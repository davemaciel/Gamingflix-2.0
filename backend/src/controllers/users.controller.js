import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { collections } from '../config/database.js';
import { logger } from '../utils/logger.js';
import {
  sendSubscriptionCreatedEmail,
  sendSubscriptionCancelledEmail,
  sendSubscriptionRenewedEmail
} from '../services/subscription-emails.service.js';

// Listar todos os usuários (apenas admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await collections.profiles()
      .find({})
      .project({ password: 0 }) // Não retorna senha
      .sort({ created_at: -1 })
      .toArray();

    // Buscar role de cada usuário
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const role = await collections.userRoles().findOne({ user_id: user.id });
        const subscription = await collections.subscriptions().findOne({
          user_id: user.id,
          status: 'active'
        });

        return {
          ...user,
          role: role?.role || 'client',
          has_active_subscription: !!subscription,
          subscription_expires_at: subscription?.expires_at || null
        };
      })
    );

    logger.info(`Admin fetched ${usersWithRoles.length} users`);
    res.json(usersWithRoles);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

// Buscar usuário específico
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await collections.profiles().findOne(
      { id },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const role = await collections.userRoles().findOne({ user_id: id });
    const subscription = await collections.subscriptions().findOne({
      user_id: id,
      status: 'active'
    });

    res.json({
      ...user,
      role: role?.role || 'client',
      subscription
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

// Atualizar usuário (admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, whatsapp, is_founder } = req.body;

    const existingUser = await collections.profiles().findOne({ id });
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verifica se email já existe em outro usuário
    if (email && email !== existingUser.email) {
      const emailExists = await collections.profiles().findOne({ email });
      if (emailExists) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }

    const updateData = {
      updated_at: new Date()
    };

    if (email) updateData.email = email;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (is_founder !== undefined) updateData.is_founder = is_founder;

    const result = await collections.profiles().findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    logger.info(`User updated by admin: ${id}`);
    res.json({ ...result, password: undefined });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

// Atualizar role do usuário
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'client'].includes(role)) {
      return res.status(400).json({ error: 'Role inválida' });
    }

    const user = await collections.profiles().findOne({ id });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const existingRole = await collections.userRoles().findOne({ user_id: id });

    if (existingRole) {
      await collections.userRoles().updateOne(
        { user_id: id },
        { $set: { role, updated_at: new Date() } }
      );
    } else {
      await collections.userRoles().insertOne({
        id: crypto.randomUUID(),
        user_id: id,
        role,
        created_at: new Date()
      });
    }

    logger.info(`User role updated: ${id} -> ${role}`);
    res.json({ message: 'Role atualizada com sucesso', role });
  } catch (error) {
    logger.error('Error updating user role:', error);
    res.status(500).json({ error: 'Erro ao atualizar role' });
  }
};

// Deletar usuário
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se não é o próprio admin
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Você não pode deletar sua própria conta' });
    }

    const user = await collections.profiles().findOne({ id });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Deleta tudo relacionado ao usuário
    await collections.profiles().deleteOne({ id });
    await collections.userRoles().deleteMany({ user_id: id });
    await collections.subscriptions().deleteMany({ user_id: id });
    await collections.userGameSelections().deleteMany({ user_id: id });

    logger.info(`User deleted by admin: ${id} (${user.email})`);
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};

// Criar assinatura para usuário
export const createUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan_id, duration_months } = req.body;

    const user = await collections.profiles().findOne({ id });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const plan = await collections.subscriptionPlans().findOne({ id: plan_id });
    if (!plan) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    // Cancela assinatura ativa anterior
    await collections.subscriptions().updateMany(
      { user_id: id, status: 'active' },
      { $set: { status: 'cancelled', updated_at: new Date() } }
    );

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + (duration_months || 1));

    const subscription = {
      id: crypto.randomUUID(),
      user_id: id,
      plan_id,
      status: 'active',
      started_at: now,
      expires_at: expiresAt,
      created_at: now,
      updated_at: now
    };

    await collections.subscriptions().insertOne(subscription);

    logger.info(`Subscription created for user ${id}: plan ${plan_id}, expires ${expiresAt}`);

    // Envia email de boas-vindas
    await sendSubscriptionCreatedEmail(
      user.email,
      user.full_name || user.email,
      plan.name,
      expiresAt
    );

    res.status(201).json(subscription);
  } catch (error) {
    logger.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Erro ao criar assinatura' });
  }
};

// Cancelar assinatura de usuário
export const cancelUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // cancelamento ou payment_failed

    // Busca dados antes de cancelar para enviar email
    const subscription = await collections.subscriptions().findOne({
      user_id: id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Nenhuma assinatura ativa encontrada' });
    }

    const user = await collections.profiles().findOne({ id });
    const plan = await collections.subscriptionPlans().findOne({ id: subscription.plan_id });

    const result = await collections.subscriptions().updateMany(
      { user_id: id, status: 'active' },
      { $set: { status: 'cancelled', updated_at: new Date() } }
    );

    logger.info(`Subscription cancelled for user ${id}`);

    // Envia email de cancelamento
    if (user && plan) {
      await sendSubscriptionCancelledEmail(
        user.email,
        user.full_name || user.email,
        plan.name,
        reason || 'cancelamento'
      );
    }

    res.json({ message: 'Assinatura cancelada com sucesso' });
  } catch (error) {
    logger.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Erro ao cancelar assinatura' });
  }
};

