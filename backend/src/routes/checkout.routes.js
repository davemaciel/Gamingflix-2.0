import express from 'express';
import { getCheckoutSession, handleWebhook } from '../controllers/checkout.controller.js';
import { authenticateToken } from '../middleware/jwtAuth.js';

const router = express.Router();

// Endpoint para obter URL do checkout
router.get('/session', authenticateToken, getCheckoutSession);

// Webhook do GGCheckout (sem autenticação JWT, usa secret do webhook)
router.post('/webhook', handleWebhook);

export default router;
