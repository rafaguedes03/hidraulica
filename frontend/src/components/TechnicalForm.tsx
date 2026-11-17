import React, { useState } from 'react';
import { HydraulicInputs, HydraulicResults, PipeMaterialId } from '../engine/types';
import { PIPE_MATERIALS, COMMERCIAL_DIAMETERS } from '../engine/materialsAndFittings';
import { FittingSelectorModal } from './FittingSelectorModal';
import { HelpTooltip } from './HelpTooltip';
import { 
  Gauge, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Wrench, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  Sliders,
  ArrowRight
} from 'lucide-react';

interface TechnicalFormProps {
  inputs: HydraulicInputs;
  results: HydraulicResults;
  onChange: (inputs: HydraulicInputs) => void;
  onCalculate: () => void;
}

export const TechnicalForm: React.FC<TechnicalFormProps> = ({
  inputs,
  results,
  onChange,
  onCalculate
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'suction' | 'discharge';
  }>({
    isOpen: false,
    type: 'suction'
  });

  const [showEfficiencies, setShowEfficiencies] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = <K extends keyof HydraulicInputs>(field: K, value: HydraulicInputs[K]) => {
    setErrorMessage(null);
    onChange({
      ...inputs,
      [field]: value
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.flowRateM3h || inputs.flowRateM3h <= 0) {
      setErrorMessage('Por favor, informe a vazão requerida maior que zero.');
      return;
    }
    const totalH = (inputs.isSubmerged ? 0 : inputs.suctionHeight) + inputs.dischargeHeight;
    if (totalH <= 0) {
      setErrorMessage('Por favor, informe ao menos uma altura de desnível maior que zero.');
      return;
    }
    setErrorMessage(null);
    onCalculate();
  };

  const getVelocityBadge = (status: string, velocity: number, msg: string) => {
    if (velocity <= 0) return null;
    let color = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
    let icon = <CheckCircle2 className="w-3.5 h-3.5" />;

    if (status === 'high' || status === 'low') {
      color = 'text-amber-400 bg-amber-950/60 border-amber-800/60';
      icon = <AlertTriangle className="w-3.5 h-3.5" />;
    } else if (status === 'critical') {
      color = 'text-rose-400 bg-rose-950/60 border-rose-800/60';
      icon = <AlertCircle className="w-3.5 h-3.5" />;
    }

    return (
      <div className={`flex items-start space-x-1.5 p-2 rounded-lg text-[11px] border ${color} mt-2`}>
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div>
          <span className="font-bold">Velocidade: {velocity.toFixed(2)} m/s — </span>
          <span>{msg}</span>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. SEÇÃO DE VAZÃO E PRESSÃO REQUERIDA */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-sky-400 border-b border-slate-800 pb-2">
          <Gauge className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Parâmetros de Vazão e Pressão Requerida
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Vazão */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center">
                <span>Vazão Requerida (Q)</span>
                <HelpTooltip
                  title="Vazão Requerida (Q)"
                  description="Volume de água por unidade de tempo que a bomba deve fornecer no destino."
                  example="Para encher uma caixa de 5.000 litros em 2 horas, a vazão é 2.5 m³/h."
                />
              </span>
              <span className="text-sky-400 font-mono text-[11px]">
                {inputs.flowRateM3h > 0 ? `${(inputs.flowRateM3h * 1000).toLocaleString()} L/h` : ''}
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex: 3.5"
                value={inputs.flowRateM3h > 0 ? inputs.flowRateM3h : ''}
                onChange={e => updateField('flowRateM3h', parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 pr-16"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none font-medium">
                m³/hora
              </span>
            </div>
          </div>

          {/* Pressão Residual */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center">
              <span>Pressão Residual no Ponto Final</span>
              <HelpTooltip
                title="Pressão Residual (mca)"
                description="Pressão mínima necessária na saída da tubulação para funcionamento de equipamentos ou saída livre no reservatório."
                example="Para caixa d'água aberta, 2 mca é suficiente. Para aspersores de irrigação, costuma-se exigir entre 15 e 30 mca."
              />
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="Ex: 2.0"
                value={inputs.residualPressureMca > 0 ? inputs.residualPressureMca : ''}
                onChange={e => updateField('residualPressureMca', parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 pr-14"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none font-medium">
                mca
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. SEÇÃO DE SUCÇÃO */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2 text-sky-400">
            <ArrowDownToLine className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
              <span>Tubulação de Sucção</span>
              <HelpTooltip
                title="Linha de Sucção"
                description="Trecho de tubulação entre o espelho d'água de captação e o bocal de entrada da motobomba de superfície."
              />
            </h3>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inputs.isSubmerged}
              onChange={e => updateField('isSubmerged', e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 bg-slate-900 border-slate-700 focus:ring-sky-500"
            />
            <span className="text-xs font-semibold text-sky-300">
              Bomba Submersa / Poço
            </span>
          </label>
        </div>

        {!inputs.isSubmerged ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Desnível de Sucção */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center">
                  <span>Desnível Sucção (H. Sucção)</span>
                  <HelpTooltip
                    title="Altura Geométrica de Sucção"
                    description="Distância vertical da superfície da água até o eixo da bomba. Em bombas centrífugas normais ao nível do mar, o limite prático é de 6 a 7 metros para evitar cavitação."
                  />
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    placeholder="Ex: 2.0"
                    value={inputs.suctionHeight > 0 ? inputs.suctionHeight : ''}
                    onChange={e => updateField('suctionHeight', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 pr-10"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">
                    m
                  </span>
                </div>
              </div>

              {/* Comprimento Linear */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center">
                  <span>Comprimento Linear</span>
                  <HelpTooltip
                    title="Extensão da Sucção"
                    description="Comprimento total dos tubos instalados no trecho de sucção."
                  />
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Ex: 5.0"
                    value={inputs.suctionLength > 0 ? inputs.suctionLength : ''}
                    onChange={e => updateField('suctionLength', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 pr-10"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">
                    m
                  </span>
                </div>
              </div>

              {/* Diâmetro Sucção */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center">
                  <span>Diâmetro Sucção (Ø)</span>
                  <HelpTooltip
                    title="Bitola da Sucção"
                    description="Diâmetro do tubo de sucção. Recomenda-se utilizar bitola igual ou imediatamente superior à bitola de recalque para manter a velocidade baixa e evitar cavitação."
                  />
                </label>
                <select
                  value={inputs.suctionDiameterMm}
                  onChange={e => updateField('suctionDiameterMm', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  {COMMERCIAL_DIAMETERS.map(d => (
                    <option key={d.nominalMm} value={d.internalMm}>
                      {d.nominalPol} ({d.nominalMm}mm ext. - {d.internalMm}mm int.)
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Material & Conexões na Sucção */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center">
                  <span>Material da Tubulação</span>
                  <HelpTooltip
                    title="Coeficiente de Rugosidade (Hazen-Williams C)"
                    description="Indica a resistência do material ao escoamento da água. Materiais mais lisos como PVC e PEAD (C=140) causam menor atrito que tubos de ferro fundido ou aço."
                  />
                </label>
                <select
                  value={inputs.suctionMaterial}
                  onChange={e => updateField('suctionMaterial', e.target.value as PipeMaterialId)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  {PIPE_MATERIALS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} (C = {m.cFactor})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex justify-between items-center">
                  <span className="flex items-center">
                    <span>Conexões (Perdas Leq)</span>
                    <HelpTooltip
                      title="Perdas de Carga Localizadas (Leq)"
                      description="Curvas, válvulas e registros provocam turbulências no fluxo de água. O método dos comprimentos equivalentes soma metros fictícios ao tubo para simular esse atrito."
                    />
                  </span>
                  <span className="text-sky-400 text-[11px]">
                    +{results.suctionEquivalentLengthM.toFixed(1)}m eq.
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: true, type: 'suction' })}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <Wrench className="w-3.5 h-3.5 text-sky-400" />
                    <span>
                      {inputs.suctionFittings.length > 0 
                        ? `${inputs.suctionFittings.reduce((a, b) => a + b.quantity, 0)} conexões adicionadas` 
                        : 'Selecionar Válvula de Pé, Curvas...'}
                    </span>
                  </span>
                  <span className="text-sky-400 text-xs font-bold">Editar</span>
                </button>
              </div>

            </div>

            {getVelocityBadge(
              results.suctionVelocityStatus,
              results.suctionVelocityMs,
              results.suctionVelocityMessage
            )}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            Instalação com bomba submersa configurada. A sucção é direta no corpo da bomba, dispensando válvula de pé.
          </div>
        )}
      </div>

      {/* 3. SEÇÃO DE RECALQUE */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-sky-400 border-b border-slate-800 pb-2">
          <ArrowUpFromLine className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center">
            <span>Tubulação de Recalque</span>
            <HelpTooltip
              title="Linha de Recalque"
              description="Trecho de tubulação que vai desde a saída da bomba até o reservatório de destino ou ponto final de utilização."
            />
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Desnível de Recalque */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center">
              <span>Desnível Recalque (H. Recalque)</span>
              <HelpTooltip
                title="Altura Geométrica de Recalque"
                description="Diferença de altura vertical entre o bocal da bomba e a cota do reservatório superior."
              />
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="0"
                placeholder="Ex: 18"
                value={inputs.dischargeHeight > 0 ? inputs.dischargeHeight : ''}
                onChange={e => updateField('dischargeHeight', parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 pr-10"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">
                m
              </span>
            </div>
          </div>

          {/* Comprimento Linear */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center">
              <span>Comprimento Linear</span>
              <HelpTooltip
                title="Comprimento do Recalque"
                description="Comprimento total real de tubos instalados ao longo de todo o percurso de elevação."
              />
            </label>
            <div className="relative">
              <input
                type="number"
                step="5"
                min="0"
                placeholder="Ex: 75"
                value={inputs.dischargeLength > 0 ? inputs.dischargeLength : ''}
                onChange={e => updateField('dischargeLength', parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 pr-10"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">
                m
              </span>
            </div>
          </div>

          {/* Diâmetro Recalque */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center">
              <span>Diâmetro Recalque (Ø)</span>
              <HelpTooltip
                title="Bitola do Recalque"
                description="Diâmetro do tubo de elevação. Deve ser dimensionado para manter a velocidade do fluido na faixa econômica de 1.0 a 2.2 m/s."
              />
            </label>
            <select
              value={inputs.dischargeDiameterMm}
              onChange={e => updateField('dischargeDiameterMm', parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              {COMMERCIAL_DIAMETERS.map(d => (
                <option key={d.nominalMm} value={d.internalMm}>
                  {d.nominalPol} ({d.nominalMm}mm ext. - {d.internalMm}mm int.)
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Material & Conexões no Recalque */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Material da Tubulação
            </label>
            <select
              value={inputs.dischargeMaterial}
              onChange={e => updateField('dischargeMaterial', e.target.value as PipeMaterialId)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              {PIPE_MATERIALS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (C = {m.cFactor})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex justify-between items-center">
              <span className="flex items-center">
                <span>Conexões (Perdas Leq)</span>
                <HelpTooltip
                  title="Conexões do Recalque"
                  description="Adicione registros de gaveta, válvulas de retenção e curvas de 90° para cômputo exato das perdas de carga localizadas."
                />
              </span>
              <span className="text-sky-400 text-[11px]">
                +{results.dischargeEquivalentLengthM.toFixed(1)}m eq.
              </span>
            </label>
            <button
              type="button"
              onClick={() => setModalState({ isOpen: true, type: 'discharge' })}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <span className="flex items-center space-x-2">
                <Wrench className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {inputs.dischargeFittings.length > 0 
                    ? `${inputs.dischargeFittings.reduce((a, b) => a + b.quantity, 0)} conexões adicionadas` 
                    : 'Selecionar Válvula Retenção, Registros...'}
                </span>
              </span>
              <span className="text-sky-400 text-xs font-bold">Editar</span>
            </button>
          </div>

        </div>

        {getVelocityBadge(
          results.dischargeVelocityStatus,
          results.dischargeVelocityMs,
          results.dischargeVelocityMessage
        )}
      </div>

      {/* 4. RENDIMENTOS (ACCORDION) */}
      <div className="p-4 rounded-2xl glass-panel-subtle border border-slate-800">
        <button
          type="button"
          onClick={() => setShowEfficiencies(!showEfficiencies)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Rendimentos do Motor e Bomba (Avançado)</span>
          </div>
          <span className="text-sky-400 text-[11px]">
            {showEfficiencies ? 'Ocultar' : 'Ajustar'}
          </span>
        </button>

        {showEfficiencies && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 flex justify-between items-center">
                <span className="flex items-center">
                  <span>Rendimento da Bomba</span>
                  <HelpTooltip
                    title="Rendimento Hidráulico da Bomba"
                    description="Eficiência mecânica/hidráulica com que a bomba transfere potência ao fluido. Varia tipicamente entre 50% e 75% em bombas comerciais."
                  />
                </span>
                <span className="text-sky-400 font-bold">{inputs.pumpEfficiencyPct}%</span>
              </label>
              <input
                type="range"
                min="30"
                max="85"
                value={inputs.pumpEfficiencyPct}
                onChange={e => updateField('pumpEfficiencyPct', parseInt(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 flex justify-between items-center">
                <span className="flex items-center">
                  <span>Rendimento do Motor Elétrico</span>
                  <HelpTooltip
                    title="Rendimento do Motor"
                    description="Eficiência com que o motor converte energia elétrica em torque mecânico no eixo. Motores WEG e industriais operam tipicamente entre 80% e 92%."
                  />
                </span>
                <span className="text-sky-400 font-bold">{inputs.motorEfficiencyPct}%</span>
              </label>
              <input
                type="range"
                min="60"
                max="95"
                value={inputs.motorEfficiencyPct}
                onChange={e => updateField('motorEfficiencyPct', parseInt(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Action Button */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-sm font-bold shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center space-x-2"
        >
          <span>Calcular e Ver Bombas Recomendadas</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Fitting Selector Modal */}
      <FittingSelectorModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.type === 'suction' ? 'Conexões da Sucção' : 'Conexões do Recalque'}
        pipeType={modalState.type}
        diameterMm={modalState.type === 'suction' ? inputs.suctionDiameterMm : inputs.dischargeDiameterMm}
        selectedFittings={modalState.type === 'suction' ? inputs.suctionFittings : inputs.dischargeFittings}
        onChange={fittings => {
          if (modalState.type === 'suction') {
            updateField('suctionFittings', fittings);
          } else {
            updateField('dischargeFittings', fittings);
          }
        }}
      />

    </form>
  );
};
