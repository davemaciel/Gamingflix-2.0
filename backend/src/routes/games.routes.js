import express from 'express';
import { getAllGames, getGameById, createGame, updateGame, deleteGame } from '../controllers/games.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/jwtAuth.js';

const router = express.Router();

// Catálogo público (sem autenticação)
router.get('/', getAllGames);
// Detalhes do jogo requer autenticação (para proteger credenciais)
router.get('/:id', authenticateToken, getGameById);
router.post('/', authenticateToken, requireAdmin, createGame);
router.put('/:id', authenticateToken, requireAdmin, updateGame);
router.delete('/:id', authenticateToken, requireAdmin, deleteGame);

export default router;
