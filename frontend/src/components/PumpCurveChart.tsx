import React from 'react';
import { BombaAvaliada, ModeloBomba, ResultadoHidraulico } from '../calculo/tipos';
import { alturaDaBombaNaVazao } from '../calculo/selecaoBombas';
import { compacto, numero } from '../lib/formatacao';

interface PropsGraficoCurva {
  bomba: ModeloBomba;
  resultados: ResultadoHidraulico;
  pontoTrabalho: BombaAvaliada['pontoTrabalho'];
}

/** Escolhe um passo "redondo" (1, 2, 5 × 10ⁿ) para os eixos. */
function passoRedondo(maximo: number, divisoes: number): number {
  const bruto = maximo / divisoes;
  const potencia10 = Math.pow(10, Math.floor(Math.log10(bruto)));
  const fator = bruto / potencia10;
  return (fator <= 1 ? 1 : fator <= 2 ? 2 : fator <= 5 ? 5 : 10) * potencia10;
}

const LARGURA = 340;
const ALTURA = 230;
const MARGEM = { topo: 12, direita: 14, base: 38, esquerda: 40 };

/**
 * Curva da bomba × curva da instalação, desenhada em SVG puro
 * (sem biblioteca de gráficos: abre rápido e funciona offline).
 */
export const PumpCurveChart: React.FC<PropsGraficoCurva> = ({ bomba, resultados, pontoTrabalho }) => {
  const vazaoMaxDados = Math.max(bomba.vazaoMaximaM3h, resultados.vazaoM3h * 1.15, 0.5);
  const alturaInstalacaoNoMax = resultados.alturaEstaticaMca + resultados.coeficienteKInstalacao * Math.pow(bomba.vazaoMaximaM3h, 1.852);
  const alturaMaxDados = Math.max(alturaDaBombaNaVazao(bomba, 0), bomba.alturaMaximaMca, Math.min(alturaInstalacaoNoMax, bomba.alturaMaximaMca * 1.3), 1);

  const passoVazao = passoRedondo(vazaoMaxDados, 5);
  const passoAltura = passoRedondo(alturaMaxDados, 4);
  const vazaoMax = Math.ceil(vazaoMaxDados / passoVazao) * passoVazao;
  const alturaMax = Math.ceil(alturaMaxDados / passoAltura) * passoAltura;

  const paraX = (q: number) => MARGEM.esquerda + (q / vazaoMax) * (LARGURA - MARGEM.esquerda - MARGEM.direita);
  const paraY = (h: number) => ALTURA - MARGEM.base - (Math.min(h, alturaMax) / alturaMax) * (ALTURA - MARGEM.topo - MARGEM.base);

  const PONTOS = 40;
  const pontosBomba: string[] = [];
  const pontosInstalacao: string[] = [];
  for (let i = 0; i <= PONTOS; i++) {
    const qBomba = (bomba.vazaoMaximaM3h * i) / PONTOS;
    pontosBomba.push(`${paraX(qBomba).toFixed(1)},${paraY(alturaDaBombaNaVazao(bomba, qBomba)).toFixed(1)}`);
    const qInst = (vazaoMax * i) / PONTOS;
    const hInst = resultados.alturaEstaticaMca + resultados.coeficienteKInstalacao * Math.pow(qInst, 1.852);
    if (hInst <= alturaMax) pontosInstalacao.push(`${paraX(qInst).toFixed(1)},${paraY(hInst).toFixed(1)}`);
  }

  const marcasVazao: number[] = [];
  for (let q = 0; q <= vazaoMax + 1e-9; q += passoVazao) marcasVazao.push(Math.round(q * 1000) / 1000);
  const marcasAltura: number[] = [];
  for (let h = 0; h <= alturaMax + 1e-9; h += passoAltura) marcasAltura.push(Math.round(h * 1000) / 1000);

  const temPontoTrabalho = pontoTrabalho.vazaoM3h > 0;
  const resumo = temPontoTrabalho
    ? `Gráfico da curva da bomba ${bomba.modelo} e da curva da instalação. Elas se cruzam em ${numero(pontoTrabalho.vazaoM3h, 1)} metros cúbicos por hora e ${numero(pontoTrabalho.alturaMca, 1)} mca.`
    : `Gráfico da curva da bomba ${bomba.modelo} e da curva da instalação. As curvas não se cruzam: a bomba não vence a altura.`;

  return (
    <figure className="space-y-2">
      <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} role="img" aria-label={resumo} className="w-full max-w-xl">
        {marcasAltura.map(h => (
          <g key={`h${h}`}>
            <line x1={MARGEM.esquerda} x2={LARGURA - MARGEM.direita} y1={paraY(h)} y2={paraY(h)} stroke="var(--color-line)" strokeWidth={h === 0 ? 1.2 : 0.6} />
            <text x={MARGEM.esquerda - 6} y={paraY(h) + 4} textAnchor="end" fontSize="11" fill="var(--color-muted)">{compacto(h)}</text>
          </g>
        ))}
        {marcasVazao.map(q => (
          <text key={`q${q}`} x={paraX(q)} y={ALTURA - MARGEM.base + 15} textAnchor="middle" fontSize="11" fill="var(--color-muted)">{compacto(q)}</text>
        ))}
        <text x={(MARGEM.esquerda + LARGURA - MARGEM.direita) / 2} y={ALTURA - 4} textAnchor="middle" fontSize="11" fill="var(--color-muted)">vazão (m³/h)</text>
        <text x={11} y={(MARGEM.topo + ALTURA - MARGEM.base) / 2} textAnchor="middle" fontSize="11" fill="var(--color-muted)" transform={`rotate(-90 11 ${(MARGEM.topo + ALTURA - MARGEM.base) / 2})`}>altura (mca)</text>

        <polyline points={pontosInstalacao.join(' ')} fill="none" stroke="var(--color-water)" strokeWidth="2.2" strokeDasharray="5 4" strokeLinecap="round" />
        <polyline points={pontosBomba.join(' ')} fill="none" stroke="var(--color-brand)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />

        {/* ponto pedido */}
        <circle cx={paraX(resultados.vazaoM3h)} cy={paraY(resultados.hmtMca)} r="4.5" fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="1.8" />
        {/* ponto de trabalho */}
        {temPontoTrabalho && (
          <circle cx={paraX(pontoTrabalho.vazaoM3h)} cy={paraY(pontoTrabalho.alturaMca)} r="5" fill="var(--color-ink)" stroke="var(--color-surface)" strokeWidth="1.5" />
        )}
      </svg>
      <figcaption className="grid gap-x-4 gap-y-1 text-sm text-muted sm:grid-cols-2">
        <span className="flex items-center gap-2">
          <svg width="22" height="6" aria-hidden="true"><line x1="0" y1="3" x2="22" y2="3" stroke="var(--color-brand)" strokeWidth="2.6" /></svg>
          Curva da bomba
        </span>
        <span className="flex items-center gap-2">
          <svg width="22" height="6" aria-hidden="true"><line x1="0" y1="3" x2="22" y2="3" stroke="var(--color-water)" strokeWidth="2.2" strokeDasharray="5 4" /></svg>
          Curva da instalação
        </span>
        <span className="flex items-center gap-2">
          <svg width="22" height="12" aria-hidden="true"><circle cx="11" cy="6" r="4.2" fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="1.8" /></svg>
          O que você pediu
        </span>
        <span className="flex items-center gap-2">
          <svg width="22" height="12" aria-hidden="true"><circle cx="11" cy="6" r="4.8" fill="var(--color-ink)" /></svg>
          Onde a bomba vai trabalhar
        </span>
      </figcaption>
    </figure>
  );
};
