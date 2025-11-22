import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URL;
const DB_NAME = process.env.MONGODB_DB_NAME;

async function verificarDisney() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    console.log('🔍 Conectando ao MongoDB Atlas...');
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Buscar serviço Disney+
    const service = await db.collection('streaming_services').findOne({ 
      name: /disney/i 
    });
    
    if (!service) {
      console.log('❌ Disney+ não encontrado!');
      const allServices = await db.collection('streaming_services').find({}).toArray();
      console.log('\n📋 Serviços cadastrados:');
      allServices.forEach(s => console.log(`  - ${s.name} (${s.id})`));
      return;
    }
    
    console.log(`✅ Disney+ encontrado: ${service.name} (${service.id})`);
    
    // Buscar perfis Disney+
    const profiles = await db.collection('streaming_profiles')
      .find({ service_id: service.id })
      .toArray();
    
    console.log(`\n📊 Perfis Disney+: ${profiles.length}`);
    
    if (profiles.length === 0) {
      console.log('❌ Nenhum perfil cadastrado!');
      console.log('\n💡 Você precisa adicionar perfis Disney+ no Admin');
      return;
    }
    
    const available = profiles.filter(p => p.status === 'available' || !p.assigned_to);
    const assigned = profiles.filter(p => p.status === 'assigned' || p.assigned_to);
    
    console.log(`   ✅ Disponíveis: ${available.length}`);
    console.log(`   🔒 Atribuídos: ${assigned.length}`);
    
    if (available.length > 0) {
      console.log('\n📝 Perfis disponíveis:');
      available.forEach((p, i) => {
        console.log(`\n   ${i + 1}. ${p.profile_name || 'Sem nome'}`);
        console.log(`      Email: ${p.email}`);
        console.log(`      Senha: ${p.password ? '********' : 'N/A'}`);
        console.log(`      PIN: ${p.pin || 'N/A'}`);
      });
    } else {
      console.log('\n⚠️ Nenhum perfil Disney+ disponível no estoque!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.close();
  }
}

verificarDisney();
