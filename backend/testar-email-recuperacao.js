import dotenv from 'dotenv';
import { sendPasswordResetEmail } from './src/config/email.js';

dotenv.config();

console.log('\n🔑 TESTANDO EMAIL DE RECUPERAÇÃO DE SENHA (NOVO DESIGN)\n');

// Pegar email da linha de comando
const email = process.argv[2];

if (!email) {
  console.error('❌ Por favor, forneça o email:');
  console.error('   Uso: node testar-email-recuperacao.js EMAIL\n');
  console.error('   Exemplo:');
  console.error('   node testar-email-recuperacao.js usuario@email.com\n');
  process.exit(1);
}

// Token fictício para teste
const testToken = 'abc123def456ghi789jkl012mno345pqr678';

console.log('📧 Configuração do Email:');
console.log(`   Para: ${email}`);
console.log(`   Nome: Usuário Teste`);
console.log(`   Token: ${testToken.substring(0, 20)}...`);
console.log(`   Link: ${process.env.FRONTEND_URL}/reset-password?token=${testToken.substring(0, 10)}...`);
console.log('\n✨ Novidades do Design:');
console.log('   ✅ Header laranja moderno');
console.log('   ✅ Saudação personalizada');
console.log('   ✅ Box de atenção (expira em 1h)');
console.log('   ✅ Botão grande e chamativo');
console.log('   ✅ Link alternativo copiável');
console.log('   ✅ Alerta de segurança');
console.log('   ✅ Dicas de senha forte');

console.log('\n📤 Enviando email...\n');

// Enviar email
sendPasswordResetEmail(
  email,
  testToken,
  'Usuário Teste'
).then(success => {
  if (success) {
    console.log('✅ Email de recuperação enviado com sucesso!');
    console.log(`📧 Verifique: ${email}`);
    console.log('⚠️  Não esqueça de checar o SPAM!\n');
    console.log('🎨 Você verá:');
    console.log('   - Header laranja com gradiente');
    console.log('   - "Olá, Usuário Teste! 👋"');
    console.log('   - Box amarelo com alerta de 1 hora');
    console.log('   - Botão laranja "🔑 Redefinir Minha Senha"');
    console.log('   - Box cinza com link copiável');
    console.log('   - Box vermelho "⚠️ Não foi você?"');
    console.log('   - Lista de dicas de segurança\n');
  } else {
    console.error('❌ Falha ao enviar email');
    console.error('   Verifique as configurações SMTP no .env\n');
    process.exit(1);
  }
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});
