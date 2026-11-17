import React, { useState } from 'react';
import { HydraulicInputs, PipeMaterialId } from '../engine/types';
import { COMMERCIAL_DIAMETERS, PIPE_MATERIALS } from '../engine/materialsAndFittings';
import { HelpTooltip } from './HelpTooltip';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface SimpleFormProps {
  inputs: HydraulicInputs;
  onChange: (inputs: HydraulicInputs) => void;
  onCalculate: () => void;
}

export const SimpleForm: React.FC<SimpleFormProps> = ({
  inputs,
  onChange,
  onCalculate
}) => {
  const [flowUnit, setFlowUnit] = useState<'m3h' | 'lh'>('m3h');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to update fields
  const updateField = <K extends keyof HydraulicInputs>(field: K, value: HydraulicInputs[K]) => {
    setErrorMessage(null);
    onChange({
      ...inputs,
      [field]: value
    });
  };

  const handleFlowChange = (rawVal: string) => {
    setErrorMessage(null);
    const num = parseFloat(rawVal) || 0;
    if (flowUnit === 'lh') {
      updateField('flowRateM3h', num / 1000);
    } else {
      updateField('flowRateM3h', num);
    }
  };

  const displayedFlow = flowUnit === 'lh' 
    ? (inputs.flowRateM3h > 0 ? Math.round(inputs.flowRateM3h * 1000) : '')
    : (inputs.flowRateM3h > 0 ? inputs.flowRateM3h : '');

  const handleMaterialChange = (mat: PipeMaterialId) => {
    onChange({
      ...inputs,
      suctionMaterial: mat,
      dischargeMaterial: mat
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.flowRateM3h || inputs.flowRateM3h <= 0) {
      setErrorMessage('Por favor, informe a vazão desejada maior que zero.');
      return;
    }
    const totalH = (inputs.isSubmerged ? 0 : inputs.suctionHeight) + inputs.dischargeHeight;
    if (totalH <= 0) {
      setErrorMessage('Por favor, informe pelo menos uma altura de desnível (sucção ou recalque) maior que zero.');
      return;
    }
    const totalDist = (inputs.isSubmerged ? 0 : inputs.suctionLength) + inputs.dischargeLength;
    if (totalDist <= 0) {
      setErrorMessage('Por favor, informe a distância da tubulação maior que zero.');
      return;
    }
    setErrorMessage(null);
    onCalculate();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-5">
        
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Dimensionamento Hidráulico Simples
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Insira os dados da sua instalação para calcular a Altura Manométrica (HMT) e encontrar as bombas ideais.
          </p>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 1. VAZÃO */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center">
                <span>Vazão</span>
                <HelpTooltip
                  title="Vazão"
                  description="Qual deverá ser a vazão da bomba para atender à necessidade do sistema? Ou qual a vazão outorgada do poço?"
                  example="Exemplo: 3.0 m³/h (ou 3.000 Litros por hora)."
                />
              </label>

              {/* Unit Toggle */}
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setFlowUnit('m3h')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    flowUnit === 'm3h' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  m³/h
                </button>
                <button
                  type="button"
                  onClick={() => setFlowUnit('lh')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    flowUnit === 'lh' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Litros/h
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                step={flowUnit === 'm3h' ? '0.1' : '50'}
                min="0"
                placeholder={flowUnit === 'm3h' ? 'Ex: 3.0' : 'Ex: 3000'}
                value={displayedFlow}
                onChange={e => handleFlowChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                {flowUnit === 'm3h' ? 'm³/h' : 'L/h'}
              </span>
            </div>
          </div>

          {/* 2. TEMPO */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center">
              <span>Tempo</span>
              <HelpTooltip
                title="Tempo"
                description="Qual o tempo que essa bomba precisaria ficar ligada?"
                example="Exemplo: 4 horas por dia (útil para estimar o volume diário e o consumo de energia elétrica)."
              />
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                placeholder="Ex: 4"
                value={inputs.operatingHours && inputs.operatingHours > 0 ? inputs.operatingHours : ''}
                onChange={e => updateField('operatingHours', parseFloat(e.target.value) || 4)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                horas / dia
              </span>
            </div>
          </div>

          {/* 3. ALTURA DE SUCÇÃO */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center">
              <span>Altura de sucção</span>
              <HelpTooltip
                title="Altura de sucção"
                description="Qual o desnível do ponto de captação de água até a bomba?"
                example="Exemplo: 2 metros (desnível vertical do espelho d'água da cisterna/rio até a entrada da bomba)."
              />
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="Ex: 2.0"
                value={inputs.suctionHeight > 0 ? inputs.suctionHeight : ''}
                onChange={e => updateField('suctionHeight', parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                metros
              </span>
            </div>
          </div>

          {/* 4. ALTURA DE RECALQUE */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center">
              <span>Altura de recalque</span>
              <HelpTooltip
                title="Altura de recalque"
                description="Qual o desnível da bomba até o reservatório Superior?"
                example="Exemplo: 18 metros (desnível vertical da bomba até a entrada da caixa d'água ou reservatório superior)."
              />
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="Ex: 18.0"
                value={inputs.dischargeHeight > 0 ? inputs.dischargeHeight : ''}
                onChange={e => updateField('dischargeHeight', parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                metros
              </span>
            </div>
          </div>

          {/* 5. DISTÂNCIA ENTRE A BOMBA E O RESERVATÓRIO INFERIOR */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center">
              <span>Distância entre a bomba e o reservatório inferior</span>
              <HelpTooltip
                title="Distância entre a bomba e o reservatório inferior"
                description="Comprimento linear total da tubulação de sucção desde o ponto de captação de água até a entrada da bomba."
                example="Exemplo: 5 metros de cano instalado na sucção."
              />
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="0"
                placeholder="Ex: 5"
                value={inputs.suctionLength > 0 ? inputs.suctionLength : ''}
                onChange={e => updateField('suctionLength', parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                metros
              </span>
            </div>
          </div>

          {/* 6. DISTÂNCIA ENTRE A BOMBA E RESERVATÓRIO SUPERIOR */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center">
              <span>Distância entre a bomba e reservatório superior</span>
              <HelpTooltip
                title="Distância entre a bomba e reservatório superior"
                description="Comprimento linear total da tubulação de recalque desde a saída da bomba até o reservatório superior."
                example="Exemplo: 60 metros de tubos ao longo do terreno."
              />
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="0"
                placeholder="Ex: 60"
                value={inputs.dischargeLength > 0 ? inputs.dischargeLength : ''}
                onChange={e => updateField('dischargeLength', parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                metros
              </span>
            </div>
          </div>

          {/* 7. MATERIAL DA TUBULAÇÃO */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center">
              <span>Material da tubulação</span>
              <HelpTooltip
                title="Material da tubulação"
                description="Tipo de material dos tubos da instalação. Define a rugosidade (Coeficiente C de Hazen-Williams) e o atrito hidráulico da água."
                example="PVC rígido ou PEAD possuem menor atrito (C=140). Aço e ferro fundido apresentam maior atrito."
              />
            </label>
            <select
              value={inputs.dischargeMaterial}
              onChange={e => handleMaterialChange(e.target.value as PipeMaterialId)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              {PIPE_MATERIALS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (C = {m.cFactor})
                </option>
              ))}
            </select>
          </div>

          {/* 8. DIÂMETRO DO TUBO */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center">
              <span>Diâmetro do tubo</span>
              <HelpTooltip
                title="Diâmetro do tubo"
                description="Bitola comercial dos canos. Tubos com diâmetro maior geram menor perda de carga e economizam energia."
                example="3/4 pol (25mm) ou 1 pol (32mm) são os mais comuns para residências e pequenos sítios."
              />
            </label>
            <select
              value={inputs.dischargeDiameterMm}
              onChange={e => {
                const dia = parseFloat(e.target.value);
                onChange({
                  ...inputs,
                  dischargeDiameterMm: dia,
                  suctionDiameterMm: dia >= 27.8 ? dia : 27.8
                });
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              {COMMERCIAL_DIAMETERS.map(d => (
                <option key={d.nominalMm} value={d.internalMm}>
                  {d.nominalPol} ({d.nominalMm} mm externo)
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-sm font-bold shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center space-x-2"
          >
            <span>Calcular e Ver Bombas Recomendadas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </form>
  );
};
