import { sendEmail } from '../config/email.js';
import { logger } from '../utils/logger.js';
import {
  subscriptionCreatedTemplate,
  subscriptionExpiring7DaysTemplate,
  subscriptionExpiring3DaysTemplate,
  subscriptionExpiredTemplate,
  subscriptionCancelledTemplate,
  subscriptionRenewedTemplate
} from '../templates/email.templates.js';

/**
 * Envia email de assinatura criada (boas-vindas)
 */
export async function sendSubscriptionCreatedEmail(userEmail, userName, planName, expiresAt) {
  const mailOptions = {
    to: userEmail,
    subject: '🎮 Bem-vindo ao GamingFlix! Sua assinatura está ativa',
    html: subscriptionCreatedTemplate(userName, planName, expiresAt)
  };

  try {
    const success = await sendEmail(mailOptions);
    if (success) {
      logger.info(`Subscription created email sent to ${userEmail}`);
    }
    return success;
  } catch (error) {
    logger.error('Error sending subscription created email:', error);
    return false;
  }
}

/**
 * Envia email de aviso de vencimento (7 dias)
 */
export async function sendSubscriptionExpiring7DaysEmail(userEmail, userName, planName, expiresAt) {
  const mailOptions = {
    to: userEmail,
    subject: '⏰ Sua assinatura GamingFlix vence em 7 dias!',
    html: subscriptionExpiring7DaysTemplate(userName, planName, expiresAt)
  };

  try {
    const success = await sendEmail(mailOptions);
    if (success) {
      logger.info(`Expiring 7 days email sent to ${userEmail}`);
    }
    return success;
  } catch (error) {
    logger.error('Error sending expiring 7 days email:', error);
    return false;
  }
}

/**
 * Envia email de aviso urgente de vencimento (3 dias)
 */
export async function sendSubscriptionExpiring3DaysEmail(userEmail, userName, planName, expiresAt) {
  const mailOptions = {
    to: userEmail,
    subject: '🚨 URGENTE: Sua assinatura GamingFlix vence em 3 dias!',
    html: subscriptionExpiring3DaysTemplate(userName, planName, expiresAt)
  };

  try {
    const success = await sendEmail(mailOptions);
    if (success) {
      logger.info(`Expiring 3 days email sent to ${userEmail}`);
    }
    return success;
  } catch (error) {
    logger.error('Error sending expiring 3 days email:', error);
    return false;
  }
}

/**
 * Envia email de assinatura expirada
 */
export async function sendSubscriptionExpiredEmail(userEmail, userName, planName) {
  const mailOptions = {
    to: userEmail,
    subject: '😢 Sua assinatura GamingFlix expirou',
    html: subscriptionExpiredTemplate(userName, planName)
  };

  try {
    const success = await sendEmail(mailOptions);
    if (success) {
      logger.info(`Subscription expired email sent to ${userEmail}`);
    }
    return success;
  } catch (error) {
    logger.error('Error sending subscription expired email:', error);
    return false;
  }
}

/**
 * Envia email de assinatura cancelada
 */
export async function sendSubscriptionCancelledEmail(userEmail, userName, planName, reason = 'cancelamento') {
  const mailOptions = {
    to: userEmail,
    subject: '❌ Sua assinatura GamingFlix foi cancelada',
    html: subscriptionCancelledTemplate(userName, planName, reason)
  };

  try {
    const success = await sendEmail(mailOptions);
    if (success) {
      logger.info(`Subscription cancelled email sent to ${userEmail} (reason: ${reason})`);
    }
    return success;
  } catch (error) {
    logger.error('Error sending subscription cancelled email:', error);
    return false;
  }
}

/**
 * Envia email de assinatura renovada
 */
export async function sendSubscriptionRenewedEmail(userEmail, userName, planName, expiresAt) {
  const mailOptions = {
    to: userEmail,
    subject: '✅ Sua assinatura GamingFlix foi renovada!',
    html: subscriptionRenewedTemplate(userName, planName, expiresAt)
  };

  try {
    const success = await sendEmail(mailOptions);
    if (success) {
      logger.info(`Subscription renewed email sent to ${userEmail}`);
    }
    return success;
  } catch (error) {
    logger.error('Error sending subscription renewed email:', error);
    return false;
  }
}
