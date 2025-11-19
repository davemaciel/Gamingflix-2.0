import { MongoClient } from 'mongodb';
import { logger } from '../utils/logger.js';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'gameflix';

let client = null;
let db = null;

// Conectar ao MongoDB
export async function connectDB() {
  try {
    if (client && db) {
      logger.info('MongoDB já está conectado');
      return db;
    }

    logger.info('📦 Conectando ao MongoDB...');
    
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db(DB_NAME);
    
    logger.info('✅ MongoDB conectado com sucesso');
    
    // Criar índices
    await createIndexes();
    
    return db;
  } catch (error) {
    logger.error('❌ Erro ao conectar MongoDB:', error);
    throw error;
  }
}

// Criar índices para performance
async function createIndexes() {
  try {
    // Índices para conversas
    await db.collection('zapflix_conversations').createIndexes([
      { key: { clientPhone: 1 }, unique: true },
      { key: { status: 1 } },
      { key: { assignedTo: 1 } },
      { key: { lastMessageAt: -1 } }
    ]);

    // Índices para mensagens
    await db.collection('zapflix_messages').createIndexes([
      { key: { conversationId: 1, timestamp: -1 } },
      { key: { status: 1 } }
    ]);

    logger.info('✅ Índices criados com sucesso');
  } catch (error) {
    logger.warn('⚠️ Erro ao criar índices (podem já existir):', error.message);
  }
}

// Obter collections
export const collections = {
  conversations: () => db.collection('zapflix_conversations'),
  messages: () => db.collection('zapflix_messages'),
  quickReplies: () => db.collection('zapflix_quick_replies'),
  // Collections do GamingFlix (para integração)
  profiles: () => db.collection('profiles'),
  userRoles: () => db.collection('userRoles')
};

// Desconectar
export async function disconnectDB() {
  if (client) {
    await client.close();
    logger.info('MongoDB desconectado');
  }
}

export default { connectDB, collections, disconnectDB };
