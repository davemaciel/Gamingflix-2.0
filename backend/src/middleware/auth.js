import { logger } from '../utils/logger.js';

/**
 * Middleware para autenticação básica de API
 * Em produção, deve ser substituído por um sistema mais robusto (JWT, OAuth, etc.)
 */
export function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  // Em produção, usar uma chave armazenada de forma segura (variável de ambiente)
  const validApiKey = process.env.API_KEY || 'ggflix-steam-2fa-api-key';
  
  if (!apiKey || apiKey !== validApiKey) {
    logger.warn(`Tentativa de acesso não autorizado: ${req.ip}`);
    return res.status(401).json({ 
      success: false, 
      error: 'Acesso não autorizado' 
    });
  }
  
  next();
}

/**
 * Middleware para limitar taxa de requisições
 * Implementação básica, em produção usar Redis ou similar para armazenamento distribuído
 */
const requestCounts = {};
const WINDOW_SIZE_MS = 60000; // 1 minuto
const MAX_REQUESTS = 10; // 10 requisições por minuto

export function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  
  // Limpa entradas antigas
  for (const key in requestCounts) {
    if (now - requestCounts[key].timestamp > WINDOW_SIZE_MS) {
      delete requestCounts[key];
    }
  }
  
  // Verifica se o IP já está no registro
  if (!requestCounts[ip]) {
    requestCounts[ip] = {
      count: 1,
      timestamp: now
    };
  } else {
    // Incrementa contador
    requestCounts[ip].count++;
  }
  
  // Verifica se excedeu o limite
  if (requestCounts[ip].count > MAX_REQUESTS) {
    logger.warn(`Rate limit excedido para IP: ${ip}`);
    return res.status(429).json({
      success: false,
      error: 'Muitas requisições. Tente novamente em 1 minuto.'
    });
  }
  
  next();
}