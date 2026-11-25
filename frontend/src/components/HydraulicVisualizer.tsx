import React from 'react';
import { DadosEntrada, ResultadoHidraulico } from '../calculo/tipos';
import { DIAMETROS_COMERCIAIS } from '../calculo/materiaisEConexoes';
import { compacto, numero } from '../lib/formatacao';

interface PropsEsquema {
  entradas: DadosEntrada;
  resultados: ResultadoHidraulico;
}

const bitola = (internalMm: number) =>
  DIAMETROS_COMERCIAIS.find(d => Math.abs(d.internoMm - internalMm) < 0.05)?.bitolaPol ?? `${internalMm} mm`;

/** Cota vertical com setas e valor. */
const Dimension: React.FC<{ x: number; y1: number; y2: number; rotulo: string; lado?: 'esquerda' | 'direita' }> = ({ x, y1, y2, rotulo, lado = 'direita' }) => {
  const meio = (y1 + y2) / 2;
  return (
    <g stroke="var(--color-muted)" strokeWidth="1" fill="none">
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <path d={`M${x - 3},${y1 + 5} L${x},${y1} L${x + 3},${y1 + 5}`} />
      <path d={`M${x - 3},${y2 - 5} L${x},${y2} L${x + 3},${y2 - 5}`} />
      <text x={lado === 'direita' ? x + 6 : x - 6} y={meio + 4} textAnchor={lado === 'direita' ? 'start' : 'end'} fontSize="12" fontWeight="600" fill="var(--color-ink)" stroke="none">
        {rotulo}
      </text>
    </g>
  );
};

/**
 * Esquema da instalação (fora de escala): de onde a água sai, onde fica a bomba e aonde chega.
 */
export const HydraulicVisualizer: React.FC<PropsEsquema> = ({ entradas, resultados }) => {
  const submersa = entradas.bombaSubmersa;
  const escoando = resultados.vazaoM3h > 0;

  // Geometria fixa do desenho
  const terrenoY = 150;
  const nivelAguaY = 172;       // nível da água na captação
  const topoCanoY = 44;
  const caixaX = 258;
  const caixaTopoY = 26;
  const bombaX = submersa ? 85 : 152;
  const bombaY = submersa ? 190 : 116;

  const trajetoCano = submersa
    ? `M${bombaX},${bombaY - 11} L${bombaX},${topoCanoY} L${caixaX + 22},${topoCanoY} L${caixaX + 22},${caixaTopoY + 14}`
    : `M100,${nivelAguaY + 20} L100,${bombaY} L${bombaX - 11},${bombaY} M${bombaX + 11},${bombaY} L178,${bombaY} L178,${topoCanoY} L${caixaX + 22},${topoCanoY} L${caixaX + 22},${caixaTopoY + 14}`;

  const descricao = submersa
    ? `Esquema: bomba submersa no poço elevando a água ${numero(resultados.desnivelRecalqueM, 1)} metros por ${compacto(entradas.comprimentoRecalqueM, 1)} metros de cano.`
    : `Esquema: bomba ${numero(resultados.desnivelSuccaoM, 1)} metros acima da água, elevando ${numero(resultados.desnivelRecalqueM, 1)} metros por ${compacto(entradas.comprimentoRecalqueM, 1)} metros de cano.`;

  const estiloRotulo = { fontSize: 12, fill: 'var(--color-muted)' } as const;

  return (
    <figure>
      <svg viewBox="0 0 340 224" role="img" aria-label={descricao} className="w-full max-w-xl">
        {/* terreno e captação */}
        <path d={`M0,${terrenoY} L50,${terrenoY} L50,204 L120,204 L120,${terrenoY} L340,${terrenoY}`} fill="none" stroke="var(--color-line)" strokeWidth="1.5" />
        <rect x="51" y={nivelAguaY} width="68" height={204 - nivelAguaY} fill="var(--color-water-tint)" />
        <line x1="51" y1={nivelAguaY} x2="119" y2={nivelAguaY} stroke="var(--color-water)" strokeWidth="1.5" />
        <text x="85" y="219" textAnchor="middle" {...estiloRotulo}>{submersa ? 'poço' : 'captação'}</text>

        {/* reservatório */}
        <line x1={caixaX + 12} y1={caixaTopoY + 46} x2={caixaX + 12} y2={terrenoY} stroke="var(--color-muted)" strokeWidth="1.5" />
        <line x1={caixaX + 48} y1={caixaTopoY + 46} x2={caixaX + 48} y2={terrenoY} stroke="var(--color-muted)" strokeWidth="1.5" />
        <rect x={caixaX} y={caixaTopoY} width="60" height="46" rx="3" fill="var(--color-surface)" stroke="var(--color-muted)" strokeWidth="1.5" />
        <rect x={caixaX + 1.5} y={caixaTopoY + 22} width="57" height="22.5" fill="var(--color-water-tint)" />
        <line x1={caixaX + 1.5} y1={caixaTopoY + 22} x2={caixaX + 58.5} y2={caixaTopoY + 22} stroke="var(--color-water)" strokeWidth="1.5" />
        <text x={caixaX + 30} y={caixaTopoY - 8} textAnchor="middle" {...estiloRotulo}>chegada</text>

        {/* tubulação */}
        <path d={trajetoCano} fill="none" stroke="var(--color-muted)" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
        <path d={trajetoCano} fill="none" stroke="var(--color-water-tint)" strokeWidth="2.2" strokeLinejoin="round" className={escoando ? 'water-flow' : ''} />

        {/* bomba */}
        <circle cx={bombaX} cy={bombaY} r="11" fill="var(--color-brand)" />
        <path d={`M${bombaX - 4},${bombaY + 4} L${bombaX},${bombaY - 5} L${bombaX + 4},${bombaY + 4} Z`} fill="var(--color-on-brand)" />
        {!submersa && <text x={bombaX} y={bombaY - 17} textAnchor="middle" {...estiloRotulo}>bomba</text>}

        {/* cotas */}
        {!submersa && resultados.desnivelSuccaoM > 0 && (
          <>
            <Dimension x={36} y1={bombaY} y2={nivelAguaY} rotulo="" />
            <text x="26" y={(bombaY + nivelAguaY) / 2} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--color-ink)" transform={`rotate(-90 26 ${(bombaY + nivelAguaY) / 2})`}>
              {numero(resultados.desnivelSuccaoM, 1)} m
            </text>
          </>
        )}
        <Dimension
          x={240}
          y1={topoCanoY}
          y2={submersa ? nivelAguaY : bombaY}
          lado="esquerda"
          rotulo={`${numero(resultados.desnivelRecalqueM, 1)} m`}
        />
      </svg>
      <figcaption className="mt-1 space-y-0.5 text-sm text-muted">
        {!submersa && (
          <p>
            Sucção: {compacto(entradas.comprimentoSuccaoM, 1)} m de cano de {bitola(entradas.diametroSuccaoMm)}, a {numero(resultados.velocidadeSuccaoMs, 2)} m/s.
          </p>
        )}
        <p>
          Recalque: {compacto(entradas.comprimentoRecalqueM, 1)} m de cano de {bitola(entradas.diametroRecalqueMm)}, a {numero(resultados.velocidadeRecalqueMs, 2)} m/s.
        </p>
        <p>Desenho fora de escala.</p>
      </figcaption>
    </figure>
  );
};
