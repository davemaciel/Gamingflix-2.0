import { sendWhatsAppMessage, getWhatsAppStatus } from '../services/whatsapp.js';
import { logger } from '../utils/logger.js';

/**
 * Envia uma mensagem com o código 2FA via WhatsApp
 * @param {Request} req - Requisição Express
 * @param {Response} res - Resposta Express
 */
export async function sendMessage(req, res) {
  try {
    const { phoneNumber, code } = req.body;
    
    if (!phoneNumber || !code) {
      return res.status(400).json({
        success: false,
        error: 'Número de telefone e código são obrigatórios'
      });
    }
    
    logger.info(`Enviando código ${code} para ${phoneNumber}`);
    
    const result = await sendWhatsAppMessage(phoneNumber, code);
    
    return res.status(200).json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      result
    });
  } catch (error) {
    logger.error(`Erro ao enviar mensagem: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Verifica o status da conexão com WhatsApp
 * @param {Request} req - Requisição Express
 * @param {Response} res - Resposta Express
 */
export async function getStatus(req, res) {
  try {
    const status = await getWhatsAppStatus();
    
    return res.status(200).json({
      success: true,
      status
    });
  } catch (error) {
    logger.error(`Erro ao verificar status do WhatsApp: ${error.message}`);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}