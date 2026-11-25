/**
 * AVISO
 * Caixa colorida para avisos do cálculo: grave (vermelho), atenção (amarelo) ou informação (cinza).
 */
import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { NivelAviso } from '../../calculo/tipos';

const ESTILO: Record<NivelAviso, { caixa: string; Icone: typeof Info; rotulo: string }> = {
  grave: { caixa: 'bg-danger-tint text-danger border-danger/30', Icone: AlertCircle, rotulo: 'Problema' },
  atencao: { caixa: 'bg-warn-tint text-warn border-warn/30', Icone: AlertTriangle, rotulo: 'Atenção' },
  info: { caixa: 'bg-sunken text-ink border-line', Icone: Info, rotulo: 'Observação' }
};

export const Notice: React.FC<{ nivel: NivelAviso; children: React.ReactNode }> = ({ nivel, children }) => {
  const { caixa, Icone, rotulo } = ESTILO[nivel];
  return (
    <div role={nivel === 'grave' ? 'alert' : undefined} className={`flex gap-2.5 rounded-xl border px-3.5 py-3 text-[15px] leading-snug ${caixa}`}>
      <Icone className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p>
        <span className="font-bold">{rotulo}: </span>
        <span className={nivel === 'info' ? 'text-muted' : ''}>{children}</span>
      </p>
    </div>
  );
};
