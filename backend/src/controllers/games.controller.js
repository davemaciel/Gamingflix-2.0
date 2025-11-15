import crypto from 'crypto';
import { collections } from '../config/database.js';
import { logger } from '../utils/logger.js';

export const getAllGames = async (req, res) => {
  try {
    const games = await collections.games().find({}).sort({ title: 1 }).toArray();
    res.json(games);
  } catch (error) {
    logger.error('Error fetching games:', error);
    res.status(500).json({ error: 'Erro ao buscar jogos' });
  }
};

export const getGameById = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await collections.games().findOne({ id });

    if (!game) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }

    res.json(game);
  } catch (error) {
    logger.error('Error fetching game:', error);
    res.status(500).json({ error: 'Erro ao buscar jogo' });
  }
};

export const createGame = async (req, res) => {
  try {
    const gameData = {
      id: crypto.randomUUID(),
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };

    await collections.games().insertOne(gameData);
    logger.info(`Game created: ${gameData.title}`);
    res.status(201).json(gameData);
  } catch (error) {
    logger.error('Error creating game:', error);
    res.status(500).json({ error: 'Erro ao criar jogo' });
  }
};

export const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Log para debug
    logger.info(`Attempting to update game with ID: ${id}`);
    logger.debug(`Update payload: ${JSON.stringify(req.body)}`);
    
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    // Remove campos que não devem ser atualizados
    delete updateData.id;
    delete updateData.created_at;
    delete updateData._id;

    // Primeiro verifica se o jogo existe
    const existingGame = await collections.games().findOne({ id });
    if (!existingGame) {
      logger.warn(`Game not found for update: ${id}`);
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }

    // Atualiza o jogo
    const result = await collections.games().findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      logger.error(`Update failed for game: ${id}`);
      return res.status(404).json({ error: 'Erro ao atualizar jogo' });
    }

    logger.info(`Game updated successfully: ${id} - ${result.title}`);
    logger.debug(`Updated game data: ${JSON.stringify(result)}`);
    
    res.json(result);
  } catch (error) {
    logger.error('Error updating game:', error);
    res.status(500).json({ error: 'Erro ao atualizar jogo', details: error.message });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await collections.games().deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }

    await collections.userGameSelections().deleteMany({ game_id: id });

    logger.info(`Game deleted: ${id}`);
    res.json({ message: 'Jogo excluído com sucesso' });
  } catch (error) {
    logger.error('Error deleting game:', error);
    res.status(500).json({ error: 'Erro ao excluir jogo' });
  }
};
