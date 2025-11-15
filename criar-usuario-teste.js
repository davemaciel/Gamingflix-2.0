import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

async function criarUsuarioTeste() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('gameflix');
    
    const email = 'teste@gameflix.com';
    const password = 'teste123';
    const username = 'teste';
    
    // Verificar se usuário já existe
    const existente = await db.collection('profiles').findOne({ email });
    if (existente) {
      console.log(`\n⚠️  Usuário ${email} já existe!`);
      console.log('\n🔄 Atualizando senha para: teste123\n');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.collection('profiles').updateOne(
        { email },
        { $set: { password: hashedPassword, updated_at: new Date() } }
      );
      
      console.log('✅ Senha atualizada!');
    } else {
      // Criar novo usuário
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = crypto.randomUUID();
      
      const profile = {
        id: userId,
        email,
        password: hashedPassword,
        username,
        full_name: 'Usuário Teste',
        whatsapp: '',
        avatar_url: null,
        is_founder: false,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      await db.collection('profiles').insertOne(profile);
      await db.collection('user_roles').insertOne({
        id: crypto.randomUUID(),
        user_id: userId,
        role: 'client',
        created_at: new Date()
      });
      
      console.log('\n✅ Usuário criado com sucesso!\n');
    }
    
    console.log('📧 Email: teste@gameflix.com');
    console.log('🔑 Senha: teste123\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.close();
  }
}

criarUsuarioTeste();
