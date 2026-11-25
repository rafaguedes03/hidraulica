/**
 * FORMATAÇÃO DE NÚMEROS
 * Tudo no padrão brasileiro: vírgula para decimais e ponto para milhar.
 */

/** Número com casas decimais fixas: numero(27.45, 1) → "27,5". */
export function numero(valor: number, casasDecimais = 1): string {
  if (!Number.isFinite(valor)) return '–';
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais
  });
}

/** Número sem zeros desnecessários: 1 → "1", 0.5 → "0,5", 1.25 → "1,25". */
export function compacto(valor: number, maximoCasas = 2): string {
  if (!Number.isFinite(valor)) return '–';
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: maximoCasas });
}

/** Valor em reais: 12.5 → "R$ 12,50". */
export function reais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Potência em cv como se fala no balcão: 0.5 → "1/2", 0.75 → "3/4", 1.5 → "1,5". */
export function cv(valor: number): string {
  const fracoes: Record<string, string> = { '0.25': '1/4', '0.33': '1/3', '0.5': '1/2', '0.75': '3/4' };
  return fracoes[String(valor)] ?? compacto(valor);
}

/** Lê o que a pessoa digitou, aceitando vírgula ou ponto. Devolve null se não for número. */
export function lerDecimal(texto: string): number | null {
  const limpo = texto.trim().replace(/\s/g, '').replace(',', '.');
  if (limpo === '' || limpo === '.' || limpo === '-') return null;
  const valor = Number(limpo);
  return Number.isFinite(valor) ? valor : null;
}
