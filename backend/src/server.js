// Servidor do HidroCalc: entrega a API (/api/...) e, se existir, o app pronto (frontend/dist).
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { testarConexao } from './database/db.js';
import { listarBombas, cadastrarBomba, salvarDimensionamento, exigirAdmin } from './controllers/pumpController.js';

dotenv.config();

const app = express();
const PORTA = process.env.PORT || 3001;

// CORS_ORIGIN aceita uma ou mais origens separadas por vírgula. Sem ele, libera qualquer origem (bom para desenvolvimento).
const origensPermitidas = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors(origensPermitidas.length > 0 ? { origin: origensPermitidas } : undefined));
app.use(express.json({ limit: '200kb' }));

// Situação do servidor e do banco
app.get('/api/health', async (req, res) => {
  const bancoConectado = await testarConexao();
  res.json({
    situacao: 'ok',
    sistema: 'HidroCalc API',
    banco: bancoConectado ? 'mysql' : 'arquivo (MySQL fora do ar)',
    horario: new Date().toISOString()
  });
});

app.get('/api/bombas', listarBombas);
app.post('/api/bombas', exigirAdmin, cadastrarBomba);
app.post('/api/projetos', salvarDimensionamento);

app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// O mesmo servidor entrega o app pronto (frontend/dist), quando ele existe.
// Assim basta uma porta só: o app e a API ficam no mesmo endereço.
const pastaApp = process.env.FRONTEND_DIST
  || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');
const temApp = fs.existsSync(path.join(pastaApp, 'index.html'));

if (temApp) {
  // index.html e o service worker nunca ficam em cache, para as atualizações chegarem.
  const semCache = res => res.setHeader('Cache-Control', 'no-cache');
  app.use(express.static(pastaApp, {
    setHeaders: (res, arquivo) => {
      if (/(index\.html|sw\.js|registerSW\.js|manifest\.webmanifest)$/.test(arquivo)) semCache(res);
    }
  }));
  // Qualquer outro endereço abre o app (ele mesmo decide qual tela mostrar).
  app.get('*', (req, res) => {
    semCache(res);
    res.sendFile(path.join(pastaApp, 'index.html'));
  });
}

// JSON malformado e outros erros não tratados
app.use((erro, req, res, next) => {
  if (erro?.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido.' });
  }
  if (erro?.type === 'entity.too.large') {
    return res.status(413).json({ erro: 'Requisição grande demais.' });
  }
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno.' });
});

app.listen(PORTA, async () => {
  console.log(`HidroCalc rodando em http://localhost:${PORTA}`);
  console.log(temApp
    ? 'App: servindo frontend/dist.'
    : 'App: frontend/dist não encontrado (só a API está no ar). Rode "npm run build" na raiz.');
  if (await testarConexao()) {
    console.log('MySQL conectado.');
  } else {
    console.log('MySQL não encontrado: o catálogo será servido a partir de catalog.json.');
  }
});
