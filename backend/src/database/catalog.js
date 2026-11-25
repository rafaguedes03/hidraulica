// Conversões entre o catálogo do app e a tabela `bombas` do MySQL.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Cópia do catálogo gerada por `npm run sync:catalog` (na raiz do projeto)
// a partir de frontend/src/calculo/catalogoBombas.ts.
const arquivoCatalogo = fileURLToPath(new URL('./catalog.json', import.meta.url));

export function lerArquivoCatalogo() {
  return JSON.parse(fs.readFileSync(arquivoCatalogo, 'utf8'));
}

export const SITES_FABRICANTES = {
  'Leão': 'https://bombasleao.com.br',
  'Altri': 'https://altribombas.com.br',
  'Imbil': 'https://imbil.com.br',
  'Schneider': 'https://www.franklin-electric.com.br',
  'Dancor': 'https://www.dancor.com.br',
  'Anauger': 'https://www.anauger.com.br',
  'Thebe': 'https://www.thebe.com.br',
  'Eletroplas': 'https://www.eletroplas.com.br'
};

/** Lê uma coluna JSON (o mysql2 às vezes já entrega como objeto). */
const lerJson = (valor, padrao) => {
  if (valor == null) return padrao;
  if (typeof valor !== 'string') return valor;
  try { return JSON.parse(valor); } catch { return padrao; }
};
const numeroOuVazio = valor => (valor == null ? undefined : Number(valor));

/** Linha da tabela `bombas` -> bomba no formato que o app usa (mesmos campos de ModeloBomba). */
export function linhaParaBomba(linha) {
  return {
    id: linha.codigo,
    fabricante: linha.fabricante_nome,
    modelo: linha.modelo,
    tipo: linha.tipo,
    potenciaCv: Number(linha.potencia_cv),
    potenciaKw: Number(linha.potencia_kw),
    tensao: linha.voltagem,
    fase: linha.fase,
    bocalSuccao: linha.succao_pol,
    bocalRecalque: linha.recalque_pol,
    alturaMaximaMca: Number(linha.altura_max_mca),
    vazaoMinimaM3h: Number(linha.vazao_min_m3h || 0),
    vazaoMaximaM3h: Number(linha.vazao_max_m3h),
    coeficientesCurva: { a: Number(linha.coef_a), b: Number(linha.coef_b), c: Number(linha.coef_c) },
    pontosCurva: lerJson(linha.pontos_curva, []),
    vazaoBepM3h: Number(linha.vazao_bep_m3h || 0),
    alturaBepMca: Number(linha.altura_bep_mca || 0),
    rendimentoMaximoPct: Number(linha.rendimento_max_pct || 60),
    precoAproximadoBrl: numeroOuVazio(linha.preco_estimado_brl),
    linkManual: linha.link_manual || undefined,
    caracteristicas: lerJson(linha.caracteristicas, [])
  };
}

/** Colunas da tabela `bombas`, na mesma ordem de bombaParaValores (sem fabricante_id). */
export const COLUNAS_BOMBA = [
  'codigo', 'modelo', 'tipo', 'potencia_cv', 'potencia_kw', 'voltagem', 'fase', 'succao_pol', 'recalque_pol',
  'vazao_min_m3h', 'vazao_max_m3h', 'altura_max_mca', 'coef_a', 'coef_b', 'coef_c', 'vazao_bep_m3h',
  'altura_bep_mca', 'rendimento_max_pct', 'preco_estimado_brl', 'link_manual', 'pontos_curva', 'caracteristicas'
];

/** Bomba do app -> valores para gravar nas colunas acima. */
export function bombaParaValores(b) {
  return [
    b.id, b.modelo, b.tipo, b.potenciaCv, b.potenciaKw ?? Math.round(b.potenciaCv * 73.55) / 100, b.tensao || '', b.fase || 'Monofásico 127/220V',
    b.bocalSuccao || '', b.bocalRecalque || '', b.vazaoMinimaM3h ?? 0, b.vazaoMaximaM3h, b.alturaMaximaMca,
    b.coeficientesCurva.a, b.coeficientesCurva.b, b.coeficientesCurva.c,
    b.vazaoBepM3h ?? null, b.alturaBepMca ?? null, b.rendimentoMaximoPct ?? 60,
    b.precoAproximadoBrl ?? null, b.linkManual ?? null,
    JSON.stringify(b.pontosCurva ?? []), JSON.stringify(b.caracteristicas ?? [])
  ];
}

const TIPOS = ['centrifuga', 'submersivel', 'periferica', 'autoaspirante', 'injetora', 'solar'];
const ehNumero = v => typeof v === 'number' && Number.isFinite(v);

/** Confere uma bomba recebida pela API. Devolve a lista de problemas (vazia se estiver tudo certo). */
export function validarBomba(b) {
  const erros = [];
  if (!b || typeof b !== 'object') return ['Corpo da requisição inválido.'];
  if (typeof b.id !== 'string' || !/^[a-z0-9-]{3,80}$/.test(b.id)) erros.push('id: use letras minúsculas, números e hífen (3 a 80 caracteres).');
  if (typeof b.fabricante !== 'string' || !b.fabricante.trim()) erros.push('fabricante: informe o fabricante.');
  if (typeof b.modelo !== 'string' || !b.modelo.trim()) erros.push('modelo: informe o modelo.');
  if (!TIPOS.includes(b.tipo)) erros.push(`tipo: use um de ${TIPOS.join(', ')}.`);
  if (!ehNumero(b.potenciaCv) || b.potenciaCv <= 0 || b.potenciaCv > 500) erros.push('potenciaCv: potência em cv, maior que zero.');
  if (!ehNumero(b.vazaoMaximaM3h) || b.vazaoMaximaM3h <= 0) erros.push('vazaoMaximaM3h: vazão máxima em m³/h, maior que zero.');
  if (!ehNumero(b.alturaMaximaMca) || b.alturaMaximaMca <= 0) erros.push('alturaMaximaMca: altura máxima em mca, maior que zero.');
  const c = b.coeficientesCurva;
  if (!c || !ehNumero(c.a) || !ehNumero(c.b) || !ehNumero(c.c)) erros.push('coeficientesCurva: informe a, b e c da curva H = aQ² + bQ + c.');
  else if (c.a >= 0 || c.c <= 0) erros.push('coeficientesCurva: a deve ser negativo e c positivo.');
  if (b.linkManual != null && !/^https?:\/\//.test(String(b.linkManual))) erros.push('linkManual: deve começar com http:// ou https://.');
  return erros;
}