// Renovar assinatura de usuário
export const renewUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration_months, duration_days, expiration_date } = req.body;

    const subscription = await collections.subscriptions().findOne({
      user_id: id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Assinatura ativa não encontrada' });
    }

    const currentExpires = new Date(subscription.expires_at);
    let newExpires;

    if (expiration_date) {
      // Define data específica
      newExpires = new Date(expiration_date);
      // Garante que é no futuro
      if (newExpires <= new Date()) {
        return res.status(400).json({ error: 'A nova data de expiração deve ser no futuro' });
      }
    } else if (duration_days) {
      // Adiciona dias
      newExpires = new Date(currentExpires);
      // Se já expirou, começa a contar de agora
      if (newExpires < new Date()) {
        newExpires = new Date();
      }
      newExpires.setDate(newExpires.getDate() + parseInt(duration_days));
    } else {
      // Padrão: Adiciona meses (ou 1 mês se nada for passado)
      newExpires = new Date(currentExpires);
      // Se já expirou, começa a contar de agora
      if (newExpires < new Date()) {
        newExpires = new Date();
      }
      newExpires.setMonth(newExpires.getMonth() + (parseInt(duration_months) || 1));
    }

    await collections.subscriptions().updateOne(
      { id: subscription.id },
      {
        $set: {
          expires_at: newExpires,
          updated_at: new Date(),
          // Reseta flags de notificação para enviar avisos novamente
          notified_7_days: false,
          notified_3_days: false
        }
      }
    );

    logger.info(`Subscription renewed for user ${id}: new expiration ${newExpires}`);

    // Envia email de renovação
    const user = await collections.profiles().findOne({ id });
    const plan = await collections.subscriptionPlans().findOne({ id: subscription.plan_id });

    if (user && plan) {
      await sendSubscriptionRenewedEmail(
        user.email,
        user.full_name || user.email,
        plan.name,
        newExpires
      );
    }

    res.json({ message: 'Assinatura renovada com sucesso', expires_at: newExpires });
  } catch (error) {
    logger.error('Error renewing subscription:', error);
    res.status(500).json({ error: 'Erro ao renovar assinatura' });
  }
};

// Atribuir streaming para usuário (Admin)
export const assignStreamingToUser = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ error: 'serviceId é obrigatório' });
    }

    // Verifica se usuário existe
    const user = await collections.profiles().findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verifica se o serviço existe
    const service = await collections.streamingServices().findOne({ id: serviceId });
    if (!service) {
      return res.status(404).json({ error: 'Serviço de streaming não encontrado' });
    }

    // Verifica se o usuário já tem um perfil para este serviço
    const existingProfile = await collections.streamingProfiles().findOne({
      service_id: serviceId,
      assigned_to: userId
    });

    if (existingProfile) {
      return res.status(400).json({ error: 'Usuário já possui um perfil para este serviço' });
    }

    // Busca um perfil disponível
    const assignedProfile = await collections.streamingProfiles().findOneAndUpdate(
      {
        service_id: serviceId,
        status: 'available'
      },
      {
        $set: {
          status: 'assigned',
          assigned_to: userId,
          assigned_at: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!assignedProfile) {
      return res.status(404).json({ error: 'Nenhum perfil disponível no momento para este serviço' });
    }

    logger.info(`Admin assigned streaming profile ${assignedProfile.id} (${service.name}) to user ${userId}`);
    res.json({
      message: 'Perfil de streaming atribuído com sucesso',
      profile: assignedProfile
    });
  } catch (error) {
    logger.error('Error assigning streaming to user:', error);
    res.status(500).json({ error: 'Erro ao atribuir streaming' });
  }
};

// Login as User (Impersonation) - Admin only
export const loginAsUser = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const adminId = req.user.id;

    // Busca o usuário alvo
    const targetUser = await collections.profiles().findOne(
      { id: targetUserId },
      { projection: { password: 0 } }
    );

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Busca role do usuário
    const userRole = await collections.userRoles().findOne({ user_id: targetUserId });

    // Gera token JWT para o usuário alvo
    const token = jwt.sign(
      {
        id: targetUser.id,
        email: targetUser.email,
        role: userRole?.role || 'client'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`Admin ${adminId} logged in as user ${targetUserId} (${targetUser.email})`);

    res.json({
      user: {
        ...targetUser,
        role: userRole?.role || 'client'
      },
      token
    });
  } catch (error) {
    logger.error('Error in loginAsUser:', error);
    res.status(500).json({ error: 'Erro ao fazer login como usuário' });
  }
};
