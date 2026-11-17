export type PipeMaterialId = 'pvc' | 'pead' | 'ferro_fundido' | 'aco_galvanizado' | 'aco_soldado';

export interface PipeMaterial {
  id: PipeMaterialId;
  name: string;
  cFactor: number; // Hazen-Williams roughness coefficient C
  typicalUse: string;
}

export type FittingId = 
  | 'curva_90_raio_longo'
  | 'curva_90_raio_curto'
  | 'curva_45'
  | 'joelho_90'
  | 'joelho_45'
  | 'valvula_pe_crivo'
  | 'valvula_retencao_pesada'
  | 'valvula_retencao_leve'
  | 'registro_gaveta_aberto'
  | 'registro_globo_aberto'
  | 'registro_esfera_aberto'
  | 'te_passagem_direta'
  | 'te_saida_lateral'
  | 'te_saida_bilateral'
  | 'saida_tubulacao'
  | 'entrada_borda';

export interface FittingDefinition {
  id: FittingId;
  name: string;
  category: 'curvas' | 'valvulas' | 'registros' | 'conexoes';
  // Equivalent length in meters for each standard nominal diameter (in mm)
  equivalentLengths: Record<number, number>;
}

export interface FittingItem {
  fittingId: FittingId;
  quantity: number;
}

export type PumpType = 
  | 'centrifuga' 
  | 'submersivel' 
  | 'periferica' 
  | 'autoaspirante' 
  | 'injetora' 
  | 'solar';

export interface PumpModel {
  id: string;
  brand: string;
  model: string;
  type: PumpType;
  powerCv: number;
  powerKw: number;
  voltage: string;
  phase: 'Monofásico 127/220V' | 'Trifásico 220/380V' | 'Bivolt Automático' | 'Solar DC (24V/48V/110V)';
  suctionPortPol: string;
  dischargePortPol: string;
  rotorDiameterMm?: number;
  maxHeadMca: number;
  maxFlowM3h: number;
  minFlowM3h: number;
  // Polynomial curve H = a*Q^2 + b*Q + c (where Q is in m3/h and H in mca)
  curveCoefficients: {
    a: number;
    b: number;
    c: number;
  };
  samplePoints: Array<{ flowM3h: number; headMca: number }>;
  bestEfficiencyFlowM3h: number;
  bestEfficiencyHeadMca: number;
  maxEfficiencyPct: number;
  manualUrl?: string;
  datasheetUrl?: string;
  buyUrl?: string;
  approxPriceBrl?: number;
  features: string[];
}

export interface MatchedPump {
  pump: PumpModel;
  operatingPoint: {
    flowM3h: number;
    headMca: number;
    efficiencyPct: number;
  };
  suitabilityScore: number; // 0 to 100
  status: 'ideal' | 'good' | 'oversized' | 'marginal' | 'incompatible';
  statusLabel: string;
  statusColor: string;
  reasons: string[];
}

export interface CommercialDiameter {
  nominalPol: string;
  nominalMm: number;
  internalMm: number;
}

export interface HydraulicInputs {
  // Scenario / Wizard metadata
  scenario?: string;
  
  // Requirements
  flowRateM3h: number; // m³/h
  operatingHours?: number; // Tempo de funcionamento diário (horas/dia)
  residualPressureMca: number; // Pressão residual no final (ex: 2 mca reservatório, 15-25 mca aspersor)
  
  // Suction (Sucção)
  suctionHeight: number; // Altura geométrica em metros (positivo = desnível de sucção)
  suctionLength: number; // Comprimento linear em metros (Distância entre bomba e reservatório inferior)
  suctionDiameterMm: number; // Diâmetro interno em mm
  suctionMaterial: PipeMaterialId;
  suctionFittings: FittingItem[];
  isSubmerged: boolean; // Se for poço/bomba submersa, a sucção é zero
  
  // Discharge (Recalque)
  dischargeHeight: number; // Altura geométrica de recalque em metros (Desnível da bomba até reservatório superior)
  dischargeLength: number; // Comprimento linear em metros (Distância entre bomba e reservatório superior)
  dischargeDiameterMm: number; // Diâmetro interno em mm
  dischargeMaterial: PipeMaterialId;
  dischargeFittings: FittingItem[];
  
  // Efficiencies
  pumpEfficiencyPct: number; // Rendimento estimado da bomba (default 60%)
  motorEfficiencyPct: number; // Rendimento estimado do motor (default 85%)
}

export interface HydraulicResults {
  // Flows in different units
  flowRateM3h: number;
  flowRateLps: number;
  flowRateLph: number;
  
  // Daily operation estimations
  operatingHours: number;
  dailyVolumeM3: number;
  dailyVolumeLiters: number;
  dailyEnergyKwh: number;
  estimatedMonthlyCostBrl: number;
  
  // Suction Details
  suctionLinearLengthM: number;
  suctionEquivalentLengthM: number;
  suctionTotalLengthM: number;
  suctionLossGradientMpm: number; // Perda de carga unitária (m/m)
  suctionLossMca: number;
  suctionVelocityMs: number;
  suctionVelocityStatus: 'low' | 'optimal' | 'high' | 'critical';
  suctionVelocityMessage: string;
  
  // Discharge Details
  dischargeLinearLengthM: number;
  dischargeEquivalentLengthM: number;
  dischargeTotalLengthM: number;
  dischargeLossGradientMpm: number; // Perda de carga unitária (m/m)
  dischargeLossMca: number;
  dischargeVelocityMs: number;
  dischargeVelocityStatus: 'low' | 'optimal' | 'high' | 'critical';
  dischargeVelocityMessage: string;
  
  // Totals
  totalGeometricHeightMca: number;
  totalHeadLossMca: number;
  totalDynamicHeadMca: number; // HMT Total (mca)
  
  // Power estimations
  hydraulicPowerCv: number;
  hydraulicPowerKw: number;
  motorShaftPowerCv: number;
  motorShaftPowerKw: number;
  suggestedCommercialPowerCv: number;
  
  // System Curve Points for Graphing
  systemCurvePoints: Array<{ flowM3h: number; systemHeadMca: number }>;
  
  // System Constant k in H = Hgeom + k * Q^1.852
  systemCurveK: number;
}
