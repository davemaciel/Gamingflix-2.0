/**
 * Script para fazer backup completo do MongoDB
 * Salva todas as coleções em arquivos JSON
 */

import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || process.env.MONGODB_DATABASE || 'gameflix';
const BACKUP_DIR = path.join(__dirname, 'mongodb-backup');

// Coleções para fazer backup (baseado no banco real)
const COLLECTIONS = [
  'profiles',           // Usuários cadastrados
  'games',              // Catálogo de jogos
  'subscriptions',      // Assinaturas ativas
  'subscription_plans', // Planos disponíveis
  'user_roles'          // Funções de usuário
];

async function backupMongoDB() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await client.connect();
    console.log('✅ Conectado ao MongoDB!');
    
    const db = client.db(DB_NAME);
    
    // Criar pasta de backup se não existir
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    // Data/hora do backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFolder = path.join(BACKUP_DIR, `backup-${timestamp}`);
    fs.mkdirSync(backupFolder, { recursive: true });
    
    console.log(`\n📁 Pasta de backup: ${backupFolder}\n`);
    
    let totalDocuments = 0;
    let totalCollections = 0;
    
    // Backup de cada coleção
    for (const collectionName of COLLECTIONS) {
      try {
        const collection = db.collection(collectionName);
        const documents = await collection.find({}).toArray();
        
        if (documents.length > 0) {
          const filePath = path.join(backupFolder, `${collectionName}.json`);
          fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
          
          console.log(`✅ ${collectionName}: ${documents.length} documentos salvos`);
          totalDocuments += documents.length;
          totalCollections++;
        } else {
          console.log(`⚠️  ${collectionName}: Vazia (sem backup)`);
        }
      } catch (error) {
        console.log(`⚠️  ${collectionName}: Não existe (pulando)`);
      }
    }
    
    // Criar arquivo de metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      database: DB_NAME,
      totalCollections,
      totalDocuments,
      collections: COLLECTIONS.filter(c => {
        return fs.existsSync(path.join(backupFolder, `${c}.json`));
      })
    };
    
    fs.writeFileSync(
      path.join(backupFolder, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ BACKUP COMPLETO!');
    console.log('='.repeat(50));
    console.log(`📊 Total: ${totalCollections} coleções, ${totalDocuments} documentos`);
    console.log(`📁 Local: ${backupFolder}`);
    console.log('\n💡 Dica: Commite esta pasta no Git para não perder dados!');
    console.log('   git add mongodb-backup/');
    console.log('   git commit -m "Backup MongoDB"');
    console.log('   git push');
    
  } catch (error) {
    console.error('❌ Erro no backup:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Executar backup
backupMongoDB();
