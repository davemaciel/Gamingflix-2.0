import { findSteamCode } from '../services/email.js';
import { logger } from '../utils/logger.js';

// Armazena o histórico de códigos (em produção, usar um banco de dados)
const codeHistory = [];

/**
 * Busca o código 2FA do Steam no email
 * @param {Request} req - Requisição Express
 * @param {Response} res - Resposta Express
 */
export async function getCode(req, res) {
  const startTime = Date.now();
  
  try {
    logger.info('Iniciando busca por código 2FA do Steam');
    
    const code = await findSteamCode();
    const searchTime = Date.now() - startTime;
    
    // Adiciona ao histórico
    const historyEntry = {
      id: Date.now().toString(),
      code,
      timestamp: new Date(),
      status: 'success',
      searchTime
    };
    
    codeHistory.unshift(historyEntry);
    
    // Mantém apenas os últimos 10 registros
    if (codeHistory.length > 10) {
      codeHistory.pop();
    }
    
    logger.info(`Código encontrado: ${code} em ${searchTime}ms`);
    
    return res.status(200).json({
      success: true,
      code,
      searchTime
    });
  } catch (error) {
    const searchTime = Date.now() - startTime;
    
    // Adiciona erro ao histórico
    const historyEntry = {
      id: Date.now().toString(),
      code: 'ERROR',
      timestamp: new Date(),
      status: 'error',
      searchTime,
      error: error.message
    };
    
    codeHistory.unshift(historyEntry);
    
    // Mantém apenas os últimos 10 registros
    if (codeHistory.length > 10) {
      codeHistory.pop();
    }
    
    logger.error(`Erro ao buscar código: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Obtém o histórico de códigos buscados
 * @param {Request} req - Requisição Express
 * @param {Response} res - Resposta Express
 */
export function getHistory(req, res) {
  try {
    return res.status(200).json({
      success: true,
      history: codeHistory
    });
  } catch (error) {
    logger.error(`Erro ao obter histórico: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}