import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'gameflix';

async function verificarPerfis() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    console.log('🔍 Conectando ao MongoDB Atlas...');
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Buscar serviço Netflix
    const servicesCollection = db.collection('streaming_services');
    const netflixService = await servicesCollection.findOne({ name: /netflix/i });
    
    if (!netflixService) {
      console.log('❌ Netflix não encontrado!');
      const allServices = await servicesCollection.find({}).toArray();
      console.log('\n📋 Serviços cadastrados:', allServices.length);
      allServices.forEach(s => console.log(`  - ${s.name} (${s.id})`));
      return;
    }
    
    console.log('\n✅ Netflix encontrado:');
    console.log(`   ID: ${netflixService.id}`);
    console.log(`   Nome: ${netflixService.name}`);
    
    // Buscar perfis da Netflix
    const profilesCollection = db.collection('streaming_profiles');
    const netflixProfiles = await profilesCollection
      .find({ service_id: netflixService.id })
      .toArray();
    
    console.log(`\n📊 Perfis Netflix: ${netflixProfiles.length}`);
    
    if (netflixProfiles.length === 0) {
      console.log('❌ Nenhum perfil cadastrado!');
      return;
    }
    
    netflixProfiles.forEach((p, i) => {
      console.log(`\n${i + 1}. Perfil ID: ${p.id}`);
      console.log(`   Nome: ${p.profile_name}`);
      console.log(`   Email: ${p.email}`);
      console.log(`   Status: ${p.status || 'SEM STATUS'}`);
      console.log(`   Assigned To: ${p.assigned_to || 'NINGUÉM'}`);
      console.log(`   PIN: ${p.pin || 'N/A'}`);
    });
    
    // Verificar usuário
    console.log('\n\n👤 Verificando usuário davimaciel.ecom@gmail.com...');
    const profilesUserCollection = db.collection('profiles');
    const user = await profilesUserCollection.findOne({ 
      email: 'davimaciel.ecom@gmail.com' 
    });
    
    if (user) {
      console.log(`✅ Usuário encontrado: ${user.id}`);
      
      // Verificar se tem perfil atribuído
      const userProfile = await profilesCollection.findOne({
        service_id: netflixService.id,
        assigned_to: user.id
      });
      
      if (userProfile) {
        console.log(`✅ Tem perfil atribuído: ${userProfile.profile_name}`);
      } else {
        console.log(`❌ NÃO tem perfil atribuído`);
      }
    } else {
      console.log('❌ Usuário não encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.close();
  }
}

verificarPerfis();
