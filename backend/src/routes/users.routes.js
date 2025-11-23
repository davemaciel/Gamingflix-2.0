import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/jwtAuth.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  createUserSubscription,
  cancelUserSubscription,
  renewUserSubscription,
  assignStreamingToUser,
  loginAsUser
} from '../controllers/users.controller.js';

const router = express.Router();

// Todas as rotas requerem autenticação e permissão de admin
router.use(authenticateToken);
router.use(requireAdmin);

// Gerenciamento de usuários
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

// Gerenciamento de assinaturas
router.post('/:id/subscription', createUserSubscription);
router.delete('/:id/subscription', cancelUserSubscription);
router.put('/:id/subscription/renew', renewUserSubscription);

// Atribuir streaming
router.post('/:id/streaming', assignStreamingToUser);

// Login as User (Impersonation)
router.post('/:id/login-as', loginAsUser);

export default router;
