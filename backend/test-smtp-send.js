import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testando envio SMTP...\n');

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

console.log('📧 Configuração SMTP:');
console.log(`   Host: ${smtpConfig.host}`);
console.log(`   Port: ${smtpConfig.port}`);
console.log(`   Secure: ${smtpConfig.secure}`);
console.log(`   User: ${smtpConfig.auth.user}`);
console.log(`   Pass: ${'*'.repeat(smtpConfig.auth.pass.length)}\n`);

if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
  console.error('❌ SMTP_USER ou SMTP_PASS não configurados no .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport(smtpConfig);

console.log('🔌 Testando conexão SMTP...\n');

// Teste de conexão
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erro ao conectar no servidor SMTP:');
    console.error('   Mensagem:', error.message);
    console.error('   Código:', error.code || 'N/A');
    console.error('\n🔍 Possíveis causas:');
    console.error('   1. Porta bloqueada pelo firewall');
    console.error('   2. Credenciais SMTP inválidas');
    console.error('   3. Servidor SMTP offline');
    console.error('   4. SSL/TLS configurado incorretamente');
    process.exit(1);
  } else {
    console.log('✅ Conexão SMTP estabelecida com sucesso!');
    console.log('✅ Servidor pronto para enviar emails\n');
    
    // Enviar email de teste
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Envia para o próprio email
      subject: '🧪 Teste de Email - GamingFlix',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">🎮 GamingFlix</h1>
            <h2>✅ Email de Teste</h2>
            <p>Este é um email de teste para verificar se o sistema SMTP está funcionando corretamente.</p>
            <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <p><strong>Servidor SMTP:</strong> ${smtpConfig.host}:${smtpConfig.port}</p>
            <p><strong>Status:</strong> <span style="color: green;">✅ Funcionando!</span></p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px;">
              Se você recebeu este email, significa que o sistema de envio está configurado corretamente.
            </p>
          </div>
        </div>
      `
    };
    
    console.log('📤 Enviando email de teste...');
    console.log(`   Para: ${mailOptions.to}\n`);
    
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('❌ Erro ao enviar email:');
        console.error('   Mensagem:', err.message);
        console.error('   Código:', err.code || 'N/A');
        process.exit(1);
      } else {
        console.log('✅ Email enviado com sucesso!');
        console.log('   MessageID:', info.messageId);
        console.log('   Response:', info.response);
        console.log('\n✅ SMTP está funcionando perfeitamente!');
        console.log('   Verifique sua caixa de entrada em:', process.env.SMTP_USER);
        process.exit(0);
      }
    });
  }
});
