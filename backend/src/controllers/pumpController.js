// Rotas da API de bombas e de projetos.
import crypto from 'node:crypto';
import banco, { ehErroDeConexao } from '../database/db.js';
import { lerArquivoCatalogo, linhaParaBomba, validarBomba, COLUNAS_BOMBA, bombaParaValores } from '../database/catalog.js';

/**
 * GET /api/bombas
 * Devolve o catálogo no formato que o app usa: { origem, bombas }.
 * Se o MySQL estiver fora do ar, responde com a cópia em arquivo (catalog.json).
 * Filtros opcionais: ?tipo=submersivel  ?busca=dancor
 */
export async function listarBombas(req, res) {
  try {
    const { tipo, busca } = req.query;
    let consulta = `
      SELECT b.*, f.nome AS fabricante_nome
      FROM bombas b
      JOIN fabricantes f ON b.fabricante_id = f.id
      WHERE 1=1`;
    const parametros = [];

    if (tipo) {
      consulta += ' AND b.tipo = ?';
      parametros.push(String(tipo));
    }
    if (busca) {
      consulta += ' AND (b.modelo LIKE ? OR f.nome LIKE ?)';
      const termo = `%${String(busca).slice(0, 80)}%`;
      parametros.push(termo, termo);
    }
    consulta += ' ORDER BY f.nome ASC, b.potencia_cv ASC, b.vazao_max_m3h ASC';

    const [linhas] = await banco.query(consulta, parametros);
    return res.json({ origem: 'mysql', bombas: linhas.map(linhaParaBomba) });
  } catch (erro) {
    if (!ehErroDeConexao(erro)) {
      console.error('Erro ao listar bombas:', erro);
      return res.status(500).json({ erro: 'Erro ao consultar o banco de dados.' });
    }
    try {
      return res.json({ origem: 'arquivo', bombas: lerArquivoCatalogo() });
    } catch (erroArquivo) {
      console.error('MySQL fora do ar e catalog.json ilegível:', erroArquivo.message);
      return res.status(503).json({ erro: 'Catálogo indisponível no momento.' });
    }
  }
}

/** Só quem tem o ADMIN_TOKEN do .env pode cadastrar bombas (cabeçalho x-admin-token). */
export function exigirAdmin(req, res, next) {
  const esperado = process.env.ADMIN_TOKEN;
  if (!esperado) {
    return res.status(503).json({ erro: 'Cadastro desativado: defina ADMIN_TOKEN no .env do servidor.' });
  }
  const recebido = String(req.get('x-admin-token') || '');
  // Compara os resumos (hash) em tempo constante, para não vazar o token pela demora da resposta.
  const a = crypto.createHash('sha256').update(recebido).digest();
  const b = crypto.createHash('sha256').update(esperado).digest();
  if (!crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ erro: 'Token de administrador inválido.' });
  }
  next();
}

/** POST /api/bombas: cadastra ou atualiza uma bomba (corpo no mesmo formato devolvido pelo GET). */
export async function cadastrarBomba(req, res) {
  const bomba = req.body;
  const erros = validarBomba(bomba);
  if (erros.length > 0) {
    return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
  }

  try {
    await banco.query('INSERT IGNORE INTO fabricantes (nome) VALUES (?)', [bomba.fabricante.trim()]);
    const [[fabricante]] = await banco.query('SELECT id FROM fabricantes WHERE nome = ?', [bomba.fabricante.trim()]);

    const colunas = ['fabricante_id', ...COLUNAS_BOMBA];
    const atualizacoes = colunas.filter(c => c !== 'codigo').map(c => `${c} = VALUES(${c})`).join(', ');
    await banco.query(
      `INSERT INTO bombas (${colunas.join(', ')}) VALUES (${colunas.map(() => '?').join(', ')}) ON DUPLICATE KEY UPDATE ${atualizacoes}`,
      [fabricante.id, ...bombaParaValores(bomba)]
    );
    return res.status(201).json({ mensagem: 'Bomba gravada.', id: bomba.id });
  } catch (erro) {
    if (ehErroDeConexao(erro)) {
      return res.status(503).json({ erro: 'MySQL fora do ar. Tente de novo mais tarde.' });
    }
    console.error('Erro ao gravar bomba:', erro);
    return res.status(500).json({ erro: 'Erro ao gravar no banco de dados.' });
  }
}

const texto = (valor, maximo) => (typeof valor === 'string' && valor.trim() ? valor.trim().slice(0, maximo) : null);
const positivo = valor => (typeof valor === 'number' && Number.isFinite(valor) && valor > 0 ? valor : null);

/** POST /api/projetos: guarda um dimensionamento feito no app. */
export async function salvarDimensionamento(req, res) {
  const corpo = req.body || {};
  const projetoNome = texto(corpo.projeto_nome, 150);
  const vazao = positivo(corpo.vazao_m3h);
  const hmt = positivo(corpo.hmt_mca);
  const potencia = positivo(corpo.potencia_cv);

  if (!projetoNome || !vazao || !hmt || !potencia) {
    return res.status(400).json({ erro: 'Informe projeto_nome, vazao_m3h, hmt_mca e potencia_cv (números maiores que zero).' });
  }

  try {
    let idBomba = null;
    if (typeof corpo.bomba_codigo === 'string') {
      const [linhas] = await banco.query('SELECT id FROM bombas WHERE codigo = ?', [corpo.bomba_codigo]);
      idBomba = linhas[0]?.id ?? null;
    }
    const [resultado] = await banco.query(
      `INSERT INTO dimensionamentos_salvos
        (projeto_nome, cliente_nome, localizacao, vazao_m3h, hmt_mca, potencia_cv, bomba_selecionada_id, dados_completos_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [projetoNome, texto(corpo.cliente_nome, 150), texto(corpo.localizacao, 150), vazao, hmt, potencia, idBomba,
        JSON.stringify(corpo.dados_completos ?? null)]
    );
    return res.status(201).json({ mensagem: 'Projeto salvo.', id: resultado.insertId });
  } catch (erro) {
    if (ehErroDeConexao(erro)) {
      return res.status(503).json({ erro: 'MySQL fora do ar. Tente de novo mais tarde.' });
    }
    console.error('Erro ao salvar projeto:', erro);
    return res.status(500).json({ erro: 'Erro ao salvar o projeto.' });
  }
}
