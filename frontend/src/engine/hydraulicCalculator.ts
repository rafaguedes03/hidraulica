import { 
  HydraulicInputs, 
  HydraulicResults, 
  FittingItem
} from './types';
import { 
  PIPE_MATERIALS, 
  FITTING_DEFINITIONS, 
  getClosestNominalDiameter 
} from './materialsAndFittings';

export const COMMERCIAL_POWERS_CV = [
  0.25, 0.33, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 6.0, 7.5, 10.0, 12.5, 15.0, 20.0, 25.0, 30.0, 40.0, 50.0
];

/**
 * Hazen-Williams Head Loss Gradient (m/m)
 * J = 10.643 * (Q^1.852) / (C^1.852 * D^4.87)
 * Q in m3/s, D in meters
 */
export function calculateHazenWilliamsGradient(
  flowM3s: number, 
  internalDiameterM: number, 
  cFactor: number
): number {
  if (flowM3s <= 0 || internalDiameterM <= 0) return 0;
  const numerator = 10.643 * Math.pow(flowM3s, 1.852);
  const denominator = Math.pow(cFactor, 1.852) * Math.pow(internalDiameterM, 4.87);
  return numerator / denominator;
}

/**
 * Flow velocity in pipe (m/s)
 * V = (4 * Q) / (pi * D^2)
 */
export function calculateFlowVelocity(flowM3s: number, internalDiameterM: number): number {
  if (internalDiameterM <= 0) return 0;
  const area = (Math.PI * Math.pow(internalDiameterM, 2)) / 4;
  return flowM3s / area;
}

/**
 * Calculate total equivalent length of fittings (m)
 */
export function calculateEquivalentLength(fittings: FittingItem[], internalDiameterMm: number): number {
  const nominalMm = getClosestNominalDiameter(internalDiameterMm);
  let totalEqLength = 0;

  for (const item of fittings) {
    if (item.quantity <= 0) continue;
    const fittingDef = FITTING_DEFINITIONS.find(f => f.id === item.fittingId);
    if (fittingDef) {
      const eqLen = fittingDef.equivalentLengths[nominalMm] || 0;
      totalEqLength += eqLen * item.quantity;
    }
  }

  return totalEqLength;
}

/**
 * Assess fluid velocity quality
 */
export function assessVelocity(velocityMs: number, isSuction: boolean): {
  status: 'low' | 'optimal' | 'high' | 'critical';
  message: string;
} {
  if (velocityMs === 0) {
    return { status: 'optimal', message: 'Sem escoamento' };
  }

  if (isSuction) {
    // Recommended suction velocity: 0.7 to 1.5 m/s (max 1.8)
    if (velocityMs < 0.6) {
      return { 
        status: 'low', 
        message: 'Velocidade baixa (<0.6 m/s): Tubulação pode estar superdimensionada (custo alto).' 
      };
    }
    if (velocityMs <= 1.5) {
      return { 
        status: 'optimal', 
        message: 'Velocidade ideal na sucção (0.7 a 1.5 m/s): Baixo risco de cavitação.' 
      };
    }
    if (velocityMs <= 2.0) {
      return { 
        status: 'high', 
        message: 'Velocidade alta na sucção (1.5 a 2.0 m/s): Risco moderado de cavitação e perda de carga.' 
      };
    }
    return { 
      status: 'critical', 
      message: 'Velocidade excessiva na sucção (>2.0 m/s): Alto risco de cavitação e perda de rendimento! Aumente o diâmetro.' 
    };
  } else {
    // Recommended discharge velocity: 1.0 to 2.5 m/s
    if (velocityMs < 0.8) {
      return { 
        status: 'low', 
        message: 'Velocidade baixa (<0.8 m/s): Tubulação larga, custo de material elevado.' 
      };
    }
    if (velocityMs <= 2.2) {
      return { 
        status: 'optimal', 
        message: 'Velocidade econômica ideal no recalque (1.0 a 2.2 m/s).' 
      };
    }
    if (velocityMs <= 3.0) {
      return { 
        status: 'high', 
        message: 'Velocidade alta (2.2 a 3.0 m/s): Perda de carga acentuada e risco de golpe de aríete.' 
      };
    }
    return { 
      status: 'critical', 
      message: 'Velocidade crítica (>3.0 m/s): Perda de carga muito alta e alto desgaste da tubulação! Aumente o diâmetro.' 
    };
  }
}

