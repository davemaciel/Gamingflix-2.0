import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emailFilePath = path.join(__dirname, '../src/config/email.js');
let content = fs.readFileSync(emailFilePath, 'utf8');

console.log('🔧 Aplicando patch de padronização de emails...\n');

// 1. Adicionar constante da logo e helper functions após as importações
const headerHelpers = `
// Logo e branding
const LOGO_URL = process.env.LOGO_URL || 'https://ultimate.gamingflix.space/assets/logo.png';

// Template de header padronizado com logo
const createEmailHeader = (subtitle, bgGradient) => \`
  <div style="background: \${bgGradient}; padding: 40px 32px; text-align: center; border-bottom: 3px solid rgba(0,0,0,0.2);">
    <img src="\${LOGO_URL}" alt="GamingFlix" style="height: 60px; margin-bottom: 12px;" />
    <p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0.95; font-weight: 600;">\${subtitle}</p>
  </div>
\`;

// Template de footer padronizado com logo
const createEmailFooter = () => \`
  <div style="padding: 24px 32px; text-align: center; background-color: #0a0a0a; color: #666; font-size: 13px; border-top: 1px solid #262626;">
    <img src="\${LOGO_URL}" alt="GamingFlix" style="height: 40px; margin-bottom: 12px; opacity: 0.8;" />
    <p style="margin: 12px 0 0 0; font-size: 12px; color: #555;">Este é um email automático. Por favor, não responda.</p>
  </div>
\`;
`;

// Encontrar posição após as importações
const insertAfter = 'let resendClient = null;';
if (content.includes(insertAfter)) {
  content = content.replace(insertAfter, insertAfter + '\n' + headerHelpers);
  console.log('✅ Helper functions adicionadas');
} else {
  console.log('⚠️  Não encontrou posição para helpers');
}

// 2. Atualizar header do email de recuperação de senha
content = content.replace(
  /<h1 style="color: white; margin: 0; font-size: 32px;">🔑 GamingFlix<\/h1>\s*<p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0\.95;">Recuperação de Senha<\/p>/,
  '${createEmailHeader(\'🔑 Recuperação de Senha\', \'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)\')}'
);

console.log('✅ Email de recuperação de senha atualizado');

// 3. Atualizar footer do email de recuperação de senha
content = content.replace(
  /<p style="margin: 0; color: #666;">🎮 <strong style="color: #ef4444;">GamingFlix<\/strong> - Seu Catálogo de Jogos<\/p>\s*<p style="margin: 12px 0 0 0; font-size: 12px; color: #555;">Este é um email automático de segurança\. Por favor, não responda\.<\/p>/,
  '${createEmailFooter()}'
);

console.log('✅ Footer do email de recuperação atualizado');

// Salvar arquivo
fs.writeFileSync(emailFilePath, content, 'utf8');

console.log('\n🎉 Patch aplicado com sucesso!');
console.log('📝 Backup salvo em: email.js.backup');
console.log('\n🔥 Reinicie o servidor para ver as mudanças!');
