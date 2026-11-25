/**
 * PEÇAS COMUNS AOS DOIS FORMULÁRIOS
 * Validação dos dados, bloco com título e a barra com os botões Limpar e Calcular.
 */
import React from 'react';
import { DadosEntrada } from '../calculo/tipos';

export interface ErrosFormulario {
  vazao?: string;
  altura?: string;
  alturaSuccao?: string;
  comprimento?: string;
}

/**
 * Confere o mínimo necessário para a conta fazer sentido:
 * vazão maior que zero, alguma altura, comprimento do recalque, e que nenhum
 * cano seja mais curto que a altura que ele vence.
 */
export function validarEntradas(entradas: DadosEntrada): ErrosFormulario {
  const erros: ErrosFormulario = {};
  if (!(entradas.vazaoM3h > 0)) {
    erros.vazao = 'Informe a quantidade de água por hora.';
  }
  const alturaTotal = (entradas.bombaSubmersa ? 0 : entradas.alturaSuccaoM) + entradas.alturaRecalqueM;
  if (!(alturaTotal > 0)) {
    erros.altura = 'Informe a altura de recalque.';
  }
  if (!(entradas.comprimentoRecalqueM > 0)) {
    erros.comprimento = 'Informe o comprimento do cano de recalque.';
  } else if (entradas.comprimentoRecalqueM < entradas.alturaRecalqueM) {
    erros.comprimento = 'O cano não pode ser mais curto que a altura de recalque.';
  }
  if (!entradas.bombaSubmersa && entradas.alturaSuccaoM > 0 && entradas.comprimentoSuccaoM > 0 && entradas.comprimentoSuccaoM < entradas.alturaSuccaoM) {
    erros.alturaSuccao = 'A altura de sucção não pode ser maior que o comprimento do cano de sucção.';
  }
  return erros;
}

export const FormSection: React.FC<{ titulo: string; passo?: number; lateral?: React.ReactNode; children: React.ReactNode }> = ({
  titulo, passo, lateral, children
}) => (
  <section className="card p-4 sm:p-5">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 text-lg font-bold text-ink">
        {passo !== undefined && (
          <span className="tabular inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-tint text-sm font-bold text-brand" aria-hidden="true">
            {passo}
          </span>
        )}
        {titulo}
      </h2>
      {lateral}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

/** Botão principal sempre ao alcance do polegar: fica preso na base da tela. */
export const SubmitBar: React.FC<{ aoLimpar: () => void; temErros: boolean }> = ({ aoLimpar, temErros }) => (
  <div className="sticky bottom-0 z-10 -mx-4 border-t border-line bg-page/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:mx-0 sm:rounded-b-2xl sm:px-0">
    {temErros && (
      <p role="alert" className="mb-2 text-sm font-medium text-danger">
        Faltam dados. Confira os campos marcados acima.
      </p>
    )}
    <div className="flex gap-2">
      <button type="button" onClick={aoLimpar} className="btn btn-secondary">
        Limpar
      </button>
      <button type="submit" className="btn btn-primary flex-1">
        Calcular bomba
      </button>
    </div>
  </div>
);
