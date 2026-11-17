import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './database/db.js';
import { listPumps, createPump, saveSizingProject } from './controllers/pumpController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    system: 'HidroCalc API',
    database: dbConnected ? 'online (MySQL)' : 'offline (Modo Fallback / Cache)',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/bombas', listPumps);
app.post('/api/bombas', createPump);
app.post('/api/projetos', saveSizingProject);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Servidor HidroCalc Backend rodando na porta ${PORT}`);
  const dbOnline = await testConnection();
  if (dbOnline) {
    console.log('✅ Conexão com banco MySQL estabelecida com sucesso!');
  } else {
    console.log('ℹ️ MySQL não detectado no momento. A API responderá em modo local / fallback resiliente.');
  }
});
