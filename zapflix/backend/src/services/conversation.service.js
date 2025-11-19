import { collections } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { ObjectId } from 'mongodb';

class ConversationService {
  /**
   * Busca ou cria uma conversa
   */
  async findOrCreateConversation(clientPhone, clientName = null) {
    try {
      const conversations = collections.conversations();
      
      let conversation = await conversations.findOne({ clientPhone });

      if (!conversation) {
        logger.info('🆕 Criando nova conversa:', { clientPhone, clientName });
        
        const newConversation = {
          clientPhone,
          clientName: clientName || clientPhone,
          assignedTo: null,
          status: 'pending',
          lastMessage: null,
          lastMessageAt: new Date(),
          unreadCount: 0,
          createdAt: new Date(),
          metadata: {
            source: 'whatsapp',
            tags: []
          }
        };

        const result = await conversations.insertOne(newConversation);
        conversation = { _id: result.insertedId, ...newConversation };
      }

      return conversation;
    } catch (error) {
      logger.error('❌ Erro ao buscar/criar conversa:', error);
      throw error;
    }
  }

  /**
   * Lista todas as conversas
   */
  async listConversations(filters = {}) {
    try {
      const conversations = collections.conversations();
      const query = {};

      // Filtros
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.assignedTo) {
        query.assignedTo = filters.assignedTo;
      }

      if (filters.search) {
        query.$or = [
          { clientName: { $regex: filters.search, $options: 'i' } },
          { clientPhone: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const result = await conversations
        .find(query)
        .sort({ lastMessageAt: -1 })
        .limit(filters.limit || 100)
        .toArray();

      return result;
    } catch (error) {
      logger.error('❌ Erro ao listar conversas:', error);
      throw error;
    }
  }

  /**
   * Atribui conversa a um atendente
   */
  async assignConversation(conversationId, attendantId) {
    try {
      const conversations = collections.conversations();

      await conversations.updateOne(
        { _id: new ObjectId(conversationId) },
        { 
          $set: { 
            assignedTo: attendantId,
            status: 'active'
          } 
        }
      );

      logger.info('✅ Conversa atribuída:', { conversationId, attendantId });
    } catch (error) {
      logger.error('❌ Erro ao atribuir conversa:', error);
      throw error;
    }
  }

  /**
   * Atualiza status da conversa
   */
  async updateStatus(conversationId, status) {
    try {
      const conversations = collections.conversations();

      await conversations.updateOne(
        { _id: new ObjectId(conversationId) },
        { $set: { status } }
      );

      logger.info('✅ Status atualizado:', { conversationId, status });
    } catch (error) {
      logger.error('❌ Erro ao atualizar status:', error);
      throw error;
    }
  }

  /**
   * Atualiza última mensagem
   */
  async updateLastMessage(conversationId, message, incrementUnread = false) {
    try {
      const conversations = collections.conversations();
      const update = {
        $set: {
          lastMessage: message,
          lastMessageAt: new Date()
        }
      };

      if (incrementUnread) {
        update.$inc = { unreadCount: 1 };
      }

      await conversations.updateOne(
        { _id: new ObjectId(conversationId) },
        update
      );
    } catch (error) {
      logger.error('❌ Erro ao atualizar última mensagem:', error);
      throw error;
    }
  }

  /**
   * Zera contador de não lidas
   */
  async resetUnreadCount(conversationId) {
    try {
      const conversations = collections.conversations();

      await conversations.updateOne(
        { _id: new ObjectId(conversationId) },
        { $set: { unreadCount: 0 } }
      );
    } catch (error) {
      logger.error('❌ Erro ao resetar não lidas:', error);
      throw error;
    }
  }

  /**
   * Salva mensagem
   */
  async saveMessage(conversationId, messageData) {
    try {
      const messages = collections.messages();

      const message = {
        conversationId: new ObjectId(conversationId),
        from: messageData.from,
        type: messageData.type || 'text',
        content: messageData.content,
        timestamp: new Date(),
        status: messageData.status || 'sent',
        isInternal: messageData.isInternal || false,
        metadata: messageData.metadata || {}
      };

      const result = await messages.insertOne(message);
      
      // Atualiza última mensagem da conversa
      await this.updateLastMessage(
        conversationId, 
        messageData.content,
        messageData.from === 'client'
      );

      return { _id: result.insertedId, ...message };
    } catch (error) {
      logger.error('❌ Erro ao salvar mensagem:', error);
      throw error;
    }
  }

  /**
   * Lista mensagens de uma conversa
   */
  async listMessages(conversationId, limit = 50, skip = 0) {
    try {
      const messages = collections.messages();

      const result = await messages
        .find({ conversationId: new ObjectId(conversationId) })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return result.reverse(); // Retorna em ordem cronológica
    } catch (error) {
      logger.error('❌ Erro ao listar mensagens:', error);
      throw error;
    }
  }

  /**
   * Marca mensagens como lidas
   */
  async markMessagesAsRead(conversationId) {
    try {
      const messages = collections.messages();

      await messages.updateMany(
        { 
          conversationId: new ObjectId(conversationId),
          status: { $ne: 'read' },
          from: 'client'
        },
        { $set: { status: 'read' } }
      );

      await this.resetUnreadCount(conversationId);

      logger.info('✅ Mensagens marcadas como lidas:', { conversationId });
    } catch (error) {
      logger.error('❌ Erro ao marcar mensagens como lidas:', error);
      throw error;
    }
  }

  /**
   * Busca conversa por telefone
   */
  async findConversationByPhone(phone) {
    try {
      const conversations = collections.conversations();
      return await conversations.findOne({ clientPhone: phone });
    } catch (error) {
      logger.error('❌ Erro ao buscar conversa por telefone:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas
   */
  async getStats(attendantId = null) {
    try {
      const conversations = collections.conversations();
      const query = attendantId ? { assignedTo: attendantId } : {};

      const stats = {
        total: await conversations.countDocuments(query),
        active: await conversations.countDocuments({ ...query, status: 'active' }),
        pending: await conversations.countDocuments({ ...query, status: 'pending' }),
        resolved: await conversations.countDocuments({ ...query, status: 'resolved' })
      };

      return stats;
    } catch (error) {
      logger.error('❌ Erro ao obter estatísticas:', error);
      throw error;
    }
  }
}

export default new ConversationService();
