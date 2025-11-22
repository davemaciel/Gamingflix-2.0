import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URL;
const DB_NAME = process.env.MONGODB_DB_NAME;

async function corrigirPerfisExistentes() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    console.log('🔍 Conectando ao MongoDB Atlas...');
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Buscar todos os perfis que têm account_id mas não têm email/password
    const perfisIncompletos = await db.collection('streaming_profiles')
      .find({
        account_id: { $exists: true },
        $or: [
          { email: { $exists: false } },
          { email: null },
          { email: undefined }
        ]
      })
      .toArray();
    
    console.log(`\n📊 Perfis incompletos encontrados: ${perfisIncompletos.length}`);
    
    if (perfisIncompletos.length === 0) {
      console.log('✅ Todos os perfis estão corretos!');
      return;
    }
    
    let corrigidos = 0;
    
    for (const perfil of perfisIncompletos) {
      // Buscar a conta correspondente
      const conta = await db.collection('streaming_accounts').findOne({
        id: perfil.account_id
      });
      
      if (!conta) {
        console.log(`⚠️ Conta não encontrada para perfil ${perfil.id}`);
        continue;
      }
      
      // Atualizar o perfil com os dados da conta
      const updateDoc = {
        $set: {
          email: conta.email,
          password: conta.password
        }
      };
      
      // Se o perfil tem 'name' ao invés de 'profile_name', corrige também
      if (perfil.name && !perfil.profile_name) {
        updateDoc.$set.profile_name = perfil.name;
        updateDoc.$unset = { name: "" }; // Remove o campo 'name' errado
      }
      
      await db.collection('streaming_profiles').updateOne(
        { id: perfil.id },
        updateDoc
      );
      
      console.log(`✅ Perfil ${perfil.id} corrigido`);
      console.log(`   Email: ${conta.email}`);
      console.log(`   Nome: ${updateDoc.$set.profile_name || perfil.profile_name || 'N/A'}`);
      console.log(`   PIN: ${perfil.pin}`);
      
      corrigidos++;
    }
    
    console.log(`\n🎉 Total de perfis corrigidos: ${corrigidos}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.close();
  }
}

corrigirPerfisExistentes();
