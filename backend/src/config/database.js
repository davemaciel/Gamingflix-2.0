import { MongoClient } from 'mongodb';
import { logger } from '../utils/logger.js';

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'gameflix';

let client = null;
let db = null;

export async function connectDatabase() {
  try {
    if (db) {
      return db;
    }

    logger.info(`Connecting to MongoDB at ${MONGODB_URL}...`);
    client = new MongoClient(MONGODB_URL);
    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    
    logger.info(`Connected to MongoDB database: ${MONGODB_DB_NAME}`);
    return db;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return db;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info('MongoDB connection closed');
  }
}

export const collections = {
  games: () => getDatabase().collection('games'),
  profiles: () => getDatabase().collection('profiles'),
  subscriptions: () => getDatabase().collection('subscriptions'),
  subscriptionPlans: () => getDatabase().collection('subscription_plans'),
  userGameSelections: () => getDatabase().collection('user_game_selections'),
  userRoles: () => getDatabase().collection('user_roles'),
};
