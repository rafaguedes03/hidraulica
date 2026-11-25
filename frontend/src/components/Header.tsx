/**
 * CABEÇALHO
 * Logo, aviso de "sem internet", botão de instalar o app, catálogo e troca de tema.
 */
import React, { useEffect, useState } from 'react';
import { BookOpen, Download, Droplets, Moon, Sun, WifiOff } from 'lucide-react';
import { Modal } from './ui/Modal';

interface PropsCabecalho {
  tema: 'escuro' | 'claro';
  aoTrocarTema: () => void;
  aoAbrirCatalogo: () => void;
  aoIrParaInicio: () => void;
}

const botaoIcone = 'inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2.5 text-[15px] font-semibold text-ink hover:bg-sunken';

export const Header: React.FC<PropsCabecalho> = ({ tema, aoTrocarTema, aoAbrirCatalogo, aoIrParaInicio }) => {
  const [eventoInstalacao, setEventoInstalacao] = useState<any>(null);
  const [instalado, setInstalado] = useState(false);
  const [mostrarAjudaInstalacao, setMostrarAjudaInstalacao] = useState(false);
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    const aoPoderInstalar = (e: Event) => {
      e.preventDefault();
      setEventoInstalacao(e);
    };
    const aoInstalar = () => setInstalado(true);
    const ficouOnline = () => setOnline(true);
    const ficouOffline = () => setOnline(false);

    const modoApp = window.matchMedia?.('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setInstalado(!!modoApp);

    window.addEventListener('beforeinstallprompt', aoPoderInstalar);
    window.addEventListener('appinstalled', aoInstalar);
    window.addEventListener('online', ficouOnline);
    window.addEventListener('offline', ficouOffline);
    return () => {
      window.removeEventListener('beforeinstallprompt', aoPoderInstalar);
      window.removeEventListener('appinstalled', aoInstalar);
      window.removeEventListener('online', ficouOnline);
      window.removeEventListener('offline', ficouOffline);
    };
  }, []);

  const instalar = async () => {
    if (!eventoInstalacao) {
      setMostrarAjudaInstalacao(true);
      return;
    }
    eventoInstalacao.prompt();
    const { resultado } = await eventoInstalacao.userChoice;
    if (resultado === 'accepted') setInstalado(true);
    setEventoInstalacao(null);
  };

  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-line bg-surface pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-4">
          <button type="button" onClick={aoIrParaInicio} className="-ml-1.5 flex min-h-11 items-center gap-2 rounded-lg px-1.5" aria-label="HidroCalc, voltar ao início">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-on-brand">
              <Droplets className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight text-ink">HidroCalc</span>
          </button>

          <div className="flex items-center gap-0.5">
            {!online && (
              <span className="mr-1 inline-flex items-center gap-1.5 rounded-full bg-sunken px-2.5 py-1 text-sm font-medium text-muted" title="O cálculo funciona normalmente sem internet">
                <WifiOff className="h-4 w-4" aria-hidden="true" />
                <span>Sem internet</span>
              </span>
            )}
            {!instalado && (
              <button type="button" onClick={instalar} className={botaoIcone} aria-label="Instalar o app">
                <Download className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Instalar</span>
              </button>
            )}
            <button type="button" onClick={aoAbrirCatalogo} className={botaoIcone} aria-label="Catálogo de bombas">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Catálogo</span>
            </button>
            <button
              type="button"
              onClick={aoTrocarTema}
              className={botaoIcone}
              aria-label={tema === 'escuro' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {tema === 'escuro' ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <Modal
        aberto={mostrarAjudaInstalacao}
        aoFechar={() => setMostrarAjudaInstalacao(false)}
        titulo="Instalar o HidroCalc"
        descricao="Instalado, ele abre pela tela inicial e funciona sem internet."
        rodape={<button type="button" onClick={() => setMostrarAjudaInstalacao(false)} className="btn btn-primary w-full">Entendi</button>}
      >
        <dl className="space-y-4 text-[15px]">
          <div>
            <dt className="font-bold text-ink">Android (Chrome)</dt>
            <dd className="text-muted">Toque nos três pontinhos no canto de cima e escolha "Instalar aplicativo" ou "Adicionar à tela inicial".</dd>
          </div>
          <div>
            <dt className="font-bold text-ink">iPhone (Safari)</dt>
            <dd className="text-muted">Toque no botão de compartilhar (quadrado com seta para cima) e escolha "Adicionar à Tela de Início".</dd>
          </div>
          <div>
            <dt className="font-bold text-ink">Computador (Chrome ou Edge)</dt>
            <dd className="text-muted">Clique no ícone de instalar que aparece no fim da barra de endereço.</dd>
          </div>
        </dl>
      </Modal>
    </>
  );
};
