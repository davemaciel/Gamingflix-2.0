import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URL;
const DB_NAME = process.env.MONGODB_DB_NAME;

async function atribuirPerfilManual() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    console.log('🔍 Conectando ao MongoDB Atlas...');
    await client.connect();
    const db = client.db(DB_NAME);
    
    const email = 'davimaciel.ecom@gmail.com';
    const serviceName = 'Netflix Premium';
    
    // Buscar usuário
    const user = await db.collection('profiles').findOne({ email });
    if (!user) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    console.log(`✅ Usuário encontrado: ${user.id}`);
    
    // Buscar serviço
    const service = await db.collection('streaming_services').findOne({ 
      name: serviceName 
    });
    if (!service) {
      console.log('❌ Serviço Netflix não encontrado!');
      return;
    }
    console.log(`✅ Serviço encontrado: ${service.id}`);
    
    // Verificar se já tem perfil
    const existing = await db.collection('streaming_profiles').findOne({
      service_id: service.id,
      assigned_to: user.id
    });
    
    if (existing) {
      console.log('⚠️ Usuário já tem perfil atribuído!');
      console.log(`   Perfil: ${existing.profile_name || 'Sem nome'}`);
      console.log(`   PIN: ${existing.pin}`);
      return;
    }
    
    // Buscar perfil disponível
    const availableProfile = await db.collection('streaming_profiles').findOne({
      service_id: service.id,
      status: 'available'
    });
    
    if (!availableProfile) {
      console.log('❌ Nenhum perfil disponível!');
      return;
    }
    
    console.log(`\n📝 Perfil disponível encontrado:`);
    console.log(`   ID: ${availableProfile.id}`);
    console.log(`   PIN: ${availableProfile.pin}`);
    
    // Atribuir perfil
    const result = await db.collection('streaming_profiles').updateOne(
      { id: availableProfile.id },
      {
        $set: {
          status: 'assigned',
          assigned_to: user.id,
          assigned_at: new Date()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('\n✅ PERFIL ATRIBUÍDO COM SUCESSO!');
      console.log(`   Usuário: ${email}`);
      console.log(`   Serviço: ${serviceName}`);
      console.log(`   Perfil ID: ${availableProfile.id}`);
      console.log(`   PIN: ${availableProfile.pin}`);
      console.log('\n💡 Acesse a plataforma e vá em Streaming → Netflix');
      console.log('   Agora você deve ver o perfil atribuído!');
    } else {
      console.log('❌ Falha ao atribuir perfil');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.close();
  }
}

atribuirPerfilManual();
