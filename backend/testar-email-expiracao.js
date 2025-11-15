import dotenv from 'dotenv';
import { sendSubscriptionExpiringEmail } from './src/config/email.js';

dotenv.config();

console.log('\n⏰ TESTANDO EMAIL DE EXPIRAÇÃO DE PLANO\n');

// Pegar dados da linha de comando
const email = process.argv[2];
const daysRemaining = parseInt(process.argv[3]) || 3;

if (!email) {
  console.error('❌ Por favor, forneça o email:');
  console.error('   Uso: node testar-email-expiracao.js EMAIL [DIAS]\n');
  console.error('   Exemplos:');
  console.error('   node testar-email-expiracao.js usuario@email.com 7');
  console.error('   node testar-email-expiracao.js usuario@email.com 3');
  console.error('   node testar-email-expiracao.js usuario@email.com 1\n');
  process.exit(1);
}

// Data de expiração simulada
const expiryDate = new Date();
expiryDate.setDate(expiryDate.getDate() + daysRemaining);

console.log('📧 Configuração do Email:');
console.log(`   Para: ${email}`);
console.log(`   Nome: Usuário Teste`);
console.log(`   Plano: Ultimate Founders`);
console.log(`   Dias Restantes: ${daysRemaining}`);
console.log(`   Expira em: ${expiryDate.toLocaleString('pt-BR')}`);

if (daysRemaining <= 3) {
  console.log(`   ⚠️  Urgência: ALTA (vermelho)`);
} else {
  console.log(`   ⚠️  Urgência: Média (laranja)`);
}

console.log('\n📤 Enviando email...\n');

// Enviar email
sendSubscriptionExpiringEmail(
  email,
  'Usuário Teste',
  'Ultimate Founders',
  daysRemaining,
  expiryDate
).then(success => {
  if (success) {
    console.log('✅ Email enviado com sucesso!');
    console.log(`📧 Verifique: ${email}`);
    console.log('⚠️  Não esqueça de checar o SPAM!\n');
    
    console.log('💡 Dica: Teste diferentes urgências:');
    console.log(`   - 7 dias: node testar-email-expiracao.js ${email} 7`);
    console.log(`   - 3 dias: node testar-email-expiracao.js ${email} 3 (vermelho)`);
    console.log(`   - 1 dia:  node testar-email-expiracao.js ${email} 1 (vermelho)\n`);
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
