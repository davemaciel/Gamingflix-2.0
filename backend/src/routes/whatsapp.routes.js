import express from 'express';
import { sendMessage, getStatus } from '../controllers/whatsapp.controller.js';

const router = express.Router();

/**
 * @route POST /api/whatsapp/send
 * @desc Envia uma mensagem com o código 2FA via WhatsApp
 * @access Public
 */
router.post('/send', sendMessage);

/**
 * @route GET /api/whatsapp/status
 * @desc Verifica o status da conexão com WhatsApp
 * @access Public
 */
router.get('/status', getStatus);

export { router as whatsappRoutes };