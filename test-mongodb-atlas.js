// Teste de conexão MongoDB Atlas
import { MongoClient } from 'mongodb';

const MONGODB_URL = 'mongodb+srv://gameflix:GamingFlix2025@ggflix.m5lplz.mongodb.net/gameflix?appName=ggflix';

async function testConnection() {
  console.log('🔄 Testando conexão com MongoDB Atlas...');
  console.log('URL:', MONGODB_URL.replace(/:[^:@]+@/, ':***@')); // Esconde senha
  
  try {
    const client = new MongoClient(MONGODB_URL);
    await client.connect();
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    const db = client.db('gameflix');
    const collections = await db.listCollections().toArray();
    
    console.log('📦 Database: gameflix');
    console.log('📂 Collections:', collections.length);
    
    if (collections.length > 0) {
      console.log('Collections encontradas:');
      collections.forEach(col => {
        console.log(`  - ${col.name}`);
      });
    } else {
      console.log('⚠️  Nenhuma collection ainda (normal em novo banco)');
    }
    
    await client.close();
    console.log('✅ Conexão fechada com sucesso!');
    console.log('\n🎉 MongoDB Atlas configurado corretamente!');
    
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    console.error('\n🔧 Verifique:');
    console.error('  1. Connection string está correta');
    console.error('  2. IP 0.0.0.0/0 está liberado no Network Access');
    console.error('  3. Usuário e senha estão corretos');
  }
}

testConnection();
