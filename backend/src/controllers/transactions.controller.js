import { collections } from '../config/database.js';
import { logger } from '../utils/logger.js';

/**
 * Lista todas as transações com filtros opcionais
 */
export const getAllTransactions = async (req, res) => {
  try {
    const { status, email, limit = 50, offset = 0 } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (email) {
      filter.customer_email = { $regex: email, $options: 'i' };
    }

    const transactions = await collections.transactions()
      .find(filter)
      .sort({ created_at: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .toArray();

    const total = await collections.transactions().countDocuments(filter);

    res.json({
      transactions,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
};

/**
 * Obtém detalhes de uma transação específica
 */
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await collections.transactions().findOne({ id });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json(transaction);
  } catch (error) {
    logger.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Erro ao buscar transação' });
  }
};

/**
 * Obtém estatísticas de transações
 */
export const getTransactionsStats = async (req, res) => {
  try {
    const stats = await collections.transactions().aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total_amount: { $sum: '$amount' }
        }
      }
    ]).toArray();

    const formatted = {
      total: 0,
      paid: 0,
      pending: 0,
      failed: 0,
      refunded: 0,
      revenue: 0
    };

    stats.forEach(stat => {
      formatted.total += stat.count;
      if (stat._id === 'paid') {
        formatted.paid = stat.count;
        formatted.revenue = stat.total_amount || 0;
      } else if (stat._id === 'pending') {
        formatted.pending = stat.count;
      } else if (stat._id === 'failed') {
        formatted.failed = stat.count;
      } else if (stat._id === 'refunded') {
        formatted.refunded = stat.count;
      }
    });

    res.json(formatted);
  } catch (error) {
    logger.error('Error fetching transaction stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};
