import express from 'express';
import { requestSteamGuardCode } from '../controllers/steamguard.controller.js';

const router = express.Router();

/**
 * POST /api/steam-guard/request
 * Solicitar código Steam Guard (público - não requer autenticação)
 */
router.post('/request', requestSteamGuardCode);

export default router;
