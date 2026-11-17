import { HydraulicInputs, HydraulicResults, MatchedPump, PumpModel } from './types';
import { PUMP_CATALOG } from './pumpCatalogData';

/**
 * Calculates the pump head H at a given flow Q (m3/h) using polynomial coefficients
 */
export function getPumpHeadAtFlow(pump: PumpModel, flowM3h: number): number {
  if (flowM3h < 0) return pump.curveCoefficients.c;
  const { a, b, c } = pump.curveCoefficients;
  const h = a * Math.pow(flowM3h, 2) + b * flowM3h + c;
  return Math.max(0, h);
}

/**
 * Finds the operating point (Q_op, H_op) where Pump Curve intersects System Curve
 * H_bomba(Q) = H_sistema(Q)
 */
export function findOperatingPoint(
  pump: PumpModel, 
  staticHeadMca: number, 
  systemCurveK: number
): { flowM3h: number; headMca: number; efficiencyPct: number } {
  // Bisection search between 0 and maxFlowM3h
  let low = 0;
  let high = pump.maxFlowM3h;
  let qOp = 0;
  let hOp = 0;

  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    const hPump = getPumpHeadAtFlow(pump, mid);
    const hSys = staticHeadMca + systemCurveK * Math.pow(mid, 1.852);

    if (hPump >= hSys) {
      qOp = mid;
      hOp = hPump;
      low = mid; // Can produce more flow
    } else {
      high = mid; // Head requirement exceeded pump capacity
    }
  }

  // Calculate approximate efficiency at this operating flow
  const bepFlow = pump.bestEfficiencyFlowM3h;
  const flowDeviation = bepFlow > 0 ? (qOp - bepFlow) / bepFlow : 0;
  // Parabolic efficiency drop away from BEP
  const efficiencyFactor = Math.max(0.3, 1 - 0.75 * Math.pow(flowDeviation, 2));
  const efficiencyPct = Math.round(pump.maxEfficiencyPct * efficiencyFactor);

  return {
    flowM3h: Math.round(qOp * 100) / 100,
    headMca: Math.round(hOp * 100) / 100,
    efficiencyPct
  };
}

/**
 * Match and rank all pumps against user's hydraulic requirements
 */
export function matchPumps(
  inputs: HydraulicInputs,
  results: HydraulicResults,
  customCatalog?: PumpModel[]
): MatchedPump[] {
  const catalog = customCatalog && customCatalog.length > 0 ? customCatalog : PUMP_CATALOG;
  const reqFlow = results.flowRateM3h;
  const reqHmt = results.totalDynamicHeadMca;
  const staticHead = results.totalGeometricHeightMca + (inputs.residualPressureMca || 0);

  const matchedList: MatchedPump[] = [];

  for (const pump of catalog) {
    const headAtReqFlow = getPumpHeadAtFlow(pump, reqFlow);
    const opPoint = findOperatingPoint(pump, staticHead, results.systemCurveK);
    
    let score = 0;
    const reasons: string[] = [];
    let status: 'ideal' | 'good' | 'oversized' | 'marginal' | 'incompatible' = 'good';
    let statusLabel = 'Atende aos Requisitos';
    let statusColor = 'emerald';

    // 1. Check if pump can meet the point (Flow & Head)
    const meetsRequiredPoint = headAtReqFlow >= reqHmt && reqFlow <= pump.maxFlowM3h;

    if (!meetsRequiredPoint) {
      status = 'incompatible';
      statusLabel = 'Não Atende';
      statusColor = 'rose';
      score = 10;
      
      if (headAtReqFlow < reqHmt) {
        reasons.push(`Altura insuficiente: entrega ${headAtReqFlow.toFixed(1)} mca na vazão de ${reqFlow.toFixed(1)} m³/h (necessário: ${reqHmt.toFixed(1)} mca).`);
      }
      if (reqFlow > pump.maxFlowM3h) {
        reasons.push(`Vazão máxima do modelo (${pump.maxFlowM3h.toFixed(1)} m³/h) é menor que a vazão de projeto.`);
      }
    } else {
      // Base score for working
      score = 60;

      // 2. Head margin assessment
      const headMarginRatio = headAtReqFlow / reqHmt;
      if (headMarginRatio >= 1.05 && headMarginRatio <= 1.25) {
        score += 20;
        reasons.push('Margem de pressão ideal (+5% a +25% de segurança).');
      } else if (headMarginRatio > 1.25 && headMarginRatio <= 1.6) {
        score += 10;
        reasons.push('Pressão com folga considerável.');
      } else if (headMarginRatio > 1.6) {
        score -= 10;
        status = 'oversized';
        statusLabel = 'Sobredimensionada';
        statusColor = 'amber';
        reasons.push(`Pressão muito superior (${headAtReqFlow.toFixed(1)} mca vs ${reqHmt.toFixed(1)} mca), o que pode aumentar o custo elétrico.`);
      }

      // 3. Proximity to Best Efficiency Point (BEP)
      const bepRatio = Math.abs(reqFlow - pump.bestEfficiencyFlowM3h) / pump.bestEfficiencyFlowM3h;
      if (bepRatio < 0.20) {
        score += 15;
        reasons.push('Operando próximo do Ponto de Melhor Eficiência (BEP).');
      } else if (bepRatio < 0.40) {
        score += 8;
      }

      // 4. Power matching check
      if (pump.powerCv >= results.motorShaftPowerCv && pump.powerCv <= results.motorShaftPowerCv * 1.8) {
        score += 5;
        reasons.push(`Potência de ${pump.powerCv} CV bem dimensionada para a potência requerida (${results.motorShaftPowerCv.toFixed(2)} CV).`);
      }

      // 5. Suction / Application suitability bonuses
      if (inputs.isSubmerged && pump.type === 'submersivel') {
        score += 10;
        reasons.push('Modelo submersível ideal para poço tubular/cisterna.');
      } else if (!inputs.isSubmerged && inputs.suctionHeight > 4 && pump.type === 'autoaspirante') {
        score += 10;
        reasons.push('Autoaspirante com excelente capacidade de sucção para desníveis acentuados.');
      } else if (inputs.scenario === 'solar' && pump.type === 'solar') {
        score += 15;
        reasons.push('Alimentação solar fotovoltaica sem conta de luz.');
      }

      // Final status badge categorization
      if (score >= 85) {
        status = 'ideal';
        statusLabel = 'Recomendação Ideal';
        statusColor = 'sky';
      } else if (score >= 70) {
        status = 'good';
        statusLabel = 'Opção Recomendada';
        statusColor = 'emerald';
      } else if (status !== 'oversized') {
        status = 'marginal';
        statusLabel = 'Atende no Limite';
        statusColor = 'yellow';
      }
    }

    matchedList.push({
      pump,
      operatingPoint: opPoint,
      suitabilityScore: Math.min(100, Math.max(0, score)),
      status,
      statusLabel,
      statusColor,
      reasons
    });
  }

  // Sort by suitability score descending
  return matchedList.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}
