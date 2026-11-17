import { PumpModel } from './types';

export const PUMP_CATALOG: PumpModel[] = [
  // =========================================================================
  // 1. BOMBAS LEÃO (Especialista em Poços Profundos e Irrigação)
  // =========================================================================
  {
    id: 'leao-4r2-05cv',
    brand: 'Leão',
    model: '4R2-08 (1/2 CV) - Submersa 4"',
    type: 'submersivel',
    powerCv: 0.5,
    powerKw: 0.37,
    voltage: '220V Monofásico',
    phase: 'Monofásico 127/220V',
    suctionPortPol: 'Submersa (Grade Inox)',
    dischargePortPol: '1"',
    maxHeadMca: 52.0,
    minFlowM3h: 0.4,
    maxFlowM3h: 2.8,
    curveCoefficients: { a: -5.8, b: -2.4, c: 53.0 },
    samplePoints: [
      { flowM3h: 0.4, headMca: 51 },
      { flowM3h: 1.0, headMca: 45 },
      { flowM3h: 1.8, headMca: 30 },
      { flowM3h: 2.5, headMca: 10 },
      { flowM3h: 2.8, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 1.5,
    bestEfficiencyHeadMca: 36,
    maxEfficiencyPct: 62,
    features: [
      'Bomba submersa 4 polegadas multiestágios em aço inox e termoplástico',
      'Motor Leão refrigerado a água de alta durabilidade',
      'Excelente para poços artesianos residenciais e pequenos sítios'
    ],
    approxPriceBrl: 1250,
    manualUrl: 'https://bombasleao.com.br'
  },
  {
    id: 'leao-4r3-10cv',
    brand: 'Leão',
    model: '4R3-12 (1.0 CV) - Submersa 4"',
    type: 'submersivel',
    powerCv: 1.0,
    powerKw: 0.75,
    voltage: '220V Monofásico ou 220/380V Trifásico',
    phase: 'Monofásico 127/220V',
    suctionPortPol: 'Submersa (Grade Inox)',
    dischargePortPol: '1.1/4"',
    maxHeadMca: 78.0,
    minFlowM3h: 0.8,
    maxFlowM3h: 4.2,
    curveCoefficients: { a: -3.8, b: -2.8, c: 79.0 },
    samplePoints: [
      { flowM3h: 0.8, headMca: 76 },
      { flowM3h: 2.0, headMca: 60 },
      { flowM3h: 3.2, headMca: 32 },
      { flowM3h: 4.0, headMca: 8 },
      { flowM3h: 4.2, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 2.6,
    bestEfficiencyHeadMca: 48,
    maxEfficiencyPct: 65,
    features: [
      'Linha 4R3 com 12 estágios para poços tubulares profundos',
      'Válvula de retenção incorporada no cabeçote de descarga',
      'Rotores flutuantes com alta tolerância a areia residual'
    ],
    approxPriceBrl: 1780,
    manualUrl: 'https://bombasleao.com.br'
  },
  {
    id: 'leao-4r4-15cv',
    brand: 'Leão',
    model: '4R4-14 (1.5 CV) - Submersa 4"',
    type: 'submersivel',
    powerCv: 1.5,
    powerKw: 1.1,
    voltage: '220V Monofásico ou 220/380V Trifásico',
    phase: 'Monofásico 127/220V',
    suctionPortPol: 'Submersa (Grade Inox)',
    dischargePortPol: '1.1/4"',
    maxHeadMca: 96.0,
    minFlowM3h: 1.0,
    maxFlowM3h: 5.5,
    curveCoefficients: { a: -2.6, b: -2.2, c: 97.0 },
    samplePoints: [
      { flowM3h: 1.0, headMca: 92 },
      { flowM3h: 2.5, headMca: 75 },
      { flowM3h: 4.0, headMca: 46 },
      { flowM3h: 5.2, headMca: 12 },
      { flowM3h: 5.5, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 3.5,
    bestEfficiencyHeadMca: 58,
    maxEfficiencyPct: 67,
    features: [
      'Alta pressão e vazão intermediária para irrigação e pecuária',
      'Corpo externo em aço inoxidável AISI 304',
      'Eixo estriado acoplado segundo norma NEMA'
    ],
    approxPriceBrl: 2200,
    manualUrl: 'https://bombasleao.com.br'
  },
  {
    id: 'leao-4r5-20cv',
    brand: 'Leão',
    model: '4R5-16 (2.0 CV) - Submersa 4"',
    type: 'submersivel',
    powerCv: 2.0,
    powerKw: 1.5,
    voltage: '220V Monofásico ou 220/380V Trifásico',
    phase: 'Trifásico 220/380V',
    suctionPortPol: 'Submersa (Grade Inox)',
    dischargePortPol: '1.1/2"',
    maxHeadMca: 112.0,
    minFlowM3h: 1.5,
    maxFlowM3h: 7.2,
    curveCoefficients: { a: -1.9, b: -1.8, c: 114.0 },
    samplePoints: [
      { flowM3h: 1.5, headMca: 107 },
      { flowM3h: 3.5, headMca: 84 },
      { flowM3h: 5.5, headMca: 46 },
      { flowM3h: 7.0, headMca: 10 },
      { flowM3h: 7.2, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 4.5,
    bestEfficiencyHeadMca: 68,
    maxEfficiencyPct: 68,
    features: [
      'Indicada para condomínios rurais, pivôs setoriais e dessedentação',
      'Saída ampliada de 1.1/2 polegada para menor perda de carga',
      'Suporta profundidades de instalação de até 100 metros'
    ],
    approxPriceBrl: 2650,
    manualUrl: 'https://bombasleao.com.br'
  },
  {
    id: 'leao-4r8-30cv',
    brand: 'Leão',
    model: '4R8-15 (3.0 CV) - Alta Vazão 4"',
    type: 'submersivel',
    powerCv: 3.0,
    powerKw: 2.2,
    voltage: '220/380V Trifásico',
    phase: 'Trifásico 220/380V',
    suctionPortPol: 'Submersa (Grade Inox)',
    dischargePortPol: '2"',
    maxHeadMca: 105.0,
    minFlowM3h: 2.0,
    maxFlowM3h: 11.0,
    curveCoefficients: { a: -0.78, b: -1.1, c: 106.0 },
    samplePoints: [
      { flowM3h: 2.0, headMca: 101 },
      { flowM3h: 5.0, headMca: 81 },
      { flowM3h: 8.0, headMca: 47 },
      { flowM3h: 10.5, headMca: 12 },
      { flowM3h: 11.0, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 7.0,
    bestEfficiencyHeadMca: 60,
    maxEfficiencyPct: 70,
    features: [
      'Série de alta vazão para poços produtivos de 4 polegadas',
      'Conexão de descarga de 2 polegadas roscada BSP',
      'Rendimento hidráulico otimizado para agricultura irrigada'
    ],
    approxPriceBrl: 3400,
    manualUrl: 'https://bombasleao.com.br'
  },
  {
    id: 'leao-6r12-50cv',
    brand: 'Leão',
    model: '6R12-08 (5.0 CV) - Poço Profundo 6"',
    type: 'submersivel',
    powerCv: 5.0,
    powerKw: 3.7,
    voltage: '220/380V Trifásico',
    phase: 'Trifásico 220/380V',
    suctionPortPol: 'Submersa (Grade Inox)',
    dischargePortPol: '2.1/2"',
    maxHeadMca: 135.0,
    minFlowM3h: 3.0,
    maxFlowM3h: 16.5,
    curveCoefficients: { a: -0.45, b: -0.85, c: 136.0 },
    samplePoints: [
      { flowM3h: 3.0, headMca: 129 },
      { flowM3h: 8.0, headMca: 100 },
      { flowM3h: 12.0, headMca: 60 },
      { flowM3h: 15.5, headMca: 15 },
      { flowM3h: 16.5, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 10.5,
    bestEfficiencyHeadMca: 78,
    maxEfficiencyPct: 73,
    features: [
      'Bomba submersa 6 polegadas para poços de alta capacidade',
      'Conjunto robusto com mancais de borracha nitrílica autolubrificados',
      'Atende irrigação por gotejamento de médio e grande porte'
    ],
    approxPriceBrl: 5100,
    manualUrl: 'https://bombasleao.com.br'
  },
  {
    id: 'leao-6r18-75cv',
    brand: 'Leão',
    model: '6R18-09 (7.5 CV) - Alta Vazão 6"',
    type: 'submersivel',
    powerCv: 7.5,
    powerKw: 5.5,
    voltage: '220/380V Trifásico',
    phase: 'Trifásico 220/380V',
    suctionPortPol: 'Submersa (Grade Inox)',
    dischargePortPol: '3"',
    maxHeadMca: 148.0,
    minFlowM3h: 5.0,
    maxFlowM3h: 25.0,
    curveCoefficients: { a: -0.22, b: -0.45, c: 150.0 },
    samplePoints: [
      { flowM3h: 5.0, headMca: 142 },
      { flowM3h: 12.0, headMca: 113 },
      { flowM3h: 18.0, headMca: 71 },
      { flowM3h: 23.5, headMca: 18 },
      { flowM3h: 25.0, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 16.0,
    bestEfficiencyHeadMca: 86,
    maxEfficiencyPct: 75,
    features: [
      'Elevada vazão (até 25 m³/h) para abastecimento coletivo e fazendas',
      'Descarga roscada de 3 polegadas',
      'Motor trifásico rebobinável em banho de água'
    ],
    approxPriceBrl: 6800,
    manualUrl: 'https://bombasleao.com.br'
  },

  // =========================================================================
  // 2. BOMBAS ALTRI (Inox de Alta Eficiência e Sistemas Submersos)
  // =========================================================================
  {
    id: 'altri-inox-4al05-05cv',
    brand: 'Altri',
    model: 'AL-405 (1/2 CV) 100% Inox 4"',
    type: 'submersivel',
    powerCv: 0.5,
    powerKw: 0.37,
    voltage: '220V Monofásico',
    phase: 'Monofásico 127/220V',
    suctionPortPol: 'Submersa',
    dischargePortPol: '1"',
    maxHeadMca: 48.0,
    minFlowM3h: 0.3,
    maxFlowM3h: 2.6,
    curveCoefficients: { a: -6.5, b: -1.8, c: 49.0 },
    samplePoints: [
      { flowM3h: 0.3, headMca: 48 },
      { flowM3h: 1.0, headMca: 40 },
      { flowM3h: 1.8, headMca: 24 },
      { flowM3h: 2.6, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 1.3,
    bestEfficiencyHeadMca: 34,
    maxEfficiencyPct: 63,
    features: [
      'Construção integral em aço inoxidável 304 com alta resistência à corrosão',
      'Selo mecânico especial em carbeto de silício',
      'Baixo consumo energético e excelente vida útil'
    ],
    approxPriceBrl: 1390,
    manualUrl: 'https://altribombas.com.br'
  },
  {
    id: 'altri-inox-4al10-10cv',
    brand: 'Altri',
    model: 'AL-410 (1.0 CV) 100% Inox 4"',
    type: 'submersivel',
    powerCv: 1.0,
    powerKw: 0.75,
    voltage: '220V Monofásico ou Trifásico',
    phase: 'Monofásico 127/220V',
    suctionPortPol: 'Submersa',
    dischargePortPol: '1.1/4"',
    maxHeadMca: 82.0,
    minFlowM3h: 0.6,
    maxFlowM3h: 4.0,
    curveCoefficients: { a: -4.8, b: -1.2, c: 83.0 },
    samplePoints: [
      { flowM3h: 0.6, headMca: 81 },
      { flowM3h: 1.8, headMca: 65 },
      { flowM3h: 3.0, headMca: 36 },
      { flowM3h: 4.0, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 2.2,
    bestEfficiencyHeadMca: 56,
    maxEfficiencyPct: 66,
    features: [
      'Carcaça, difusores e rotores 100% em aço inox',
      'Totalmente isenta de contaminação por ferrugem na água',
      'Indicada para água mineral e processos agroindustriais'
    ],
    approxPriceBrl: 1950,
    manualUrl: 'https://altribombas.com.br'
  },
  {
    id: 'altri-inox-4al15-15cv',
    brand: 'Altri',
    model: 'AL-415 (1.5 CV) Inox Alta Pressão',
    type: 'submersivel',
    powerCv: 1.5,
    powerKw: 1.1,
    voltage: '220V Monofásico ou Trifásico',
    phase: 'Monofásico 127/220V',
    suctionPortPol: 'Submersa',
    dischargePortPol: '1.1/4"',
    maxHeadMca: 104.0,
    minFlowM3h: 0.8,
    maxFlowM3h: 5.2,
    curveCoefficients: { a: -3.6, b: -1.5, c: 105.0 },
    samplePoints: [
      { flowM3h: 0.8, headMca: 101 },
      { flowM3h: 2.4, headMca: 80 },
      { flowM3h: 4.0, headMca: 41 },
      { flowM3h: 5.2, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 2.8,
    bestEfficiencyHeadMca: 70,
    maxEfficiencyPct: 68,
    features: [
      'Estágios usinados a laser para máximo rendimento',
      'Eixo estriado em inox 316 para águas levemente ácidas',
      'Operação silenciosa e confiável'
    ],
    approxPriceBrl: 2490,
    manualUrl: 'https://altribombas.com.br'
  },
  {
    id: 'altri-inox-4al20-20cv',
    brand: 'Altri',
    model: 'AL-420 (2.0 CV) Inox Vazão Média',
    type: 'submersivel',
    powerCv: 2.0,
    powerKw: 1.5,
    voltage: '220/380V Trifásico',
    phase: 'Trifásico 220/380V',
    suctionPortPol: 'Submersa',
    dischargePortPol: '1.1/2"',
    maxHeadMca: 120.0,
    minFlowM3h: 1.0,
    maxFlowM3h: 6.8,
    curveCoefficients: { a: -2.3, b: -1.6, c: 122.0 },
    samplePoints: [
      { flowM3h: 1.0, headMca: 118 },
      { flowM3h: 3.2, headMca: 92 },
      { flowM3h: 5.2, headMca: 49 },
      { flowM3h: 6.8, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 4.0,
    bestEfficiencyHeadMca: 78,
    maxEfficiencyPct: 69,
    features: [
      'Conjunto hidráulico de precisão para poços profundos',
      'Acoplamento universal NEMA 4 polegadas',
      'Projetada para operação contínua 24h em pivôs e estufas'
    ],
    approxPriceBrl: 2980,
    manualUrl: 'https://altribombas.com.br'
  },
  {
    id: 'altri-inox-4al30-30cv',
    brand: 'Altri',
    model: 'AL-430 (3.0 CV) Inox 4"',
    type: 'submersivel',
    powerCv: 3.0,
    powerKw: 2.2,
    voltage: '220/380V Trifásico',
    phase: 'Trifásico 220/380V',
    suctionPortPol: 'Submersa',
    dischargePortPol: '2"',
    maxHeadMca: 138.0,
    minFlowM3h: 1.5,
    maxFlowM3h: 9.5,
    curveCoefficients: { a: -1.4, b: -1.2, c: 140.0 },
    samplePoints: [
      { flowM3h: 1.5, headMca: 135 },
      { flowM3h: 4.5, headMca: 106 },
      { flowM3h: 7.5, headMca: 52 },
      { flowM3h: 9.5, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 5.8,
    bestEfficiencyHeadMca: 88,
    maxEfficiencyPct: 71,
    features: [
      'Excelente relação pressão x vazão com bocal de 2 polegadas',
      'Válvula de retenção interna com vedação em EPDM',
      'Indicada para irrigação por aspersão de médio alcance'
    ],
    approxPriceBrl: 3750,
    manualUrl: 'https://altribombas.com.br'
  },
  {
    id: 'altri-centrifuga-ac10-10cv',
    brand: 'Altri',
    model: 'AC-10 (1.0 CV) Centrífuga Inox',
    type: 'centrifuga',
    powerCv: 1.0,
    powerKw: 0.75,
    voltage: '127/220V Monofásico',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1.1/4"',
    dischargePortPol: '1"',
    maxHeadMca: 36.0,
    minFlowM3h: 0.5,
    maxFlowM3h: 8.0,
    curveCoefficients: { a: -0.52, b: -0.32, c: 36.5 },
    samplePoints: [
      { flowM3h: 0.5, headMca: 36 },
      { flowM3h: 3.0, headMca: 30 },
      { flowM3h: 6.0, headMca: 15 },
      { flowM3h: 8.0, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 4.5,
    bestEfficiencyHeadMca: 24,
    maxEfficiencyPct: 65,
    features: [
      'Bomba centrífuga de superfície com carcaça em inox estampado',
      'Ideal para recirculação de água limpa, laticínios e cervejarias',
      'Elevada resistência mecânica'
    ],
    approxPriceBrl: 1420,
    manualUrl: 'https://altribombas.com.br'
  },
  {
    id: 'altri-centrifuga-ac20-20cv',
    brand: 'Altri',
    model: 'AC-20 (2.0 CV) Centrífuga Inox',
    type: 'centrifuga',
    powerCv: 2.0,
    powerKw: 1.5,
    voltage: '220/380V Trifásico',
    phase: 'Trifásico 220/380V',
    suctionPortPol: '1.1/2"',
    dischargePortPol: '1.1/4"',
    maxHeadMca: 48.0,
    minFlowM3h: 1.0,
    maxFlowM3h: 13.0,
    curveCoefficients: { a: -0.26, b: -0.28, c: 48.5 },
    samplePoints: [
      { flowM3h: 1.0, headMca: 48 },
      { flowM3h: 5.0, headMca: 40 },
      { flowM3h: 9.5, headMca: 22 },
      { flowM3h: 13.0, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 7.5,
    bestEfficiencyHeadMca: 31,
    maxEfficiencyPct: 69,
    features: [
      'Bomba centrífuga sanitária em inox para transferência rápida',
      'Motor industrial com proteção IP-55',
      'Alta vazão para lavagem de estábulos e fertirrigação'
    ],
    approxPriceBrl: 2150,
    manualUrl: 'https://altribombas.com.br'
  },

  // =========================================================================
  // 3. BOMBAS IMBIL (Líder em Bombas Industriais, Irrigação e Saneamento)
  // =========================================================================
  {
    id: 'imbil-ita-32-160-20cv',
    brand: 'Imbil',
    model: 'ITA 32-160 (2.0 CV) - Linha Normalizada',
    type: 'centrifuga',
    powerCv: 2.0,
    powerKw: 1.5,
    voltage: '220/380V Trifásico',
    phase: 'Trifásico 220/380V',
    suctionPortPol: '2"',
    dischargePortPol: '1.1/4"',
    rotorDiameterMm: 160,
    maxHeadMca: 38.0,
    minFlowM3h: 2.0,
    maxFlowM3h: 15.0,
    curveCoefficients: { a: -0.15, b: -0.25, c: 38.5 },
    samplePoints: [
      { flowM3h: 2.0, headMca: 37 },
      { flowM3h: 6.0, headMca: 31 },
      { flowM3h: 11.0, headMca: 17 },
      { flowM3h: 15.0, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 8.5,
    bestEfficiencyHeadMca: 25,
    maxEfficiencyPct: 72,
    features: [
      'Bomba centrífuga monobloco normalizada ISO 2858',
      'Carcaça robusta em ferro fundido de alta densidade',
      'Padrão industrial pesado para irrigação e saneamento rural'
    ],
    approxPriceBrl: 2890,
    manualUrl: 'https://imbil.com.br/produtos/ita'
  },
  {
    id: 'imbil-ita-40-160-30cv',
    brand: 'Imbil',
    model: 'ITA 40-160 (3.0 CV) - Média Vazão',
    type: 'centrifuga',
    powerCv: 3.0,
    powerKw: 2.2,
    voltage: '220/380V Trifásico',
    phase: 'Trifásico 220/380V',
    suctionPortPol: '2.1/2"',
    dischargePortPol: '1.1/2"',
    rotorDiameterMm: 165,
    maxHeadMca: 42.0,
    minFlowM3h: 3.0,
    maxFlowM3h: 22.0,
    curveCoefficients: { a: -0.078, b: -0.18, c: 42.5 },
    samplePoints: [
      { flowM3h: 3.0, headMca: 41 },
      { flowM3h: 10.0, headMca: 33 },
      { flowM3h: 16.0, headMca: 19 },
      { flowM3h: 22.0, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 13.0,
    bestEfficiencyHeadMca: 26,
    maxEfficiencyPct: 74,
    features: [
      'Bocais flangeados de alto fluxo',
      'Excelente rendimento hidráulico para sistemas de microaspersão',
      'Fácil manutenção sem desacoplar tubulações (sistema Back-Pull-Out)'
    ],
    approxPriceBrl: 3750,
    manualUrl: 'https://imbil.com.br/produtos/ita'
  },
  {
    id: 'imbil-ita-50-200-50cv',
    brand: 'Imbil',
    model: 'ITA 50-200 (5.0 CV) - Alta Pressão',
    type: 'centrifuga',
    powerCv: 5.0,
    powerKw: 3.7,
    voltage: '220/380V Trifásico',
    phase: 'Trifásico 220/380V',
    suctionPortPol: '2.1/2"',
    dischargePortPol: '2"',
    rotorDiameterMm: 200,
    maxHeadMca: 62.0,
    minFlowM3h: 4.0,
    maxFlowM3h: 30.0,
    curveCoefficients: { a: -0.062, b: -0.15, c: 63.0 },
    samplePoints: [
      { flowM3h: 4.0, headMca: 61 },
      { flowM3h: 14.0, headMca: 48 },
      { flowM3h: 22.0, headMca: 29 },
      { flowM3h: 30.0, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 18.0,
    bestEfficiencyHeadMca: 40,
    maxEfficiencyPct: 76,
    features: [
      'Caracol de alto rendimento com rotor fechado balanceado',
      'Adequada para elevações acentuadas e adutoras longas',
      'Motor WEG W22 Premium de alta eficiência'
    ],
    approxPriceBrl: 5200,
    manualUrl: 'https://imbil.com.br/produtos/ita'
  },
  {
    id: 'imbil-ita-50-250-75cv',
    brand: 'Imbil',
    model: 'ITA 50-250 (7.5 CV) - Alta Carga Hidráulica',
    type: 'centrifuga',
    powerCv: 7.5,
    powerKw: 5.5,
    voltage: '220/380V Trifásico',
    phase: 'Trifásico 220/380V',
    suctionPortPol: '2.1/2"',
    dischargePortPol: '2"',
    rotorDiameterMm: 250,
    maxHeadMca: 88.0,
    minFlowM3h: 5.0,
    maxFlowM3h: 35.0,
    curveCoefficients: { a: -0.065, b: -0.12, c: 89.0 },
    samplePoints: [
      { flowM3h: 5.0, headMca: 87 },
      { flowM3h: 16.0, headMca: 70 },
      { flowM3h: 26.0, headMca: 41 },
      { flowM3h: 35.0, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 22.0,
    bestEfficiencyHeadMca: 54,
    maxEfficiencyPct: 77,
    features: [
      'Pressão elevada (quase 90 mca) para morros e longas distâncias',
      'Vedação por selo mecânico balanceado de alta durabilidade',
      'Aplicação severa na agropecuária e indústria'
    ],
    approxPriceBrl: 6900,
    manualUrl: 'https://imbil.com.br/produtos/ita'
  },
  {
    id: 'imbil-ita-65-160-10cv',
    brand: 'Imbil',
    model: 'ITA 65-160 (10.0 CV) - Grande Vazão Irrigação',
    type: 'centrifuga',
    powerCv: 10.0,
    powerKw: 7.5,
    voltage: '220/380V Trifásico',
    phase: 'Trifásico 220/380V',
    suctionPortPol: '3"',
    dischargePortPol: '2.1/2"',
    rotorDiameterMm: 175,
    maxHeadMca: 48.0,
    minFlowM3h: 10.0,
    maxFlowM3h: 60.0,
    curveCoefficients: { a: -0.012, b: -0.08, c: 49.0 },
    samplePoints: [
      { flowM3h: 10.0, headMca: 47 },
      { flowM3h: 28.0, headMca: 37 },
      { flowM3h: 46.0, headMca: 20 },
      { flowM3h: 60.0, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 38.0,
    bestEfficiencyHeadMca: 29,
    maxEfficiencyPct: 80,
    features: [
      'Vazão volumétrica massiva de até 60 m³/h (60.000 L/h)',
      'Perfeita para pivôs de irrigação e drenagem de grandes áreas',
      'Sucção de 3 polegadas flangeada'
    ],
    approxPriceBrl: 8400,
    manualUrl: 'https://imbil.com.br/produtos/ita'
  },
  {
    id: 'imbil-ini-32-125-15cv',
    brand: 'Imbil',
    model: 'INI 32-125 (1.5 CV) - Centrífuga Compacta',
    type: 'centrifuga',
    powerCv: 1.5,
    powerKw: 1.1,
    voltage: '220/380V Trifásico ou Monofásico',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1.1/2"',
    dischargePortPol: '1.1/4"',
    rotorDiameterMm: 130,
    maxHeadMca: 26.0,
    minFlowM3h: 1.5,
    maxFlowM3h: 12.0,
    curveCoefficients: { a: -0.16, b: -0.22, c: 26.5 },
    samplePoints: [
      { flowM3h: 1.5, headMca: 25 },
      { flowM3h: 5.0, headMca: 21 },
      { flowM3h: 9.0, headMca: 11 },
      { flowM3h: 12.0, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 6.5,
    bestEfficiencyHeadMca: 17,
    maxEfficiencyPct: 70,
    features: [
      'Construção compacta para abastecimento predial e chácaras',
      'Baixo nível de ruído e vibração',
      'Rotor em ferro fundido de precisão'
    ],
    approxPriceBrl: 2150,
    manualUrl: 'https://imbil.com.br/produtos/ini'
  },
  {
    id: 'imbil-ini-40-200-40cv',
    brand: 'Imbil',
    model: 'INI 40-200 (4.0 CV) - Média/Alta Carga',
    type: 'centrifuga',
    powerCv: 4.0,
    powerKw: 3.0,
    voltage: '220/380V Trifásico',
    phase: 'Trifásico 220/380V',
    suctionPortPol: '2"',
    dischargePortPol: '1.1/2"',
    rotorDiameterMm: 200,
    maxHeadMca: 56.0,
    minFlowM3h: 3.0,
    maxFlowM3h: 24.0,
    curveCoefficients: { a: -0.09, b: -0.15, c: 56.5 },
    samplePoints: [
      { flowM3h: 3.0, headMca: 55 },
      { flowM3h: 11.0, headMca: 43 },
      { flowM3h: 18.0, headMca: 24 },
      { flowM3h: 24.0, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 14.0,
    bestEfficiencyHeadMca: 36,
    maxEfficiencyPct: 75,
    features: [
      'Excelente rendimento em lavouras de café e hortaliças',
      'Eixo em aço inoxidável protegido por luva',
      'Selo mecânico de primeira linha'
    ],
    approxPriceBrl: 4400,
    manualUrl: 'https://imbil.com.br/produtos/ini'
  },

  // =========================================================================
  // 4. SCHNEIDER / FRANKLIN ELECTRIC (Líder Residencial e Agrícola)
  // =========================================================================
  {
    id: 'schneider-bc91s-05cv',
    brand: 'Schneider',
    model: 'BC-91 S (1/2 CV) - Centrífuga',
    type: 'centrifuga',
    powerCv: 0.5,
    powerKw: 0.37,
    voltage: '127/220V com seletor',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1"',
    dischargePortPol: '1"',
    rotorDiameterMm: 110,
    maxHeadMca: 27.0,
    minFlowM3h: 0.5,
    maxFlowM3h: 7.2,
    curveCoefficients: { a: -0.42, b: -0.65, c: 27.5 },
    samplePoints: [
      { flowM3h: 0.5, headMca: 27 },
      { flowM3h: 2.0, headMca: 24 },
      { flowM3h: 4.0, headMca: 18 },
      { flowM3h: 6.0, headMca: 9 },
      { flowM3h: 7.2, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 3.8,
    bestEfficiencyHeadMca: 19,
    maxEfficiencyPct: 62,
    features: [
      'Carcaça de ferro fundido GG-15 e rotor em alumínio/bronze',
      'Motor WEG IP-21 com protetor térmico embutido',
      'Padrão de confiabilidade nacional'
    ],
    approxPriceBrl: 720,
    manualUrl: 'https://www.franklin-electric.com.br/produtos/bombas-centrifugas/bc-91-s/'
  },
  {
    id: 'schneider-bc91s-075cv',
    brand: 'Schneider',
    model: 'BC-91 S (3/4 CV) - Centrífuga',
    type: 'centrifuga',
    powerCv: 0.75,
    powerKw: 0.55,
    voltage: '127/220V com seletor',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1"',
    dischargePortPol: '1"',
    rotorDiameterMm: 120,
    maxHeadMca: 31.0,
    minFlowM3h: 0.5,
    maxFlowM3h: 8.5,
    curveCoefficients: { a: -0.36, b: -0.45, c: 31.5 },
    samplePoints: [
      { flowM3h: 0.5, headMca: 31 },
      { flowM3h: 2.0, headMca: 29 },
      { flowM3h: 4.0, headMca: 24 },
      { flowM3h: 6.0, headMca: 16 },
      { flowM3h: 8.5, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 4.5,
    bestEfficiencyHeadMca: 22,
    maxEfficiencyPct: 64,
    features: [
      'Excelente equilíbrio entre vazão e pressão média',
      'Motor WEG monofásico de alto rendimento',
      'Adequada para sítios, prédios baixos e pomares'
    ],
    approxPriceBrl: 890,
    manualUrl: 'https://www.franklin-electric.com.br/produtos/bombas-centrifugas/bc-91-s/'
  },
  {
    id: 'schneider-bc91s-10cv',
    brand: 'Schneider',
    model: 'BC-91 S (1.0 CV) - Centrífuga',
    type: 'centrifuga',
    powerCv: 1.0,
    powerKw: 0.75,
    voltage: '127/220V ou 220/380V Trifásico',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1.1/4"',
    dischargePortPol: '1"',
    rotorDiameterMm: 128,
    maxHeadMca: 35.0,
    minFlowM3h: 1.0,
    maxFlowM3h: 10.2,
    curveCoefficients: { a: -0.28, b: -0.40, c: 35.5 },
    samplePoints: [
      { flowM3h: 1.0, headMca: 35 },
      { flowM3h: 3.0, headMca: 32 },
      { flowM3h: 5.0, headMca: 27 },
      { flowM3h: 7.0, headMca: 19 },
      { flowM3h: 10.2, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 5.5,
    bestEfficiencyHeadMca: 24,
    maxEfficiencyPct: 66,
    features: [
      'Bocal de sucção ampliado para 1.1/4 polegada',
      'Maior vazão para irrigação contínua de hortaliças',
      'Durabilidade comprovada'
    ],
    approxPriceBrl: 1100,
    manualUrl: 'https://www.franklin-electric.com.br/produtos/bombas-centrifugas/bc-91-s/'
  },
  {
    id: 'schneider-bc92s-15cv',
    brand: 'Schneider',
    model: 'BC-92 S (1.5 CV) - Alta Pressão',
    type: 'centrifuga',
    powerCv: 1.5,
    powerKw: 1.1,
    voltage: '127/220V ou 220/380V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1.1/2"',
    dischargePortPol: '1"',
    rotorDiameterMm: 145,
    maxHeadMca: 44.0,
    minFlowM3h: 1.0,
    maxFlowM3h: 12.5,
    curveCoefficients: { a: -0.23, b: -0.35, c: 44.5 },
    samplePoints: [
      { flowM3h: 1.0, headMca: 44 },
      { flowM3h: 4.0, headMca: 40 },
      { flowM3h: 7.0, headMca: 32 },
      { flowM3h: 10.0, headMca: 19 },
      { flowM3h: 12.5, headMca: 4 }
    ],
    bestEfficiencyFlowM3h: 6.8,
    bestEfficiencyHeadMca: 33,
    maxEfficiencyPct: 68,
    features: [
      'Indicada para grandes desníveis e longas distâncias horizontais',
      'Sucção de 1.1/2 polegada para menor atrito',
      'Rotor fechado de alta precisão'
    ],
    approxPriceBrl: 1480,
    manualUrl: 'https://www.franklin-electric.com.br/produtos/bombas-centrifugas/bc-92-s/'
  },
  {
    id: 'schneider-bc92s-20cv',
    brand: 'Schneider',
    model: 'BC-92 S (2.0 CV) - Alta Pressão',
    type: 'centrifuga',
    powerCv: 2.0,
    powerKw: 1.5,
    voltage: '220/380V Trifásico ou 127/220V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1.1/2"',
    dischargePortPol: '1"',
    rotorDiameterMm: 155,
    maxHeadMca: 52.0,
    minFlowM3h: 1.0,
    maxFlowM3h: 14.2,
    curveCoefficients: { a: -0.21, b: -0.30, c: 52.0 },
    samplePoints: [
      { flowM3h: 1.0, headMca: 51 },
      { flowM3h: 4.0, headMca: 48 },
      { flowM3h: 8.0, headMca: 39 },
      { flowM3h: 11.0, headMca: 26 },
      { flowM3h: 14.2, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 8.0,
    bestEfficiencyHeadMca: 39,
    maxEfficiencyPct: 70,
    features: [
      'Alta pressão e vazão para sistemas de irrigação por aspersão',
      'Capacidade de vencer desníveis acima de 40 metros com folga',
      'Motor industrial WEG de alto rendimento'
    ],
    approxPriceBrl: 1750,
    manualUrl: 'https://www.franklin-electric.com.br/produtos/bombas-centrifugas/bc-92-s/'
  },
  {
    id: 'schneider-sub25-10cv',
    brand: 'Schneider',
    model: 'SUB 25-10 (1.0 CV) - Submersa 4"',
    type: 'submersivel',
    powerCv: 1.0,
    powerKw: 0.75,
    voltage: '220V Monofásico ou Trifásico',
    phase: 'Monofásico 127/220V',
    suctionPortPol: 'Submersa (Grade Inox)',
    dischargePortPol: '1.1/4"',
    maxHeadMca: 84.0,
    minFlowM3h: 0.8,
    maxFlowM3h: 4.5,
    curveCoefficients: { a: -3.4, b: -2.8, c: 85.0 },
    samplePoints: [
      { flowM3h: 0.8, headMca: 82 },
      { flowM3h: 2.0, headMca: 68 },
      { flowM3h: 3.0, headMca: 50 },
      { flowM3h: 4.0, headMca: 24 },
      { flowM3h: 4.5, headMca: 6 }
    ],
    bestEfficiencyFlowM3h: 2.5,
    bestEfficiencyHeadMca: 60,
    maxEfficiencyPct: 62,
    features: [
      'Multi-estágios de alta pressão para poços artesianos',
      'Corpo e eixo em aço inoxidável AISI 304',
      'Excelente para dessedentação animal e pivôs de pequena escala'
    ],
    approxPriceBrl: 1890,
    manualUrl: 'https://www.franklin-electric.com.br/produtos/bombas-submersas/sub-25/'
  },
  {
    id: 'schneider-msa21r-10cv',
    brand: 'Schneider',
    model: 'Autoaspirante MSA-21 R (1.0 CV)',
    type: 'autoaspirante',
    powerCv: 1.0,
    powerKw: 0.75,
    voltage: '127/220V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1"',
    dischargePortPol: '1"',
    rotorDiameterMm: 125,
    maxHeadMca: 38.0,
    minFlowM3h: 0.5,
    maxFlowM3h: 5.5,
    curveCoefficients: { a: -1.0, b: -1.2, c: 39.0 },
    samplePoints: [
      { flowM3h: 0.5, headMca: 38 },
      { flowM3h: 2.0, headMca: 32 },
      { flowM3h: 3.5, headMca: 22 },
      { flowM3h: 5.5, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 2.8,
    bestEfficiencyHeadMca: 27,
    maxEfficiencyPct: 58,
    features: [
      'Autoaspirante: Dispensa válvula de pé na sucção em desníveis de até 7m',
      'Elimina ar da tubulação automaticamente',
      'Excelente para captação em rios e tanques onde há entrada ocasional de ar'
    ],
    approxPriceBrl: 1280,
    manualUrl: 'https://www.franklin-electric.com.br/produtos/bombas-autoaspirantes/msa-21-r/'
  },

  // =========================================================================
  // 5. BOMBAS DANCOR (Tradição em Abastecimento e Agricultura)
  // =========================================================================
  {
    id: 'dancor-pratika-05cv',
    brand: 'Dancor',
    model: 'Pratika CP-4R (1/2 CV) - Centrífuga',
    type: 'centrifuga',
    powerCv: 0.5,
    powerKw: 0.37,
    voltage: '127/220V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '3/4"',
    dischargePortPol: '3/4"',
    rotorDiameterMm: 105,
    maxHeadMca: 24.0,
    minFlowM3h: 0.4,
    maxFlowM3h: 6.0,
    curveCoefficients: { a: -0.55, b: -0.50, c: 24.5 },
    samplePoints: [
      { flowM3h: 0.4, headMca: 24 },
      { flowM3h: 2.0, headMca: 21 },
      { flowM3h: 4.0, headMca: 14 },
      { flowM3h: 6.0, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 3.2,
    bestEfficiencyHeadMca: 17,
    maxEfficiencyPct: 60,
    features: [
      'Compacta e silenciosa',
      'Carcaça com tratamento anticorrosivo',
      'Excelente custo-benefício para abastecimento diário'
    ],
    approxPriceBrl: 640,
    manualUrl: 'https://www.dancor.com.br/produtos/pratika-cp-4r'
  },
  {
    id: 'dancor-pratika-075cv',
    brand: 'Dancor',
    model: 'Pratika CP-4R (3/4 CV) - Centrífuga',
    type: 'centrifuga',
    powerCv: 0.75,
    powerKw: 0.55,
    voltage: '127/220V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1"',
    dischargePortPol: '1"',
    rotorDiameterMm: 115,
    maxHeadMca: 28.0,
    minFlowM3h: 0.5,
    maxFlowM3h: 7.5,
    curveCoefficients: { a: -0.42, b: -0.45, c: 28.5 },
    samplePoints: [
      { flowM3h: 0.5, headMca: 28 },
      { flowM3h: 2.5, headMca: 24 },
      { flowM3h: 5.0, headMca: 16 },
      { flowM3h: 7.5, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 4.0,
    bestEfficiencyHeadMca: 20,
    maxEfficiencyPct: 62,
    features: [
      'Rotor fechado de alta precisão em Noryl',
      'Selo mecânico resistente ao desgaste',
      'Indicada para residências, pequenas lavouras e fontes'
    ],
    approxPriceBrl: 810,
    manualUrl: 'https://www.dancor.com.br/produtos/pratika-cp-4r'
  },
  {
    id: 'dancor-pratika-10cv',
    brand: 'Dancor',
    model: 'Pratika CP-4R (1.0 CV) - Centrífuga',
    type: 'centrifuga',
    powerCv: 1.0,
    powerKw: 0.75,
    voltage: '127/220V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1"',
    dischargePortPol: '1"',
    rotorDiameterMm: 125,
    maxHeadMca: 32.0,
    minFlowM3h: 0.5,
    maxFlowM3h: 9.0,
    curveCoefficients: { a: -0.33, b: -0.40, c: 32.5 },
    samplePoints: [
      { flowM3h: 0.5, headMca: 32 },
      { flowM3h: 3.0, headMca: 28 },
      { flowM3h: 6.0, headMca: 18 },
      { flowM3h: 9.0, headMca: 3 }
    ],
    bestEfficiencyFlowM3h: 4.8,
    bestEfficiencyHeadMca: 23,
    maxEfficiencyPct: 63,
    features: [
      'Alta confiabilidade nacional',
      'Selo mecânico de grafite/cerâmica de alta durabilidade',
      'Fácil reposição de peças em todo o Brasil'
    ],
    approxPriceBrl: 960,
    manualUrl: 'https://www.dancor.com.br/produtos/pratika-cp-4r'
  },
  {
    id: 'dancor-ultra-d-15cv',
    brand: 'Dancor',
    model: 'Ultra D-15 (1.5 CV) - Média Pressão',
    type: 'centrifuga',
    powerCv: 1.5,
    powerKw: 1.1,
    voltage: '127/220V ou 220/380V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1.1/2"',
    dischargePortPol: '1.1/4"',
    rotorDiameterMm: 140,
    maxHeadMca: 42.0,
    minFlowM3h: 1.0,
    maxFlowM3h: 13.5,
    curveCoefficients: { a: -0.19, b: -0.25, c: 42.5 },
    samplePoints: [
      { flowM3h: 1.0, headMca: 42 },
      { flowM3h: 4.5, headMca: 37 },
      { flowM3h: 9.0, headMca: 25 },
      { flowM3h: 13.5, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 7.5,
    bestEfficiencyHeadMca: 30,
    maxEfficiencyPct: 67,
    features: [
      'Projetada para irrigação por aspersão e gotejamento',
      'Motor de carcaça de alumínio com dissipação térmica otimizada',
      'Excelente desempenho em distâncias horizontais longas'
    ],
    approxPriceBrl: 1420,
    manualUrl: 'https://www.dancor.com.br/produtos/ultra-d'
  },
  {
    id: 'dancor-ultra-d-20cv',
    brand: 'Dancor',
    model: 'Ultra D-20 (2.0 CV) - Alta Vazão',
    type: 'centrifuga',
    powerCv: 2.0,
    powerKw: 1.5,
    voltage: '220/380V Trifásico ou 127/220V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '2"',
    dischargePortPol: '1.1/2"',
    rotorDiameterMm: 155,
    maxHeadMca: 48.0,
    minFlowM3h: 1.5,
    maxFlowM3h: 18.0,
    curveCoefficients: { a: -0.13, b: -0.22, c: 48.5 },
    samplePoints: [
      { flowM3h: 1.5, headMca: 48 },
      { flowM3h: 6.0, headMca: 42 },
      { flowM3h: 12.0, headMca: 27 },
      { flowM3h: 18.0, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 10.5,
    bestEfficiencyHeadMca: 33,
    maxEfficiencyPct: 69,
    features: [
      'Bocal de sucção de 2 polegadas para evitar cavitação',
      'Indicada para transferência em açudes e abastecimento de caixas centrais',
      'Alta robustez mecânica'
    ],
    approxPriceBrl: 1780,
    manualUrl: 'https://www.dancor.com.br/produtos/ultra-d'
  },
  {
    id: 'dancor-ds4-05cv',
    brand: 'Dancor',
    model: 'DS-4 05 (1/2 CV) - Submersível Poço',
    type: 'submersivel',
    powerCv: 0.5,
    powerKw: 0.37,
    voltage: '220V Monofásico',
    phase: 'Monofásico 127/220V',
    suctionPortPol: 'Submersa',
    dischargePortPol: '1"',
    maxHeadMca: 50.0,
    minFlowM3h: 0.4,
    maxFlowM3h: 2.7,
    curveCoefficients: { a: -6.1, b: -2.0, c: 51.0 },
    samplePoints: [
      { flowM3h: 0.4, headMca: 50 },
      { flowM3h: 1.2, headMca: 40 },
      { flowM3h: 2.0, headMca: 22 },
      { flowM3h: 2.7, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 1.4,
    bestEfficiencyHeadMca: 35,
    maxEfficiencyPct: 60,
    features: [
      'Bomba submersa multiestágio econômica para poços tubulares',
      'Corpo em aço inox e rotores em Noryl',
      'Acompanha caixa de controle monofásica'
    ],
    approxPriceBrl: 1190,
    manualUrl: 'https://www.dancor.com.br/produtos/ds-4'
  },

  // =========================================================================
  // 6. BOMBAS ANAUGER (Vibratórias, Cisternas e Energia Solar)
  // =========================================================================
  {
    id: 'anauger-800-5g',
    brand: 'Anauger',
    model: 'Anauger 800 5G (Vibratória)',
    type: 'submersivel',
    powerCv: 0.45,
    powerKw: 0.34,
    voltage: '127V ou 220V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: 'Submersa (Crivo)',
    dischargePortPol: '3/4"',
    maxHeadMca: 70.0,
    minFlowM3h: 0.3,
    maxFlowM3h: 1.9,
    curveCoefficients: { a: -14.5, b: -8.2, c: 72.0 },
    samplePoints: [
      { flowM3h: 0.3, headMca: 68 },
      { flowM3h: 0.6, headMca: 60 },
      { flowM3h: 1.0, headMca: 50 },
      { flowM3h: 1.4, headMca: 35 },
      { flowM3h: 1.9, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 1.1,
    bestEfficiencyHeadMca: 45,
    maxEfficiencyPct: 42,
    features: [
      'Ideal para poços comuns (caipira/cisterna) e pequenas propriedades',
      'Excelente pressão para enchimento de caixas elevadas',
      'Baixo consumo elétrico (340W)'
    ],
    approxPriceBrl: 380,
    manualUrl: 'https://www.anauger.com.br/produtos/bomba-anauger-800-5g/'
  },
  {
    id: 'anauger-900-5g',
    brand: 'Anauger',
    model: 'Anauger 900 5G (Vibratória Alta Vazão)',
    type: 'submersivel',
    powerCv: 0.6,
    powerKw: 0.45,
    voltage: '127V ou 220V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: 'Submersa (Crivo)',
    dischargePortPol: '1"',
    maxHeadMca: 70.0,
    minFlowM3h: 0.5,
    maxFlowM3h: 2.3,
    curveCoefficients: { a: -11.8, b: -6.5, c: 71.5 },
    samplePoints: [
      { flowM3h: 0.5, headMca: 66 },
      { flowM3h: 1.0, headMca: 55 },
      { flowM3h: 1.5, headMca: 42 },
      { flowM3h: 2.0, headMca: 22 },
      { flowM3h: 2.3, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 1.4,
    bestEfficiencyHeadMca: 45,
    maxEfficiencyPct: 45,
    features: [
      'Maior vazão da linha vibratória Anauger (até 2.300 L/h)',
      'Saída de 1 polegada',
      'Ótima para abastecimento rural e pequenos pomares'
    ],
    approxPriceBrl: 450,
    manualUrl: 'https://www.anauger.com.br/produtos/bomba-anauger-900-5g/'
  },
  {
    id: 'anauger-ecco',
    brand: 'Anauger',
    model: 'Anauger ECCO (Econômica)',
    type: 'submersivel',
    powerCv: 0.38,
    powerKw: 0.28,
    voltage: '127V ou 220V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: 'Submersa (Crivo)',
    dischargePortPol: '3/4"',
    maxHeadMca: 50.0,
    minFlowM3h: 0.2,
    maxFlowM3h: 1.4,
    curveCoefficients: { a: -21.0, b: -6.0, c: 51.0 },
    samplePoints: [
      { flowM3h: 0.2, headMca: 49 },
      { flowM3h: 0.6, headMca: 40 },
      { flowM3h: 1.0, headMca: 24 },
      { flowM3h: 1.4, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 0.8,
    bestEfficiencyHeadMca: 32,
    maxEfficiencyPct: 40,
    features: [
      'Modelo ultra-econômico com consumo de 280W',
      'Ideal para cisternas e reservatórios com desnível moderado',
      'Fácil instalação e manuseio'
    ],
    approxPriceBrl: 320,
    manualUrl: 'https://www.anauger.com.br/produtos/bomba-anauger-ecco/'
  },
  {
    id: 'anauger-solar-r100',
    brand: 'Anauger',
    model: 'Solar R100 (Energia Solar DC)',
    type: 'solar',
    powerCv: 0.35,
    powerKw: 0.25,
    voltage: 'DC (Placas Solares 100W a 300W)',
    phase: 'Solar DC (24V/48V/110V)',
    suctionPortPol: 'Submersa (Crivo)',
    dischargePortPol: '3/4"',
    maxHeadMca: 40.0,
    minFlowM3h: 0.2,
    maxFlowM3h: 1.2,
    curveCoefficients: { a: -22.0, b: -8.0, c: 42.0 },
    samplePoints: [
      { flowM3h: 0.2, headMca: 40 },
      { flowM3h: 0.5, headMca: 33 },
      { flowM3h: 0.8, headMca: 22 },
      { flowM3h: 1.2, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 0.6,
    bestEfficiencyHeadMca: 28,
    maxEfficiencyPct: 44,
    features: [
      'Alimentação 100% fotovoltaica direta sem necessidade de baterias',
      'Ideal para bebedouros de gado isolados no pasto e semiárido',
      'Driver integrado com proteção contra funcionamento a seco'
    ],
    approxPriceBrl: 1650,
    manualUrl: 'https://www.anauger.com.br/produtos/anauger-solar-r100/'
  },
  {
    id: 'anauger-solar-p100',
    brand: 'Anauger',
    model: 'Solar P100 (Energia Solar Poço Profundo)',
    type: 'solar',
    powerCv: 0.5,
    powerKw: 0.37,
    voltage: 'DC (Painéis Solares 250W a 500W)',
    phase: 'Solar DC (24V/48V/110V)',
    suctionPortPol: 'Submersa',
    dischargePortPol: '3/4"',
    maxHeadMca: 65.0,
    minFlowM3h: 0.2,
    maxFlowM3h: 1.6,
    curveCoefficients: { a: -20.5, b: -7.5, c: 66.0 },
    samplePoints: [
      { flowM3h: 0.2, headMca: 63 },
      { flowM3h: 0.8, headMca: 46 },
      { flowM3h: 1.2, headMca: 28 },
      { flowM3h: 1.6, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 0.9,
    bestEfficiencyHeadMca: 42,
    maxEfficiencyPct: 46,
    features: [
      'Maior capacidade de pressão na linha solar fotovoltaica',
      'Operação contínua sob irradiação solar de 5 a 6 horas diárias',
      'Zero custo mensal de energia elétrica'
    ],
    approxPriceBrl: 2190,
    manualUrl: 'https://www.anauger.com.br/produtos/anauger-solar-p100/'
  },

  // =========================================================================
  // 7. BOMBAS THEBE (Centrífugas e Alta Vazão)
  // =========================================================================
  {
    id: 'thebe-th16-10cv',
    brand: 'Thebe',
    model: 'TH-16 (1.0 CV) - Centrífuga',
    type: 'centrifuga',
    powerCv: 1.0,
    powerKw: 0.75,
    voltage: '127/220V ou 220/380V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1.1/2"',
    dischargePortPol: '1"',
    rotorDiameterMm: 135,
    maxHeadMca: 36.0,
    minFlowM3h: 1.0,
    maxFlowM3h: 11.5,
    curveCoefficients: { a: -0.24, b: -0.35, c: 36.5 },
    samplePoints: [
      { flowM3h: 1.0, headMca: 36 },
      { flowM3h: 4.0, headMca: 31 },
      { flowM3h: 8.0, headMca: 18 },
      { flowM3h: 11.5, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 6.0,
    bestEfficiencyHeadMca: 25,
    maxEfficiencyPct: 65,
    features: [
      'Bomba monobloco para uso geral e irrigação',
      'Rotor em alumínio/bronze e corpo em ferro fundido',
      'Elevada confiabilidade mecânica'
    ],
    approxPriceBrl: 1150,
    manualUrl: 'https://www.thebe.com.br/produtos/th-16'
  },
  {
    id: 'thebe-th16-20cv',
    brand: 'Thebe',
    model: 'TH-16 (2.0 CV) - Alta Vazão',
    type: 'centrifuga',
    powerCv: 2.0,
    powerKw: 1.5,
    voltage: '220/380V Trifásico ou 127/220V',
    phase: 'Trifásico 220/380V',
    suctionPortPol: '2"',
    dischargePortPol: '1.1/2"',
    rotorDiameterMm: 160,
    maxHeadMca: 48.0,
    minFlowM3h: 2.0,
    maxFlowM3h: 22.0,
    curveCoefficients: { a: -0.08, b: -0.25, c: 49.0 },
    samplePoints: [
      { flowM3h: 2.0, headMca: 48 },
      { flowM3h: 8.0, headMca: 42 },
      { flowM3h: 14.0, headMca: 31 },
      { flowM3h: 18.0, headMca: 18 },
      { flowM3h: 22.0, headMca: 4 }
    ],
    bestEfficiencyFlowM3h: 12.0,
    bestEfficiencyHeadMca: 35,
    maxEfficiencyPct: 72,
    features: [
      'Sucção ampla de 2 polegadas para evitar cavitação com vazões elevadas',
      'Perfeita para sistemas de irrigação por canhão, microaspersão e gotejamento',
      'Rotor de bronze e carcaça robusta'
    ],
    approxPriceBrl: 2200,
    manualUrl: 'https://www.thebe.com.br/produtos/th-16'
  },
  {
    id: 'thebe-tsb40-10cv',
    brand: 'Thebe',
    model: 'TSB-40 (1.0 CV) - Submersa Inox 4"',
    type: 'submersivel',
    powerCv: 1.0,
    powerKw: 0.75,
    voltage: '220V Monofásico ou Trifásico',
    phase: 'Monofásico 127/220V',
    suctionPortPol: 'Submersa',
    dischargePortPol: '1.1/4"',
    maxHeadMca: 72.0,
    minFlowM3h: 0.6,
    maxFlowM3h: 4.2,
    curveCoefficients: { a: -3.8, b: -1.5, c: 73.0 },
    samplePoints: [
      { flowM3h: 0.6, headMca: 71 },
      { flowM3h: 2.0, headMca: 54 },
      { flowM3h: 3.2, headMca: 29 },
      { flowM3h: 4.2, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 2.4,
    bestEfficiencyHeadMca: 48,
    maxEfficiencyPct: 64,
    features: [
      'Bomba submersa para poços de 4 polegadas com carcaça em inox',
      'Excelente desempenho para desníveis médios e abastecimento rural',
      'Motor com proteção térmica'
    ],
    approxPriceBrl: 1690,
    manualUrl: 'https://www.thebe.com.br/produtos/tsb-40'
  },

  // =========================================================================
  // 8. BOMBAS ELETROPLAS (Periféricas e Centrífugas Acessíveis)
  // =========================================================================
  {
    id: 'eletroplas-qb60-05cv',
    brand: 'Eletroplas',
    model: 'Periférica QB-60 (1/2 CV)',
    type: 'periferica',
    powerCv: 0.5,
    powerKw: 0.37,
    voltage: '127V ou 220V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1"',
    dischargePortPol: '1"',
    rotorDiameterMm: 65,
    maxHeadMca: 35.0,
    minFlowM3h: 0.2,
    maxFlowM3h: 2.1,
    curveCoefficients: { a: -6.8, b: -2.5, c: 35.5 },
    samplePoints: [
      { flowM3h: 0.2, headMca: 34 },
      { flowM3h: 0.6, headMca: 29 },
      { flowM3h: 1.0, headMca: 22 },
      { flowM3h: 1.5, headMca: 14 },
      { flowM3h: 2.1, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 0.9,
    bestEfficiencyHeadMca: 24,
    maxEfficiencyPct: 48,
    features: [
      'Alta pressão com baixo consumo elétrico para vazões baixas',
      'Rotor periférico em latão bronzeado',
      'Econômica para pressurização residencial e cisternas rasas'
    ],
    approxPriceBrl: 260,
    manualUrl: 'https://www.eletroplas.com.br/produtos/qb-60'
  },
  {
    id: 'eletroplas-ics50a-05cv',
    brand: 'Eletroplas',
    model: 'ICS-50A (1/2 CV) - Centrífuga Standard',
    type: 'centrifuga',
    powerCv: 0.5,
    powerKw: 0.37,
    voltage: '127/220V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1"',
    dischargePortPol: '1"',
    rotorDiameterMm: 108,
    maxHeadMca: 22.0,
    minFlowM3h: 0.5,
    maxFlowM3h: 5.8,
    curveCoefficients: { a: -0.62, b: -0.40, c: 22.5 },
    samplePoints: [
      { flowM3h: 0.5, headMca: 22 },
      { flowM3h: 2.0, headMca: 19 },
      { flowM3h: 4.0, headMca: 11 },
      { flowM3h: 5.8, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 3.0,
    bestEfficiencyHeadMca: 15,
    maxEfficiencyPct: 58,
    features: [
      'Modelo de entrada com carcaça em ferro fundido',
      'Adequada para pequenas distâncias e bombeamento residencial',
      'Manutenção simples e econômica'
    ],
    approxPriceBrl: 490,
    manualUrl: 'https://www.eletroplas.com.br/produtos/ics-50a'
  },
  {
    id: 'eletroplas-ics100-10cv',
    brand: 'Eletroplas',
    model: 'ICS-100 (1.0 CV) - Centrífuga Média',
    type: 'centrifuga',
    powerCv: 1.0,
    powerKw: 0.75,
    voltage: '127/220V',
    phase: 'Monofásico 127/220V',
    suctionPortPol: '1"',
    dischargePortPol: '1"',
    rotorDiameterMm: 125,
    maxHeadMca: 30.0,
    minFlowM3h: 0.5,
    maxFlowM3h: 8.5,
    curveCoefficients: { a: -0.38, b: -0.35, c: 30.5 },
    samplePoints: [
      { flowM3h: 0.5, headMca: 30 },
      { flowM3h: 3.0, headMca: 26 },
      { flowM3h: 6.0, headMca: 14 },
      { flowM3h: 8.5, headMca: 2 }
    ],
    bestEfficiencyFlowM3h: 4.5,
    bestEfficiencyHeadMca: 21,
    maxEfficiencyPct: 62,
    features: [
      'Bomba monobloco com protetor térmico no motor',
      'Boa vazão para abastecimento de caixas e tanques',
      'Excelente custo de aquisição'
    ],
    approxPriceBrl: 780,
    manualUrl: 'https://www.eletroplas.com.br/produtos/ics-100'
  }
];
