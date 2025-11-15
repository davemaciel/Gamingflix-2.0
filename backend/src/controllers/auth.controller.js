import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { collections } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { sendPasswordResetEmail, sendWelcomeEmail, sendPasswordChangedEmail } from '../config/email.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const signUp = async (req, res) => {
  try {
    const { email, password, full_name, whatsapp, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    if (!username) {
      return res.status(400).json({ error: 'Nome de usuário é obrigatório' });
    }

    const existingUser = await collections.profiles().findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const existingUsername = await collections.profiles().findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Nome de usuário já está em uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    const profile = {
      id: userId,
      email,
      password: hashedPassword,
      username,
      full_name: full_name || '',
      whatsapp: whatsapp || '',
      avatar_url: null,
      is_founder: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    await collections.profiles().insertOne(profile);
    await collections.userRoles().insertOne({
      id: crypto.randomUUID(),
      user_id: userId,
      role: 'client',
      created_at: new Date()
    });

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    logger.info(`New user registered: ${email}`);
    
    // Envia email de boas-vindas (não bloqueia o cadastro se falhar)
    sendWelcomeEmail(email, full_name).catch(err => {
      logger.error('Failed to send welcome email:', err);
    });

    res.status(201).json({
      user: {
        id: userId,
        email,
        username: profile.username,
        full_name: profile.full_name,
        whatsapp: profile.whatsapp,
        avatar_url: profile.avatar_url
      },
      token
    });
  } catch (error) {
    logger.error('Error in signUp:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await collections.profiles().findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const userRole = await collections.userRoles().findOne({ user_id: user.id });

    logger.info(`User logged in: ${email}`);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        whatsapp: user.whatsapp,
        avatar_url: user.avatar_url,
        role: userRole?.role || 'client'
      },
      token
    });
  } catch (error) {
    logger.error('Error in signIn:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await collections.profiles().findOne({ id: userId }, { projection: { password: 0 } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userRole = await collections.userRoles().findOne({ user_id: userId });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        whatsapp: user.whatsapp,
        avatar_url: user.avatar_url,
        is_founder: user.is_founder,
        role: userRole?.role || 'client',
        created_at: user.created_at
      }
    });
  } catch (error) {
    logger.error('Error in getMe:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
};

export const checkRole = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = await collections.userRoles().findOne({ user_id: userId, role: 'admin' });

    res.json({
      isAdmin: !!userRole
    });
  } catch (error) {
    logger.error('Error in checkRole:', error);
    res.status(500).json({ error: 'Erro ao verificar permissões' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const user = await collections.profiles().findOne({ email });
    
    if (!user) {
      return res.json({ message: 'Se o email existir, um link de recuperação será enviado' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await collections.profiles().updateOne(
      { email },
      { 
        $set: { 
          reset_token: resetToken, 
          reset_token_expiry: resetTokenExpiry 
        } 
      }
    );

    try {
      const emailSent = await sendPasswordResetEmail(email, resetToken, user.full_name);
      if (!emailSent) {
        logger.warn(`Failed to send reset email to ${email}. Token: ${resetToken}`);
      }
    } catch (emailError) {
      logger.error('Error sending email:', emailError);
      logger.warn(`Email not sent but token created. Token: ${resetToken}`);
    }

    logger.info(`Password reset requested for: ${email}`);

    res.json({ 
      message: 'Se o email existir, um link de recuperação será enviado',
      token: resetToken
    });
  } catch (error) {
    logger.error('Error in forgotPassword:', error);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token e senha são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    const user = await collections.profiles().findOne({ 
      reset_token: token,
      reset_token_expiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await collections.profiles().updateOne(
      { id: user.id },
      { 
        $set: { 
          password: hashedPassword,
          updated_at: new Date()
        },
        $unset: {
          reset_token: "",
          reset_token_expiry: ""
        }
      }
    );

    logger.info(`Password reset successfully for: ${user.email}`);

    // Envia email de confirmação de senha alterada
    sendPasswordChangedEmail(user.email, user.full_name).catch(err => {
      logger.error('Failed to send password changed email:', err);
    });

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    logger.error('Error in resetPassword:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
};

// Verifica disponibilidade de username
export const checkUsername = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || username.length < 3) {
      return res.status(400).json({ 
        available: false, 
        error: 'Username deve ter no mínimo 3 caracteres' 
      });
    }

    // Verifica se username já existe
    const existingUser = await collections.profiles().findOne({ username });

    res.json({
      available: !existingUser,
      username
    });
  } catch (error) {
    logger.error('Error in checkUsername:', error);
    res.status(500).json({ error: 'Erro ao verificar username' });
  }
};

// Atualiza perfil do usuário (username, avatar, etc)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, full_name, whatsapp, avatar_url } = req.body;

    const user = await collections.profiles().findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Se está mudando username, verifica se já existe
    if (username && username !== user.username) {
      const existingUsername = await collections.profiles().findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ error: 'Nome de usuário já está em uso' });
      }
    }

    const updateData = {
      updated_at: new Date()
    };

    if (username) updateData.username = username;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    await collections.profiles().updateOne(
      { id: userId },
      { $set: updateData }
    );

    const updatedUser = await collections.profiles().findOne(
      { id: userId },
      { projection: { password: 0 } }
    );

    logger.info(`Profile updated for user: ${userId}`);

    res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        full_name: updatedUser.full_name,
        whatsapp: updatedUser.whatsapp,
        avatar_url: updatedUser.avatar_url
      }
    });
  } catch (error) {
    logger.error('Error in updateProfile:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

// Troca de senha dentro do perfil
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });
    }

    const user = await collections.profiles().findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verifica senha atual
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await collections.profiles().updateOne(
      { id: userId },
      { 
        $set: { 
          password: hashedPassword,
          updated_at: new Date()
        }
      }
    );

    logger.info(`Password changed for user: ${userId}`);

    // Envia email de confirmação de senha alterada
    sendPasswordChangedEmail(user.email, user.full_name).catch(err => {
      logger.error('Failed to send password changed email:', err);
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    logger.error('Error in changePassword:', error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
};
