import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

interface PropsJanela {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: string;
  rodape?: React.ReactNode;
  tamanho?: 'normal' | 'grande';
  children: React.ReactNode;
}

/** Janela que sobe da base no celular e fica centralizada em telas maiores. */
export const Modal: React.FC<PropsJanela> = ({ aberto, aoFechar, titulo, descricao, rodape, tamanho = 'normal', children }) => {
  const idTitulo = useId();
  const refPainel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const focoAnterior = document.activeElement as HTMLElement | null;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar();
    };
    document.addEventListener('keydown', aoTeclar);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    refPainel.current?.focus();
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflowAnterior;
      focoAnterior?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/50" onClick={aoFechar} aria-hidden="true" />
      <div
        ref={refPainel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className={`relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-line bg-surface outline-none sm:rounded-2xl ${
          tamanho === 'grande' ? 'sm:max-w-3xl' : 'sm:max-w-xl'
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <h2 id={idTitulo} className="text-lg font-bold leading-snug text-ink">{titulo}</h2>
            {descricao && <p className="mt-0.5 text-sm text-muted">{descricao}</p>}
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="-mr-1.5 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-sunken hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">{children}</div>
        {rodape && (
          <div className="border-t border-line px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
            {rodape}
          </div>
        )}
      </div>
    </div>
  );
};
