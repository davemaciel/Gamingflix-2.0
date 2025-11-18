import pkg from 'nodemailer';
import { Resend } from 'resend';
import { logger } from '../utils/logger.js';

// Compatibilidade com módulos ESM
const nodemailer = pkg.default || pkg;

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM;
let resendClient = null;

const getFromAddress = () => RESEND_FROM || process.env.SMTP_FROM || process.env.SMTP_USER;

const getResendClient = () => {
  if (!RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
};

export const createEmailTransporter = () => {
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };

const sendViaResend = async (mailOptions) => {
  const client = getResendClient();
  if (!client) return false;

  const from = mailOptions.from || getFromAddress();
  if (!from) {
    logger.error('Resend FROM address not configured.');
    return false;
  }

  try {
    await client.emails.send({
      from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html
    });
    return true;
  } catch (error) {
    logger.error('Error sending email via Resend:', error);
    return false;
  }
};

const sendViaSMTP = async (mailOptions) => {
  const transporter = createEmailTransporter();
  if (!transporter) return false;

  const from = mailOptions.from || getFromAddress();
  if (!from) {
    logger.error('SMTP FROM address not configured.');
    return false;
  }

  try {
    await transporter.sendMail({ ...mailOptions, from });
    return true;
  } catch (error) {
    logger.error('Error sending email via SMTP:', error);
    return false;
  }
};

const sendEmail = async (mailOptions) => {
  if (getResendClient()) {
    const success = await sendViaResend(mailOptions);
    if (success) {
      return true;
    }
    logger.warn('Falling back to SMTP after Resend failure.');
  }

  return await sendViaSMTP(mailOptions);
};

  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    logger.warn('SMTP credentials not configured. Password reset emails will not be sent.');
    return null;
  }

  try {
    return nodemailer.createTransport(emailConfig);
  } catch (error) {
    logger.error('Error creating email transporter:', error);
    return null;
  }
};

export const sendPasswordResetEmail = async (email, resetToken, fullName = null) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: '🔑 Recuperação de Senha - GamingFlix',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🔑 GamingFlix</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Recuperação de Senha</p>
        </div>
        
        <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #333; margin-top: 0;">Olá${fullName ? `, ${fullName}` : ''}! 👋</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Recebemos uma solicitação para <strong>redefinir a senha</strong> da sua conta GamingFlix.
          </p>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>⏰ Atenção:</strong> Este link expira em <strong>1 hora</strong> por segurança.
            </p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Para criar uma nova senha, clique no botão abaixo:
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 16px 40px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
              🔑 Redefinir Minha Senha
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <p style="color: #666; margin: 0 0 8px 0; font-size: 14px;">
              <strong>Ou copie e cole este link no navegador:</strong>
            </p>
            <p style="color: #6366f1; margin: 0; font-size: 12px; word-break: break-all;">
              ${resetUrl}
            </p>
          </div>
          
          <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="color: #991b1b; margin: 0; font-size: 14px;">
              <strong>⚠️ Não foi você?</strong><br>
              Se você não solicitou a recuperação de senha, ignore este email. Sua senha permanecerá inalterada.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h3 style="color: #6366f1; margin-top: 0;">🛡️ Dicas de Segurança:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Nunca compartilhe sua senha com ninguém</li>
              <li>Use uma senha forte com letras, números e símbolos</li>
              <li>Não use a mesma senha em múltiplos sites</li>
              <li>Altere sua senha regularmente</li>
            </ul>
          </div>
          
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e5e5;">
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
            © 2025 GamingFlix - Todos os direitos reservados<br>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #6366f1; text-decoration: none;">gamingflix.com</a>
          </p>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 16px;">
            Este é um email automático de segurança. Por favor, não responda.
          </p>
        </div>
      </div>
    `
  };

  const sent = await sendEmail(mailOptions);
  if (sent) {
    logger.info(`Password reset email sent to ${email}`);
    return true;
  }

  logger.error('Failed to send password reset email');
  return false;
};

export const sendWelcomeEmail = async (email, fullName) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: '🎮 Bem-vindo ao GamingFlix!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🎮 GamingFlix</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Sua Plataforma de Jogos AAA</p>
        </div>
        
        <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #333; margin-top: 0;">Olá${fullName ? `, ${fullName}` : ''}! 👋</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Seja muito bem-vindo(a) ao <strong>GamingFlix</strong>! Estamos felizes em ter você conosco.
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Sua conta foi criada com sucesso e agora você pode explorar nosso catálogo com mais de <strong>50 jogos AAA</strong>!
          </p>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #6366f1; padding: 20px; border-radius: 4px; margin: 24px 0;">
            <h3 style="color: #6366f1; margin-top: 0; font-size: 18px;">🚀 Próximos Passos:</h3>
            <ol style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Explore nosso catálogo de jogos</li>
              <li>Escolha um plano que atenda suas necessidades</li>
              <li>Comece a jogar imediatamente!</li>
            </ol>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h3 style="color: #333; margin-top: 0;">✨ O que você ganha:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0;">
              <li>🎮 <strong>+50 Jogos AAA</strong> - Assassin's Creed, GTA, Elden Ring e muito mais</li>
              <li>🔑 <strong>Acesso Instantâneo</strong> - Credenciais na hora</li>
              <li>🛡️ <strong>Steam Guard</strong> - Automatizado para você</li>
              <li>🔄 <strong>Troca Ilimitada</strong> - Mude de jogo quando quiser</li>
              <li>📱 <strong>Suporte VIP</strong> - WhatsApp direto</li>
              <li>💎 <strong>Founders</strong> - Preço vitalício garantido</li>
            </ul>
          </div>
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; border-radius: 8px; margin: 32px 0; text-align: center;">
            <h3 style="color: white; margin: 0 0 12px 0;">🎁 Oferta Especial Founders</h3>
            <p style="color: white; margin: 0 0 20px 0; opacity: 0.9;">Garanta preço vitalício por tempo limitado!</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/" 
               style="display: inline-block; padding: 16px 40px; background-color: white; color: #10b981; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              🚀 Ver Planos Founders
            </a>
          </div>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/catalogo" 
               style="display: inline-block; padding: 14px 32px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              📚 Explorar Catálogo
            </a>
          </div>
          
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e5e5;">
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
            © 2025 GamingFlix - Todos os direitos reservados<br>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #6366f1; text-decoration: none;">gamingflix.com</a>
          </p>
        </div>
      </div>
    `
  };

  const sent = await sendEmail(mailOptions);
  if (sent) {
    logger.info(`Welcome email sent to ${email}`);
    return true;
  }

  logger.warn('Failed to send welcome email');
  return false;
};

