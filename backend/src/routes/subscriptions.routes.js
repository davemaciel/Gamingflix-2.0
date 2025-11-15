import express from 'express';
import {
  getUserSubscription,
  getFounderStatus,
  getAllPlans,
  getUserGameSelections,
  addGameSelection,
  removeGameSelection
} from '../controllers/subscriptions.controller.js';
import { authenticateToken } from '../middleware/jwtAuth.js';

const router = express.Router();

router.get('/me', authenticateToken, getUserSubscription);
router.get('/founder', authenticateToken, getFounderStatus);
router.get('/plans', authenticateToken, getAllPlans);
router.get('/games', authenticateToken, getUserGameSelections);
router.post('/games', authenticateToken, addGameSelection);
router.delete('/games/:game_id', authenticateToken, removeGameSelection);

export default router;
