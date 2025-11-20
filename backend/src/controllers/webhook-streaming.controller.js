import crypto from 'crypto';
import { collections } from '../config/database.js';
import { logger } from '../utils/logger.js';

const WEBHOOK_SECRET = process.env.GG_CHECKOUT_WEBHOOK_SECRET;

/**
 * Webhook para processar pagamentos de Streaming
 */
export const handleStreamingPayment = async (req, res) => {
    try {
        const payload = req.body;

        logger.info('=== WEBHOOK STREAMING RECEBIDO ===');
        // logger.info('Headers:', JSON.stringify(req.headers, null, 2)); // Descomentar para debug
        logger.info('Body:', JSON.stringify(payload, null, 2));

        // 1. Validação de Assinatura (HMAC)
        // A assinatura vem no header X-GGCheckout-Signature
        if (WEBHOOK_SECRET) {
            const signature = req.headers['x-ggcheckout-signature'];
            
            if (!signature) {
                logger.warn('Webhook sem assinatura recebido');
                return res.status(401).json({ error: 'Assinatura ausente' });
            }

            // Criar hash HMAC-SHA256 do payload usando a chave secreta
            const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
            const digest = hmac.update(JSON.stringify(payload)).digest('hex');

            // Comparar assinaturas (timing safe)
            if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
                logger.warn('Assinatura de webhook inválida');
                return res.status(401).json({ error: 'Assinatura inválida' });
            }
            
            logger.info('✅ Assinatura validada com sucesso');
        } else {
            logger.warn('⚠️ GGCHECKOUT_WEBHOOK_SECRET não configurado. Pule a validação de assinatura apenas em dev.');
        }

        const { event, transaction_id, user_id, service_id, amount, timestamp } = payload;

        // 2. Validação de Payload Básico
        if (!event || !transaction_id || !user_id || !service_id) {
            logger.warn('Payload inválido - campos obrigatórios ausentes');
            return res.status(400).json({ error: 'Payload inválido' });
        }

        // 3. Idempotência - Verificar se transação já foi processada
        const existingTransaction = await collections.transactions().findOne({ id: transaction_id });
        if (existingTransaction) {
            logger.info(`Transação ${transaction_id} já processada anteriormente. Retornando sucesso.`);
            return res.status(200).json({ received: true, status: 'already_processed' });
        }

        // 4. Salvar registro da transação
        const transaction = {
            id: transaction_id,
            type: 'streaming_purchase',
            event,
            user_id,
            service_id,
            amount: amount || 0,
            status: event === 'payment.approved' ? 'paid' : 'pending', // Ajustar conforme eventos reais
            raw_payload: payload,
            created_at: new Date(),
            processed_at: new Date()
        };

        await collections.transactions().insertOne(transaction);
        logger.info(`Transação ${transaction_id} registrada.`);

        // 5. Processar Pagamento Aprovado
        if (event === 'payment.approved') {
            logger.info(`💰 Pagamento aprovado para user ${user_id}, serviço ${service_id}`);
            
            await assignStreamingProfile(user_id, service_id, transaction_id);
        } else {
            logger.info(`Evento ${event} ignorado (não é aprovação de pagamento).`);
        }

        res.status(200).json({ received: true });

    } catch (error) {
        logger.error('❌ Erro ao processar webhook de streaming:', error);
        res.status(500).json({ error: 'Erro interno ao processar webhook' });
    }
};

/**
 * Lógica Core para atribuir perfil (separada do controller HTTP para reuso/teste)
 */
async function assignStreamingProfile(userId, serviceId, transactionId) {
    try {
        // 1. Verificar se serviço existe
        const service = await collections.streamingServices().findOne({ id: serviceId });
        if (!service) {
            logger.error(`Serviço ${serviceId} não encontrado para transação ${transactionId}`);
            // TODO: Notificar admin ou reembolsar?
            return;
        }

        // 2. Verificar se usuário já tem perfil ativo neste serviço
        // Nota: Dependendo da regra de negócio, o usuário pode ter múltiplos perfis. 
        // Mas assumiremos 1 por serviço por enquanto, ou permitiremos múltiplos se ele pagou de novo.
        // O requisito diz: "não deve atribuir perfil duplicado" se receber o mesmo transaction_id (já tratado na idempotência).
        // Mas se for uma NOVA transação, ele pode querer um segundo perfil?
        // O código existente em streaming.controller.js bloqueia múltiplos perfis: "Você já possui um perfil para este serviço".
        // Vamos manter essa lógica para ser consistente, mas logar um aviso.
        
        const existingProfile = await collections.streamingProfiles().findOne({
            service_id: serviceId,
            assigned_to: userId
        });

        if (existingProfile) {
            logger.warn(`Usuário ${userId} já possui perfil no serviço ${serviceId}. Verifique se isso é intencional.`);
            // Se a regra for estrita, poderíamos parar aqui. Mas como ele PAGOU, talvez devêssemos entregar outro?
            // Vamos seguir a lógica do controller existente e NÃO entregar outro, mas logar um erro CRÍTICO para resolução manual.
            logger.error(`CRÍTICO: Usuário pagou mas já tinha perfil. Transação: ${transactionId}`);
            return;
        }

        // 3. Buscar e Atribuir Perfil Disponível (Atomicamente)
        const assignedProfile = await collections.streamingProfiles().findOneAndUpdate(
            {
                service_id: serviceId,
                status: 'available'
            },
            {
                $set: {
                    status: 'assigned',
                    assigned_to: userId,
                    assigned_at: new Date(),
                    transaction_id: transactionId // Linkar com a transação que originou
                }
            },
            { returnDocument: 'after' }
        );

        if (!assignedProfile) {
            logger.error(`CRÍTICO: Estoque esgotado para serviço ${serviceId}. Usuário ${userId} pagou mas não recebeu.`);
            // TODO: Sistema de fila ou notificação urgente para admin repor estoque
            return;
        }

        logger.info(`✅ Perfil ${assignedProfile.id} atribuído com sucesso ao usuário ${userId}`);

    } catch (error) {
        logger.error(`Erro ao atribuir perfil para transação ${transactionId}:`, error);
        throw error;
    }
}
