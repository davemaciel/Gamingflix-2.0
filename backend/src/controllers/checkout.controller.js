import crypto from 'crypto';
import { collections } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { sendSubscriptionCreatedEmail } from '../services/subscription-emails.service.js';
import { handleStreamingPayment } from './webhook-streaming.controller.js';

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

    logger.info('=== WEBHOOK RECEBIDO ===');
    logger.info('Headers:', JSON.stringify(req.headers, null, 2));
    logger.info('Body:', JSON.stringify(payload, null, 2));

    // DETECÇÃO DE STREAMING (Método 1): Payload novo com service_id
    if (payload.service_id && payload.user_id) {
      logger.info('🔄 Redirecionando webhook para controller de Streaming (formato novo)...');
      return handleStreamingPayment(req, res);
    }

    const { event, customer, payment, products } = payload;

    // DEBUG: Verificar se products existe
    logger.info(`📦 DEBUG - Products recebido: ${products ? 'SIM' : 'NÃO'}`);
    if (products) {
      logger.info(`📦 DEBUG - É array? ${Array.isArray(products) ? 'SIM' : 'NÃO'}`);
      logger.info(`📦 DEBUG - Quantidade: ${Array.isArray(products) ? products.length : 'N/A'}`);
      if (Array.isArray(products) && products.length > 0) {
        products.forEach((p, i) => {
          logger.info(`📦 DEBUG - Produto ${i + 1}: ${JSON.stringify(p)}`);
        });
      }
    }

    // DETECÇÃO DE STREAMING (Método 2): Payload antigo, mas produto é de streaming
    if (products && Array.isArray(products) && products.length > 0) {
      const streamingKeywords = ['netflix', 'disney', 'hbo', 'max', 'prime', 'paramount', 'apple tv', 'crunchyroll'];

      logger.info(`🔍 Verificando ${products.length} produto(s) contra keywords de streaming...`);

      const isStreamingProduct = products.some(p => {
        const productName = (p.name || p.title || '').toLowerCase();
        logger.info(`🔍 Verificando produto: "${productName}"`);

        const matchesKeyword = streamingKeywords.some(keyword => {
          const matches = productName.includes(keyword);
          if (matches) {
            logger.info(`✅ Match encontrado: "${keyword}" em "${productName}"`);
          }
          return matches;
        });

        return matchesKeyword;
      });

      if (isStreamingProduct) {
        logger.info('🎬 Produto de streaming detectado! Processando como streaming...');
        return handleStreamingPurchaseFromProducts(req, res, { event, customer, payment, products });
      } else {
        logger.info('❌ Nenhum produto de streaming detectado. Processando como jogos.');
      }
    } else {
      logger.info('⚠️ Payload não contém array de products válido. Processando como jogos.');
    }

    // Validação opcional do secret (se configurado)
    if (WEBHOOK_SECRET) {
      const signature = req.headers['x-ggcheckout-signature'] || req.headers['x-webhook-signature'];
      logger.info('Webhook signature (if provided):', signature);
    }

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
    const successEvents = ['pix.paid', 'card.paid', 'card.approved', 'payment.succeeded', 'payment.paid'];
    const failureEvents = ['card.failed', 'pix.failed', 'card.refunded', 'payment.failed', 'payment.refunded'];

    if (successEvents.includes(event)) {
      logger.info(`🎉 Evento de pagamento bem-sucedido detectado: ${event}`);
      await handlePaymentSuccess(customer, payment, transactionId);
      logger.info('✅ Pagamento processado com sucesso!');
    } else if (failureEvents.includes(event)) {
      logger.info(`❌ Evento de falha de pagamento detectado: ${event}`);
      await handlePaymentFailed(customer, transactionId);
    } else {
      logger.info(`ℹ️ Evento informativo recebido: ${event}`);
    }

    logger.info('=== WEBHOOK PROCESSADO COM SUCESSO ===');
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('❌ ERROR PROCESSING WEBHOOK:', error);
    logger.error('Stack trace:', error.stack);
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
    'card.approved': 'paid', // Adicionado
    'card.failed': 'failed',
    'card.refunded': 'refunded',
    'card.pending': 'pending',
    'payment.succeeded': 'paid', // Adicionado
    'payment.paid': 'paid', // Adicionado
    'payment.failed': 'failed', // Adicionado
    'payment.refunded': 'refunded' // Adicionado
  };
  return eventMap[event] || 'unknown';
}

/**
 * Processa pagamento bem-sucedido
 */
