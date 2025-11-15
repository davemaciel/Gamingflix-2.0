import { MongoClient } from 'mongodb';

const verificarUsuario = async () => {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('gameflix');

    const email = 'davimaciel.ecom@gmail.com';
    
    console.log('🔍 Buscando dados do usuário:', email);
    console.log('='.repeat(60));
    
    const profile = await db.collection('profiles').findOne({ email });
    console.log('\n📋 PERFIL:');
    console.log(JSON.stringify(profile, null, 2));
    
    if (profile) {
      const role = await db.collection('user_roles').findOne({ user_id: profile.id });
      console.log('\n👤 ROLE:');
      console.log(JSON.stringify(role, null, 2));
      
      const subscription = await db.collection('subscriptions').findOne({ user_id: profile.id });
      console.log('\n💳 ASSINATURA:');
      console.log(JSON.stringify(subscription, null, 2));
      
      if (subscription) {
        const plan = await db.collection('subscription_plans').findOne({ id: subscription.plan_id });
        console.log('\n📦 PLANO:');
        console.log(JSON.stringify(plan, null, 2));
      }
      
      const gameSelections = await db.collection('user_game_selections').find({ user_id: profile.id }).toArray();
      console.log('\n🎮 JOGOS SELECIONADOS:', gameSelections.length);
      if (gameSelections.length > 0) {
        console.log(JSON.stringify(gameSelections, null, 2));
      }
    }
    
    console.log('\n📊 TOTAL DE JOGOS NO BANCO:');
    const totalGames = await db.collection('games').countDocuments();
    console.log('  -', totalGames, 'jogos cadastrados');
    
    console.log('\n📊 PLANOS DISPONÍVEIS:');
    const plans = await db.collection('subscription_plans').find({}).toArray();
    plans.forEach(p => console.log(`  - ${p.name} (${p.slug}): max ${p.max_games} jogos`));

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
};

verificarUsuario();
