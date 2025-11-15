import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import { collections } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('JWT authentication error:', error);
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = await collections.userRoles().findOne({
      user_id: userId,
      role: 'admin'
    });

    if (!userRole) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    next();
  } catch (error) {
    logger.error('Admin check error:', error);
    return res.status(500).json({ error: 'Erro ao verificar permissões' });
  }
};
