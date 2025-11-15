import crypto from 'crypto';
import { collections } from '../config/database.js';
import { logger } from '../utils/logger.js';

export const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();

    const subscription = await collections.subscriptions().findOne({
      user_id: userId,
      status: 'active',
      $or: [
        { expires_at: null },
        { expires_at: { $gt: currentDate } }
      ]
    });

    if (!subscription) {
      return res.json(null);
    }

    const plan = await collections.subscriptionPlans().findOne({ id: subscription.plan_id });

    res.json({
      ...subscription,
      plan
    });
  } catch (error) {
    logger.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Erro ao buscar assinatura' });
  }
};

export const getFounderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await collections.profiles().findOne({ id: userId });

    res.json({
      is_founder: profile?.is_founder || false
    });
  } catch (error) {
    logger.error('Error fetching founder status:', error);
    res.status(500).json({ error: 'Erro ao buscar status founder' });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const plans = await collections.subscriptionPlans().find({ is_active: true }).sort({ price: 1 }).toArray();
    res.json(plans);
  } catch (error) {
    logger.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Erro ao buscar planos' });
  }
};

export const getUserGameSelections = async (req, res) => {
  try {
    const userId = req.user.id;
    const selections = await collections.userGameSelections().find({ user_id: userId }).toArray();

    const gameIds = selections.map(s => s.game_id);
    const games = await collections.games().find({ id: { $in: gameIds } }).toArray();

    res.json(games);
  } catch (error) {
    logger.error('Error fetching game selections:', error);
    res.status(500).json({ error: 'Erro ao buscar jogos selecionados' });
  }
};

export const addGameSelection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { game_id } = req.body;

    const subscription = await collections.subscriptions().findOne({
      user_id: userId,
      status: 'active'
    });

    if (!subscription) {
      const profile = await collections.profiles().findOne({ id: userId });
      if (!profile?.is_founder) {
        return res.status(403).json({ error: 'Assinatura ativa necessária' });
      }
    }

    const existingSelection = await collections.userGameSelections().findOne({
      user_id: userId,
      game_id
    });

    if (existingSelection) {
      return res.status(400).json({ error: 'Jogo já selecionado' });
    }

    if (subscription) {
      const plan = await collections.subscriptionPlans().findOne({ id: subscription.plan_id });
      const currentSelections = await collections.userGameSelections().countDocuments({ user_id: userId });

      if (plan && plan.max_games < 999999 && currentSelections >= plan.max_games) {
        return res.status(400).json({ error: 'Limite de jogos atingido' });
      }
    }

    const selection = {
      id: crypto.randomUUID(),
      user_id: userId,
      game_id,
      selected_at: new Date()
    };

    await collections.userGameSelections().insertOne(selection);
    logger.info(`Game selection added: user ${userId}, game ${game_id}`);

    res.status(201).json(selection);
  } catch (error) {
    logger.error('Error adding game selection:', error);
    res.status(500).json({ error: 'Erro ao adicionar jogo' });
  }
};

export const removeGameSelection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { game_id } = req.params;

    const result = await collections.userGameSelections().deleteOne({
      user_id: userId,
      game_id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Seleção não encontrada' });
    }

    logger.info(`Game selection removed: user ${userId}, game ${game_id}`);
    res.json({ message: 'Jogo removido com sucesso' });
  } catch (error) {
    logger.error('Error removing game selection:', error);
    res.status(500).json({ error: 'Erro ao remover jogo' });
  }
};
