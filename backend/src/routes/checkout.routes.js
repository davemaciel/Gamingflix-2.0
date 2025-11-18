import express from 'express';
import { getCheckoutSession, handleWebhook } from '../controllers/checkout.controller.js';
import { authenticateToken } from '../middleware/jwtAuth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Endpoint para obter URL do checkout
router.get('/session', authenticateToken, getCheckoutSession);

// Webhook do GGCheckout (sem autenticação JWT, usa secret do webhook)
router.post('/webhook', handleWebhook);

// Endpoint de teste do webhook (APENAS PARA DEBUG - remover em produção)
router.post('/webhook/test', authenticateToken, async (req, res) => {
  try {
    logger.info('=== TESTE DE WEBHOOK INICIADO ===');
    logger.info('User ID:', req.user.id);
    logger.info('User email:', req.user.email);
    
    // Simular payload de pix.paid
    const testPayload = {
      event: 'pix.paid',
      customer: {
        email: req.user.email,
        name: req.user.full_name || 'Test User',
        phone: req.user.whatsapp || null,
        document: null,
        ip: '127.0.0.1'
      },
      payment: {
        id: `test-${Date.now()}`,
        amount: 1.00,
        method: 'pix',
        paymentMethod: 'pix',
        status: 'paid',
        gateway: 'mercadopago'
      },
      products: [{
        id: 'test-product',
        title: 'Ultimate Gamingflix',
        type: 'main'
      }]
    };
    
    logger.info('Payload de teste:', JSON.stringify(testPayload, null, 2));
    
    // Processar como se fosse um webhook real
    req.body = testPayload;
    await handleWebhook(req, res);
    
  } catch (error) {
    logger.error('Erro no teste de webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
