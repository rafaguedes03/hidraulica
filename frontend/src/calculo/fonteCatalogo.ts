/**
 * DE ONDE VEM O CATÁLOGO DE BOMBAS
 *
 * 1. O app já nasce com uma cópia do catálogo embutida (funciona sem internet desde a instalação).
 * 2. Quando há conexão, busca a versão mais nova na API (GET /api/bombas) e guarda no aparelho.
 *    A resposta da API é { origem: 'mysql' | 'arquivo', bombas: [...] }.
 * 3. Sem conexão, usa a última versão guardada; se nunca houve, usa a embutida.
 */
import { ModeloBomba } from './tipos';
import { CATALOGO_BOMBAS } from './catalogoBombas';

// v2: os campos das bombas passaram a ter nomes em português.
const CHAVE_ARMAZENAMENTO = 'hidrocalc_catalogo_v2';
const ENDERECO_API = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '');

export type OrigemCatalogo = 'embutido' | 'aparelho' | 'servidor';

export interface EstadoCatalogo {
  bombas: ModeloBomba[];
  origem: OrigemCatalogo;
  atualizadoEm: string | null;
}

function ehNumero(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor);
}

/** Só aceita bombas com os campos que o cálculo realmente usa. */
export function ehBombaValida(b: any): b is ModeloBomba {
  return !!b
    && typeof b.id === 'string' && typeof b.fabricante === 'string' && typeof b.modelo === 'string'
    && typeof b.tipo === 'string'
    && ehNumero(b.potenciaCv) && ehNumero(b.alturaMaximaMca) && ehNumero(b.vazaoMaximaM3h) && b.vazaoMaximaM3h > 0
    && !!b.coeficientesCurva
    && ehNumero(b.coeficientesCurva.a) && ehNumero(b.coeficientesCurva.b) && ehNumero(b.coeficientesCurva.c)
    && ehNumero(b.vazaoBepM3h) && ehNumero(b.rendimentoMaximoPct);
}

/** Preenche campos opcionais que faltarem, para as telas não quebrarem. */
export function normalizarBomba(b: ModeloBomba): ModeloBomba {
  return {
    ...b,
    potenciaKw: ehNumero(b.potenciaKw) ? b.potenciaKw : Math.round(b.potenciaCv * 0.7355 * 100) / 100,
    vazaoMinimaM3h: ehNumero(b.vazaoMinimaM3h) ? b.vazaoMinimaM3h : 0,
    alturaBepMca: ehNumero(b.alturaBepMca) ? b.alturaBepMca : 0,
    bocalSuccao: b.bocalSuccao || '',
    bocalRecalque: b.bocalRecalque || '',
    tensao: b.tensao || '',
    pontosCurva: Array.isArray(b.pontosCurva) ? b.pontosCurva : [],
    caracteristicas: Array.isArray(b.caracteristicas) ? b.caracteristicas : []
  };
}

/** Lê a resposta da API (ou o que estava guardado). Devolve null se não houver bomba válida. */
export function lerRespostaCatalogo(resposta: any): ModeloBomba[] | null {
  // a API devolve { origem, bombas }; o que fica guardado no aparelho é a lista direto
  const lista = Array.isArray(resposta) ? resposta : resposta?.bombas;
  if (!Array.isArray(lista)) return null;
  const bombas = lista.filter(ehBombaValida).map(normalizarBomba);
  return bombas.length > 0 ? bombas : null;
}

export function catalogoEmbutido(): EstadoCatalogo {
  return { bombas: CATALOGO_BOMBAS, origem: 'embutido', atualizadoEm: null };
}

export function carregarCatalogoGuardado(): EstadoCatalogo {
  try {
    const texto = localStorage.getItem(CHAVE_ARMAZENAMENTO);
    if (texto) {
      const guardado = JSON.parse(texto);
      const bombas = lerRespostaCatalogo(guardado?.bombas);
      if (bombas) return { bombas, origem: 'aparelho', atualizadoEm: guardado.atualizadoEm ?? null };
    }
  } catch {
    // armazenamento indisponível ou corrompido: segue com o catálogo embutido
  }
  return catalogoEmbutido();
}

export async function buscarCatalogoServidor(tempoLimiteMs = 5000): Promise<EstadoCatalogo | null> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;
  const controle = new AbortController();
  const cronometro = setTimeout(() => controle.abort(), tempoLimiteMs);
  try {
    const resposta = await fetch(`${ENDERECO_API}/api/bombas`, {
      signal: controle.signal,
      headers: { Accept: 'application/json' }
    });
    if (!resposta.ok) return null;
    const bombas = lerRespostaCatalogo(await resposta.json());
    if (!bombas) return null;
    const estado: EstadoCatalogo = { bombas, origem: 'servidor', atualizadoEm: new Date().toISOString() };
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify({ bombas, atualizadoEm: estado.atualizadoEm }));
    } catch {
      // sem espaço para guardar: continua usando em memória
    }
    return estado;
  } catch {
    return null; // sem internet, servidor fora do ar ou resposta inválida
  } finally {
    clearTimeout(cronometro);
  }
}
