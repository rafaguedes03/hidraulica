import React, { useState } from 'react';
import { HydraulicInputs, HydraulicResults, MatchedPump } from '../engine/types';
import { PumpCurveChart } from './PumpCurveChart';
import { HelpTooltip } from './HelpTooltip';
import { 
  Gauge, 
  Zap, 
  Droplet, 
  TrendingDown, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Check, 
  FileText,
  ArrowLeft,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface ResultsPanelProps {
  inputs: HydraulicInputs;
  results: HydraulicResults;
  matchedPumps: MatchedPump[];
  onOpenReport: () => void;
  onBackToForm: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  results,
  matchedPumps,
  onOpenReport,
  onBackToForm
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ideal' | 'centrifuga' | 'submersivel' | 'solar'>('all');
  
  // FILTER STRICTLY ONLY COMPATIBLE PUMPS
  const compatiblePumps = matchedPumps.filter(m => m.status !== 'incompatible');

  const [expandedPumpId, setExpandedPumpId] = useState<string | null>(
    compatiblePumps.length > 0 ? compatiblePumps[0].pump.id : null
  );

  const filteredPumps = compatiblePumps.filter(m => {
    if (selectedFilter === 'ideal') return m.suitabilityScore >= 80;
    if (selectedFilter === 'centrifuga') return m.pump.type === 'centrifuga' || m.pump.type === 'autoaspirante';
    if (selectedFilter === 'submersivel') return m.pump.type === 'submersivel';
    if (selectedFilter === 'solar') return m.pump.type === 'solar';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Bar with Return Action and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Resultados do Dimensionamento</span>
          </h2>
          <p className="text-xs text-slate-400">
            Foram encontrados {compatiblePumps.length} modelo(s) de bombas que atendem plenamente à sua instalação.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToForm}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400" />
          <span>Voltar e Ajustar Dados</span>
        </button>
      </div>

      {/* 1. CARDS DE RESUMO TÉCNICO (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* HMT Card */}
        <div className="p-4 rounded-2xl glass-panel border border-sky-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="flex items-center">
              <span>HMT Total</span>
              <HelpTooltip
                title="Altura Manométrica Total (HMT)"
                description="É a energia total em metros de coluna d'água (mca) que a bomba precisa vencer. É a soma do desnível geométrico real, das perdas por atrito e da pressão residual exigida."
              />
            </span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {results.totalDynamicHeadMca.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-sky-400">mca</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Desnível ({results.totalGeometricHeightMca.toFixed(1)}m) + Perdas ({results.totalHeadLossMca.toFixed(1)}m)
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500" />
        </div>

        {/* Vazão Card */}
        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="flex items-center">
              <span>Vazão Requerida</span>
              <HelpTooltip
                title="Vazão de Projeto"
                description="Taxa volumétrica de bombeamento demandada pela instalação."
              />
            </span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {results.flowRateM3h.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-cyan-400">m³/h</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {results.flowRateLph.toLocaleString()} L/h | {results.dailyVolumeM3.toFixed(1)} m³/dia ({results.operatingHours}h/dia)
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500" />
        </div>

        {/* Potência Comercial Card */}
        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="flex items-center">
              <span>Motor Sugerido</span>
              <HelpTooltip
                title="Potência Comercial do Motor"
                description="Tamanho padronizado de motor comercial necessário para acionar a bomba com margem de segurança contra sobrecarga elétrica."
              />
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-300">
              {results.suggestedCommercialPowerCv}
            </span>
            <span className="text-xs font-bold text-emerald-400">CV</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Eixo: {results.motorShaftPowerCv.toFixed(2)} CV | Consumo: ~{results.dailyEnergyKwh.toFixed(1)} kWh/dia
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Perda de Carga Total Card */}
        <div className="p-4 rounded-2xl glass-panel border border-amber-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="flex items-center">
              <span>Perda de Carga</span>
              <HelpTooltip
                title="Perda de Carga por Atrito (hf)"
                description="Resistência oferecida pela tubulação e conexões ao escoamento da água. Quanto maior o atrito, maior a pressão necessária na bomba."
              />
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-amber-300">
              {results.totalHeadLossMca.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-amber-400">mca</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Sucção: {results.suctionLossMca.toFixed(1)}m | Recalque: {results.dischargeLossMca.toFixed(1)}m
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </div>

      </div>

      {/* 2. CATÁLOGO DE MODELOS RECOMENDADOS */}
      <div className="space-y-4">
        
        {/* Filter bar & Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-sky-400" />
              <span>Bombas Compatíveis Selecionadas ({filteredPumps.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Modelos ordenados por adequação hidráulica e ponto de maior eficiência.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedFilter === 'all' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas ({compatiblePumps.length})
            </button>
            <button
              onClick={() => setSelectedFilter('ideal')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedFilter === 'ideal' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Recomendação Ideal
            </button>
            <button
              onClick={() => setSelectedFilter('centrifuga')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedFilter === 'centrifuga' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Centrífugas
            </button>
            <button
              onClick={() => setSelectedFilter('submersivel')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedFilter === 'submersivel' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Submersíveis
            </button>
            <button
              onClick={() => setSelectedFilter('solar')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedFilter === 'solar' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Solares
            </button>
          </div>
        </div>

        {/* Empty state if no pump fits */}
        {filteredPumps.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <Info className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">
              Nenhuma bomba do catálogo atende aos parâmetros informados
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              A altura manométrica ({results.totalDynamicHeadMca.toFixed(1)} mca) ou a vazão ({results.flowRateM3h.toFixed(1)} m³/h) ultrapassam a capacidade dos modelos padrão cadastrados.
            </p>
            <div className="pt-2">
              <button
                onClick={onBackToForm}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
              >
                Ajustar Diâmetro ou Desnível
              </button>
            </div>
          </div>
        ) : (
          /* Pump Cards List */
          <div className="space-y-4">
            {filteredPumps.map((matched, index) => {
              const pump = matched.pump;
              const isExpanded = expandedPumpId === pump.id;

              let badgeBg = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
              if (matched.status === 'ideal') {
                badgeBg = 'bg-sky-500/20 text-sky-200 border-sky-500/40';
              } else if (matched.status === 'oversized') {
                badgeBg = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
              }

              return (
                <div
                  key={pump.id}
                  className={`rounded-2xl border transition-all duration-200 ${
                    matched.status === 'ideal' && index === 0
                      ? 'bg-slate-900/90 border-sky-500/50 shadow-xl ring-1 ring-sky-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase bg-slate-800 text-white border border-slate-700">
                          {pump.brand}
                        </span>
                        <h4 className="text-base font-bold text-white">
                          {pump.model}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeBg}`}>
                          {matched.statusLabel} ({matched.suitabilityScore}%)
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                        <div>
                          <span className="text-slate-500 font-medium">Potência: </span>
                          <strong className="text-sky-300 font-bold">{pump.powerCv} CV</strong> ({pump.powerKw} kW)
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Alimentação: </span>
                          <span>{pump.phase}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Bocais: </span>
                          <span>Suc. {pump.suctionPortPol} / Rec. {pump.dischargePortPol}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">H. Máxima: </span>
                          <span>{pump.maxHeadMca} mca</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Q. Máxima: </span>
                          <span>{pump.maxFlowM3h} m³/h</span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        {matched.reasons.map((r, i) => (
                          <div key={i} className="text-xs text-slate-300 flex items-start space-x-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                      <div className="text-left lg:text-right">
                        {pump.approxPriceBrl && (
                          <div className="text-xs text-slate-400">
                            Preço médio estimado: <strong className="text-emerald-400 font-bold">R$ {pump.approxPriceBrl.toFixed(2)}</strong>
                          </div>
                        )}
                        <div className="text-xs text-sky-400 font-medium">
                          Ponto de Operação: <strong>{matched.operatingPoint.flowM3h.toFixed(1)} m³/h @ {matched.operatingPoint.headMca.toFixed(1)} mca</strong>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {pump.manualUrl && (
                          <a
                            href={pump.manualUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Manual</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setExpandedPumpId(isExpanded ? null : pump.id)}
                          className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 transition-all"
                        >
                          <span>{isExpanded ? 'Ocultar Curva' : 'Ver Curva H x Q'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                  </div>

                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/60 rounded-b-2xl space-y-4 animate-in fade-in duration-200">
                      <div className="flex flex-wrap gap-2">
                        {pump.features.map((feat, fi) => (
                          <span key={fi} className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-800/80 text-slate-300 border border-slate-700">
                            {feat}
                          </span>
                        ))}
                      </div>

                      <PumpCurveChart
                        pump={pump}
                        results={results}
                        operatingPoint={matched.operatingPoint}
                      />
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 3. BOTÃO DE GERAR RELATÓRIO COMPLETO */}
      <div className="p-6 rounded-2xl glass-panel border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span>Memorial Técnico de Dimensionamento Hidráulico</span>
          </h4>
          <p className="text-xs text-slate-400">
            Gere o laudo oficial em PDF com todas as memórias de cálculo, perdas de carga e lista de materiais para aquisição.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenReport}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-sky-600/30 transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>Baixar Laudo Técnico PDF</span>
        </button>
      </div>

    </div>
  );
};