/**
 * Main calculation engine
 */
export function calculateHydraulics(inputs: HydraulicInputs): HydraulicResults {
  const flowRateM3h = Math.max(0.01, inputs.flowRateM3h);
  const flowRateM3s = flowRateM3h / 3600;
  const flowRateLps = flowRateM3h / 3.6;
  const flowRateLph = flowRateM3h * 1000;

  // Materials C Factors
  const suctionMaterial = PIPE_MATERIALS.find(m => m.id === inputs.suctionMaterial) || PIPE_MATERIALS[0];
  const dischargeMaterial = PIPE_MATERIALS.find(m => m.id === inputs.dischargeMaterial) || PIPE_MATERIALS[0];

  // Suction calculations
  const suctionDM = (inputs.suctionDiameterMm || 25) / 1000;
  const suctionEqLength = inputs.isSubmerged ? 0 : calculateEquivalentLength(inputs.suctionFittings, inputs.suctionDiameterMm);
  const suctionLinearLength = inputs.isSubmerged ? 0 : Math.max(0, inputs.suctionLength);
  const suctionTotalLength = suctionLinearLength + suctionEqLength;
  
  const suctionGradient = inputs.isSubmerged ? 0 : calculateHazenWilliamsGradient(flowRateM3s, suctionDM, suctionMaterial.cFactor);
  const suctionLossMca = suctionGradient * suctionTotalLength;
  
  const suctionVelocityMs = inputs.isSubmerged ? 0 : calculateFlowVelocity(flowRateM3s, suctionDM);
  const suctionVelAssessment = assessVelocity(suctionVelocityMs, true);

  // Discharge calculations
  const dischargeDM = (inputs.dischargeDiameterMm || 25) / 1000;
  const dischargeEqLength = calculateEquivalentLength(inputs.dischargeFittings, inputs.dischargeDiameterMm);
  const dischargeLinearLength = Math.max(0, inputs.dischargeLength);
  const dischargeTotalLength = dischargeLinearLength + dischargeEqLength;

  const dischargeGradient = calculateHazenWilliamsGradient(flowRateM3s, dischargeDM, dischargeMaterial.cFactor);
  const dischargeLossMca = dischargeGradient * dischargeTotalLength;

  const dischargeVelocityMs = calculateFlowVelocity(flowRateM3s, dischargeDM);
  const dischargeVelAssessment = assessVelocity(dischargeVelocityMs, false);

  // Totals
  const suctionHeightGeo = inputs.isSubmerged ? 0 : Math.max(0, inputs.suctionHeight);
  const dischargeHeightGeo = Math.max(0, inputs.dischargeHeight);
  const totalGeometricHeightMca = suctionHeightGeo + dischargeHeightGeo;
  const totalHeadLossMca = suctionLossMca + dischargeLossMca;
  const residualPressure = Math.max(0, inputs.residualPressureMca || 0);

  // Total Dynamic Head (HMT)
  const totalDynamicHeadMca = totalGeometricHeightMca + totalHeadLossMca + residualPressure;

  // Power calculations
  // P_hid (CV) = (gamma * Q * HMT) / 75 where gamma = 1000 kgf/m3, Q in m3/s, HMT in mca
  // P_hid = (1000 * (Q_m3h/3600) * HMT) / 75 = (Q_m3h * HMT) / 270
  const hydraulicPowerCv = (flowRateM3h * totalDynamicHeadMca) / 270;
  const hydraulicPowerKw = hydraulicPowerCv * 0.7355;

  const pumpEff = Math.max(0.2, (inputs.pumpEfficiencyPct || 60) / 100);
  const motorEff = Math.max(0.5, (inputs.motorEfficiencyPct || 85) / 100);
  const totalEfficiency = pumpEff * motorEff;

  const motorShaftPowerCv = hydraulicPowerCv / totalEfficiency;
  const motorShaftPowerKw = motorShaftPowerCv * 0.7355;

  // Suggest commercial standard power (with safety margin)
  let suggestedCommercialPowerCv = COMMERCIAL_POWERS_CV[COMMERCIAL_POWERS_CV.length - 1];
  for (const cv of COMMERCIAL_POWERS_CV) {
    if (cv >= motorShaftPowerCv) {
      suggestedCommercialPowerCv = cv;
      break;
    }
  }

  // System curve constant k: H_loss = k * Q^1.852 -> k = totalHeadLossMca / (flowRateM3h^1.852)
  const systemCurveK = flowRateM3h > 0 ? totalHeadLossMca / Math.pow(flowRateM3h, 1.852) : 0;
  const staticHead = totalGeometricHeightMca + residualPressure;

  // Generate system curve points from 0 up to 1.8x design flow
  const maxPlotFlow = Math.max(flowRateM3h * 1.8, 5);
  const systemCurvePoints: Array<{ flowM3h: number; systemHeadMca: number }> = [];
  const step = maxPlotFlow / 20;

  for (let q = 0; q <= maxPlotFlow + step / 2; q += step) {
    const roundedQ = Math.round(q * 100) / 100;
    const hLoss = systemCurveK * Math.pow(roundedQ, 1.852);
    const hSys = staticHead + hLoss;
    systemCurvePoints.push({
      flowM3h: roundedQ,
      systemHeadMca: Math.round(hSys * 100) / 100
    });
  }

    // Daily operation metrics
  const operatingHours = Math.max(0.5, inputs.operatingHours || 4);
  const dailyVolumeM3 = Math.round(flowRateM3h * operatingHours * 10) / 10;
  const dailyVolumeLiters = Math.round(dailyVolumeM3 * 1000);
  const dailyEnergyKwh = Math.round((motorShaftPowerKw / (inputs.motorEfficiencyPct ? inputs.motorEfficiencyPct / 100 : 0.85)) * operatingHours * 100) / 100;
  const estimatedMonthlyCostBrl = Math.round(dailyEnergyKwh * 30 * 0.85 * 100) / 100;

  return {
    flowRateM3h: Math.round(flowRateM3h * 100) / 100,
    flowRateLps: Math.round(flowRateLps * 100) / 100,
    flowRateLph: Math.round(flowRateLph),
    
    operatingHours,
    dailyVolumeM3,
    dailyVolumeLiters,
    dailyEnergyKwh,
    estimatedMonthlyCostBrl,
    
    suctionLinearLengthM: Math.round(suctionLinearLength * 10) / 10,
    suctionEquivalentLengthM: Math.round(suctionEqLength * 10) / 10,
    suctionTotalLengthM: Math.round(suctionTotalLength * 10) / 10,
    suctionLossGradientMpm: Math.round(suctionGradient * 10000) / 10000,
    suctionLossMca: Math.round(suctionLossMca * 100) / 100,
    suctionVelocityMs: Math.round(suctionVelocityMs * 100) / 100,
    suctionVelocityStatus: suctionVelAssessment.status,
    suctionVelocityMessage: suctionVelAssessment.message,

    dischargeLinearLengthM: Math.round(dischargeLinearLength * 10) / 10,
    dischargeEquivalentLengthM: Math.round(dischargeEqLength * 10) / 10,
    dischargeTotalLengthM: Math.round(dischargeTotalLength * 10) / 10,
    dischargeLossGradientMpm: Math.round(dischargeGradient * 10000) / 10000,
    dischargeLossMca: Math.round(dischargeLossMca * 100) / 100,
    dischargeVelocityMs: Math.round(dischargeVelocityMs * 100) / 100,
    dischargeVelocityStatus: dischargeVelAssessment.status,
    dischargeVelocityMessage: dischargeVelAssessment.message,

    totalGeometricHeightMca: Math.round(totalGeometricHeightMca * 100) / 100,
    totalHeadLossMca: Math.round(totalHeadLossMca * 100) / 100,
    totalDynamicHeadMca: Math.round(totalDynamicHeadMca * 100) / 100,

    hydraulicPowerCv: Math.round(hydraulicPowerCv * 100) / 100,
    hydraulicPowerKw: Math.round(hydraulicPowerKw * 100) / 100,
    motorShaftPowerCv: Math.round(motorShaftPowerCv * 100) / 100,
    motorShaftPowerKw: Math.round(motorShaftPowerKw * 100) / 100,
    suggestedCommercialPowerCv,

    systemCurvePoints,
    systemCurveK
  };
}
