import express from 'express';
import { 
  signUp, 
  signIn, 
  getMe, 
  checkRole, 
  forgotPassword, 
  resetPassword,
  checkUsername,
  updateProfile,
  changePassword
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/jwtAuth.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateToken, getMe);
router.get('/role', authenticateToken, checkRole);

// Novas rotas
router.get('/check-username/:username', checkUsername);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);

export default router;
