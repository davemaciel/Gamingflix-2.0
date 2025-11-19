import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/database.js';
import { logger } from './utils/logger.js';
import evolutionService from './services/evolution.service.js';

const app = express();
const httpServer = createServer(app);

// Configuração do Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*'
}));
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ZapFlix Backend',
    timestamp: new Date().toISOString()
  });
});

// Informações da instância Evolution
app.get('/api/evolution/status', async (req, res) => {
  try {
    const status = await evolutionService.getInstanceInfo();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// QR Code para conectar WhatsApp
app.get('/api/evolution/qrcode', async (req, res) => {
  try {
    const qrcode = await evolutionService.getQRCode();
    res.json(qrcode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io - Gerenciamento de conexões
io.on('connection', (socket) => {
  logger.info(`🔌 Cliente conectado: ${socket.id}`);

  // Atendente entra em uma sala (conversa)
  socket.on('join_room', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    logger.info(`👤 Socket ${socket.id} entrou na conversa ${conversationId}`);
  });

  // Atendente sai de uma sala
  socket.on('leave_room', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    logger.info(`👋 Socket ${socket.id} saiu da conversa ${conversationId}`);
  });

  // Atendente está digitando
  socket.on('typing', (conversationId) => {
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      conversationId,
      userId: socket.userId
    });
  });

  socket.on('disconnect', () => {
    logger.info(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

// Função auxiliar para emitir eventos
export function emitSocketEvent(event, data) {
  io.emit(event, data);
}

export function emitToConversation(conversationId, event, data) {
  io.to(`conversation_${conversationId}`).emit(event, data);
}

// Inicializar servidor
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Conectar ao banco
    await connectDB();

    // Iniciar servidor
    httpServer.listen(PORT, () => {
      logger.info(`
╔════════════════════════════════════════════╗
║                                            ║
║        🚀 ZapFlix Backend                  ║
║                                            ║
║   Port: ${PORT}                          ║
║   Environment: ${process.env.NODE_ENV}    ║
║   Evolution API: ${process.env.EVOLUTION_API_URL} ║
║                                            ║
╚════════════════════════════════════════════╝
      `);
    });

    // Log de status da Evolution API
    try {
      const status = await evolutionService.getInstanceInfo();
      logger.info('📱 Evolution API Status:', status.state);
    } catch (error) {
      logger.warn('⚠️ Evolution API não está acessível');
    }
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Iniciar
startServer();

export { io, app };
