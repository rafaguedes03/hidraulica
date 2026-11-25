import React, { useEffect, useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { compacto, lerDecimal } from '../../lib/formatacao';

interface PropsMoldura {
  id: string;
  rotulo: string;
  dica?: string;
  ajuda?: React.ReactNode;
  erro?: string;
  complemento?: React.ReactNode;
  children: React.ReactNode;
}

/** Rótulo + campo + dica. A explicação longa abre embaixo, sem balão flutuante (melhor no celular). */
export const FieldShell: React.FC<PropsMoldura> = ({ id, rotulo, dica, ajuda, erro, complemento, children }) => {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-[15px] font-semibold leading-snug text-ink">
          {rotulo}
        </label>
        {complemento}
        {ajuda && !complemento && (
          <button
            type="button"
            onClick={() => setAberto(o => !o)}
            aria-expanded={aberto}
            aria-controls={`${id}-help`}
            className="-my-1 inline-flex min-h-8 shrink-0 items-center gap-0.5 rounded-md px-1 text-sm font-medium text-brand"
          >
            O que é isso?
            <ChevronDown className={`h-4 w-4 transition-transform ${aberto ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        )}
      </div>
      {ajuda && aberto && (
        <div id={`${id}-help`} className="rounded-lg bg-sunken px-3 py-2 text-sm leading-relaxed text-ink">
          {ajuda}
        </div>
      )}
      {children}
      {erro ? (
        <p id={`${id}-msg`} className="text-sm font-medium text-danger">{erro}</p>
      ) : dica ? (
        <p id={`${id}-msg`} className="text-sm text-muted">{dica}</p>
      ) : null}
    </div>
  );
};

interface PropsCampoNumero {
  rotulo: string;
  valor: number;
  aoAlterar: (valor: number) => void;
  unidade?: string;
  dica?: string;
  ajuda?: React.ReactNode;
  erro?: string;
  exemplo?: string;
  complemento?: React.ReactNode;
  /** Mostra o campo vazio quando o valor é zero (padrão). */
  vazioQuandoZero?: boolean;
  maximo?: number;
}

/**
 * Campo numérico que aceita vírgula ou ponto e abre o teclado decimal no celular.
 * Guarda o texto digitado para não "brigar" com quem está no meio da digitação.
 */
export const NumberField: React.FC<PropsCampoNumero> = ({
  rotulo, valor, aoAlterar, unidade, dica, ajuda, erro, exemplo, complemento, vazioQuandoZero = true, maximo
}) => {
  const id = useId();
  const paraTexto = (v: number) => (vazioQuandoZero && !v ? '' : compacto(v, 3).replace(/\./g, ''));
  const [texto, setTexto] = useState(() => paraTexto(valor));

  // Se o valor mudar por fora (limpar, trocar unidade), atualiza o texto.
  useEffect(() => {
    const atual = lerDecimal(texto) ?? 0;
    if (Math.abs(atual - (valor || 0)) > 1e-9) setTexto(paraTexto(valor));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  const aoDigitar = (bruto: string) => {
    const limpo = bruto.replace(/[^0-9.,]/g, '');
    setTexto(limpo);
    let n = lerDecimal(limpo) ?? 0;
    if (n < 0) n = 0;
    if (maximo !== undefined && n > maximo) n = maximo;
    aoAlterar(n);
  };

  return (
    <FieldShell id={id} rotulo={rotulo} dica={dica} ajuda={ajuda} erro={erro} complemento={complemento}>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="next"
          placeholder={exemplo}
          value={texto}
          onChange={e => aoDigitar(e.target.value)}
          aria-invalid={erro ? true : undefined}
          aria-describedby={dica || erro ? `${id}-msg` : undefined}
          className={`input tabular font-semibold ${unidade ? 'pr-20' : ''}`}
        />
        {unidade && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[15px] text-muted">
            {unidade}
          </span>
        )}
      </div>
    </FieldShell>
  );
};

interface PropsCampoSelecao {
  rotulo: string;
  valor: string | number;
  aoAlterar: (valor: string) => void;
  opcoes: Array<{ valor: string | number; rotulo: string }>;
  dica?: string;
  ajuda?: React.ReactNode;
}

export const SelectField: React.FC<PropsCampoSelecao> = ({ rotulo, valor, aoAlterar, opcoes, dica, ajuda }) => {
  const id = useId();
  return (
    <FieldShell id={id} rotulo={rotulo} dica={dica} ajuda={ajuda}>
      <select
        id={id}
        value={valor}
        onChange={e => aoAlterar(e.target.value)}
        aria-describedby={dica ? `${id}-msg` : undefined}
        className="input font-medium"
      >
        {opcoes.map(o => (
          <option key={o.valor} value={o.valor}>{o.rotulo}</option>
        ))}
      </select>
    </FieldShell>
  );
};

interface PropsSegmentado<T extends string> {
  rotulo: string;
  valor: T;
  aoAlterar: (valor: T) => void;
  opcoes: Array<{ valor: T; rotulo: string }>;
  tamanho?: 'normal' | 'pequeno';
  ocultarRotulo?: boolean;
}

/** Escolha entre poucas opções, todas visíveis. */
export function Segmented<T extends string>({ rotulo, valor, aoAlterar, opcoes, tamanho = 'normal', ocultarRotulo }: PropsSegmentado<T>) {
  const id = useId();
  return (
    <div className={ocultarRotulo ? '' : 'space-y-1.5'}>
      <span id={id} className={ocultarRotulo ? 'sr-only' : 'block text-[15px] font-semibold text-ink'}>{rotulo}</span>
      <div role="radiogroup" aria-labelledby={id} className="flex rounded-xl bg-sunken p-1">
        {opcoes.map(o => {
          const ativo = o.valor === valor;
          return (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={ativo}
              onClick={() => aoAlterar(o.valor)}
              className={`flex-1 rounded-lg px-2 text-center font-semibold leading-tight transition-colors ${
                tamanho === 'pequeno' ? 'min-h-8 text-sm' : 'min-h-11 py-1.5 text-[15px]'
              } ${ativo ? 'bg-surface text-ink shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink'}`}
            >
              {o.rotulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
