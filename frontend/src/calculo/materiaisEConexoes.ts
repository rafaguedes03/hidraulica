/**
 * TUBOS E CONEXÕES
 *
 * Tabelas usadas no cálculo das perdas de carga:
 *   - MATERIAIS_TUBO: coeficiente C de Hazen-Williams de cada material;
 *   - DIAMETROS_COMERCIAIS: bitolas do PVC soldável (externo e interno);
 *   - CONEXOES: comprimento equivalente de cada peça, por bitola (NBR 5626).
 */
import { MaterialTubo, DefinicaoConexao, DiametroComercial, ItemConexao } from './tipos';

/** Quanto maior o C, mais liso o tubo e menor a perda de carga. */
export const MATERIAIS_TUBO: MaterialTubo[] = [
  {
    id: 'pvc',
    nome: 'PVC Rígido Soldável (NBR 5648)',
    nomeCurto: 'PVC',
    coeficienteC: 140,
    usoTipico: 'Padrão residencial, predial e irrigação leve. Baixíssimo atrito e imune à corrosão.'
  },
  {
    id: 'pead',
    nome: 'PEAD (Polietileno de Alta Densidade)',
    nomeCurto: 'PEAD (mangueira preta)',
    coeficienteC: 140,
    usoTipico: 'Irrigação rural, captação subterrânea e adutoras flexíveis.'
  },
  {
    id: 'aco_galvanizado',
    nome: 'Aço Galvanizado Novo (NBR 5580)',
    nomeCurto: 'Aço galvanizado',
    coeficienteC: 125,
    usoTipico: 'Poços artesianos, alta pressão mecânica e instalações expostas.'
  },
  {
    id: 'aco_soldado',
    nome: 'Aço Soldado Novo / Aço Carbono',
    nomeCurto: 'Aço carbono',
    coeficienteC: 130,
    usoTipico: 'Adutoras de grande porte e instalações industriais.'
  },
  {
    id: 'ferro_fundido',
    nome: 'Ferro Fundido Dúctil / Usado',
    nomeCurto: 'Ferro fundido',
    coeficienteC: 100,
    usoTipico: 'Redes públicas e tubulações antigas sujeitas a incrustações.'
  }
];

/**
 * Bitolas comerciais do PVC soldável. O cálculo usa o diâmetro interno;
 * o nominal (externo) serve para achar a linha certa na tabela de conexões.
 */
export const DIAMETROS_COMERCIAIS: DiametroComercial[] = [
  { bitolaPol: '1/2"', nominalMm: 20, internoMm: 17.0 },
  { bitolaPol: '3/4"', nominalMm: 25, internoMm: 21.6 },
  { bitolaPol: '1"', nominalMm: 32, internoMm: 27.8 },
  { bitolaPol: '1.1/4"', nominalMm: 40, internoMm: 35.2 },
  { bitolaPol: '1.1/2"', nominalMm: 50, internoMm: 44.0 },
  { bitolaPol: '2"', nominalMm: 60, internoMm: 53.4 },
  { bitolaPol: '2.1/2"', nominalMm: 75, internoMm: 66.6 },
  { bitolaPol: '3"', nominalMm: 85, internoMm: 75.6 },
  { bitolaPol: '4"', nominalMm: 110, internoMm: 97.8 }
];

/**
 * Comprimento equivalente de cada conexão, em metros de cano reto,
 * para cada diâmetro nominal (20, 25, 32... 110 mm).
 * Ex.: uma válvula de pé de 32 mm causa a mesma perda que 13,3 m de cano.
 */
