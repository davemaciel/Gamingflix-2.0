import express from 'express';
import { 
  getAllTransactions, 
  getTransactionById, 
  getTransactionsStats 
} from '../controllers/transactions.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/jwtAuth.js';

const router = express.Router();

// Todas as rotas requerem autenticação e privilégios de admin
router.get('/', authenticateToken, requireAdmin, getAllTransactions);
router.get('/stats', authenticateToken, requireAdmin, getTransactionsStats);
router.get('/:id', authenticateToken, requireAdmin, getTransactionById);

export default router;
