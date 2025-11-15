import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const resetPassword = async () => {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('gameflix');
    const profiles = db.collection('profiles');

    const email = 'davimaciel.ecom@gmail.com';
    const novaSenha = '123456';

    const user = await profiles.findOne({ email });
    
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      console.log('\nUsuários disponíveis:');
      const users = await profiles.find({}, { projection: { email: 1 } }).toArray();
      users.forEach(u => console.log('  -', u.email));
      return;
    }

    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    
    await profiles.updateOne(
      { email },
      { 
        $set: { 
          password: hashedPassword,
          updated_at: new Date()
        },
        $unset: {
          reset_token: "",
          reset_token_expiry: ""
        }
      }
    );

    console.log('✅ Senha resetada com sucesso!');
    console.log('📧 Email:', email);
    console.log('🔑 Nova senha:', novaSenha);
    console.log('\n⚠️  Faça login com essa senha e depois altere no perfil!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
};

resetPassword();
