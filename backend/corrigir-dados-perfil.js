import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URL;
const DB_NAME = process.env.MONGODB_DB_NAME;

async function corrigirDadosPerfil() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    console.log('🔍 Conectando ao MongoDB Atlas...');
    await client.connect();
    const db = client.db(DB_NAME);
    
    const profileId = '221bdf93-4689-4f37-975c-455e57f5180c';
    
    // Atualizar dados do perfil
    const result = await db.collection('streaming_profiles').updateOne(
      { id: profileId },
      {
        $set: {
          email: 'netflix@gamingflix.com',
          password: '********',  // Você deve preencher com a senha real
          profile_name: 'user1'
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Dados do perfil atualizados!');
      console.log('\n⚠️ ATENÇÃO: Você precisa editar este script e adicionar:');
      console.log('  - Email da conta Netflix');
      console.log('  - Senha da conta Netflix');
      console.log('  - Nome do perfil (user1, user2, etc)');
    } else {
      console.log('❌ Nenhuma alteração realizada');
    }
    
    // Mostrar perfil atualizado
    const profile = await db.collection('streaming_profiles').findOne({ id: profileId });
    console.log('\n📋 Perfil atualizado:');
    console.log(`   Email: ${profile.email}`);
    console.log(`   Senha: ${profile.password}`);
    console.log(`   Nome Perfil: ${profile.profile_name}`);
    console.log(`   PIN: ${profile.pin}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.close();
  }
}

corrigirDadosPerfil();