async function handlePaymentSuccess(customer, payment, transactionId) {
  try {
    logger.info('=== PROCESSANDO PAGAMENTO BEM-SUCEDIDO ===');
    logger.info('Customer:', JSON.stringify(customer, null, 2));
    logger.info('Payment:', JSON.stringify(payment, null, 2));
    logger.info('Transaction ID:', transactionId);

    const email = customer.email;
    logger.info(`Buscando usuário com email: ${email}`);

    // Buscar usuário por email
    let user = await collections.profiles().findOne({ email });
    logger.info('Usuário encontrado:', user ? `ID: ${user.id}` : 'NÃO ENCONTRADO');

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
    logger.info('✅ Assinatura criada com sucesso:', subscription.id);

    // Marcar usuário como Founder
    await collections.profiles().updateOne(
      { id: user.id },
      { $set: { is_founder: true, updated_at: new Date() } }
    );
    logger.info('✅ Usuário marcado como Founder');

    logger.info(`✅ Subscription created for user ${user.id} (${email}): expires ${expiresAt}`);

    // Enviar email de boas-vindas
    logger.info('📧 Enviando email de boas-vindas...');
    const emailSent = await sendSubscriptionCreatedEmail(
      email,
      user.full_name || email,
      foundersPlan.name,
      expiresAt
    );
    logger.info(emailSent ? '✅ Email enviado com sucesso' : '❌ Falha ao enviar email');

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

/**
 * Processa compra de streaming quando payload é no formato antigo (products array)
 */
async function handleStreamingPurchaseFromProducts(req, res, { event, customer, payment, products }) {
  try {
    logger.info('=== PROCESSANDO COMPRA DE STREAMING (formato antigo) ===');

    // Validar assinatura (OPCIONAL - GGCheckout não envia por padrão)
    if (WEBHOOK_SECRET) {
      const signature = req.headers['x-ggcheckout-signature'];
      if (!signature) {
        logger.warn('⚠️ Webhook sem assinatura HMAC (não enviada pelo GGCheckout). Continuando...');
      } else {
        const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
        const digest = hmac.update(JSON.stringify(req.body)).digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
          logger.warn('❌ Assinatura de webhook inválida!');
          return res.status(401).json({ error: 'Assinatura inválida' });
        }
        logger.info('✅ Assinatura HMAC validada');
      }
    }

    // Validar se é evento de sucesso
    const successEvents = ['pix.paid', 'card.paid', 'card.approved', 'payment.succeeded', 'payment.paid', 'payment.approved'];
    if (!successEvents.includes(event)) {
      logger.info(`Evento ${event} não é de pagamento aprovado. Ignorando.`);
      return res.status(200).json({ received: true, status: 'ignored' });
    }

    // 1. Buscar ou criar usuário pelo email
    const email = customer.email;
    let user = await collections.profiles().findOne({ email });

    if (!user) {
      logger.warn(`Usuário ${email} não encontrado. Criando...`);
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
      await collections.userRoles().insertOne({
        id: crypto.randomUUID(),
        user_id: userId,
        role: 'client',
        created_at: new Date()
      });
    }

    // 2. Identificar serviço de streaming pelo ID do produto no GGCheckout
    const productId = products[0]?.id;
    const productName = (products[0]?.name || products[0]?.title || '');

    logger.info(`📦 Produto do webhook: ID="${productId}", Nome="${productName}"`);

    if (!productId) {
      logger.error('❌ Payload não contém product.id. Impossível identificar serviço.');
      return res.status(400).json({ error: 'ID do produto não fornecido no webhook' });
    }

    // Buscar serviço pelo ggcheckout_product_id
    logger.info(`🔍 Buscando serviço com ggcheckout_product_id = "${productId}"...`);

    let service = await collections.streamingServices().findOne({
      ggcheckout_product_id: productId
    });

    if (!service) {
      logger.warn(`⚠️ Nenhum serviço encontrado com ggcheckout_product_id = "${productId}"`);

      // Fallback: tentar buscar por keywords (método antigo, apenas para compatibilidade temporária)
      logger.warn('⚠️ Tentando fallback por keywords do nome do produto...');
      const streamingKeywords = ['netflix', 'disney', 'hbo', 'max', 'prime', 'paramount', 'apple tv', 'crunchyroll'];
      const productNameLower = productName.toLowerCase();
      const matchedKeyword = streamingKeywords.find(keyword => productNameLower.includes(keyword));

      if (matchedKeyword) {
        logger.info(`🔍 Keyword "${matchedKeyword}" detectada. Buscando por nome...`);
        service = await collections.streamingServices().findOne({
          name: { $regex: new RegExp(matchedKeyword, 'i') }
        });

        if (service) {
          logger.warn(`⚠️ Serviço encontrado via fallback: ${service.name}`);
          logger.warn(`⚠️ ATENÇÃO ADMIN: Configure o ggcheckout_product_id="${productId}" no painel admin para este serviço!`);
        }
      }

      if (!service) {
        const allServices = await collections.streamingServices().find({}).toArray();
        logger.error(`Serviços cadastrados: ${allServices.map(s => `${s.name} (product_id: ${s.ggcheckout_product_id || 'NÃO CONFIGURADO'})`).join(', ')}`);
        return res.status(404).json({
          error: `Serviço não encontrado para product_id="${productId}". Configure o ID do Produto no Admin.`
        });
      }
    }

    logger.info(`✅ Serviço encontrado: ${service.name} (ID: ${service.id})`);

    const transactionId = payment.id || crypto.randomUUID();

    // 3. Verificar idempotência
    const existingTransaction = await collections.transactions().findOne({ id: transactionId });
    if (existingTransaction) {
      logger.info(`Transação ${transactionId} já processada.`);
      return res.status(200).json({ received: true, status: 'already_processed' });
    }

    // 4. Registrar transação
    await collections.transactions().insertOne({
      id: transactionId,
      type: 'streaming_purchase',
      event,
      user_id: user.id,
      service_id: service.id,
      amount: payment.amount || 0,
      status: 'paid',
      raw_payload: req.body,
      created_at: new Date(),
      processed_at: new Date()
    });

    // 5. Verificar se usuário já tem perfil
    const existingProfile = await collections.streamingProfiles().findOne({
      service_id: service.id,
      assigned_to: user.id
    });

    if (existingProfile) {
      logger.warn(`Usuário ${user.id} já possui perfil de ${serviceName}`);
      return res.status(200).json({
        received: true,
        warning: 'Usuário já possui perfil neste serviço'
      });
    }

    // 6. Atribuir perfil disponível
    const assignedProfile = await collections.streamingProfiles().findOneAndUpdate(
      {
        service_id: service.id,
        status: 'available'
      },
      {
        $set: {
          status: 'assigned',
          assigned_to: user.id,
          assigned_at: new Date(),
          transaction_id: transactionId
        }
      },
      { returnDocument: 'after' }
    );

    if (!assignedProfile) {
      logger.error(`CRÍTICO: Estoque esgotado para ${serviceName}`);
      return res.status(503).json({ error: 'Nenhum perfil disponível no momento' });
    }

    logger.info(`✅ Perfil ${assignedProfile.id} de ${serviceName} atribuído ao usuário ${user.id} (${email})`);
    res.status(200).json({
      received: true,
      profile_assigned: true,
      profile_id: assignedProfile.id
    });

  } catch (error) {
    logger.error('Erro ao processar compra de streaming:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}

/**
 * Gera uma fatura manual para o usuário
 */
export const createInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await collections.profiles().findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Busca a última assinatura (ativa ou expirada) para saber o plano
    const lastSub = await collections.subscriptions().findOne(
      { user_id: userId },
      { sort: { created_at: -1 } }
    );

    let planId;
    if (lastSub) {
      planId = lastSub.plan_id;
    } else {
      // Se nunca teve assinatura, assume o plano padrão (Founders)
      const defaultPlan = await collections.subscriptionPlans().findOne({ slug: 'ultimate-founders' });
      if (defaultPlan) planId = defaultPlan.id;
    }

    if (!planId) {
      return res.status(400).json({ error: 'Plano não encontrado para gerar fatura' });
    }

    const plan = await collections.subscriptionPlans().findOne({ id: planId });
    if (!plan) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    // VERIFICAÇÃO ANTI-DUPLICIDADE
    // Verifica se já existe uma fatura PENDENTE para este usuário e este plano
    // criada nas últimas 24 horas (ou sem limite de tempo, dependendo da regra de negócio)
    const existingPendingTransaction = await collections.transactions().findOne({
      customer_email: user.email,
      status: 'pending',
      'products.id': plan.id
    });

    if (existingPendingTransaction) {
      logger.info(`Returning existing pending invoice ${existingPendingTransaction.id} for user ${user.email}`);
      return res.status(200).json({
        message: 'Já existe uma fatura pendente para este plano',
        transaction: existingPendingTransaction,
        checkout_url: CHECKOUT_URL
      });
    }

    // Cria transação pendente
    const transactionId = crypto.randomUUID();
    const transaction = {
      id: transactionId,
      event: 'invoice.manual',
      status: 'pending',
      payment_method: 'unknown',
      amount: plan.price,
      customer_email: user.email,
      customer_name: user.full_name || '',
      products: [{
        id: plan.id,
        name: plan.name,
        price: plan.price
      }],
      created_at: new Date(),
      updated_at: new Date(),
      is_manual: true
    };

    await collections.transactions().insertOne(transaction);
    logger.info(`Manual invoice ${transactionId} generated for user ${user.email}`);

    res.status(201).json({
      message: 'Fatura gerada com sucesso',
      transaction,
      checkout_url: CHECKOUT_URL
    });

  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Erro ao gerar fatura' });
  }
};

