import React, { useEffect, useState } from 'react';
import { 
  Droplets, 
  Settings2, 
  BookOpen, 
  RotateCcw, 
  Download,
  BarChart3,
  Sun,
  Moon,
  Info,
  X
} from 'lucide-react';

interface HeaderProps {
  mode: 'simple' | 'technical';
  setMode: (mode: 'simple' | 'technical') => void;
  view: 'form' | 'results';
  setView: (view: 'form' | 'results') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onReset: () => void;
  onOpenCatalog: () => void;
  onOpenReport: () => void;
  hasCalculations: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  view,
  setView,
  theme,
  setTheme,
  onReset,
  onOpenCatalog,
  onOpenReport,
  hasCalculations
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Also check if already in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setCanInstall(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show instructional modal on how to install in Chrome/Edge/Safari/Android
      setShowInstallHelp(true);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <>
      <header className={`sticky top-0 z-40 w-full transition-all border-b ${
        theme === 'light' 
          ? 'bg-white/90 border-slate-200 backdrop-blur-xl shadow-xs' 
          : 'bg-slate-950/80 border-sky-500/20 backdrop-blur-xl'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Logo & Branding */}
            <div 
              onClick={() => setView('form')}
              className="flex items-center space-x-3 cursor-pointer select-none"
            >
              <div className={`relative flex items-center justify-center w-10 h-10 rounded-2xl p-[1.5px] shadow-md ${
                theme === 'light'
                  ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-600'
                  : 'bg-gradient-to-tr from-sky-600 via-cyan-500 to-blue-600 shadow-sky-500/25'
              }`}>
                <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                  theme === 'light' ? 'bg-white' : 'bg-slate-950'
                }`}>
                  <Droplets className={`w-5 h-5 ${
                    theme === 'light' ? 'text-emerald-600' : 'text-sky-400'
                  }`} />
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className={`text-lg font-bold tracking-tight flex items-center gap-1 ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}>
                    Hidro<span className={`text-transparent bg-clip-text ${
                      theme === 'light'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                        : 'bg-gradient-to-r from-sky-400 to-cyan-300'
                    }`}>Calc</span>
                  </h1>
                </div>
                <p className={`text-[11px] hidden sm:block ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Dimensionamento Técnico de Bombas Hidráulicas
                </p>
              </div>
            </div>

            {/* Mode Switcher (Visible on Form view) */}
            {view === 'form' ? (
              <div className={`flex items-center p-1 rounded-xl border shadow-inner ${
                theme === 'light' 
                  ? 'bg-slate-100 border-slate-200' 
                  : 'bg-slate-900 border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setMode('simple')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'simple'
                      ? theme === 'light'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-sky-600 text-white shadow-md'
                      : theme === 'light'
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Modo Simples</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('technical')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'technical'
                      ? theme === 'light'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-sky-600 text-white shadow-md'
                      : theme === 'light'
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Modo Avançado</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setView('form')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    theme === 'light'
                      ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  Editar Dados
                </button>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                  theme === 'light'
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-sky-400 bg-sky-950/60 border-sky-800/60'
                }`}>
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Resultados</span>
                </span>
              </div>
            )}

            {/* Right Action Icons & Badges */}
            <div className="flex items-center space-x-2">
              
              {/* Install PWA Button */}
              <button
                onClick={handleInstallClick}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  theme === 'light'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
                title="Instalar App no dispositivo para uso offline"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instalar App</span>
              </button>

              {/* Theme Toggle (Dark / Light) */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-2 rounded-xl border transition-all ${
                  theme === 'light'
                    ? 'bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200 shadow-xs'
                    : 'bg-slate-900 border-slate-800 text-sky-400 hover:bg-slate-800'
                }`}
                title={theme === 'dark' ? 'Mudar para Modo Claro (Branco & Verde)' : 'Mudar para Modo Escuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
                ) : (
                  <Moon className="w-4 h-4 text-emerald-700 animate-in spin-in-180 duration-300" />
                )}
              </button>

              {/* Catalog button */}
              <button
                onClick={onOpenCatalog}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700'
                }`}
                title="Ver Catálogo de Bombas"
              >
                <BookOpen className={`w-3.5 h-3.5 ${
                  theme === 'light' ? 'text-emerald-600' : 'text-sky-400'
                }`} />
                <span className="hidden md:inline">Catálogo</span>
              </button>

              {/* Report button */}
              {hasCalculations && (
                <button
                  onClick={onOpenReport}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-sm ${
                    theme === 'light'
                      ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                      : 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border-sky-500/40'
                  }`}
                  title="Gerar Relatório Técnico em PDF"
                >
                  <span>Laudo PDF</span>
                </button>
              )}

              {/* Reset button */}
              <button
                onClick={onReset}
                className={`p-1.5 rounded-lg transition-colors ${
                  theme === 'light'
                    ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Limpar formulário"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* PWA Install Instructions Modal (if beforeinstallprompt didn't trigger) */}
      {showInstallHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-xl ${
                  theme === 'light' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-500/20 text-sky-400'
                }`}>
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">Instalação do HidroCalc (PWA)</h3>
              </div>
              <button
                onClick={() => setShowInstallHelp(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
              O HidroCalc é uma aplicação PWA instalável que funciona 100% offline. Para instalar no seu navegador:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className={`p-3 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <strong className={`block mb-0.5 ${theme === 'light' ? 'text-emerald-700' : 'text-sky-400'}`}>
                  No Google Chrome / Microsoft Edge (Computador):
                </strong>
                <span>Clique no ícone de instalação (computadorzinho com seta para baixo) no canto direito da barra de endereços (URL).</span>
              </div>

              <div className={`p-3 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <strong className={`block mb-0.5 ${theme === 'light' ? 'text-emerald-700' : 'text-sky-400'}`}>
                  No Android (Chrome):
                </strong>
                <span>Toque no menu de 3 pontos (⋮) e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
              </div>

              <div className={`p-3 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <strong className={`block mb-0.5 ${theme === 'light' ? 'text-emerald-700' : 'text-sky-400'}`}>
                  No iPhone / iPad (Safari):
                </strong>
                <span>Toque no botão de Compartilhar (quadrado com seta para cima) e selecione <strong>"Adicionar à Tela de Início"</strong>.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInstallHelp(false)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors text-white ${
                theme === 'light' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-sky-600 hover:bg-sky-500'
              }`}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
