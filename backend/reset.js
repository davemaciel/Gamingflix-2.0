import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb+srv://gameflix:GamingFlix2025@ggflix.m5lpb1z.mongodb.net/gameflix');

try {
  await client.connect();
  console.log('🔗 Conectado ao MongoDB');
  
  const hash = await bcrypt.hash('senha123', 10);
  
  const result = await client.db('gameflix').collection('profiles').updateOne(
    { email: 'otavioferreira2019@gmail.com' },
    { $set: { password: hash } }
  );
  
  if (result.modifiedCount > 0) {
    console.log('✅ Senha alterada com sucesso!');
    console.log('📧 Email: otavioferreira2019@gmail.com');
    console.log('🔑 Nova senha: senha123');
  } else {
    console.log('⚠️ Usuário não encontrado ou senha já era essa');
  }
} catch (error) {
  console.error('❌ Erro:', error.message);
} finally {
  await client.close();
}