export const sendSubscriptionActivatedEmail = async (email, fullName, planName, expiryDate) => {
  const formattedExpiry = expiryDate ? new Date(expiryDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }) : 'Vitalício';

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: '🎉 Assinatura Ativada - GamingFlix',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🎉 GamingFlix</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Assinatura Ativada!</p>
        </div>
        
        <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #333; margin-top: 0;">Parabéns${fullName ? `, ${fullName}` : ''}! 🎊</h2>
          
          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin: 24px 0;">
            <p style="color: #065f46; margin: 0; font-size: 18px; font-weight: bold;">
              ✅ Sua assinatura está ATIVA e pronta para uso!
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 24px; border-radius: 8px; margin: 24px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 Detalhes da Assinatura</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #e5e5e5;"><strong>Plano:</strong></td>
                <td style="padding: 12px 0; color: #333; text-align: right; border-bottom: 1px solid #e5e5e5;">${planName || 'GamingFlix'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #e5e5e5;"><strong>Status:</strong></td>
                <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #e5e5e5;"><span style="color: #10b981; font-weight: bold;">✅ ATIVO</span></td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #666;"><strong>Validade:</strong></td>
                <td style="padding: 12px 0; color: #333; text-align: right;">${formattedExpiry}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h3 style="color: #6366f1; margin-top: 0;">🎮 Agora você pode:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0;">
              <li>✅ Acessar <strong>TODOS</strong> os jogos do catálogo</li>
              <li>✅ Obter credenciais Steam <strong>instantaneamente</strong></li>
              <li>✅ Trocar de jogo <strong>quantas vezes quiser</strong></li>
              <li>✅ Steam Guard <strong>automatizado</strong></li>
              <li>✅ Suporte VIP via <strong>WhatsApp</strong></li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/catalogo" 
               style="display: inline-block; padding: 16px 40px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              🎮 Começar a Jogar Agora
            </a>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>💡 Dica:</strong> Vá para o catálogo, escolha seu jogo favorito e clique em "Acessar Jogo" para obter suas credenciais!
            </p>
          </div>
          
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e5e5;">
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
            © 2025 GamingFlix - Todos os direitos reservados<br>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #6366f1; text-decoration: none;">gamingflix.com</a>
          </p>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 16px;">
            Dúvidas? Entre em contato pelo WhatsApp
          </p>
        </div>
      </div>
    `
  };

  const sent = await sendEmail(mailOptions);
  if (sent) {
    logger.info(`Subscription activated email sent to ${email}`);
    return true;
  }

  logger.warn('Failed to send subscription activated email');
  return false;
};

export const sendPasswordChangedEmail = async (email, fullName) => {
  const currentDate = new Date().toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const mailOptions = {
    from: {
      name: 'GamingFlix - Segurança',
      address: process.env.SMTP_FROM || process.env.SMTP_USER
    },
    to: email,
    subject: '🔒 Senha Alterada com Sucesso - GamingFlix',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🔒 GamingFlix</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Segurança da Conta</p>
        </div>
        
        <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #333; margin-top: 0;">Olá${fullName ? `, ${fullName}` : ''}!</h2>
          
          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="color: #065f46; margin: 0; font-size: 16px; font-weight: bold;">
              ✅ Sua senha foi alterada com sucesso!
            </p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Esta é uma confirmação de que a senha da sua conta GamingFlix foi alterada.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h3 style="color: #333; margin-top: 0; font-size: 18px;">📋 Detalhes da Alteração</h3>
            <p style="color: #666; margin: 8px 0;">
              <strong>Data e Hora:</strong> ${currentDate}
            </p>
            <p style="color: #666; margin: 8px 0;">
              <strong>Email:</strong> ${email}
            </p>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>⚠️ Não foi você?</strong><br>
              Se você não realizou esta alteração, sua conta pode estar comprometida. 
              Entre em contato imediatamente com nosso suporte pelo WhatsApp.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h3 style="color: #6366f1; margin-top: 0;">🛡️ Dicas de Segurança:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Use uma senha forte e única</li>
              <li>Não compartilhe sua senha com ninguém</li>
              <li>Ative a autenticação em duas etapas quando disponível</li>
              <li>Verifique regularmente a atividade da sua conta</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth" 
               style="display: inline-block; padding: 16px 32px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Fazer Login
            </a>
          </div>
          
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e5e5;">
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
            © 2025 GamingFlix - Todos os direitos reservados<br>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #6366f1; text-decoration: none;">gamingflix.com</a>
          </p>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 16px;">
            Este é um email automático de segurança. Por favor, não responda.
          </p>
        </div>
      </div>
    `
  };

  const sent = await sendEmail(mailOptions);
  if (sent) {
    logger.info(`Password changed email sent to ${email}`);
    return true;
  }

  logger.warn('Failed to send password changed email');
  return false;
};

