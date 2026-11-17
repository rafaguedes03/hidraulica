import React, { useState } from 'react';
import { HydraulicInputs } from '../engine/types';
import { 
  Home, 
  Sprout, 
  Beef, 
  SunMedium, 
  Check, 
  Sparkles, 
  ArrowRight,
  Calculator
} from 'lucide-react';

interface QuickWizardProps {
  currentInputs: HydraulicInputs;
  onApply: (inputs: HydraulicInputs) => void;
}

export const QuickWizard: React.FC<QuickWizardProps> = ({
  currentInputs,
  onApply
}) => {
  const [activeTab, setActiveTab] = useState<'casa' | 'irrigacao' | 'animais' | 'solar'>('casa');

  // Scenario 1: Casa / Sítio
  const [casaPeople, setCasaPeople] = useState(5);
  const [casaLitersPerPerson, setCasaLitersPerPerson] = useState(200);
  const [casaFillHours, setCasaFillHours] = useState(1.5);
  const [casaHeight, setCasaHeight] = useState(15);
  const [casaDistance, setCasaDistance] = useState(60);

  // Scenario 2: Irrigação
  const [irrigAreaM2, setIrrigAreaM2] = useState(2500);
  const [irrigType, setIrrigType] = useState<'gotejamento' | 'microaspersao' | 'aspersao'>('gotejamento');
  const [irrigLaminaMm, setIrrigLaminaMm] = useState(5);
  const [irrigHours, setIrrigHours] = useState(3);
  const [irrigHeight, setIrrigHeight] = useState(12);
  const [irrigDistance, setIrrigDistance] = useState(150);

  // Scenario 3: Animais
  const [gadoCorte, setGadoCorte] = useState(40);
  const [gadoLeite, setGadoLeite] = useState(10);
  const [cavalos, setCavalos] = useState(4);
  const [suinos, setSuinos] = useState(0);
  const [animaisHours, setAnimaisHours] = useState(2);
  const [animaisHeight, setAnimaisHeight] = useState(20);
  const [animaisDistance, setAnimaisDistance] = useState(200);

  // Scenario 4: Solar
  const [solarDailyVolumeM3, setSolarDailyVolumeM3] = useState(8);
  const [solarSunHours, setSolarSunHours] = useState(5);
  const [solarHeight, setSolarHeight] = useState(25);
  const [solarDistance, setSolarDistance] = useState(80);

  // Calculations for Scenarios
  // 1. Casa
  const totalDailyCasaL = casaPeople * casaLitersPerPerson;
  const flowCasaM3h = Math.max(0.3, Math.round((totalDailyCasaL / 1000 / casaFillHours) * 10) / 10);

  // 2. Irrigação: Volume = Area (m2) * Lamina (mm) / 1000 = m3
  const totalDailyIrrigM3 = (irrigAreaM2 * irrigLaminaMm) / 1000;
  const flowIrrigM3h = Math.max(0.5, Math.round((totalDailyIrrigM3 / irrigHours) * 10) / 10);
  const residualIrrigMca = irrigType === 'gotejamento' ? 12 : irrigType === 'microaspersao' ? 18 : 28;

  // 3. Animais: Gado corte: 50L, Gado Leite: 100L, Cavalos: 50L, Suínos: 15L
  const totalDailyAnimaisL = (gadoCorte * 50) + (gadoLeite * 100) + (cavalos * 50) + (suinos * 15);
  const flowAnimaisM3h = Math.max(0.3, Math.round((totalDailyAnimaisL / 1000 / animaisHours) * 10) / 10);

  // 4. Solar:
  const flowSolarM3h = Math.max(0.2, Math.round((solarDailyVolumeM3 / solarSunHours) * 10) / 10);

  const handleApplyCasa = () => {
    onApply({
      ...currentInputs,
      scenario: 'casa',
      flowRateM3h: flowCasaM3h,
      residualPressureMca: 2, // Reservatório aberto
      suctionHeight: 2,
      suctionLength: 5,
      suctionDiameterMm: 27.8, // 1"
      dischargeHeight: casaHeight,
      dischargeLength: casaDistance,
      dischargeDiameterMm: 21.6, // 3/4"
      isSubmerged: false
    });
  };

  const handleApplyIrrigacao = () => {
    const pipeDia = flowIrrigM3h > 8 ? 53.4 : flowIrrigM3h > 4 ? 44.0 : 35.2;
    onApply({
      ...currentInputs,
      scenario: 'irrigacao',
      flowRateM3h: flowIrrigM3h,
      residualPressureMca: residualIrrigMca,
      suctionHeight: 3,
      suctionLength: 8,
      suctionDiameterMm: pipeDia,
      dischargeHeight: irrigHeight,
      dischargeLength: irrigDistance,
      dischargeDiameterMm: pipeDia,
      isSubmerged: false
    });
  };

  const handleApplyAnimais = () => {
    onApply({
      ...currentInputs,
      scenario: 'animais',
      flowRateM3h: flowAnimaisM3h,
      residualPressureMca: 2,
      suctionHeight: 0,
      suctionLength: 0,
      suctionDiameterMm: 27.8,
      dischargeHeight: animaisHeight,
      dischargeLength: animaisDistance,
      dischargeDiameterMm: 27.8,
      isSubmerged: true // Comum usar poço com submersa
    });
  };

  const handleApplySolar = () => {
    onApply({
      ...currentInputs,
      scenario: 'solar',
      flowRateM3h: flowSolarM3h,
      residualPressureMca: 2,
      suctionHeight: 0,
      suctionLength: 0,
      suctionDiameterMm: 21.6,
      dischargeHeight: solarHeight,
      dischargeLength: solarDistance,
      dischargeDiameterMm: 21.6,
      isSubmerged: true
    });
  };

  return (
    <div className="rounded-2xl glass-panel p-5 border border-sky-500/20 space-y-6">
      
      {/* Title & Introduction */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 font-bold shadow-md shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Assistente de Dimensionamento Rápido
            </h2>
            <p className="text-xs text-slate-400">
              Selecione o seu objetivo e calculamos a vazão e tubulações ideais automaticamente.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs / Scenarios */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => setActiveTab('casa')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
            activeTab === 'casa'
              ? 'bg-sky-500/15 border-sky-500 text-sky-300 shadow-md shadow-sky-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-1.5" />
          <span className="text-xs font-bold">Casa & Sítio</span>
          <span className="text-[10px] text-slate-500">Caixa d'água</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('irrigacao')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
            activeTab === 'irrigacao'
              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <Sprout className="w-5 h-5 mb-1.5" />
          <span className="text-xs font-bold">Irrigação</span>
          <span className="text-[10px] text-slate-500">Horta & Lavoura</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('animais')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
            activeTab === 'animais'
              ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <Beef className="w-5 h-5 mb-1.5" />
          <span className="text-xs font-bold">Bebedouro Gado</span>
          <span className="text-[10px] text-slate-500">Pecuária Rural</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('solar')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
            activeTab === 'solar'
              ? 'bg-yellow-500/15 border-yellow-500 text-yellow-300 shadow-md shadow-yellow-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <SunMedium className="w-5 h-5 mb-1.5" />
          <span className="text-xs font-bold">Bomba Solar</span>
          <span className="text-[10px] text-slate-500">Sem rede elétrica</span>
        </button>
      </div>

      {/* Active Tab Panel Form */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
        
        {/* ================= ABA 1: CASA ================= */}
        {activeTab === 'casa' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Pessoas na Residência</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={casaPeople}
                  onChange={e => setCasaPeople(parseInt(e.target.value) || 1)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Consumo (L/pessoa/dia)</label>
                <input
                  type="number"
                  step="50"
                  min="50"
                  max="500"
                  value={casaLitersPerPerson}
                  onChange={e => setCasaLitersPerPerson(parseInt(e.target.value) || 150)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Tempo Enchimento (horas)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="8"
                  value={casaFillHours}
                  onChange={e => setCasaFillHours(parseFloat(e.target.value) || 1)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300">Desnível do Terreno (metros de subida)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={casaHeight}
                  onChange={e => setCasaHeight(parseFloat(e.target.value) || 10)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Distância da Tubulação (metros de cano)</label>
                <input
                  type="number"
                  step="10"
                  min="5"
                  max="1000"
                  value={casaDistance}
                  onChange={e => setCasaDistance(parseFloat(e.target.value) || 50)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
            </div>

            {/* Calculated Result Box */}
            <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-sky-200">
                <span className="font-bold">Consumo Total: {totalDailyCasaL.toLocaleString()} Litros/dia</span>
                <span className="text-slate-400 block text-[11px]">
                  Vazão estimada da bomba: <strong className="text-sky-300">{flowCasaM3h} m³/h</strong> ({(flowCasaM3h * 1000).toLocaleString()} L/h)
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplyCasa}
                className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 transition-all"
              >
                <span>Aplicar ao Cálculo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= ABA 2: IRRIGAÇÃO ================= */}
        {activeTab === 'irrigacao' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Área Irrigada (m²)</label>
                <input
                  type="number"
                  step="500"
                  min="100"
                  max="100000"
                  value={irrigAreaM2}
                  onChange={e => setIrrigAreaM2(parseFloat(e.target.value) || 1000)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
                <span className="text-[10px] text-slate-500">{(irrigAreaM2 / 10000).toFixed(2)} hectares</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Tipo de Emissor</label>
                <select
                  value={irrigType}
                  onChange={e => setIrrigType(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                >
                  <option value="gotejamento">Gotejamento (Pressão 12 mca)</option>
                  <option value="microaspersao">Microaspersão (Pressão 18 mca)</option>
                  <option value="aspersao">Aspersão Convencional (Pressão 28 mca)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Tempo de Rega (h/dia)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="12"
                  value={irrigHours}
                  onChange={e => setIrrigHours(parseFloat(e.target.value) || 2)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300">Desnível do Rio/Poço até o Campo (m)</label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={irrigHeight}
                  onChange={e => setIrrigHeight(parseFloat(e.target.value) || 10)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Comprimento da Linha Principal (m)</label>
                <input
                  type="number"
                  step="20"
                  min="10"
                  max="2000"
                  value={irrigDistance}
                  onChange={e => setIrrigDistance(parseFloat(e.target.value) || 100)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-emerald-200">
                <span className="font-bold">Lâmina Diária: {irrigLaminaMm} mm ({totalDailyIrrigM3.toFixed(1)} m³ por dia)</span>
                <span className="text-slate-400 block text-[11px]">
                  Vazão necessária na motobomba: <strong className="text-emerald-300">{flowIrrigM3h} m³/h</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplyIrrigacao}
                className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
              >
                <span>Aplicar ao Cálculo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= ABA 3: ANIMAIS ================= */}
        {activeTab === 'animais' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Gado de Corte (50L/d)</label>
                <input
                  type="number"
                  min="0"
                  value={gadoCorte}
                  onChange={e => setGadoCorte(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Gado Leiteiro (100L/d)</label>
                <input
                  type="number"
                  min="0"
                  value={gadoLeite}
                  onChange={e => setGadoLeite(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Cavalos (50L/d)</label>
                <input
                  type="number"
                  min="0"
                  value={cavalos}
                  onChange={e => setCavalos(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Suínos (15L/d)</label>
                <input
                  type="number"
                  min="0"
                  value={suinos}
                  onChange={e => setSuinos(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300">Desnível do Poço até o Bebedouro (m)</label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={animaisHeight}
                  onChange={e => setAnimaisHeight(parseFloat(e.target.value) || 20)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Distância em Tubulação (m)</label>
                <input
                  type="number"
                  step="20"
                  min="10"
                  max="2000"
                  value={animaisDistance}
                  onChange={e => setAnimaisDistance(parseFloat(e.target.value) || 100)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-amber-200">
                <span className="font-bold">Consumo do Rebanho: {totalDailyAnimaisL.toLocaleString()} Litros/dia</span>
                <span className="text-slate-400 block text-[11px]">
                  Vazão para encher em {animaisHours}h: <strong className="text-amber-300">{flowAnimaisM3h} m³/h</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplyAnimais}
                className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 transition-all"
              >
                <span>Aplicar ao Cálculo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= ABA 4: SOLAR ================= */}
        {activeTab === 'solar' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Volume Diário Necessário (m³/dia)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  value={solarDailyVolumeM3}
                  onChange={e => setSolarDailyVolumeM3(parseFloat(e.target.value) || 5)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
                <span className="text-[10px] text-slate-500">{(solarDailyVolumeM3 * 1000).toLocaleString()} Litros/dia</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Horas de Sol de Pico (PSH)</label>
                <input
                  type="number"
                  step="0.5"
                  min="3"
                  max="7"
                  value={solarSunHours}
                  onChange={e => setSolarSunHours(parseFloat(e.target.value) || 5)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
                <span className="text-[10px] text-slate-500">Média Brasil / Semiárido: 5 a 6 horas</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300">Desnível do Poço até o Reservatório (m)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={solarHeight}
                  onChange={e => setSolarHeight(parseFloat(e.target.value) || 20)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Distância da Tubulação (m)</label>
                <input
                  type="number"
                  step="10"
                  min="10"
                  max="1000"
                  value={solarDistance}
                  onChange={e => setSolarDistance(parseFloat(e.target.value) || 50)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-yellow-950/40 border border-yellow-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-yellow-200">
                <span className="font-bold">Bombeamento 100% Fotovoltaico</span>
                <span className="text-slate-400 block text-[11px]">
                  Vazão instantânea sob sol pleno: <strong className="text-yellow-300">{flowSolarM3h} m³/h</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplySolar}
                className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold shadow-md shadow-yellow-600/30 transition-all"
              >
                <span>Aplicar ao Cálculo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
