import pool, { testConnection } from './db.js';

const FABRICANTES_SEED = [
  { nome: 'Leão', site: 'https://bombasleao.com.br' },
  { nome: 'Altri', site: 'https://altribombas.com.br' },
  { nome: 'Imbil', site: 'https://imbil.com.br' },
  { nome: 'Schneider', site: 'https://www.franklin-electric.com.br' },
  { nome: 'Dancor', site: 'https://www.dancor.com.br' },
  { nome: 'Anauger', site: 'https://www.anauger.com.br' },
  { nome: 'Thebe', site: 'https://www.thebe.com.br' },
  { nome: 'Eletroplas', site: 'https://www.eletroplas.com.br' }
];

const BOMBAS_SEED = [
  // Leão
  {
    fabricante: 'Leão',
    modelo: '4R2-08 (1/2 CV) - Submersa 4"',
    tipo: 'submersivel',
    potencia_cv: 0.5,
    potencia_kw: 0.37,
    voltagem: '220V Monofásico',
    fase: 'Monofásico 127/220V',
    succao_pol: 'Submersa',
    recalque_pol: '1"',
    vazao_max_m3h: 2.8,
    altura_max_mca: 52.0,
    coef_a: -5.8,
    coef_b: -2.4,
    coef_c: 53.0,
    vazao_bep_m3h: 1.5,
    altura_bep_mca: 36.0,
    rendimento_max_pct: 62,
    preco_estimado_brl: 1250.00,
    link_manual: 'https://bombasleao.com.br'
  },
  {
    fabricante: 'Leão',
    modelo: '4R3-12 (1.0 CV) - Submersa 4"',
    tipo: 'submersivel',
    potencia_cv: 1.0,
    potencia_kw: 0.75,
    voltagem: '220V Monofásico',
    fase: 'Monofásico 127/220V',
    succao_pol: 'Submersa',
    recalque_pol: '1.1/4"',
    vazao_max_m3h: 4.2,
    altura_max_mca: 78.0,
    coef_a: -3.8,
    coef_b: -2.8,
    coef_c: 79.0,
    vazao_bep_m3h: 2.6,
    altura_bep_mca: 48.0,
    rendimento_max_pct: 65,
    preco_estimado_brl: 1780.00,
    link_manual: 'https://bombasleao.com.br'
  },
  {
    fabricante: 'Leão',
    modelo: '4R5-16 (2.0 CV) - Submersa 4"',
    tipo: 'submersivel',
    potencia_cv: 2.0,
    potencia_kw: 1.5,
    voltagem: '220/380V Trifásico',
    fase: 'Trifásico 220/380V',
    succao_pol: 'Submersa',
    recalque_pol: '1.1/2"',
    vazao_max_m3h: 7.2,
    altura_max_mca: 112.0,
    coef_a: -1.9,
    coef_b: -1.8,
    coef_c: 114.0,
    vazao_bep_m3h: 4.5,
    altura_bep_mca: 68.0,
    rendimento_max_pct: 68,
    preco_estimado_brl: 2650.00,
    link_manual: 'https://bombasleao.com.br'
  },
  // Altri
  {
    fabricante: 'Altri',
    modelo: 'AL-405 (1/2 CV) 100% Inox 4"',
    tipo: 'submersivel',
    potencia_cv: 0.5,
    potencia_kw: 0.37,
    voltagem: '220V Monofásico',
    fase: 'Monofásico 127/220V',
    succao_pol: 'Submersa',
    recalque_pol: '1"',
    vazao_max_m3h: 2.6,
    altura_max_mca: 48.0,
    coef_a: -6.5,
    coef_b: -1.8,
    coef_c: 49.0,
    vazao_bep_m3h: 1.3,
    altura_bep_mca: 34.0,
    rendimento_max_pct: 63,
    preco_estimado_brl: 1390.00,
    link_manual: 'https://altribombas.com.br'
  },
  {
    fabricante: 'Altri',
    modelo: 'AL-410 (1.0 CV) 100% Inox 4"',
    tipo: 'submersivel',
    potencia_cv: 1.0,
    potencia_kw: 0.75,
    voltagem: '220V Monofásico',
    fase: 'Monofásico 127/220V',
    succao_pol: 'Submersa',
    recalque_pol: '1.1/4"',
    vazao_max_m3h: 4.0,
    altura_max_mca: 82.0,
    coef_a: -4.8,
    coef_b: -1.2,
    coef_c: 83.0,
    vazao_bep_m3h: 2.2,
    altura_bep_mca: 56.0,
    rendimento_max_pct: 66,
    preco_estimado_brl: 1950.00,
    link_manual: 'https://altribombas.com.br'
  },
  // Imbil
  {
    fabricante: 'Imbil',
    modelo: 'ITA 32-160 (2.0 CV) - Normalizada',
    tipo: 'centrifuga',
    potencia_cv: 2.0,
    potencia_kw: 1.5,
    voltagem: '220/380V Trifásico',
    fase: 'Trifásico 220/380V',
    succao_pol: '2"',
    recalque_pol: '1.1/4"',
    vazao_max_m3h: 15.0,
    altura_max_mca: 38.0,
    coef_a: -0.15,
    coef_b: -0.25,
    coef_c: 38.5,
    vazao_bep_m3h: 8.5,
    altura_bep_mca: 25.0,
    rendimento_max_pct: 72,
    preco_estimado_brl: 2890.00,
    link_manual: 'https://imbil.com.br'
  },
  {
    fabricante: 'Imbil',
    modelo: 'ITA 50-200 (5.0 CV) - Alta Pressão',
    tipo: 'centrifuga',
    potencia_cv: 5.0,
    potencia_kw: 3.7,
    voltagem: '220/380V Trifásico',
    fase: 'Trifásico 220/380V',
    succao_pol: '2.1/2"',
    recalque_pol: '2"',
    vazao_max_m3h: 30.0,
    altura_max_mca: 62.0,
    coef_a: -0.062,
    coef_b: -0.15,
    coef_c: 63.0,
    vazao_bep_m3h: 18.0,
    altura_bep_mca: 40.0,
    rendimento_max_pct: 76,
    preco_estimado_brl: 5200.00,
    link_manual: 'https://imbil.com.br'
  },
  // Schneider
  {
    fabricante: 'Schneider',
    modelo: 'BC-91 S (1/2 CV) - Centrífuga',
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
    preco_estimado_brl: 720.00,
    link_manual: 'https://www.franklin-electric.com.br'
  },
  {
    fabricante: 'Schneider',
    modelo: 'BC-92 S (2.0 CV) - Alta Pressão',
    tipo: 'centrifuga',
    potencia_cv: 2.0,
    potencia_kw: 1.5,
    voltagem: '220/380V Trifásico',
    fase: 'Trifásico 220/380V',
    succao_pol: '1.1/2"',
    recalque_pol: '1"',
    vazao_max_m3h: 14.2,
    altura_max_mca: 52.0,
    coef_a: -0.21,
    coef_b: -0.30,
    coef_c: 52.0,
    vazao_bep_m3h: 8.0,
    altura_bep_mca: 39.0,
    rendimento_max_pct: 70,
    preco_estimado_brl: 1750.00,
    link_manual: 'https://www.franklin-electric.com.br'
  }
];

