import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { sendWelcomeEmail } from './src/config/email.js';

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.log('\n📧 USO: node reenviar-boasvindas.js SEU_EMAIL\n');
  console.log('Exemplo: node reenviar-boasvindas.js teste@email.com\n');
  process.exit(1);
}

const client = new MongoClient('mongodb://localhost:27017');

async function reenviar() {
  try {
    await client.connect();
    const db = client.db('gameflix');
    
    const user = await db.collection('profiles').findOne({ email });
    
    if (!user) {
      console.log(`\n❌ Email não encontrado: ${email}\n`);
      process.exit(1);
    }
    
    console.log(`\n✅ Usuário encontrado: ${user.full_name || user.username || user.email}`);
    console.log(`📤 Enviando email de boas-vindas...\n`);
    
    await sendWelcomeEmail(user.email, user.full_name);
    
    console.log('✅ Email enviado!');
    console.log(`📧 Verifique: ${email}\n`);
    console.log('⚠️  Confira também a pasta de SPAM!\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

reenviar();