export const sendSubscriptionExpiringEmail = async (email, fullName, planName, daysRemaining, expiryDate) => {
  const transporter = createEmailTransporter();
  
  if (!transporter) {
    logger.warn('Email transporter not configured - skipping subscription expiring email');
    return false;
  }

  const formattedExpiry = new Date(expiryDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const urgencyColor = daysRemaining <= 3 ? '#ef4444' : '#f59e0b';
  const urgencyBg = daysRemaining <= 3 ? '#fee2e2' : '#fef3c7';
  const urgencyText = daysRemaining <= 3 ? '#991b1b' : '#92400e';

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: `⏰ Seu plano expira em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} - GamingFlix`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, #dc2626 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">⏰ GamingFlix</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Aviso de Expiração</p>
        </div>
        
        <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #333; margin-top: 0;">Olá${fullName ? `, ${fullName}` : ''}! 👋</h2>
          
          <div style="background-color: ${urgencyBg}; border-left: 4px solid ${urgencyColor}; padding: 20px; border-radius: 4px; margin: 24px 0;">
            <p style="color: ${urgencyText}; margin: 0; font-size: 18px; font-weight: bold;">
              ⚠️ Seu plano está prestes a expirar!
            </p>
            <p style="color: ${urgencyText}; margin: 12px 0 0 0; font-size: 16px;">
              Faltam apenas <strong style="font-size: 24px;">${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}</strong> para sua assinatura acabar.
            </p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Não perca o acesso aos seus jogos favoritos! Renove agora e continue jogando sem interrupções.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 24px; border-radius: 8px; margin: 24px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 Detalhes da Assinatura</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #e5e5e5;"><strong>Plano:</strong></td>
                <td style="padding: 12px 0; color: #333; text-align: right; border-bottom: 1px solid #e5e5e5;">${planName || 'GamingFlix'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #e5e5e5;"><strong>Status:</strong></td>
                <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #e5e5e5;"><span style="color: ${urgencyColor}; font-weight: bold;">⚠️ EXPIRANDO</span></td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #e5e5e5;"><strong>Dias Restantes:</strong></td>
                <td style="padding: 12px 0; color: ${urgencyColor}; text-align: right; font-weight: bold; font-size: 18px; border-bottom: 1px solid #e5e5e5;">${daysRemaining}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #666;"><strong>Expira em:</strong></td>
                <td style="padding: 12px 0; color: #333; text-align: right;">${formattedExpiry}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h3 style="color: #6366f1; margin-top: 0;">🎮 O que você perderá:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0;">
              <li>❌ Acesso a <strong>+50 jogos AAA</strong></li>
              <li>❌ Credenciais Steam <strong>instantâneas</strong></li>
              <li>❌ Trocas <strong>ilimitadas</strong> de jogos</li>
              <li>❌ Steam Guard <strong>automatizado</strong></li>
              <li>❌ Suporte VIP via <strong>WhatsApp</strong></li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/" 
               style="display: inline-block; padding: 16px 40px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
              💳 Renovar Agora
            </a>
          </div>
          
          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="color: #065f46; margin: 0; font-size: 14px;">
              <strong>💎 Founders:</strong> Mantenha seu preço vitalício renovando antes de expirar!
            </p>
          </div>
          
          <div style="text-align: center; margin: 24px 0;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Precisa de ajuda? Entre em contato pelo WhatsApp
            </p>
          </div>
          
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e5e5;">
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
            © 2025 GamingFlix - Todos os direitos reservados<br>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #6366f1; text-decoration: none;">gamingflix.com</a>
          </p>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 16px;">
            Este é um email automático. Por favor, não responda.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Subscription expiring email sent to ${email} (${daysRemaining} days remaining)`);
    return true;
  } catch (error) {
    logger.error('Error sending subscription expiring email:', error);
    return false;
  }
};
