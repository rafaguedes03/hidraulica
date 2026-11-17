import pool, { testConnection } from '../database/db.js';

// Fallback in-memory catalog when MySQL is offline
const MOCK_BOMBAS = [
  {
    id: 1,
    fabricante: 'Schneider',
    modelo: 'BC-91 S 1/2 CV',
    tipo: 'centrifuga',
    potencia_cv: 0.5,
    potencia_kw: 0.37,
    voltagem: '127/220V',
    fase: 'Monofásico 127/220V',
    succao_pol: '1"',
    recalque_pol: '1"',
    vazao_max_m3h: 7.2,
    altura_max_mca: 27.0,
    coef_a: -0.42,
    coef_b: -0.65,
    coef_c: 27.5,
    vazao_bep_m3h: 3.8,
    altura_bep_mca: 19.0,
    rendimento_max_pct: 62,
    preco_estimado_brl: 720.00
  },
  {
    id: 2,
    fabricante: 'Anauger',
    modelo: 'Anauger 800 5G',
    tipo: 'submersivel',
    potencia_cv: 0.45,
    potencia_kw: 0.34,
    voltagem: '127V ou 220V',
    fase: 'Monofásico 127/220V',
    succao_pol: 'Submersa',
    recalque_pol: '3/4"',
    vazao_max_m3h: 1.9,
    altura_max_mca: 70.0,
    coef_a: -14.5,
    coef_b: -8.2,
    coef_c: 72.0,
    vazao_bep_m3h: 1.1,
    altura_bep_mca: 45.0,
    rendimento_max_pct: 42,
    preco_estimado_brl: 380.00
  }
];

export async function listPumps(req, res) {
  const isConnected = await testConnection();

  if (!isConnected) {
    // Return mock data with a header indicating offline fallback
    res.setHeader('X-Data-Source', 'local-fallback');
    return res.json({
      source: 'local-fallback',
      message: 'Banco MySQL offline. Retornando dados locais em cache.',
      data: MOCK_BOMBAS
    });
  }

  try {
    const { tipo, fabricante_id, search } = req.query;
    let query = `
      SELECT b.*, f.nome as fabricante_nome, f.site as fabricante_site 
      FROM bombas b 
      JOIN fabricantes f ON b.fabricante_id = f.id 
      WHERE 1=1
    `;
    const params = [];

    if (tipo) {
      query += ' AND b.tipo = ?';
      params.push(tipo);
    }
    if (fabricante_id) {
      query += ' AND b.fabricante_id = ?';
      params.push(fabricante_id);
    }
    if (search) {
      query += ' AND (b.modelo LIKE ? OR f.nome LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY b.potencia_cv ASC, b.vazao_max_m3h ASC';

    const [rows] = await pool.query(query, params);
    return res.json({ source: 'mysql', data: rows });
  } catch (err) {
    console.error('Erro ao listar bombas:', err);
    return res.status(500).json({ error: 'Erro ao consultar banco de dados' });
  }
}

export async function createPump(req, res) {
  const isConnected = await testConnection();
  if (!isConnected) {
    return res.status(503).json({ error: 'MySQL offline. Não é possível cadastrar bomba no momento.' });
  }

  try {
    const {
      fabricante_id, modelo, tipo, potencia_cv, potencia_kw,
      voltagem, fase, succao_pol, recalque_pol, vazao_max_m3h,
      altura_max_mca, coef_a, coef_b, coef_c, preco_estimado_brl, link_manual
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO bombas 
        (fabricante_id, modelo, tipo, potencia_cv, potencia_kw, voltagem, fase, succao_pol, recalque_pol, vazao_max_m3h, altura_max_mca, coef_a, coef_b, coef_c, preco_estimado_brl, link_manual)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fabricante_id, modelo, tipo, potencia_cv, potencia_kw,
        voltagem, fase || 'Monofásico 127/220V', succao_pol, recalque_pol,
        vazao_max_m3h, altura_max_mca, coef_a, coef_b, coef_c,
        preco_estimado_brl, link_manual
      ]
    );

    return res.status(201).json({ message: 'Bomba cadastrada com sucesso', id: result.insertId });
  } catch (err) {
    console.error('Erro ao criar bomba:', err);
    return res.status(500).json({ error: 'Erro ao inserir no banco de dados' });
  }
}

export async function saveSizingProject(req, res) {
  const isConnected = await testConnection();
  if (!isConnected) {
    return res.status(503).json({ error: 'MySQL offline' });
  }

  try {
    const { projeto_nome, cliente_nome, localizacao, vazao_m3h, hmt_mca, potencia_cv, bomba_selecionada_id, dados_completos } = req.body;

    const [result] = await pool.query(
      `INSERT INTO dimensionamentos_salvos 
        (projeto_nome, cliente_nome, localizacao, vazao_m3h, hmt_mca, potencia_cv, bomba_selecionada_id, dados_completos_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projeto_nome, cliente_nome, localizacao, vazao_m3h,
        hmt_mca, potencia_cv, bomba_selecionada_id, JSON.stringify(dados_completos)
      ]
    );

    return res.status(201).json({ message: 'Projeto salvo com sucesso', id: result.insertId });
  } catch (err) {
    console.error('Erro ao salvar projeto:', err);
    return res.status(500).json({ error: 'Erro ao persistir projeto' });
  }
}
