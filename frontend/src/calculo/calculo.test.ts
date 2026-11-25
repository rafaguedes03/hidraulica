/**
 * TESTES DO CÁLCULO
 * Conferem as fórmulas com contas feitas à mão e as regras de seleção.
 * Rodar com: npm test (dentro de frontend)
 */
import { describe, it, expect } from 'vitest';
import { DadosEntrada } from './tipos';
import {
  calcularHidraulica,
  perdaUnitariaHazenWilliams,
  velocidadeEscoamento,
  folgaMotorPct,
  proximoMotorComercialCv,
  calcularPressaoAtmosferica
} from './calculoHidraulico';
import { avaliarBombas, alturaDaBombaNaVazao, ehBombaSubmersa } from './selecaoBombas';
import { CATALOGO_BOMBAS } from './catalogoBombas';
import { lerRespostaCatalogo } from './fonteCatalogo';
import { lerDecimal } from '../lib/formatacao';

// Instalação de referência: 3 m³/h, 2 m de sucção, 18 m de recalque, PVC de 1"
const base: DadosEntrada = {
  vazaoM3h: 3,
  horasPorDia: 4,
  pressaoResidualMca: 0,
  alturaSuccaoM: 2,
  comprimentoSuccaoM: 5,
  diametroSuccaoMm: 27.8,
  materialSuccao: 'pvc',
  conexoesSuccao: [],
  bombaSubmersa: false,
  alturaRecalqueM: 18,
  comprimentoRecalqueM: 60,
  diametroRecalqueMm: 27.8,
  materialRecalque: 'pvc',
  conexoesRecalque: [],
  rendimentoBombaPct: 60,
  rendimentoMotorPct: 85,
  altitudeM: 500,
  tarifaEnergiaBrlKwh: 1
};

describe('fórmulas básicas', () => {
  it('Hazen-Williams confere com cálculo manual', () => {
    // Q = 1 L/s, D = 50 mm, C = 140  ->  J ≈ 0,00676 m/m
    const j = perdaUnitariaHazenWilliams(0.001, 0.05, 140);
    expect(j).toBeCloseTo(0.00676, 4);
  });

  it('velocidade = Q / área', () => {
    // 1 L/s em 50 mm -> 0,509 m/s
    expect(velocidadeEscoamento(0.001, 0.05)).toBeCloseTo(0.509, 3);
  });

  it('pressão atmosférica cai com a altitude', () => {
    expect(calcularPressaoAtmosferica(0)).toBeCloseTo(10.33, 2);
    expect(calcularPressaoAtmosferica(1000)).toBeCloseTo(9.16, 1);
  });

  it('folga do motor segue a tabela', () => {
    expect(folgaMotorPct(1)).toBe(50);
    expect(folgaMotorPct(4)).toBe(30);
    expect(folgaMotorPct(8)).toBe(20);
    expect(folgaMotorPct(15)).toBe(15);
    expect(folgaMotorPct(30)).toBe(10);
  });

  it('arredonda para o motor comercial de cima', () => {
    expect(proximoMotorComercialCv(0.6)).toBe(0.75);
    expect(proximoMotorComercialCv(1)).toBe(1);
    expect(proximoMotorComercialCv(1.01)).toBe(1.5);
  });
});

describe('calcularHidraulica', () => {
  const r = calcularHidraulica(base);

  it('HMT = desnível + perdas + pressão residual', () => {
    expect(r.desnivelTotalM).toBe(20);
    expect(r.hmtMca).toBeCloseTo(r.desnivelTotalM + r.perdaTotalMca + r.pressaoResidualMca, 1);
    // 3 m³/h em PVC 27,8 mm: J ≈ 0,0847 m/m -> 65 m de tubo ≈ 5,50 mca
    expect(r.perdaTotalMca).toBeCloseTo(5.5, 1);
  });

  it('potência no eixo usa só o rendimento da bomba', () => {
    const hidraulica = (3 * r.hmtMca) / 270;
    expect(r.potenciaHidraulicaCv).toBeCloseTo(hidraulica, 2);
    expect(r.potenciaEixoCv).toBeCloseTo(hidraulica / 0.6, 2);
  });

  it('motor sugerido tem folga sobre o eixo', () => {
    expect(r.folgaMotorPct).toBe(50);
    expect(r.motorComercialCv).toBeGreaterThanOrEqual(r.potenciaEixoCv * 1.5 - 0.01);
    expect(r.motorComercialCv).toBe(0.75);
  });

  it('energia aplica o rendimento do motor uma única vez', () => {
    const kw = (r.potenciaEixoCv * 0.7355) / 0.85;
    expect(r.potenciaEletricaKw).toBeCloseTo(kw, 2);
    expect(r.consumoDiarioKwh).toBeCloseTo(kw * 4, 1);
    expect(r.custoMensalBrl).toBeCloseTo(kw * 4 * 30 * 1, 0);
  });

  it('vazão zero não gera números inventados', () => {
    const z = calcularHidraulica({ ...base, vazaoM3h: 0 });
    expect(z.vazaoM3h).toBe(0);
    expect(z.potenciaHidraulicaCv).toBe(0);
    expect(z.motorComercialCv).toBe(0);
    expect(z.perdaTotalMca).toBe(0);
  });

  it('modo simples soma conexões típicas', () => {
    const tipica = calcularHidraulica({ ...base, usarConexoesTipicas: true });
    expect(tipica.comprimentoEquivSuccaoM).toBeGreaterThan(10);
    expect(tipica.comprimentoEquivRecalqueM).toBeGreaterThan(5);
    expect(tipica.hmtMca).toBeGreaterThan(r.hmtMca);
    expect(tipica.avisos.some(a => a.codigo === 'conexoes_tipicas')).toBe(true);
  });

  it('bomba submersa zera a sucção', () => {
    const s = calcularHidraulica({ ...base, bombaSubmersa: true });
    expect(s.perdaSuccaoMca).toBe(0);
    expect(s.desnivelTotalM).toBe(18);
    expect(s.npshDisponivelMca).toBe(null);
  });

  it('sucção de 9 m é barrada', () => {
    const alta = calcularHidraulica({ ...base, alturaSuccaoM: 9 });
    expect(alta.avisos.some(a => a.codigo === 'succao_impossivel' && a.nivel === 'grave')).toBe(true);
  });

  it('sucção de 2 m não gera aviso de sucção', () => {
    expect(r.avisos.some(a => a.codigo.startsWith('succao'))).toBe(false);
    expect(r.npshDisponivelMca as number).toBeGreaterThan(6);
  });

  it('pressão residual entra na HMT e na parte estática', () => {
    const p = calcularHidraulica({ ...base, pressaoResidualMca: 25 });
    expect(p.alturaEstaticaMca).toBe(45);
    expect(p.hmtMca).toBeCloseTo(r.hmtMca + 25, 1);
  });
});

