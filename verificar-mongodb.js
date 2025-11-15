import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const MONGO_DB_NAME = process.env.MONGODB_DB_NAME || 'gameflix';

async function verificarMongoDB() {
  console.log('🔍 Verificando conexão com MongoDB...\n');
  console.log(`URL: ${MONGO_URL}`);
  console.log(`Database: ${MONGO_DB_NAME}\n`);
  
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB com sucesso!\n');
    
    const db = client.db(MONGO_DB_NAME);
    
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('⚠️  Nenhuma coleção encontrada no banco de dados.');
      console.log('   Execute a migração para importar dados do Supabase:');
      console.log('   npm run migrate:supabase-to-mongo\n');
    } else {
      console.log('📊 Coleções disponíveis:\n');
      
      for (const collectionInfo of collections) {
        const collection = db.collection(collectionInfo.name);
        const count = await collection.countDocuments();
        console.log(`   ✓ ${collectionInfo.name.padEnd(25)} ${count} documentos`);
      }
      
      console.log('\n✅ MongoDB está pronto para uso!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar no MongoDB:');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Possíveis soluções:');
      console.log('   1. Certifique-se que o MongoDB está instalado');
      console.log('   2. Inicie o serviço do MongoDB:');
      console.log('      - Windows: net start MongoDB');
      console.log('      - Docker: docker start mongodb');
      console.log('   3. Verifique se a porta 27017 está disponível\n');
    }
    
    process.exit(1);
  } finally {
    await client.close();
  }
}

verificarMongoDB();
