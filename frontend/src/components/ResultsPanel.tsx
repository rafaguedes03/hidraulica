/**
 * TELA DE RESULTADO
 * Mostra, de cima para baixo: o motor indicado, a composição da altura
 * manométrica, os avisos, as bombas do catálogo que atendem (com a curva),
 * o gasto de energia, o esquema da instalação e a conta completa.
 */
import React, { useState } from 'react';
import { DadosEntrada, ResultadoHidraulico, BombaAvaliada } from '../calculo/tipos';
import { conexoesConsideradas } from '../calculo/calculoHidraulico';
import { descreverConexoes } from '../calculo/materiaisEConexoes';
import { PumpCurveChart } from './PumpCurveChart';
import { HydraulicVisualizer } from './HydraulicVisualizer';
import { Notice } from './ui/Notice';
import { reais, compacto, cv, numero } from '../lib/formatacao';
import { ArrowLeft, Check, AlertTriangle, ChevronDown, ExternalLink, FileText } from 'lucide-react';

interface PropsPainelResultados {
  entradas: DadosEntrada;
  resultados: ResultadoHidraulico;
  bombasAvaliadas: BombaAvaliada[];
  aoAbrirRelatorio: () => void;
  aoVoltar: () => void;
}

const ESTILO_SITUACAO: Record<BombaAvaliada['situacao'], string> = {
  ideal: 'bg-brand text-on-brand',
  boa: 'bg-brand-tint text-brand',
  superdimensionada: 'bg-warn-tint text-warn',
  limite: 'bg-warn-tint text-warn',
  incompativel: 'bg-danger-tint text-danger'
};

const NOME_TIPO: Record<string, string> = {
  centrifuga: 'Centrífuga',
  submersivel: 'Submersa',
  periferica: 'Periférica',
  autoaspirante: 'Autoaspirante',
  injetora: 'Injetora',
  solar: 'Solar'
};

