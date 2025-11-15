import { createEmailTransporter } from '../config/email.js';
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
  const transporter = createEmailTransporter();
  
  if (!transporter) {
    logger.warn('Email transporter not configured. Subscription created email not sent.');
    return false;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: userEmail,
    subject: '🎮 Bem-vindo ao GamingFlix! Sua assinatura está ativa',
    html: subscriptionCreatedTemplate(userName, planName, expiresAt)
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Subscription created email sent to ${userEmail}`);
    return true;
  } catch (error) {
    logger.error('Error sending subscription created email:', error);
    return false;
  }
}

/**
 * Envia email de aviso de vencimento (7 dias)
 */
export async function sendSubscriptionExpiring7DaysEmail(userEmail, userName, planName, expiresAt) {
  const transporter = createEmailTransporter();
  
  if (!transporter) {
    logger.warn('Email transporter not configured. Expiring 7 days email not sent.');
    return false;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: userEmail,
    subject: '⏰ Sua assinatura GamingFlix vence em 7 dias!',
    html: subscriptionExpiring7DaysTemplate(userName, planName, expiresAt)
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Expiring 7 days email sent to ${userEmail}`);
    return true;
  } catch (error) {
    logger.error('Error sending expiring 7 days email:', error);
    return false;
  }
}

/**
 * Envia email de aviso urgente de vencimento (3 dias)
 */
export async function sendSubscriptionExpiring3DaysEmail(userEmail, userName, planName, expiresAt) {
  const transporter = createEmailTransporter();
  
  if (!transporter) {
    logger.warn('Email transporter not configured. Expiring 3 days email not sent.');
    return false;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: userEmail,
    subject: '🚨 URGENTE: Sua assinatura GamingFlix vence em 3 dias!',
    html: subscriptionExpiring3DaysTemplate(userName, planName, expiresAt)
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Expiring 3 days email sent to ${userEmail}`);
    return true;
  } catch (error) {
    logger.error('Error sending expiring 3 days email:', error);
    return false;
  }
}

/**
 * Envia email de assinatura expirada
 */
export async function sendSubscriptionExpiredEmail(userEmail, userName, planName) {
  const transporter = createEmailTransporter();
  
  if (!transporter) {
    logger.warn('Email transporter not configured. Subscription expired email not sent.');
    return false;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: userEmail,
    subject: '😢 Sua assinatura GamingFlix expirou',
    html: subscriptionExpiredTemplate(userName, planName)
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Subscription expired email sent to ${userEmail}`);
    return true;
  } catch (error) {
    logger.error('Error sending subscription expired email:', error);
    return false;
  }
}

/**
 * Envia email de assinatura cancelada
 */
export async function sendSubscriptionCancelledEmail(userEmail, userName, planName, reason = 'cancelamento') {
  const transporter = createEmailTransporter();
  
  if (!transporter) {
    logger.warn('Email transporter not configured. Subscription cancelled email not sent.');
    return false;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: userEmail,
    subject: '❌ Sua assinatura GamingFlix foi cancelada',
    html: subscriptionCancelledTemplate(userName, planName, reason)
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Subscription cancelled email sent to ${userEmail} (reason: ${reason})`);
    return true;
  } catch (error) {
    logger.error('Error sending subscription cancelled email:', error);
    return false;
  }
}

/**
 * Envia email de assinatura renovada
 */
export async function sendSubscriptionRenewedEmail(userEmail, userName, planName, expiresAt) {
  const transporter = createEmailTransporter();
  
  if (!transporter) {
    logger.warn('Email transporter not configured. Subscription renewed email not sent.');
    return false;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: userEmail,
    subject: '✅ Sua assinatura GamingFlix foi renovada!',
    html: subscriptionRenewedTemplate(userName, planName, expiresAt)
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Subscription renewed email sent to ${userEmail}`);
    return true;
  } catch (error) {
    logger.error('Error sending subscription renewed email:', error);
    return false;
  }
}
