/**
 * Script para verificar bancos de dados e coleções no MongoDB
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017';

async function verificarMongoDB() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await client.connect();
    console.log('✅ Conectado ao MongoDB!\n');
    
    // Listar todos os bancos de dados
    const adminDb = client.db('admin');
    const { databases } = await adminDb.admin().listDatabases();
    
    console.log('📊 BANCOS DE DADOS ENCONTRADOS:\n');
    console.log('='.repeat(50));
    
    for (const db of databases) {
      console.log(`\n🗄️  Banco: ${db.name}`);
      console.log(`   Tamanho: ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB`);
      
      if (db.name !== 'admin' && db.name !== 'local' && db.name !== 'config') {
        // Listar coleções do banco
        const database = client.db(db.name);
        const collections = await database.listCollections().toArray();
        
        if (collections.length > 0) {
          console.log(`   Coleções:`);
          for (const col of collections) {
            const count = await database.collection(col.name).countDocuments();
            console.log(`     - ${col.name}: ${count} documentos`);
          }
        } else {
          console.log(`   ⚠️  Sem coleções`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(50));
    
    // Verificar banco configurado no .env
    const envDbName = process.env.MONGODB_DB_NAME || process.env.MONGODB_DATABASE || 'gameflix';
    console.log(`\n🔍 BANCO CONFIGURADO NO .ENV: "${envDbName}"`);
    
    const dbExists = databases.find(d => d.name === envDbName);
    if (dbExists) {
      console.log(`✅ Banco "${envDbName}" existe!`);
      const database = client.db(envDbName);
      const collections = await database.listCollections().toArray();
      
      if (collections.length > 0) {
        console.log(`\n📦 Coleções em "${envDbName}":`);
        for (const col of collections) {
          const count = await database.collection(col.name).countDocuments();
          console.log(`  - ${col.name}: ${count} documentos`);
        }
      } else {
        console.log(`⚠️  Banco "${envDbName}" existe mas está vazio (sem coleções)`);
      }
    } else {
      console.log(`❌ Banco "${envDbName}" NÃO existe!`);
      console.log(`💡 Será criado automaticamente quando o backend inserir dados`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.close();
  }
}

verificarMongoDB();