/** De quais parcelas a altura manométrica é feita. */
const HeadBreakdown: React.FC<{ resultados: ResultadoHidraulico }> = ({ resultados }) => {
  const parcelas = [
    { rotulo: 'Desnível (altura a vencer)', valor: resultados.desnivelTotalM, cor: 'var(--color-brand)' },
    { rotulo: 'Perdas por atrito no cano e nas conexões', valor: resultados.perdaTotalMca, cor: 'var(--color-water)' },
    { rotulo: 'Pressão que sobra na chegada', valor: resultados.pressaoResidualMca, cor: 'var(--color-muted)' }
  ].filter(p => p.valor > 0);
  const total = resultados.hmtMca || 1;

  return (
    <div>
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
        {parcelas.map(p => (
          <div key={p.rotulo} style={{ width: `${(p.valor / total) * 100}%`, backgroundColor: p.cor }} />
        ))}
      </div>
      <dl className="mt-3 space-y-1.5">
        {parcelas.map(p => (
          <div key={p.rotulo} className="flex items-baseline justify-between gap-3 text-[15px]">
            <dt className="flex items-baseline gap-2 text-muted">
              <span className="inline-block h-2.5 w-2.5 shrink-0 translate-y-px rounded-sm" style={{ backgroundColor: p.cor }} aria-hidden="true" />
              {p.rotulo}
            </dt>
            <dd className="tabular shrink-0 font-semibold text-ink">{numero(p.valor, 1)} m</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 border-t border-line pt-1.5 text-[15px]">
          <dt className="font-semibold text-ink">Altura manométrica total</dt>
          <dd className="tabular shrink-0 font-bold text-ink">{numero(resultados.hmtMca, 1)} mca</dd>
        </div>
      </dl>
    </div>
  );
};

const PumpCard: React.FC<{ avaliada: BombaAvaliada; resultados: ResultadoHidraulico; primeira: boolean }> = ({ avaliada, resultados, primeira }) => {
  const [aberto, setAberto] = useState(false);
  const { bomba } = avaliada;
  const idPainel = `curva-${bomba.id}`;

  return (
    <li className={`card overflow-hidden ${primeira ? 'border-brand ring-1 ring-brand' : ''}`}>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted">{bomba.fabricante}, {NOME_TIPO[bomba.tipo]?.toLowerCase() ?? bomba.tipo}</p>
            <h3 className="text-[17px] font-bold leading-snug text-ink">{bomba.modelo}</h3>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold ${ESTILO_SITUACAO[avaliada.situacao]}`}>
            {avaliada.rotulo}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[15px] sm:grid-cols-4">
          <div>
            <dt className="text-sm text-muted">Motor</dt>
            <dd className="tabular font-semibold text-ink">{cv(bomba.potenciaCv)} cv</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Nesta instalação</dt>
            <dd className="tabular font-semibold text-ink">{numero(avaliada.pontoTrabalho.vazaoM3h * 1000, 0)} L/h</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Entrada e saída</dt>
            <dd className="font-semibold text-ink">
              {/submers/i.test(bomba.bocalSuccao) ? `saída ${bomba.bocalRecalque}` : `${bomba.bocalSuccao} e ${bomba.bocalRecalque}`}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Alimentação</dt>
            <dd className="font-semibold text-ink">{bomba.tensao || bomba.fase}</dd>
          </div>
        </dl>

        <ul className="space-y-1 text-[15px]">
          {avaliada.motivos.map((r, i) => (
            <li key={`r${i}`} className="flex gap-2 text-ink">
              <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" aria-hidden="true" />
              <span>{r}</span>
            </li>
          ))}
          {avaliada.ressalvas.map((c, i) => (
            <li key={`c${i}`} className="flex gap-2 text-warn">
              <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              <span>{c}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAberto(o => !o)}
            aria-expanded={aberto}
            aria-controls={idPainel}
            className="btn btn-sm btn-secondary"
          >
            {aberto ? 'Esconder curva' : 'Ver curva'}
            <ChevronDown className={`h-4 w-4 transition-transform ${aberto ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {bomba.linkManual && (
            <a href={bomba.linkManual} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-quiet">
              Site do fabricante
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      {aberto && (
        <div id={idPainel} className="space-y-3 border-t border-line bg-page/50 p-4">
          <PumpCurveChart bomba={bomba} resultados={resultados} pontoTrabalho={avaliada.pontoTrabalho} />
          <p className="tabular text-[15px] text-ink">
            Vai trabalhar em {numero(avaliada.pontoTrabalho.vazaoM3h, 2)} m³/h a {numero(avaliada.pontoTrabalho.alturaMca, 1)} mca,
            com rendimento estimado de {avaliada.pontoTrabalho.rendimentoPct}%.
          </p>
          {bomba.caracteristicas.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted">
              {bomba.caracteristicas.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          )}
        </div>
      )}
    </li>
  );
};

const Row: React.FC<{ rotulo: string; valor: string }> = ({ rotulo, valor }) => (
  <div className="flex items-baseline justify-between gap-4 py-2 text-[15px]">
    <dt className="text-muted">{rotulo}</dt>
    <dd className="tabular shrink-0 text-right font-semibold text-ink">{valor}</dd>
  </div>
);

export const ResultsPanel: React.FC<PropsPainelResultados> = ({ entradas, resultados, bombasAvaliadas, aoAbrirRelatorio, aoVoltar }) => {
  const [mostrarTodas, setMostrarTodas] = useState(false);

  const compativeis = bombasAvaliadas.filter(a => a.situacao !== 'incompativel');
  const visiveis = mostrarTodas ? compativeis : compativeis.slice(0, 3);
  const graves = resultados.avisos.filter(a => a.nivel === 'grave');
  const outros = resultados.avisos.filter(a => a.nivel !== 'grave');
  const fracaoPerdas = resultados.hmtMca > 0 ? resultados.perdaTotalMca / resultados.hmtMca : 0;
  const conexoes = conexoesConsideradas(entradas);

  return (
    <div className="space-y-4">
      <button type="button" onClick={aoVoltar} className="btn btn-sm btn-quiet -ml-2">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Alterar dados
      </button>

      {graves.map((w, i) => <Notice key={`b${i}`} nivel={w.nivel}>{w.mensagem}</Notice>)}

      {/* A resposta, do jeito que se pede no balcão da loja */}
      <section className="card p-5 sm:p-6" aria-labelledby="resposta">
        <p className="text-[15px] text-muted">{graves.length > 0 ? 'Depois de corrigir a instalação, procure uma bomba de' : 'Procure uma bomba de'}</p>
        <h1 id="resposta" className="tabular mt-0.5 text-[2.75rem] font-extrabold leading-none tracking-tight text-brand sm:text-6xl">
          {cv(resultados.motorComercialCv)} cv
        </h1>
        <p className="mt-3 max-w-prose text-lg leading-snug text-ink">
          que entregue <strong className="tabular">{numero(resultados.vazaoLh, 0)} litros por hora</strong> a{' '}
          <strong className="tabular">{numero(resultados.hmtMca, 1)} mca</strong> de altura manométrica.
        </p>
        <div className="mt-5 border-t border-line pt-4">
          <HeadBreakdown resultados={resultados} />
        </div>
      </section>

      {fracaoPerdas > 0.4 && (
        <Notice nivel="atencao">
          {numero(fracaoPerdas * 100, 0)}% da altura é só atrito no cano. Um cano uma bitola acima reduz bastante a bomba e o gasto de energia.
        </Notice>
      )}
      {outros.filter(w => w.nivel === 'atencao').map((w, i) => <Notice key={`w${i}`} nivel={w.nivel}>{w.mensagem}</Notice>)}

      {/* Bombas */}
      <section aria-labelledby="bombas" className="space-y-3 pt-2">
        <div>
          <h2 id="bombas" className="text-xl font-bold text-ink">
            {compativeis.length > 0
              ? `${compativeis.length} ${compativeis.length === 1 ? 'bomba do catálogo atende' : 'bombas do catálogo atendem'}`
              : 'Nenhuma bomba do catálogo atende'}
          </h2>
          {compativeis.length > 0 && (
            <p className="text-[15px] text-muted">Da mais indicada para a menos indicada.</p>
          )}
        </div>

        {compativeis.length === 0 ? (
          <div className="card space-y-3 p-4 text-[15px] text-ink">
            <p>
              {graves.length > 0
                ? 'Resolva o problema apontado acima e calcule de novo.'
                : `Nenhum modelo cadastrado entrega ${numero(resultados.vazaoM3h, 1)} m³/h a ${numero(resultados.hmtMca, 0)} mca${entradas.bombaSubmersa ? ' entre as bombas submersas' : ''}.`}
            </p>
            {graves.length === 0 && (
              <p className="text-muted">
                Tente um cano mais grosso (menos atrito), uma vazão menor por mais horas, ou leve estes números a uma revenda: bomba de {cv(resultados.motorComercialCv)} cv, {numero(resultados.vazaoM3h, 1)} m³/h, {numero(resultados.hmtMca, 0)} mca.
              </p>
            )}
            <button type="button" onClick={aoVoltar} className="btn btn-secondary">Alterar dados</button>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {visiveis.map((m, i) => <PumpCard key={m.bomba.id} avaliada={m} resultados={resultados} primeira={i === 0} />)}
            </ul>
            {compativeis.length > 3 && (
              <button type="button" onClick={() => setMostrarTodas(s => !s)} className="btn btn-secondary w-full">
                {mostrarTodas ? 'Mostrar só as 3 melhores' : `Ver as outras ${compativeis.length - 3}`}
              </button>
            )}
            <p className="text-sm text-muted">
              As curvas deste catálogo são aproximadas. Antes de comprar, confira a curva no catálogo do fabricante ou com a revenda.
            </p>
          </>
        )}
      </section>

      {/* Energia */}
      <section aria-labelledby="energia" className="card p-4 sm:p-5">
        <h2 id="energia" className="text-lg font-bold text-ink">Gasto de energia</h2>
        <dl className="mt-1 divide-y divide-line">
          <Row rotulo={`Água bombeada (${compacto(resultados.horasPorDia)} h por dia)`} valor={`${numero(resultados.volumeDiarioLitros, 0)} litros/dia`} />
          <Row rotulo="Consumo" valor={`${numero(resultados.consumoDiarioKwh, 1)} kWh/dia`} />
          <Row rotulo={`Custo estimado (${reais(resultados.tarifaEnergiaBrlKwh)} por kWh)`} valor={`${reais(resultados.custoMensalBrl)} por mês`} />
        </dl>
      </section>

      {/* Esquema */}
      <section aria-labelledby="esquema" className="card p-4 sm:p-5">
        <h2 id="esquema" className="mb-2 text-lg font-bold text-ink">Sua instalação</h2>
        <HydraulicVisualizer entradas={entradas} resultados={resultados} />
      </section>

      {/* Conta completa, para quem quer conferir */}
      <details className="card group">
        <summary className="flex min-h-14 list-none items-center justify-between gap-3 px-4 text-lg font-bold text-ink sm:px-5 [&::-webkit-details-marker]:hidden">
          Como chegamos a esses números
          <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="space-y-4 border-t border-line px-4 pb-4 sm:px-5">
          <dl className="divide-y divide-line">
            <Row rotulo="Vazão" valor={`${numero(resultados.vazaoM3h, 2)} m³/h (${numero(resultados.vazaoLs, 2)} L/s)`} />
            {!entradas.bombaSubmersa && (
              <>
                <Row rotulo="Sucção: cano + conexões" valor={`${numero(resultados.comprimentoCanoSuccaoM, 1)} + ${numero(resultados.comprimentoEquivSuccaoM, 1)} m`} />
                <Row rotulo="Sucção: velocidade" valor={`${numero(resultados.velocidadeSuccaoMs, 2)} m/s`} />
                <Row rotulo="Sucção: perda de carga" valor={`${numero(resultados.perdaSuccaoMca, 2)} mca`} />
                {resultados.npshDisponivelMca !== null && (
                  <Row rotulo={`NPSH disponível (altitude ${numero(entradas.altitudeM ?? 500, 0)} m)`} valor={`${numero(resultados.npshDisponivelMca, 1)} mca`} />
                )}
              </>
            )}
            <Row rotulo="Recalque: cano + conexões" valor={`${numero(resultados.comprimentoCanoRecalqueM, 1)} + ${numero(resultados.comprimentoEquivRecalqueM, 1)} m`} />
            <Row rotulo="Recalque: velocidade" valor={`${numero(resultados.velocidadeRecalqueMs, 2)} m/s`} />
            <Row rotulo="Recalque: perda de carga" valor={`${numero(resultados.perdaRecalqueMca, 2)} mca`} />
            <Row rotulo="Potência hidráulica" valor={`${numero(resultados.potenciaHidraulicaCv, 2)} cv`} />
            <Row rotulo={`Potência no eixo (bomba com ${compacto(entradas.rendimentoBombaPct)}% de rendimento)`} valor={`${numero(resultados.potenciaEixoCv, 2)} cv`} />
            <Row rotulo={`Com folga de ${resultados.folgaMotorPct}%`} valor={`${numero(resultados.potenciaMotorNecessariaCv, 2)} cv`} />
            <Row rotulo="Motor comercial" valor={`${cv(resultados.motorComercialCv)} cv`} />
            <Row rotulo={`Potência elétrica (motor com ${compacto(entradas.rendimentoMotorPct)}%)`} valor={`${numero(resultados.potenciaEletricaKw, 2)} kW`} />
          </dl>
          <div className="space-y-1.5 text-sm text-muted">
            <p>Perdas pelo método de Hazen-Williams, com conexões convertidas em comprimento equivalente.</p>
            {!entradas.bombaSubmersa && conexoes.succao.length > 0 && <p>Conexões na sucção: {descreverConexoes(conexoes.succao)}.</p>}
            {conexoes.recalque.length > 0 && <p>Conexões no recalque: {descreverConexoes(conexoes.recalque)}.</p>}
            {outros.filter(w => w.nivel === 'info').map((w, i) => <p key={i}>{w.mensagem}</p>)}
          </div>
        </div>
      </details>

      <button type="button" onClick={aoAbrirRelatorio} className="btn btn-secondary w-full">
        <FileText className="h-5 w-5" aria-hidden="true" />
        Baixar memorial de cálculo em PDF
      </button>
    </div>
  );
};
