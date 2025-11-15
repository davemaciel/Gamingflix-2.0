/**
 * Templates de Email para Sistema de Assinaturas
 * GamingFlix - Catálogo de Jogos
 */

const baseStyle = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #0f0f0f;
  color: #ffffff;
  padding: 0;
  margin: 0;
`;

const containerStyle = `
  max-width: 600px;
  margin: 0 auto;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;

const headerStyle = `
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 32px;
  text-align: center;
`;

const contentStyle = `
  padding: 32px;
  line-height: 1.6;
`;

const buttonStyle = `
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  margin: 16px 0;
  transition: transform 0.2s;
`;

const footerStyle = `
  padding: 24px;
  text-align: center;
  background-color: #0a0a0a;
  color: #888;
  font-size: 14px;
  border-top: 1px solid #333;
`;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

/**
 * Template: Assinatura Criada (Boas-vindas)
 */
export const subscriptionCreatedTemplate = (userName, planName, expiresAt) => {
  const expirationDate = new Date(expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo ao GamingFlix!</title>
    </head>
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <h1 style="margin: 0; font-size: 32px; color: white;">🎮 Bem-vindo ao GamingFlix!</h1>
        </div>
        
        <div style="${contentStyle}">
          <h2 style="color: #6366f1; margin-top: 0;">Olá, ${userName}! 👋</h2>
          
          <p style="font-size: 16px; color: #e0e0e0;">
            Sua assinatura foi <strong style="color: #8b5cf6;">ativada com sucesso</strong>! 🎉
          </p>
          
          <div style="background-color: #1a1a2e; border-left: 4px solid #6366f1; padding: 16px; margin: 24px 0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #aaa;">Plano Atual</p>
            <p style="margin: 8px 0 0 0; font-size: 20px; font-weight: bold; color: #8b5cf6;">${planName}</p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #888;">Válido até: <strong style="color: #6366f1;">${expirationDate}</strong></p>
          </div>
          
          <h3 style="color: #8b5cf6; margin-top: 32px;">O que você pode fazer agora:</h3>
          <ul style="color: #e0e0e0; padding-left: 20px;">
            <li style="margin: 12px 0;">✅ Acessar nosso catálogo completo de jogos</li>
            <li style="margin: 12px 0;">✅ Selecionar seus jogos favoritos</li>
            <li style="margin: 12px 0;">✅ Receber credenciais de acesso instantaneamente</li>
            <li style="margin: 12px 0;">✅ Jogar ilimitadamente durante sua assinatura</li>
          </ul>
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="${FRONTEND_URL}/catalogo" style="${buttonStyle}">
              Explorar Catálogo 🎮
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 32px; text-align: center;">
            Dúvidas? Responda este email ou entre em contato conosco!
          </p>
        </div>
        
        <div style="${footerStyle}">
          <p style="margin: 0;">© 2025 GamingFlix - Seu catálogo de jogos</p>
          <p style="margin: 8px 0 0 0; font-size: 12px;">Este é um email automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template: Aviso de Vencimento (7 dias)
 */
export const subscriptionExpiring7DaysTemplate = (userName, planName, expiresAt) => {
  const expirationDate = new Date(expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sua assinatura vence em 7 dias</title>
    </head>
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; color: white;">⏰ Lembrete Importante</h1>
        </div>
        
        <div style="${contentStyle}">
          <h2 style="color: #f59e0b; margin-top: 0;">Olá, ${userName}!</h2>
          
          <p style="font-size: 16px; color: #e0e0e0;">
            Sua assinatura <strong style="color: #f59e0b;">${planName}</strong> está chegando ao fim! 📅
          </p>
          
          <div style="background-color: #1a1a2e; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 16px; color: #aaa;">Sua assinatura expira em:</p>
            <p style="margin: 12px 0; font-size: 28px; font-weight: bold; color: #f59e0b;">7 DIAS</p>
            <p style="margin: 0; font-size: 14px; color: #888;">Data de expiração: <strong style="color: #f59e0b;">${expirationDate}</strong></p>
          </div>
          
          <p style="font-size: 16px; color: #e0e0e0; text-align: center;">
            Não perca o acesso aos seus jogos favoritos! 🎮
          </p>
          
          <h3 style="color: #f59e0b; margin-top: 32px;">Renove agora e continue jogando:</h3>
          <ul style="color: #e0e0e0; padding-left: 20px;">
            <li style="margin: 12px 0;">✅ Mantenha acesso ao catálogo completo</li>
            <li style="margin: 12px 0;">✅ Não perca seus jogos selecionados</li>
            <li style="margin: 12px 0;">✅ Continue de onde parou, sem interrupções</li>
          </ul>
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="${FRONTEND_URL}/catalogo" style="${buttonStyle.replace('#6366f1', '#f59e0b').replace('#8b5cf6', '#d97706')}">
              Renovar Assinatura 🔄
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 32px; text-align: center;">
            Precisa de ajuda? Entre em contato conosco!
          </p>
        </div>
        
        <div style="${footerStyle}">
          <p style="margin: 0;">© 2025 GamingFlix - Seu catálogo de jogos</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template: Aviso Urgente de Vencimento (3 dias)
 */
export const subscriptionExpiring3DaysTemplate = (userName, planName, expiresAt) => {
  const expirationDate = new Date(expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>URGENTE: Sua assinatura vence em 3 dias!</title>
    </head>
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; color: white;">🚨 ATENÇÃO: Última Chamada!</h1>
        </div>
        
        <div style="${contentStyle}">
          <h2 style="color: #ef4444; margin-top: 0;">Olá, ${userName}!</h2>
          
          <p style="font-size: 18px; color: #e0e0e0; font-weight: bold;">
            ⚠️ Sua assinatura expira em apenas <span style="color: #ef4444;">3 DIAS</span>!
          </p>
          
          <div style="background-color: #1a1a2e; border: 2px solid #ef4444; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 16px; color: #aaa;">⏰ Tempo Restante:</p>
            <p style="margin: 12px 0; font-size: 36px; font-weight: bold; color: #ef4444;">3 DIAS</p>
            <p style="margin: 0; font-size: 14px; color: #888;">Expira em: <strong style="color: #ef4444;">${expirationDate}</strong></p>
          </div>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #991b1b; font-weight: bold;">
              ⚠️ Após a expiração, você perderá:
            </p>
            <ul style="color: #991b1b; padding-left: 20px; margin-top: 8px;">
              <li>Acesso ao catálogo de jogos</li>
              <li>Suas credenciais de jogo</li>
              <li>Jogos selecionados</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #e0e0e0; text-align: center; font-weight: bold;">
            🔥 Renove AGORA e continue jogando sem interrupções!
          </p>
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="${FRONTEND_URL}/catalogo" style="${buttonStyle.replace('#6366f1', '#ef4444').replace('#8b5cf6', '#dc2626')}">
              RENOVAR AGORA! 🚀
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 32px; text-align: center;">
            Problemas para renovar? Fale conosco imediatamente!
          </p>
        </div>
        
        <div style="${footerStyle}">
          <p style="margin: 0;">© 2025 GamingFlix - Seu catálogo de jogos</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template: Assinatura Expirada
 */
export const subscriptionExpiredTemplate = (userName, planName) => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sua assinatura expirou</title>
    </head>
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        <div style="background: linear-gradient(135deg, #71717a 0%, #52525b 100%); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; color: white;">😢 Assinatura Expirada</h1>
        </div>
        
        <div style="${contentStyle}">
          <h2 style="color: #71717a; margin-top: 0;">Olá, ${userName}</h2>
          
          <p style="font-size: 16px; color: #e0e0e0;">
            Sua assinatura <strong style="color: #71717a;">${planName}</strong> expirou e você perdeu o acesso aos jogos. 😔
          </p>
          
          <div style="background-color: #1a1a2e; border-left: 4px solid #71717a; padding: 20px; margin: 24px 0; border-radius: 8px;">
            <p style="margin: 0; font-size: 16px; color: #aaa;">Status da Assinatura:</p>
            <p style="margin: 12px 0; font-size: 24px; font-weight: bold; color: #71717a;">EXPIRADA</p>
            <p style="margin: 0; font-size: 14px; color: #888;">Você não tem mais acesso ao catálogo</p>
          </div>
          
          <h3 style="color: #6366f1; margin-top: 32px;">📢 Sentimos sua falta!</h3>
          <p style="font-size: 16px; color: #e0e0e0;">
            Reative sua assinatura agora e volte a jogar seus games favoritos! 🎮
          </p>
          
          <ul style="color: #e0e0e0; padding-left: 20px;">
            <li style="margin: 12px 0;">✨ Acesso imediato ao catálogo completo</li>
            <li style="margin: 12px 0;">✨ Selecione novos jogos</li>
            <li style="margin: 12px 0;">✨ Continue de onde parou</li>
          </ul>
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="${FRONTEND_URL}/catalogo" style="${buttonStyle}">
              Reativar Assinatura 🔄
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 32px; text-align: center;">
            Tem alguma dúvida? Estamos aqui para ajudar!
          </p>
        </div>
        
        <div style="${footerStyle}">
          <p style="margin: 0;">© 2025 GamingFlix - Seu catálogo de jogos</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template: Assinatura Cancelada
 */
export const subscriptionCancelledTemplate = (userName, planName, reason = 'cancelamento') => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Assinatura Cancelada</title>
    </head>
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; color: white;">❌ Assinatura Cancelada</h1>
        </div>
        
        <div style="${contentStyle}">
          <h2 style="color: #f97316; margin-top: 0;">Olá, ${userName}</h2>
          
          <p style="font-size: 16px; color: #e0e0e0;">
            Sua assinatura <strong style="color: #f97316;">${planName}</strong> foi cancelada.
          </p>
          
          <div style="background-color: #1a1a2e; border-left: 4px solid #f97316; padding: 20px; margin: 24px 0; border-radius: 8px;">
            <p style="margin: 0; font-size: 16px; color: #aaa;">Motivo do Cancelamento:</p>
            <p style="margin: 12px 0; font-size: 18px; font-weight: bold; color: #f97316;">${reason === 'payment_failed' ? 'Falha no Pagamento' : 'Cancelamento Manual'}</p>
            <p style="margin: 0; font-size: 14px; color: #888;">Você perdeu o acesso aos jogos</p>
          </div>
          
          <h3 style="color: #6366f1; margin-top: 32px;">💔 Sentimos muito por isso!</h3>
          <p style="font-size: 16px; color: #e0e0e0;">
            ${reason === 'payment_failed' 
              ? 'Houve um problema com o pagamento. Que tal tentar novamente?' 
              : 'Esperamos que você volte em breve!'}
          </p>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #78350f; font-weight: bold;">
              🎁 Oferta Especial de Retorno:
            </p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #78350f;">
              Reative sua assinatura nos próximos 7 dias e ganhe benefícios exclusivos!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="${FRONTEND_URL}/catalogo" style="${buttonStyle}">
              Reativar Assinatura 🔄
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 32px; text-align: center;">
            Precisa de ajuda? Fale conosco!
          </p>
        </div>
        
        <div style="${footerStyle}">
          <p style="margin: 0;">© 2025 GamingFlix - Seu catálogo de jogos</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template: Assinatura Renovada
 */
export const subscriptionRenewedTemplate = (userName, planName, expiresAt) => {
  const expirationDate = new Date(expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Assinatura Renovada!</title>
    </head>
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; color: white;">✅ Assinatura Renovada!</h1>
        </div>
        
        <div style="${contentStyle}">
          <h2 style="color: #10b981; margin-top: 0;">Olá, ${userName}! 🎉</h2>
          
          <p style="font-size: 16px; color: #e0e0e0;">
            Sua assinatura <strong style="color: #10b981;">${planName}</strong> foi renovada com sucesso!
          </p>
          
          <div style="background-color: #1a1a2e; border-left: 4px solid #10b981; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 16px; color: #aaa;">Nova Data de Expiração:</p>
            <p style="margin: 12px 0; font-size: 24px; font-weight: bold; color: #10b981;">${expirationDate}</p>
            <p style="margin: 0; font-size: 14px; color: #888;">Continue jogando sem interrupções! 🎮</p>
          </div>
          
          <h3 style="color: #10b981; margin-top: 32px;">🎮 Aproveite seus jogos:</h3>
          <ul style="color: #e0e0e0; padding-left: 20px;">
            <li style="margin: 12px 0;">✅ Acesso total ao catálogo</li>
            <li style="margin: 12px 0;">✅ Selecione novos jogos</li>
            <li style="margin: 12px 0;">✅ Sem interrupções até ${expirationDate}</li>
          </ul>
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="${FRONTEND_URL}/catalogo" style="${buttonStyle.replace('#6366f1', '#10b981').replace('#8b5cf6', '#059669')}">
              Explorar Catálogo 🎮
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 32px; text-align: center;">
            Obrigado por continuar conosco! 💚
          </p>
        </div>
        
        <div style="${footerStyle}">
          <p style="margin: 0;">© 2025 GamingFlix - Seu catálogo de jogos</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
