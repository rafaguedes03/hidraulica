import { PipeMaterial, FittingDefinition, CommercialDiameter } from './types';

export const PIPE_MATERIALS: PipeMaterial[] = [
  {
    id: 'pvc',
    name: 'PVC Rígido Soldável (NBR 5648)',
    cFactor: 140,
    typicalUse: 'Padrão residencial, predial e irrigação leve. Baixíssimo atrito e imune à corrosão.'
  },
  {
    id: 'pead',
    name: 'PEAD (Polietileno de Alta Densidade)',
    cFactor: 140,
    typicalUse: 'Irrigação rural, captação subterrânea e adutoras flexíveis.'
  },
  {
    id: 'aco_galvanizado',
    name: 'Aço Galvanizado Novo (NBR 5580)',
    cFactor: 125,
    typicalUse: 'Poços artesianos, alta pressão mecânica e instalações expostas.'
  },
  {
    id: 'aco_soldado',
    name: 'Aço Soldado Novo / Aço Carbono',
    cFactor: 130,
    typicalUse: 'Adutoras de grande porte e instalações industriais.'
  },
  {
    id: 'ferro_fundido',
    name: 'Ferro Fundido Dúctil / Usado',
    cFactor: 100,
    typicalUse: 'Redes públicas e tubulações antigas sujeitas a incrustações.'
  }
];

export const COMMERCIAL_DIAMETERS: CommercialDiameter[] = [
  { nominalPol: '1/2"', nominalMm: 20, internalMm: 17.0 },
  { nominalPol: '3/4"', nominalMm: 25, internalMm: 21.6 },
  { nominalPol: '1"', nominalMm: 32, internalMm: 27.8 },
  { nominalPol: '1.1/4"', nominalMm: 40, internalMm: 35.2 },
  { nominalPol: '1.1/2"', nominalMm: 50, internalMm: 44.0 },
  { nominalPol: '2"', nominalMm: 60, internalMm: 53.4 },
  { nominalPol: '2.1/2"', nominalMm: 75, internalMm: 66.6 },
  { nominalPol: '3"', nominalMm: 85, internalMm: 75.6 },
  { nominalPol: '4"', nominalMm: 110, internalMm: 97.8 }
];

export const FITTING_DEFINITIONS: FittingDefinition[] = [
  {
    id: 'valvula_pe_crivo',
    name: 'Válvula de Pé com Crivo (Sucção)',
    category: 'valvulas',
    equivalentLengths: {
      20: 7.3, 25: 9.5, 32: 13.3, 40: 15.5, 50: 18.3, 60: 23.7, 75: 28.0, 85: 35.0, 110: 45.0
    }
  },
  {
    id: 'valvula_retencao_pesada',
    name: 'Válvula de Retenção (Pesada / Tipo Portinhola)',
    category: 'valvulas',
    equivalentLengths: {
      20: 2.4, 25: 2.7, 32: 3.8, 40: 4.9, 50: 6.8, 60: 8.2, 75: 10.3, 85: 12.5, 110: 16.0
    }
  },
  {
    id: 'valvula_retencao_leve',
    name: 'Válvula de Retenção (Leve / Tipo Mola)',
    category: 'valvulas',
    equivalentLengths: {
      20: 1.6, 25: 2.1, 32: 2.7, 40: 3.4, 50: 4.3, 60: 5.8, 75: 7.1, 85: 8.5, 110: 11.2
    }
  },
  {
    id: 'curva_90_raio_longo',
    name: 'Curva 90° Raio Longo',
    category: 'curvas',
    equivalentLengths: {
      20: 0.3, 25: 0.4, 32: 0.5, 40: 0.6, 50: 0.7, 60: 1.0, 75: 1.2, 85: 1.4, 110: 1.9
    }
  },
  {
    id: 'curva_90_raio_curto',
    name: 'Curva 90° Raio Curto',
    category: 'curvas',
    equivalentLengths: {
      20: 0.6, 25: 0.7, 32: 0.9, 40: 1.1, 50: 1.3, 60: 1.7, 75: 2.1, 85: 2.5, 110: 3.4
    }
  },
  {
    id: 'joelho_90',
    name: 'Joelho 90° (Cotovelo)',
    category: 'curvas',
    equivalentLengths: {
      20: 1.1, 25: 1.2, 32: 1.5, 40: 2.0, 50: 3.2, 60: 3.4, 75: 3.7, 85: 3.9, 110: 4.8
    }
  },
  {
    id: 'joelho_45',
    name: 'Joelho 45°',
    category: 'curvas',
    equivalentLengths: {
      20: 0.4, 25: 0.5, 32: 0.7, 40: 0.8, 50: 1.0, 60: 1.3, 75: 1.7, 85: 1.9, 110: 2.4
    }
  },
  {
    id: 'registro_gaveta_aberto',
    name: 'Registro de Gaveta Aberto',
    category: 'registros',
    equivalentLengths: {
      20: 0.1, 25: 0.2, 32: 0.3, 40: 0.4, 50: 0.7, 60: 0.8, 75: 0.9, 85: 1.1, 110: 1.4
    }
  },
  {
    id: 'registro_globo_aberto',
    name: 'Registro de Globo Aberto',
    category: 'registros',
    equivalentLengths: {
      20: 4.9, 25: 6.7, 32: 8.2, 40: 11.3, 50: 15.2, 60: 17.1, 75: 21.0, 85: 25.0, 110: 34.0
    }
  },
  {
    id: 'registro_esfera_aberto',
    name: 'Registro de Esfera (Passagem Plena)',
    category: 'registros',
    equivalentLengths: {
      20: 0.1, 25: 0.1, 32: 0.2, 40: 0.2, 50: 0.3, 60: 0.4, 75: 0.5, 85: 0.6, 110: 0.8
    }
  },
  {
    id: 'te_passagem_direta',
    name: 'Tê 90° - Passagem Direta',
    category: 'conexoes',
    equivalentLengths: {
      20: 0.7, 25: 0.8, 32: 0.9, 40: 1.5, 50: 2.2, 60: 2.3, 75: 2.4, 85: 2.5, 110: 3.1
    }
  },
  {
    id: 'te_saida_lateral',
    name: 'Tê 90° - Saída Lateral',
    category: 'conexoes',
    equivalentLengths: {
      20: 2.3, 25: 2.4, 32: 3.1, 40: 4.6, 50: 7.3, 60: 7.6, 75: 7.8, 85: 8.3, 110: 10.0
    }
  },
  {
    id: 'saida_tubulacao',
    name: 'Saída de Tubulação (Entrada no reservatório)',
    category: 'conexoes',
    equivalentLengths: {
      20: 0.8, 25: 0.9, 32: 1.3, 40: 1.4, 50: 1.6, 60: 2.2, 75: 2.6, 85: 3.1, 110: 3.9
    }
  }
];

export function getClosestNominalDiameter(internalMm: number): number {
  let closest = COMMERCIAL_DIAMETERS[0].nominalMm;
  let minDiff = Math.abs(COMMERCIAL_DIAMETERS[0].internalMm - internalMm);
  
  for (const d of COMMERCIAL_DIAMETERS) {
    const diff = Math.abs(d.internalMm - internalMm);
    if (diff < minDiff) {
      minDiff = diff;
      closest = d.nominalMm;
    }
  }
  return closest;
}