export async function runSeed() {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('MySQL não está acessível no momento. Certifique-se de que o XAMPP ou MySQL local esteja rodando.');
    return;
  }

  try {
    console.log('Populando dados no banco de dados MySQL...');

    for (const fab of FABRICANTES_SEED) {
      await pool.query(
        'INSERT IGNORE INTO fabricantes (nome, site) VALUES (?, ?)',
        [fab.nome, fab.site]
      );
    }

    for (const b of BOMBAS_SEED) {
      const [fabRows] = await pool.query('SELECT id FROM fabricantes WHERE nome = ?', [b.fabricante]);
      const fabId = fabRows[0]?.id;

      if (fabId) {
        await pool.query(
          `INSERT INTO bombas 
            (fabricante_id, modelo, tipo, potencia_cv, potencia_kw, voltagem, fase, succao_pol, recalque_pol, vazao_max_m3h, altura_max_mca, coef_a, coef_b, coef_c, vazao_bep_m3h, altura_bep_mca, rendimento_max_pct, preco_estimado_brl, link_manual)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE modelo=VALUES(modelo)`,
          [
            fabId, b.modelo, b.tipo, b.potencia_cv, b.potencia_kw, b.voltagem, b.fase, b.succao_pol, b.recalque_pol,
            b.vazao_max_m3h, b.altura_max_mca, b.coef_a, b.coef_b, b.coef_c, b.vazao_bep_m3h, b.altura_bep_mca,
            b.rendimento_max_pct, b.preco_estimado_brl, b.link_manual
          ]
        );
      }
    }

    console.log('Seed finalizado com sucesso!');
  } catch (err) {
    console.error('Erro no seed:', err);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed().then(() => process.exit(0));
}
