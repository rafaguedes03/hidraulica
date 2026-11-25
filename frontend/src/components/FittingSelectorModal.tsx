/**
 * SELETOR DE CONEXÕES (modo técnico)
 * Janela com botões + e − para cada peça. Mostra quantos metros de cano reto
 * cada peça equivale na bitola escolhida e o total.
 */
import React from 'react';
import { IdConexao, ItemConexao } from '../calculo/tipos';
import { CONEXOES, diametroNominalMaisProximo } from '../calculo/materiaisEConexoes';
import { Modal } from './ui/Modal';
import { numero } from '../lib/formatacao';
import { Plus, Minus } from 'lucide-react';

interface PropsSeletorConexoes {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  diametroMm: number;
  conexoesSelecionadas: ItemConexao[];
  aoAlterar: (fittings: ItemConexao[]) => void;
}

const CATEGORIAS = [
  { id: 'valvulas', nome: 'Válvulas' },
  { id: 'curvas', nome: 'Curvas e joelhos' },
  { id: 'registros', nome: 'Registros' },
  { id: 'conexoes', nome: 'Tês e saídas' }
] as const;

export const FittingSelectorModal: React.FC<PropsSeletorConexoes> = ({
  aberto, aoFechar, titulo, diametroMm, conexoesSelecionadas, aoAlterar
}) => {
  const diametroNominal = diametroNominalMaisProximo(diametroMm);

  const quantidadeDe = (id: IdConexao) => conexoesSelecionadas.find(f => f.idConexao === id)?.quantidade ?? 0;

  const alterarQuantidade = (id: IdConexao, variacao: number) => {
    const novaQuantidade = Math.max(0, quantidadeDe(id) + variacao);
    const outras = conexoesSelecionadas.filter(f => f.idConexao !== id);
    aoAlterar(novaQuantidade === 0 ? outras : [...outras, { idConexao: id, quantidade: novaQuantidade }]);
  };

  const totalEquivalente = conexoesSelecionadas.reduce((soma, item) => {
    const definicao = CONEXOES.find(f => f.id === item.idConexao);
    return soma + (definicao?.comprimentosEquivalentes[diametroNominal] ?? 0) * item.quantidade;
  }, 0);

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={titulo}
      descricao={`Cano de ${diametroNominal} mm. Cada peça conta como alguns metros a mais de cano reto.`}
      rodape={
        <div className="flex items-center justify-between gap-3">
          <p className="text-[15px] text-muted">
            Total: <strong className="tabular text-ink">{numero(totalEquivalente, 1)} m</strong> equivalentes
          </p>
          <button type="button" onClick={aoFechar} className="btn btn-primary">
            Pronto
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {CATEGORIAS.map(categoria => (
          <div key={categoria.id}>
            <h3 className="mb-1 text-sm font-bold text-muted">{categoria.nome}</h3>
            <ul className="divide-y divide-line">
              {CONEXOES.filter(f => f.categoria === categoria.id).map(definicao => {
                const qtd = quantidadeDe(definicao.id);
                return (
                  <li key={definicao.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium leading-snug text-ink">{definicao.nome}</p>
                      <p className="tabular text-sm text-muted">{numero(definicao.comprimentosEquivalentes[diametroNominal] ?? 0, 1)} m cada</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(definicao.id, -1)}
                        disabled={qtd === 0}
                        aria-label={`Tirar um: ${definicao.nome}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink hover:bg-sunken disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className={`tabular w-7 text-center text-base font-bold ${qtd > 0 ? 'text-brand' : 'text-muted'}`} aria-live="polite">
                        {qtd}
                      </span>
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(definicao.id, 1)}
                        aria-label={`Adicionar um: ${definicao.nome}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink hover:bg-sunken"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Modal>
  );
};
