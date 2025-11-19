import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb+srv://gameflix:GamingFlix2025@ggflix.m5lpb1z.mongodb.net/gameflix');

try {
  await client.connect();
  console.log('🔗 Conectado ao MongoDB\n');
  
  const users = await client.db('gameflix').collection('profiles').find({}, {
    projection: { email: 1, full_name: 1, username: 1, _id: 0 }
  }).toArray();
  
  console.log(`📋 Total de usuários: ${users.length}\n`);
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. 📧 ${user.email}`);
    if (user.full_name) console.log(`   👤 ${user.full_name}`);
    if (user.username) console.log(`   🔖 @${user.username}`);
    console.log('');
  });
  
} catch (error) {
  console.error('❌ Erro:', error.message);
} finally {
  await client.close();
}
