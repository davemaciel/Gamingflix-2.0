import crypto from 'crypto';
import { collections } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { sendSubscriptionCreatedEmail } from '../services/subscription-emails.service.js';

const CHECKOUT_URL = process.env.GG_CHECKOUT_CHECKOUT_URL || 'https://www.ggcheckout.com/checkout/v2/Et6D7G1DJX9xxt6mCOcA';
const WEBHOOK_SECRET = process.env.GG_CHECKOUT_WEBHOOK_SECRET;

/**
 * Retorna URL do checkout hospedado do GGCheckout
 */
export const getCheckoutSession = async (req, res) => {
  try {
    res.json({
      checkout_url: CHECKOUT_URL,
      plan: 'Ultimate Founders',
      price: 59.90
    });
  } catch (error) {
    logger.error('Error getting checkout session:', error);
    res.status(500).json({ error: 'Erro ao obter sessão de checkout' });
  }
};

/**
 * Webhook do GGCheckout para receber eventos de pagamento
 */
export const handleWebhook = async (req, res) => {
  try {
    const payload = req.body;
    
    // Validação opcional do secret (se configurado)
    if (WEBHOOK_SECRET) {
      const signature = req.headers['x-ggcheckout-signature'] || req.headers['x-webhook-signature'];
      // TODO: implementar validação de assinatura quando GGCheckout fornecer detalhes
      logger.info('Webhook signature validation (if provided):', signature);
    }

    logger.info('Received GGCheckout webhook:', JSON.stringify(payload, null, 2));

    const { event, customer, payment, products } = payload;
    
    if (!event || !customer || !payment) {
      logger.warn('Invalid webhook payload - missing required fields');
      return res.status(400).json({ error: 'Payload inválido' });
    }

    // Salvar/atualizar transação
    const transactionId = payment.id || crypto.randomUUID();
    const now = new Date();

    const transaction = {
      id: transactionId,
      event,
      status: getStatusFromEvent(event),
      payment_method: payment.method || 'unknown',
      amount: payment.amount || 0,
      customer_email: customer.email,
      customer_name: customer.name || '',
      customer_phone: customer.phone || '',
      products: products || [],
      raw_payload: payload,
      created_at: now,
      updated_at: now
    };

    await collections.transactions().updateOne(
      { id: transactionId },
      { $set: transaction },
      { upsert: true }
    );

    logger.info(`Transaction ${transactionId} saved with status: ${transaction.status}`);

    // Processar evento de pagamento
    if (event === 'pix.paid' || event === 'card.paid') {
      await handlePaymentSuccess(customer, payment, transactionId);
    } else if (event === 'card.failed' || event === 'pix.failed' || event === 'card.refunded') {
      await handlePaymentFailed(customer, transactionId);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
};

/**
 * Mapeia evento do webhook para status da transação
 */
function getStatusFromEvent(event) {
  const eventMap = {
    'pix.generated': 'pending',
    'pix.paid': 'paid',
    'pix.failed': 'failed',
    'card.generated': 'pending',
    'card.paid': 'paid',
    'card.failed': 'failed',
    'card.refunded': 'refunded',
    'card.pending': 'pending'
  };
  return eventMap[event] || 'unknown';
}

/**
 * Processa pagamento bem-sucedido
 */
async function handlePaymentSuccess(customer, payment, transactionId) {
  try {
    const email = customer.email;
    
    // Buscar usuário por email
    let user = await collections.profiles().findOne({ email });
    
    if (!user) {
      logger.warn(`User not found for email ${email}, creating placeholder`);
      // Criar perfil placeholder (usuário deve completar cadastro depois)
      const userId = crypto.randomUUID();
      user = {
        id: userId,
        email,
        full_name: customer.name || '',
        created_at: new Date(),
        updated_at: new Date(),
        needs_password_setup: true
      };
      await collections.profiles().insertOne(user);
      
      // Criar role padrão
      await collections.userRoles().insertOne({
        id: crypto.randomUUID(),
        user_id: userId,
        role: 'client',
        created_at: new Date()
      });
    }

    // Buscar plano Founders (assumindo que já existe)
    let foundersPlan = await collections.subscriptionPlans().findOne({ slug: 'ultimate-founders' });
    
    if (!foundersPlan) {
      logger.warn('Founders plan not found, creating it');
      foundersPlan = {
        id: crypto.randomUUID(),
        name: 'Ultimate Founders',
        slug: 'ultimate-founders',
        price: 59.90,
        max_games: 999999,
        description: 'Acesso total vitalício com preço bloqueado para sempre',
        features: [
          'Acesso ILIMITADO a todos os jogos',
          'Preço vitalício de R$ 59,90/mês (nunca aumenta)',
          'Badge exclusivo de FOUNDER no seu perfil',
          'Troca ilimitada de jogos',
          'TODOS OS LANÇAMENTOS NOVOS inclusos',
          'Garantia de 30 dias',
          'Suporte VIP 24/7',
          'Acesso offline'
        ],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };
      await collections.subscriptionPlans().insertOne(foundersPlan);
    }

    // Cancelar assinatura ativa anterior (se houver)
    await collections.subscriptions().updateMany(
      { user_id: user.id, status: 'active' },
      { $set: { status: 'cancelled', updated_at: new Date() } }
    );

    // Criar nova assinatura (30 dias)
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const subscription = {
      id: crypto.randomUUID(),
      user_id: user.id,
      plan_id: foundersPlan.id,
      status: 'active',
      started_at: now,
      expires_at: expiresAt,
      transaction_id: transactionId,
      created_at: now,
      updated_at: now
    };

    await collections.subscriptions().insertOne(subscription);

    // Marcar usuário como Founder
    await collections.profiles().updateOne(
      { id: user.id },
      { $set: { is_founder: true, updated_at: new Date() } }
    );

    logger.info(`Subscription created for user ${user.id} (${email}): expires ${expiresAt}`);

    // Enviar email de boas-vindas
    await sendSubscriptionCreatedEmail(
      email,
      user.full_name || email,
      foundersPlan.name,
      expiresAt
    );

  } catch (error) {
    logger.error('Error handling payment success:', error);
    throw error;
  }
}

/**
 * Processa falha de pagamento
 */
async function handlePaymentFailed(customer, transactionId) {
  try {
    const email = customer.email;
    const user = await collections.profiles().findOne({ email });
    
    if (!user) {
      logger.warn(`User not found for email ${email} on payment failure`);
      return;
    }

    // Atualizar assinatura relacionada (se existir)
    await collections.subscriptions().updateMany(
      { user_id: user.id, transaction_id: transactionId },
      { $set: { status: 'cancelled', updated_at: new Date() } }
    );

    logger.info(`Payment failed for user ${user.id} (${email}), subscription cancelled`);
  } catch (error) {
    logger.error('Error handling payment failure:', error);
    throw error;
  }
}
