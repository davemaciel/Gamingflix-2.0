import { MongoClient } from 'mongodb';

async function checkUsers() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('gameflix');
    
    // Buscar usuários
    const users = await db.collection('profiles').find({}).project({ 
      email: 1, 
      username: 1, 
      is_founder: 1, 
      _id: 0 
    }).toArray();
    
    console.log('\n📋 USUÁRIOS NO BANCO DE DADOS:\n');
    users.forEach((u, i) => {
      console.log(`${i+1}. Email: ${u.email}`);
      console.log(`   Username: ${u.username || 'N/A'}`);
      console.log(`   Founder: ${u.is_founder || false}`);
      console.log('');
    });
    
    // Estatísticas
    const stats = {
      games: await db.collection('games').countDocuments(),
      profiles: await db.collection('profiles').countDocuments(),
      plans: await db.collection('subscription_plans').countDocuments(),
      subs: await db.collection('subscriptions').countDocuments()
    };
    
    console.log('📊 ESTATÍSTICAS:');
    console.log(`✅ Jogos: ${stats.games}`);
    console.log(`✅ Usuários: ${stats.profiles}`);
    console.log(`✅ Planos: ${stats.plans}`);
    console.log(`✅ Assinaturas: ${stats.subs}\n`);
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await client.close();
  }
}

checkUsers();
