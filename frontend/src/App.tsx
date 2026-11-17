import React, { useState, useMemo, useEffect } from 'react';
import { HydraulicInputs } from './engine/types';
import { calculateHydraulics } from './engine/hydraulicCalculator';
import { matchPumps } from './engine/pumpMatcher';
import { Header } from './components/Header';
import { HydraulicVisualizer } from './components/HydraulicVisualizer';
import { SimpleForm } from './components/SimpleForm';
import { TechnicalForm } from './components/TechnicalForm';
import { ResultsPanel } from './components/ResultsPanel';
import { ReportModal } from './components/ReportModal';
import { CatalogExplorer } from './components/CatalogExplorer';
import { GraduationCap } from 'lucide-react';

const ZERO_INPUTS: HydraulicInputs = {
  scenario: 'custom',
  flowRateM3h: 0,
  residualPressureMca: 0,
  suctionHeight: 0,
  suctionLength: 0,
  suctionDiameterMm: 27.8, // 1" (32mm ext)
  suctionMaterial: 'pvc',
  suctionFittings: [],
  isSubmerged: false,
  dischargeHeight: 0,
  dischargeLength: 0,
  dischargeDiameterMm: 21.6, // 3/4" (25mm ext)
  dischargeMaterial: 'pvc',
  dischargeFittings: [],
  pumpEfficiencyPct: 60,
  motorEfficiencyPct: 85
};

export const App: React.FC = () => {
  const [mode, setMode] = useState<'simple' | 'technical'>('simple');
  const [view, setView] = useState<'form' | 'results'>('form');
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('hidrocalc_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [inputs, setInputs] = useState<HydraulicInputs>(() => {
    const saved = localStorage.getItem('hidrocalc_inputs_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return ZERO_INPUTS;
      }
    }
    return ZERO_INPUTS;
  });

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Sync theme with HTML document class
  useEffect(() => {
    localStorage.setItem('hidrocalc_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Save to localStorage whenever inputs change (offline persistence)
  useEffect(() => {
    localStorage.setItem('hidrocalc_inputs_v2', JSON.stringify(inputs));
  }, [inputs]);

  // Real-time calculation of hydraulic results
  const results = useMemo(() => {
    return calculateHydraulics(inputs);
  }, [inputs]);

  // Real-time matching against catalog
  const matchedPumps = useMemo(() => {
    return matchPumps(inputs, results);
  }, [inputs, results]);

  const handleReset = () => {
    if (window.confirm('Deseja limpar todos os campos preenchidos?')) {
      setInputs(ZERO_INPUTS);
      setView('form');
    }
  };

  const handleCalculate = () => {
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasCalculations = results.flowRateM3h > 0 && results.totalDynamicHeadMca > 0;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      theme === 'light' 
        ? 'bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white' 
        : 'bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white'
    }`}>
      
      {/* Top Header */}
      <Header
        mode={mode}
        setMode={setMode}
        view={view}
        setView={setView}
        theme={theme}
        setTheme={setTheme}
        onReset={handleReset}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        hasCalculations={hasCalculations}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* VIEW 1: ENTRADA DE DADOS (FORMULÁRIO LIMPO) */}
        {view === 'form' && (
          <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
            
            {mode === 'simple' ? (
              <SimpleForm
                inputs={inputs}
                onChange={setInputs}
                onCalculate={handleCalculate}
              />
            ) : (
              <TechnicalForm
                inputs={inputs}
                results={results}
                onChange={setInputs}
                onCalculate={handleCalculate}
              />
            )}

            {/* Mode Switch Card Footer */}
            <div className={`p-4 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              theme === 'light' ? 'bg-white border-slate-200' : 'glass-panel-subtle border-slate-800'
            }`}>
              <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
                {mode === 'simple'
                  ? 'Precisa detalhar sucção, conexões e materiais específicos?'
                  : 'Deseja um formulário mais direto com poucas entradas?'}
              </span>
              <button
                type="button"
                onClick={() => setMode(mode === 'simple' ? 'technical' : 'simple')}
                className={`font-bold transition-colors ml-2 shrink-0 ${
                  theme === 'light' ? 'text-emerald-700 hover:text-emerald-800' : 'text-sky-400 hover:text-sky-300'
                }`}
              >
                {mode === 'simple' ? 'Alternar para Modo Avançado →' : 'Alternar para Modo Simples →'}
              </button>
            </div>

          </div>
        )}

        {/* VIEW 2: TELA DE RESULTADOS */}
        {view === 'results' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Dynamic Animated Hydraulic Visualizer */}
            <section aria-label="Esquema Hidráulico Dinâmico">
              <HydraulicVisualizer inputs={inputs} results={results} />
            </section>

            {/* Results Panel */}
            <section aria-label="Painel de Resultados e Bombas">
              <ResultsPanel
                inputs={inputs}
                results={results}
                matchedPumps={matchedPumps}
                onOpenReport={() => setIsReportOpen(true)}
                onBackToForm={() => setView('form')}
              />
            </section>

          </div>
        )}

        {/* Educational Engineering Reference Section */}
        <section className={`p-6 rounded-2xl border text-xs space-y-3 transition-colors ${
          theme === 'light' 
            ? 'bg-white border-slate-200 text-slate-600 shadow-xs' 
            : 'glass-panel-subtle border-slate-800/80 text-slate-400'
        }`}>
          <div className={`flex items-center space-x-2 font-bold text-sm ${
            theme === 'light' ? 'text-slate-900' : 'text-slate-200'
          }`}>
            <GraduationCap className={`w-4 h-4 ${theme === 'light' ? 'text-emerald-600' : 'text-sky-400'}`} />
            <span>Critérios Técnicos de Dimensionamento (IFNMG / NBR 5626)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-[11px] leading-relaxed">
            <div className={`p-3 rounded-xl border ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'
            }`}>
              <strong className={`block mb-1 ${theme === 'light' ? 'text-emerald-700' : 'text-sky-300'}`}>
                Perdas Contínuas (Hazen-Williams)
              </strong>
              Calcula a dissipação de energia ao longo do comprimento da tubulação em função da rugosidade do tubo.
            </div>

            <div className={`p-3 rounded-xl border ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'
            }`}>
              <strong className={`block mb-1 ${theme === 'light' ? 'text-teal-700' : 'text-emerald-300'}`}>
                Perdas Localizadas (Leq)
              </strong>
              Computa perdas singulares em conexões, válvulas de pé com crivo, retenção e curvas através do método de comprimentos equivalentes.
            </div>

            <div className={`p-3 rounded-xl border ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'
            }`}>
              <strong className={`block mb-1 ${theme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>
                Ponto de Operação Real
              </strong>
              Interseção matemática entre a curva característica da bomba H(Q) e a resistência do circuito Hsis(Q).
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className={`w-full border-t py-5 text-center text-xs transition-colors ${
        theme === 'light' 
          ? 'bg-white border-slate-200 text-slate-500' 
          : 'bg-slate-950 border-slate-900 text-slate-500'
      }`}>
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className={theme === 'light' ? 'text-slate-800' : 'text-slate-300'}>
              HidroCalc
            </strong> — Sistema de Dimensionamento de Bombas Hidráulicas
          </div>
          <div className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Plataforma técnica para apoio a produtores rurais, técnicos e engenheiros
          </div>
        </div>
      </footer>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        inputs={inputs}
        results={results}
        matchedPumps={matchedPumps}
      />

      {/* Catalog Explorer Modal */}
      <CatalogExplorer
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
      />

    </div>
  );
};

export default App;
