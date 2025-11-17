import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupRoutes } from './routes/index.js';
import { logger } from './utils/logger.js';
import { connectDatabase, closeDatabase } from './config/database.js';
import { startSubscriptionChecker } from './services/subscription.service.js';
import path from 'path';
import { fileURLToPath } from 'url';
// WhatsApp desativado temporariamente para evitar erro de criptografia (libsignal)

// Resolve o caminho correto do .env (backend/.env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

// Só carrega o backend/.env quando estamos rodando localmente.
// Em plataformas como Render ou Railway as variáveis já vêm do ambiente.
const runningInManagedEnv =
  process.env.RENDER === 'true' ||
  Boolean(process.env.RENDER_EXTERNAL_HOSTNAME) ||
  Boolean(process.env.RAILWAY_ENVIRONMENT) ||
  process.env.CLOUD_ENV === 'true';

if (!runningInManagedEnv || process.env.LOAD_LOCAL_ENV === 'true') {
  dotenv.config({ path: envPath });
} else {
  // Ainda assim carregamos variáveis padrão do processo sem tocar no arquivo local
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Forçando escutar em todas as interfaces

// Middleware
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'https://codigosteam.gamingflix.space', 
  'http://localhost:5173', 
  'http://codigosteam.gamingflix.space',
  'http://185.100.215.33',
  'https://185.100.215.33',
  'http://35.215.218.188:80',
  'http://35.215.218.188',
  'https://ultimate.gamingflix.space',
  'http://ultimate.gamingflix.space',
  'http://ultimate.gamingflix.space:80'
];
app.use(cors({ 
  origin: function(origin, callback) {
    // Permitir requisições sem origem (como apps mobile ou curl)
    if (!origin) return callback(null, true);
    
    // Verificar se a origem está na lista de permitidos
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Permitir qualquer subdomínio de gamingflix.space
    if (origin.endsWith('gamingflix.space')) {
      return callback(null, true);
    }
    
    callback(null, true); // Temporariamente permitir todas as origens para debug
  },
  credentials: true
}));
app.use(express.json());
app.set('trust proxy', 1);

// Logging de requisições (reduzido)
app.use((req, res, next) => {
  // Apenas log para rotas importantes e ignorando requisições frequentes de histórico
  if (!req.url.includes('/api/steam/history')) {
    logger.info(`${req.method} ${req.url}`);
  }
  next();
});

// Configuração das rotas
setupRoutes(app);

// Servir frontend estático (produção)
const distPath = path.resolve(__dirname, '../../dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') return next();
  return res.sendFile(path.join(distPath, 'index.html'));
});

// Rota de saúde para verificar se o servidor está funcionando
// Disponível em /health E /api/health (para proxy reverso)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString(), via: 'proxy' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  logger.error(`Erro: ${err.message}`);
  res.status(500).json({ error: 'Erro interno do servidor', message: err.message });
});

// Inicia o servidor
let subscriptionCheckerInterval;

app.listen(PORT, HOST, async () => {
  try {
    await connectDatabase();
    logger.info(`Servidor rodando em http://${HOST}:${PORT}`);
    logger.info('MongoDB conectado com sucesso');
    logger.info('WhatsApp desativado temporariamente; inicialização pulada');
    
    // Inicia verificação automática de assinaturas expiradas
    subscriptionCheckerInterval = startSubscriptionChecker();
  } catch (error) {
    logger.error('Erro ao conectar ao MongoDB:', error);
    // Não encerramos o processo aqui para evitar que o Railway retorne 502.
    // A aplicação continuará rodando e os erros de banco aparecerão nos logs e nas rotas.
  }
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM recebido. Encerrando servidor...');
  if (subscriptionCheckerInterval) {
    clearInterval(subscriptionCheckerInterval);
  }
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recebido. Encerrando servidor...');
  if (subscriptionCheckerInterval) {
    clearInterval(subscriptionCheckerInterval);
  }
  await closeDatabase();
  process.exit(0);
});

export default app;