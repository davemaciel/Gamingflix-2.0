// Script de Migração: MongoDB Local → MongoDB Atlas
import { MongoClient } from 'mongodb';

// CONFIGURAÇÕES
const LOCAL_URL = 'mongodb://localhost:27017';
const ATLAS_URL = 'mongodb+srv://gameflix:GamingFlix2025@ggflix.m5lpb1z.mongodb.net/?appName=ggflix';
const DB_NAME = 'gameflix';

// Collections para migrar
const COLLECTIONS = [
  'games',
  'profiles', 
  'subscriptions',
  'subscription_plans',
  'user_game_selections',
  'user_roles'
];

async function migrateDatabase() {
  console.log('🚀 Iniciando migração de dados...\n');
  
  let localClient, atlasClient;
  
  try {
    // Conectar ao MongoDB Local
    console.log('📦 Conectando ao MongoDB Local...');
    localClient = new MongoClient(LOCAL_URL);
    await localClient.connect();
    const localDb = localClient.db(DB_NAME);
    console.log('✅ Conectado ao MongoDB Local\n');
    
    // Conectar ao MongoDB Atlas
    console.log('☁️  Conectando ao MongoDB Atlas...');
    atlasClient = new MongoClient(ATLAS_URL);
    await atlasClient.connect();
    const atlasDb = atlasClient.db(DB_NAME);
    console.log('✅ Conectado ao MongoDB Atlas\n');
    
    // Listar collections existentes no local
    const localCollections = await localDb.listCollections().toArray();
    const existingCollections = localCollections.map(c => c.name);
    
    console.log(`📂 Collections encontradas no local: ${existingCollections.join(', ')}\n`);
    
    // Migrar cada collection
    for (const collectionName of COLLECTIONS) {
      if (!existingCollections.includes(collectionName)) {
        console.log(`⏭️  Collection '${collectionName}' não existe localmente, pulando...\n`);
        continue;
      }
      
      console.log(`📋 Migrando collection: ${collectionName}`);
      
      // Buscar todos os documentos da collection local
      const localCollection = localDb.collection(collectionName);
      const documents = await localCollection.find({}).toArray();
      
      console.log(`   📊 ${documents.length} documentos encontrados`);
      
      if (documents.length === 0) {
        console.log(`   ⏭️  Collection vazia, pulando...\n`);
        continue;
      }
      
      // Inserir no Atlas
      const atlasCollection = atlasDb.collection(collectionName);
      
      // Limpar collection no Atlas antes (opcional)
      const existingCount = await atlasCollection.countDocuments();
      if (existingCount > 0) {
        console.log(`   ⚠️  Collection já tem ${existingCount} documentos no Atlas`);
        console.log(`   🗑️  Limpando collection...`);
        await atlasCollection.deleteMany({});
      }
      
      // Inserir documentos
      const result = await atlasCollection.insertMany(documents);
      console.log(`   ✅ ${result.insertedCount} documentos migrados com sucesso!\n`);
    }
    
    console.log('🎉 Migração concluída com sucesso!');
    console.log('\n📊 RESUMO:');
    
    // Mostrar contagem final
    for (const collectionName of COLLECTIONS) {
      if (existingCollections.includes(collectionName)) {
        const atlasCollection = atlasDb.collection(collectionName);
        const count = await atlasCollection.countDocuments();
        console.log(`   ${collectionName}: ${count} documentos`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error.message);
    console.error('\n🔧 Verifique:');
    console.error('   1. MongoDB local está rodando (mongodb://localhost:27017)');
    console.error('   2. Connection string do Atlas está correta');
    console.error('   3. Você tem acesso à internet');
    console.error('   4. IP está liberado no MongoDB Atlas (0.0.0.0/0)');
  } finally {
    // Fechar conexões
    if (localClient) await localClient.close();
    if (atlasClient) await atlasClient.close();
    console.log('\n👋 Conexões fechadas');
  }
}

// Executar migração
migrateDatabase();
