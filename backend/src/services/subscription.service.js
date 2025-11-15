import { collections } from '../config/database.js';
import { logger } from '../utils/logger.js';
import {
  sendSubscriptionExpiring7DaysEmail,
  sendSubscriptionExpiring3DaysEmail,
  sendSubscriptionExpiredEmail
} from './subscription-emails.service.js';

/**
 * Verifica e expira assinaturas vencidas
 * Executado periodicamente via cron job
 */
export async function checkExpiredSubscriptions() {
  try {
    const now = new Date();
    
    // Busca assinaturas expiradas para enviar email antes de atualizar
    const expiredSubs = await collections.subscriptions().find({
      status: 'active',
      expires_at: { $ne: null, $lt: now }
    }).toArray();

    // Envia emails de expiração
    for (const sub of expiredSubs) {
      const user = await collections.profiles().findOne({ id: sub.user_id });
      const plan = await collections.subscriptionPlans().findOne({ id: sub.plan_id });
      
      if (user && plan) {
        await sendSubscriptionExpiredEmail(user.email, user.full_name || user.email, plan.name);
      }
    }
    
    // Atualiza status para expired
    const result = await collections.subscriptions().updateMany(
      {
        status: 'active',
        expires_at: { $ne: null, $lt: now }
      },
      {
        $set: {
          status: 'expired',
          updated_at: now
        }
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`Expired ${result.modifiedCount} subscription(s) and sent emails`);
    }

    return result.modifiedCount;
  } catch (error) {
    logger.error('Error checking expired subscriptions:', error);
    return 0;
  }
}

/**
 * Verifica se um usuário tem assinatura ativa
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>}
 */
export async function hasActiveSubscription(userId) {
  try {
    const now = new Date();
    
    const subscription = await collections.subscriptions().findOne({
      user_id: userId,
      status: 'active',
      $or: [
        { expires_at: null }, // Assinatura vitalícia
        { expires_at: { $gt: now } } // Assinatura ainda válida
      ]
    });

    return !!subscription;
  } catch (error) {
    logger.error('Error checking active subscription:', error);
    return false;
  }
}

/**
 * Verifica se um usuário é founder (acesso vitalício)
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>}
 */
export async function isFounder(userId) {
  try {
    const profile = await collections.profiles().findOne({ id: userId });
    return profile?.is_founder === true;
  } catch (error) {
    logger.error('Error checking founder status:', error);
    return false;
  }
}

/**
 * Verifica se usuário tem acesso aos jogos
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>}
 */
export async function hasGameAccess(userId) {
  const founder = await isFounder(userId);
  if (founder) return true;

  return await hasActiveSubscription(userId);
}

/**
 * Verifica assinaturas que expiram em 7 dias e envia avisos
 */
export async function checkExpiring7DaysSubscriptions() {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const eightDaysFromNow = new Date(now);
    eightDaysFromNow.setDate(eightDaysFromNow.getDate() + 8);

    // Busca assinaturas que expiram entre 7 e 8 dias (janela de 1 dia)
    const expiringSubs = await collections.subscriptions().find({
      status: 'active',
      expires_at: {
        $gte: sevenDaysFromNow,
        $lt: eightDaysFromNow
      },
      // Evita reenviar se já enviou (usando campo opcional)
      notified_7_days: { $ne: true }
    }).toArray();

    let emailsSent = 0;
    
    for (const sub of expiringSubs) {
      const user = await collections.profiles().findOne({ id: sub.user_id });
      const plan = await collections.subscriptionPlans().findOne({ id: sub.plan_id });
      
      if (user && plan) {
        const sent = await sendSubscriptionExpiring7DaysEmail(
          user.email,
          user.full_name || user.email,
          plan.name,
          sub.expires_at
        );
        
        if (sent) {
          // Marca como notificado
          await collections.subscriptions().updateOne(
            { id: sub.id },
            { $set: { notified_7_days: true } }
          );
          emailsSent++;
        }
      }
    }

    if (emailsSent > 0) {
      logger.info(`Sent ${emailsSent} expiring 7-days warning email(s)`);
    }

    return emailsSent;
  } catch (error) {
    logger.error('Error checking expiring 7-days subscriptions:', error);
    return 0;
  }
}

/**
 * Verifica assinaturas que expiram em 3 dias e envia avisos urgentes
 */
export async function checkExpiring3DaysSubscriptions() {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const fourDaysFromNow = new Date(now);
    fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4);

    // Busca assinaturas que expiram entre 3 e 4 dias (janela de 1 dia)
    const expiringSubs = await collections.subscriptions().find({
      status: 'active',
      expires_at: {
        $gte: threeDaysFromNow,
        $lt: fourDaysFromNow
      },
      // Evita reenviar se já enviou
      notified_3_days: { $ne: true }
    }).toArray();

    let emailsSent = 0;
    
    for (const sub of expiringSubs) {
      const user = await collections.profiles().findOne({ id: sub.user_id });
      const plan = await collections.subscriptionPlans().findOne({ id: sub.plan_id });
      
      if (user && plan) {
        const sent = await sendSubscriptionExpiring3DaysEmail(
          user.email,
          user.full_name || user.email,
          plan.name,
          sub.expires_at
        );
        
        if (sent) {
          // Marca como notificado
          await collections.subscriptions().updateOne(
            { id: sub.id },
            { $set: { notified_3_days: true } }
          );
          emailsSent++;
        }
      }
    }

    if (emailsSent > 0) {
      logger.info(`Sent ${emailsSent} expiring 3-days urgent warning email(s)`);
    }

    return emailsSent;
  } catch (error) {
    logger.error('Error checking expiring 3-days subscriptions:', error);
    return 0;
  }
}

/**
 * Executa todas as verificações de assinatura
 */
export async function runAllSubscriptionChecks() {
  logger.info('Running subscription checks...');
  
  await checkExpiredSubscriptions();
  await checkExpiring7DaysSubscriptions();
  await checkExpiring3DaysSubscriptions();
  
  logger.info('Subscription checks completed');
}

/**
 * Inicia o serviço de verificação automática (a cada 1 hora)
 */
export function startSubscriptionChecker() {
  // Verifica imediatamente ao iniciar
  runAllSubscriptionChecks();

  // Verifica a cada 1 hora
  const interval = setInterval(() => {
    runAllSubscriptionChecks();
  }, 60 * 60 * 1000); // 1 hora

  logger.info('Subscription checker started (runs every 1 hour)');

  return interval;
}