describe('catálogo', () => {
  it('toda curva bate com os pontos de amostra (até 10% da altura máxima)', () => {
    for (const b of CATALOGO_BOMBAS) {
      for (const ponto of b.pontosCurva) {
        const desvio = Math.abs(alturaDaBombaNaVazao(b, ponto.vazaoM3h) - ponto.alturaMca) / b.alturaMaximaMca;
        expect(desvio).toBeLessThan(0.1);
      }
    }
  });

  it('ids únicos e curvas decrescentes no fim', () => {
    const ids = new Set(CATALOGO_BOMBAS.map(b => b.id));
    expect(ids.size).toBe(CATALOGO_BOMBAS.length);
    for (const b of CATALOGO_BOMBAS) {
      expect(alturaDaBombaNaVazao(b, b.vazaoMaximaM3h)).toBeLessThan(b.alturaMaximaMca * 0.3);
    }
  });

  it('valida o que vem da API', () => {
    expect(lerRespostaCatalogo({ bombas: CATALOGO_BOMBAS })?.length).toBe(CATALOGO_BOMBAS.length);
    expect(lerRespostaCatalogo({ bombas: [{ id: 'x' }] })).toBe(null);
    expect(lerRespostaCatalogo('<html>')).toBe(null);
  });
});

describe('avaliarBombas', () => {
  it('nunca recomenda bomba submersa para instalação de superfície', () => {
    const entradas = { ...base, usarConexoesTipicas: true };
    const resultado = calcularHidraulica(entradas);
    const servem = avaliarBombas(entradas, resultado).filter(a => a.situacao !== 'incompativel');
    expect(servem.length).toBeGreaterThan(0);
    expect(servem.every(a => !ehBombaSubmersa(a.bomba))).toBe(true);
  });

  it('em poço, só recomenda submersas', () => {
    const entradas = { ...base, bombaSubmersa: true, alturaRecalqueM: 40 };
    const resultado = calcularHidraulica(entradas);
    const servem = avaliarBombas(entradas, resultado).filter(a => a.situacao !== 'incompativel');
    expect(servem.length).toBeGreaterThan(0);
    expect(servem.every(a => ehBombaSubmersa(a.bomba))).toBe(true);
  });

  it('toda bomba recomendada entrega a altura na vazão pedida', () => {
    const entradas = { ...base, usarConexoesTipicas: true };
    const resultado = calcularHidraulica(entradas);
    for (const a of avaliarBombas(entradas, resultado).filter(x => x.situacao !== 'incompativel')) {
      expect(alturaDaBombaNaVazao(a.bomba, resultado.vazaoM3h)).toBeGreaterThanOrEqual(resultado.hmtMca);
      expect(a.pontoTrabalho.vazaoM3h).toBeGreaterThanOrEqual(resultado.vazaoM3h - 0.01);
    }
  });

  it('sucção impossível não recomenda bomba de superfície comum', () => {
    const entradas = { ...base, alturaSuccaoM: 9 };
    const resultado = calcularHidraulica(entradas);
    const servem = avaliarBombas(entradas, resultado).filter(a => a.situacao !== 'incompativel');
    expect(servem.length).toBe(0);
  });

  it('sem dados, nada é recomendado', () => {
    const entradas = { ...base, vazaoM3h: 0 };
    const servem = avaliarBombas(entradas, calcularHidraulica(entradas)).filter(a => a.situacao !== 'incompativel');
    expect(servem.length).toBe(0);
  });
});

describe('entrada de números', () => {
  it('aceita vírgula e ponto', () => {
    expect(lerDecimal('3,5')).toBe(3.5);
    expect(lerDecimal('3.5')).toBe(3.5);
    expect(lerDecimal(' 12 ')).toBe(12);
    expect(lerDecimal('')).toBe(null);
    expect(lerDecimal('abc')).toBe(null);
  });
});
