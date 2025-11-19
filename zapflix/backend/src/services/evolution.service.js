import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';

const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE = process.env.EVOLUTION_INSTANCE;

class EvolutionService {
  constructor() {
    this.baseUrl = `${EVOLUTION_URL}`;
    this.headers = {
      'apikey': EVOLUTION_KEY,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Envia mensagem de texto
   */
  async sendText(phone, message) {
    try {
      logger.info('📤 Enviando mensagem de texto:', { phone, preview: message.substring(0, 50) });

      const response = await fetch(`${this.baseUrl}/message/sendText/${INSTANCE}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          number: this.formatPhone(phone),
          text: message
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar mensagem');
      }

      logger.info('✅ Mensagem enviada com sucesso');
      return data;
    } catch (error) {
      logger.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Envia imagem
   */
  async sendImage(phone, imageUrl, caption = '') {
    try {
      logger.info('📤 Enviando imagem:', { phone, imageUrl });

      const response = await fetch(`${this.baseUrl}/message/sendMedia/${INSTANCE}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          number: this.formatPhone(phone),
          mediatype: 'image',
          media: imageUrl,
          caption
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar imagem');
      }

      logger.info('✅ Imagem enviada com sucesso');
      return data;
    } catch (error) {
      logger.error('❌ Erro ao enviar imagem:', error);
      throw error;
    }
  }

  /**
   * Envia áudio
   */
  async sendAudio(phone, audioUrl) {
    try {
      logger.info('📤 Enviando áudio:', { phone, audioUrl });

      const response = await fetch(`${this.baseUrl}/message/sendMedia/${INSTANCE}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          number: this.formatPhone(phone),
          mediatype: 'audio',
          media: audioUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar áudio');
      }

      logger.info('✅ Áudio enviado com sucesso');
      return data;
    } catch (error) {
      logger.error('❌ Erro ao enviar áudio:', error);
      throw error;
    }
  }

  /**
   * Envia documento
   */
  async sendDocument(phone, documentUrl, filename) {
    try {
      logger.info('📤 Enviando documento:', { phone, filename });

      const response = await fetch(`${this.baseUrl}/message/sendMedia/${INSTANCE}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          number: this.formatPhone(phone),
          mediatype: 'document',
          media: documentUrl,
          fileName: filename
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar documento');
      }

      logger.info('✅ Documento enviado com sucesso');
      return data;
    } catch (error) {
      logger.error('❌ Erro ao enviar documento:', error);
      throw error;
    }
  }

  /**
   * Marca mensagem como lida
   */
  async markAsRead(messageKey) {
    try {
      await fetch(`${this.baseUrl}/chat/markMessageAsRead/${INSTANCE}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          readMessages: [messageKey]
        })
      });

      logger.info('✅ Mensagem marcada como lida');
    } catch (error) {
      logger.error('❌ Erro ao marcar como lida:', error);
    }
  }

  /**
   * Obtém informações da instância
   */
  async getInstanceInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/instance/connectionState/${INSTANCE}`, {
        headers: this.headers
      });

      return await response.json();
    } catch (error) {
      logger.error('❌ Erro ao obter info da instância:', error);
      throw error;
    }
  }

  /**
   * Obtém QR Code para conectar WhatsApp
   */
  async getQRCode() {
    try {
      const response = await fetch(`${this.baseUrl}/instance/connect/${INSTANCE}`, {
        headers: this.headers
      });

      return await response.json();
    } catch (error) {
      logger.error('❌ Erro ao obter QR Code:', error);
      throw error;
    }
  }

  /**
   * Formata número de telefone
   * @param {string} phone - Número no formato +5511999999999 ou 5511999999999
   * @returns {string} - Número formatado para WhatsApp
   */
  formatPhone(phone) {
    // Remove todos os caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Adiciona código do país se não tiver
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Valida se o número é WhatsApp válido
   */
  async validatePhone(phone) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/whatsappNumbers/${INSTANCE}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          numbers: [this.formatPhone(phone)]
        })
      });

      const data = await response.json();
      return data.length > 0 && data[0].exists;
    } catch (error) {
      logger.error('❌ Erro ao validar número:', error);
      return false;
    }
  }
}

export default new EvolutionService();
