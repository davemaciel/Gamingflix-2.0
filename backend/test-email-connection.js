import Imap from 'imap';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testando conexão IMAP...\n');

const emailConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  tls: process.env.EMAIL_TLS === 'true',
  tlsOptions: { rejectUnauthorized: false },
  authTimeout: 10000,
  debug: console.log // Ativa debug do IMAP
};

console.log('📧 Configuração:');
console.log(`   Host: ${emailConfig.host}`);
console.log(`   Port: ${emailConfig.port}`);
console.log(`   User: ${emailConfig.user}`);
console.log(`   TLS: ${emailConfig.tls}`);
console.log(`   Password: ${'*'.repeat(emailConfig.password.length)}\n`);

const imap = new Imap(emailConfig);

imap.once('ready', () => {
  console.log('✅ Conexão IMAP estabelecida com sucesso!');
  console.log('✅ As credenciais estão corretas!');
  imap.end();
});

imap.once('error', (err) => {
  console.error('❌ Erro de conexão IMAP:');
  console.error('   Mensagem:', err.message || 'VAZIO');
  console.error('   Código:', err.code || 'N/A');
  console.error('   Stack:', err.stack);
  console.error('\n🔍 Possíveis causas:');
  console.error('   1. Firewall bloqueando porta 993');
  console.error('   2. Credenciais inválidas');
  console.error('   3. Servidor IMAP fora do ar');
  console.error('   4. Host/porta incorretos');
});

imap.once('end', () => {
  console.log('📭 Conexão IMAP encerrada');
  process.exit(0);
});

setTimeout(() => {
  console.error('⏱️ TIMEOUT - Não conseguiu conectar em 15 segundos');
  process.exit(1);
}, 15000);

console.log('🔌 Tentando conectar...\n');
imap.connect();