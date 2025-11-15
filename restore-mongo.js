/**
 * Script para restaurar backup completo do MongoDB
 * Restaura todas as coleções dos arquivos JSON
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

async function restoreMongoDB() {
  // Listar backups disponíveis
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup-'))
    .sort()
    .reverse(); // Mais recente primeiro
  
  if (backups.length === 0) {
    console.error('❌ Nenhum backup encontrado!');
    process.exit(1);
  }
  
  console.log('📦 Backups disponíveis:');
  backups.forEach((backup, index) => {
    console.log(`  ${index + 1}. ${backup}`);
  });
  
  // Usar o backup mais recente (ou você pode pedir ao usuário para escolher)
  const selectedBackup = backups[0];
  const backupFolder = path.join(BACKUP_DIR, selectedBackup);
  
  console.log(`\n🔄 Usando backup: ${selectedBackup}\n`);
  
  // Ler metadata
  const metadataPath = path.join(backupFolder, 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    console.log('📊 Informações do backup:');
    console.log(`   Data: ${new Date(metadata.timestamp).toLocaleString()}`);
    console.log(`   Coleções: ${metadata.totalCollections}`);
    console.log(`   Documentos: ${metadata.totalDocuments}\n`);
  }
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await client.connect();
    console.log('✅ Conectado ao MongoDB!');
    
    const db = client.db(DB_NAME);
    
    let totalRestored = 0;
    let totalCollections = 0;
    
    // Listar arquivos JSON na pasta de backup
    const jsonFiles = fs.readdirSync(backupFolder)
      .filter(f => f.endsWith('.json') && f !== 'metadata.json');
    
    for (const file of jsonFiles) {
      const collectionName = file.replace('.json', '');
      const filePath = path.join(backupFolder, file);
      
      try {
        const documents = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        if (documents.length > 0) {
          const collection = db.collection(collectionName);
          
          // OPÇÃO 1: Limpar e inserir (substitui tudo)
          await collection.deleteMany({});
          await collection.insertMany(documents);
          
          console.log(`✅ ${collectionName}: ${documents.length} documentos restaurados`);
          totalRestored += documents.length;
          totalCollections++;
        }
      } catch (error) {
        console.error(`❌ Erro ao restaurar ${collectionName}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ RESTAURAÇÃO COMPLETA!');
    console.log('='.repeat(50));
    console.log(`📊 Total: ${totalCollections} coleções, ${totalRestored} documentos`);
    console.log(`🗄️  Banco: ${DB_NAME}`);
    console.log('\n💡 Agora você pode iniciar o backend normalmente!');
    
  } catch (error) {
    console.error('❌ Erro na restauração:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Executar restore
restoreMongoDB();
