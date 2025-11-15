import { logger } from '../utils/logger.js';
import { findSteamCode } from '../services/email.js';

/**
 * Buscar código Steam Guard REAL do email via IMAP
 * POST /api/steam-guard/request
 * Usa a MESMA função que funciona no endpoint /api/steam/code
 */
export const requestSteamGuardCode = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Steam Guard code request received from /steam-guard page');
    
    // Usa a MESMA função que funciona no catálogo
    const code = await findSteamCode();
    const searchTime = Date.now() - startTime;
    
    logger.info(`Código encontrado: ${code} em ${searchTime}ms`);
    
    // Retorna o código REAL encontrado
    res.json({
      code,
      message: 'Código Steam Guard encontrado!',
      searchTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const searchTime = Date.now() - startTime;
    
    logger.error(`Error in requestSteamGuardCode: ${error.message}`);
    res.status(500).json({ 
      error: error.message || 'Erro ao buscar código Steam Guard. Verifique se há um email recente do Steam.' 
    });
  }
};
