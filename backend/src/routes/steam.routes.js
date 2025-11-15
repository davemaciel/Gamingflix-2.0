import express from 'express';
import { getCode, getHistory } from '../controllers/steam.controller.js';

const router = express.Router();

/**
 * @route GET /api/steam/code
 * @route GET /api/steam-guard (alias para compatibilidade)
 * @desc Busca o código 2FA do Steam no email
 * @access Public
 */
router.get('/code', getCode);
router.get('/guard', getCode); // Alias para /steam-guard

/**
 * @route GET /api/steam/history
 * @desc Obtém o histórico de códigos buscados
 * @access Public
 */
router.get('/history', getHistory);

export { router as steamRoutes };