export const CONEXOES: DefinicaoConexao[] = [
  {
    id: 'valvula_pe_crivo',
    nome: 'Válvula de Pé com Crivo (Sucção)',
    categoria: 'valvulas',
    comprimentosEquivalentes: {
      20: 7.3, 25: 9.5, 32: 13.3, 40: 15.5, 50: 18.3, 60: 23.7, 75: 28.0, 85: 35.0, 110: 45.0
    }
  },
  {
    id: 'valvula_retencao_pesada',
    nome: 'Válvula de Retenção (Pesada / Tipo Portinhola)',
    categoria: 'valvulas',
    comprimentosEquivalentes: {
      20: 2.4, 25: 2.7, 32: 3.8, 40: 4.9, 50: 6.8, 60: 8.2, 75: 10.3, 85: 12.5, 110: 16.0
    }
  },
  {
    id: 'valvula_retencao_leve',
    nome: 'Válvula de Retenção (Leve / Tipo Mola)',
    categoria: 'valvulas',
    comprimentosEquivalentes: {
      20: 1.6, 25: 2.1, 32: 2.7, 40: 3.4, 50: 4.3, 60: 5.8, 75: 7.1, 85: 8.5, 110: 11.2
    }
  },
  {
    id: 'curva_90_raio_longo',
    nome: 'Curva 90° Raio Longo',
    categoria: 'curvas',
    comprimentosEquivalentes: {
      20: 0.3, 25: 0.4, 32: 0.5, 40: 0.6, 50: 0.7, 60: 1.0, 75: 1.2, 85: 1.4, 110: 1.9
    }
  },
  {
    id: 'curva_90_raio_curto',
    nome: 'Curva 90° Raio Curto',
    categoria: 'curvas',
    comprimentosEquivalentes: {
      20: 0.6, 25: 0.7, 32: 0.9, 40: 1.1, 50: 1.3, 60: 1.7, 75: 2.1, 85: 2.5, 110: 3.4
    }
  },
  {
    id: 'joelho_90',
    nome: 'Joelho 90° (Cotovelo)',
    categoria: 'curvas',
    comprimentosEquivalentes: {
      20: 1.1, 25: 1.2, 32: 1.5, 40: 2.0, 50: 3.2, 60: 3.4, 75: 3.7, 85: 3.9, 110: 4.8
    }
  },
  {
    id: 'joelho_45',
    nome: 'Joelho 45°',
    categoria: 'curvas',
    comprimentosEquivalentes: {
      20: 0.4, 25: 0.5, 32: 0.7, 40: 0.8, 50: 1.0, 60: 1.3, 75: 1.7, 85: 1.9, 110: 2.4
    }
  },
  {
    id: 'registro_gaveta_aberto',
    nome: 'Registro de Gaveta Aberto',
    categoria: 'registros',
    comprimentosEquivalentes: {
      20: 0.1, 25: 0.2, 32: 0.3, 40: 0.4, 50: 0.7, 60: 0.8, 75: 0.9, 85: 1.1, 110: 1.4
    }
  },
  {
    id: 'registro_globo_aberto',
    nome: 'Registro de Globo Aberto',
    categoria: 'registros',
    comprimentosEquivalentes: {
      20: 4.9, 25: 6.7, 32: 8.2, 40: 11.3, 50: 15.2, 60: 17.1, 75: 21.0, 85: 25.0, 110: 34.0
    }
  },
  {
    id: 'registro_esfera_aberto',
    nome: 'Registro de Esfera (Passagem Plena)',
    categoria: 'registros',
    comprimentosEquivalentes: {
      20: 0.1, 25: 0.1, 32: 0.2, 40: 0.2, 50: 0.3, 60: 0.4, 75: 0.5, 85: 0.6, 110: 0.8
    }
  },
  {
    id: 'te_passagem_direta',
    nome: 'Tê 90° - Passagem Direta',
    categoria: 'conexoes',
    comprimentosEquivalentes: {
      20: 0.7, 25: 0.8, 32: 0.9, 40: 1.5, 50: 2.2, 60: 2.3, 75: 2.4, 85: 2.5, 110: 3.1
    }
  },
  {
    id: 'te_saida_lateral',
    nome: 'Tê 90° - Saída Lateral',
    categoria: 'conexoes',
    comprimentosEquivalentes: {
      20: 2.3, 25: 2.4, 32: 3.1, 40: 4.6, 50: 7.3, 60: 7.6, 75: 7.8, 85: 8.3, 110: 10.0
    }
  },
  {
    id: 'saida_tubulacao',
    nome: 'Saída de Tubulação (Entrada no reservatório)',
    categoria: 'conexoes',
    comprimentosEquivalentes: {
      20: 0.8, 25: 0.9, 32: 1.3, 40: 1.4, 50: 1.6, 60: 2.2, 75: 2.6, 85: 3.1, 110: 3.9
    }
  }
];

/**
 * Diâmetro nominal (mm) cuja medida interna é a mais próxima da informada.
 * Ex.: 27,8 mm internos → 32 mm nominal (1").
 */
export function diametroNominalMaisProximo(diametroInternoMm: number): number {
  let maisProximo = DIAMETROS_COMERCIAIS[0].nominalMm;
  let menorDiferenca = Math.abs(DIAMETROS_COMERCIAIS[0].internoMm - diametroInternoMm);

  for (const diametro of DIAMETROS_COMERCIAIS) {
    const diferenca = Math.abs(diametro.internoMm - diametroInternoMm);
    if (diferenca < menorDiferenca) {
      menorDiferenca = diferenca;
      maisProximo = diametro.nominalMm;
    }
  }
  return maisProximo;
}

/**
 * Conexões típicas de uma instalação pequena, usadas no modo simples para que
 * as perdas localizadas não fiquem de fora da conta.
 * Sucção: válvula de pé com crivo e uma curva.
 */
export const CONEXOES_TIPICAS_SUCCAO: ItemConexao[] = [
  { idConexao: 'valvula_pe_crivo', quantidade: 1 },
  { idConexao: 'curva_90_raio_longo', quantidade: 1 }
];

/** Recalque: válvula de retenção, registro, três joelhos e a saída no reservatório. */
export const CONEXOES_TIPICAS_RECALQUE: ItemConexao[] = [
  { idConexao: 'valvula_retencao_leve', quantidade: 1 },
  { idConexao: 'registro_gaveta_aberto', quantidade: 1 },
  { idConexao: 'joelho_90', quantidade: 3 },
  { idConexao: 'saida_tubulacao', quantidade: 1 }
];

/** Texto curto da lista de conexões, para o memorial: "1× válvula de pé com crivo, 3× joelho 90°". */
export function descreverConexoes(conexoes: ItemConexao[]): string {
  return conexoes
    .filter(item => item.quantidade > 0)
    .map(item => {
      const definicao = CONEXOES.find(c => c.id === item.idConexao);
      // tira o que está entre parênteses no fim do nome: "Válvula de Pé com Crivo (Sucção)" → "válvula de pé com crivo"
      const nome = definicao ? definicao.nome.replace(/\s*\(.*\)$/, '').toLowerCase() : item.idConexao;
      return `${item.quantidade}× ${nome}`;
    })
    .join(', ');
}
