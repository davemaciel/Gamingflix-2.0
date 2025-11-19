import express from 'express';
import {
  getAllTransactions,
  getTransactionById,
  getTransactionsStats,
  getMyTransactions
} from '../controllers/transactions.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/jwtAuth.js';

const router = express.Router();

// Rotas de usuário
router.get('/my-invoices', authenticateToken, getMyTransactions);

// Todas as rotas requerem autenticação e privilégios de admin
router.get('/', authenticateToken, requireAdmin, getAllTransactions);
router.get('/stats', authenticateToken, requireAdmin, getTransactionsStats);
router.get('/:id', authenticateToken, requireAdmin, getTransactionById);

export default router;
