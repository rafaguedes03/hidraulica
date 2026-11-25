// Preenche o MySQL com o catálogo de catalog.json. Pode rodar quantas vezes quiser:
// bombas que já existem são atualizadas, as novas são inseridas.
import banco, { testarConexao } from './db.js';
import { lerArquivoCatalogo, SITES_FABRICANTES, COLUNAS_BOMBA, bombaParaValores } from './catalog.js';

async function semear() {
  if (!(await testarConexao())) {
    console.error('Não foi possível conectar ao MySQL. Confira o arquivo .env e se o banco foi criado com schema.sql.');
    process.exit(1);
  }

  const catalogo = lerArquivoCatalogo();
  const fabricantes = [...new Set(catalogo.map(b => b.fabricante))];

  for (const nome of fabricantes) {
    await banco.query(
      'INSERT INTO fabricantes (nome, site) VALUES (?, ?) ON DUPLICATE KEY UPDATE site = VALUES(site)',
      [nome, SITES_FABRICANTES[nome] ?? null]
    );
  }
  const [linhas] = await banco.query('SELECT id, nome FROM fabricantes');
  const idDoFabricante = Object.fromEntries(linhas.map(l => [l.nome, l.id]));

  const colunas = ['fabricante_id', ...COLUNAS_BOMBA];
  const marcadores = colunas.map(() => '?').join(', ');
  const atualizacoes = colunas.filter(c => c !== 'codigo').map(c => `${c} = VALUES(${c})`).join(', ');

  for (const bomba of catalogo) {
    await banco.query(
      `INSERT INTO bombas (${colunas.join(', ')}) VALUES (${marcadores}) ON DUPLICATE KEY UPDATE ${atualizacoes}`,
      [idDoFabricante[bomba.fabricante], ...bombaParaValores(bomba)]
    );
  }

  console.log(`Catálogo gravado: ${fabricantes.length} fabricantes, ${catalogo.length} bombas.`);
  await banco.end();
}

semear().catch(erro => {
  console.error('Erro no seed:', erro.message);
  process.exit(1);
});
