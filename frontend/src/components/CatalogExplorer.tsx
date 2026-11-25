/**
 * CATÁLOGO DE BOMBAS
 * Lista as bombas com busca por marca/modelo e filtro por tipo.
 */
import React, { useId, useMemo, useState } from 'react';
import { TipoBomba } from '../calculo/tipos';
import { EstadoCatalogo } from '../calculo/fonteCatalogo';
import { Modal } from './ui/Modal';
import { cv, numero } from '../lib/formatacao';
import { ExternalLink, Search } from 'lucide-react';

interface PropsCatalogo {
  aberto: boolean;
  aoFechar: () => void;
  catalogo: EstadoCatalogo;
}

const TIPOS: Array<{ valor: TipoBomba | 'todos'; rotulo: string }> = [
  { valor: 'todos', rotulo: 'Todos os tipos' },
  { valor: 'centrifuga', rotulo: 'Centrífugas' },
  { valor: 'submersivel', rotulo: 'Submersas' },
  { valor: 'autoaspirante', rotulo: 'Autoaspirantes' },
  { valor: 'periferica', rotulo: 'Periféricas' },
  { valor: 'injetora', rotulo: 'Injetoras' },
  { valor: 'solar', rotulo: 'Solares' }
];

const TEXTO_ORIGEM: Record<EstadoCatalogo['origem'], string> = {
  embutido: 'Catálogo que vem com o app.',
  aparelho: 'Catálogo guardado neste aparelho',
  servidor: 'Catálogo atualizado agora pela internet.'
};

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const CatalogExplorer: React.FC<PropsCatalogo> = ({ aberto, aoFechar, catalogo }) => {
  const idBusca = useId();
  const idTipo = useId();
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState<TipoBomba | 'todos'>('todos');

  const disponiveis = TIPOS.filter(t => t.valor === 'todos' || catalogo.bombas.some(p => p.tipo === t.valor));

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return catalogo.bombas
      .filter(p => tipo === 'todos' || p.tipo === tipo)
      .filter(p => !termo || normalizar(`${p.fabricante} ${p.modelo}`).includes(termo))
      .sort((a, b) => a.fabricante.localeCompare(b.fabricante, 'pt-BR') || a.potenciaCv - b.potenciaCv);
  }, [catalogo.bombas, busca, tipo]);

  const textoOrigem = catalogo.origem === 'aparelho' && catalogo.atualizadoEm
    ? `${TEXTO_ORIGEM.aparelho} em ${new Date(catalogo.atualizadoEm).toLocaleDateString('pt-BR')}.`
    : catalogo.origem === 'aparelho' ? `${TEXTO_ORIGEM.aparelho}.` : TEXTO_ORIGEM[catalogo.origem];

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      tamanho="grande"
      titulo="Catálogo de bombas"
      descricao={`${catalogo.bombas.length} modelos. ${textoOrigem}`}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
          <div className="relative">
            <label htmlFor={idBusca} className="sr-only">Buscar por marca ou modelo</label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id={idBusca}
              type="search"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar marca ou modelo"
              className="input pl-11"
            />
          </div>
          <div>
            <label htmlFor={idTipo} className="sr-only">Tipo de bomba</label>
            <select id={idTipo} value={tipo} onChange={e => setTipo(e.target.value as TipoBomba | 'todos')} className="input font-medium">
              {disponiveis.map(t => <option key={t.valor} value={t.valor}>{t.rotulo}</option>)}
            </select>
          </div>
        </div>

        {filtrados.length === 0 ? (
          <p className="py-8 text-center text-[15px] text-muted">
            Nenhuma bomba encontrada. Tente outro nome ou outro tipo.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {filtrados.map(bomba => (
              <li key={bomba.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-muted">{bomba.fabricante}</p>
                  <p className="text-[15px] font-semibold leading-snug text-ink">{bomba.modelo}</p>
                  <p className="tabular mt-0.5 text-sm text-muted">
                    {cv(bomba.potenciaCv)} cv, até {numero(bomba.vazaoMaximaM3h, 1)} m³/h, até {numero(bomba.alturaMaximaMca, 0)} mca
                  </p>
                </div>
                {bomba.linkManual && (
                  <a
                    href={bomba.linkManual}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Site do fabricante: ${bomba.fabricante} ${bomba.modelo}`}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-brand hover:bg-brand-tint"
                  >
                    <ExternalLink className="h-5 w-5" aria-hidden="true" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="text-sm text-muted">
          Vazão e altura máximas não acontecem juntas: para escolher, use o cálculo. As curvas são aproximadas; confirme no catálogo do fabricante.
        </p>
      </div>
    </Modal>
  );
};
