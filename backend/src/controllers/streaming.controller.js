import crypto from 'crypto';
import { collections } from '../config/database.js';
import { logger } from '../utils/logger.js';

// --- Services ---

export const getAllServices = async (req, res) => {
    try {
        const services = await collections.streamingServices().find({}).sort({ name: 1 }).toArray();
        res.json(services);
    } catch (error) {
        logger.error('Error fetching streaming services:', error);
        res.status(500).json({ error: 'Erro ao buscar serviços de streaming' });
    }
};

export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await collections.streamingServices().findOne({ id });
        if (!service) {
            return res.status(404).json({ error: 'Serviço não encontrado' });
        }
        res.json(service);
    } catch (error) {
        logger.error('Error fetching service:', error);
        res.status(500).json({ error: 'Erro ao buscar serviço' });
    }
};

export const createService = async (req, res) => {
    try {
        const serviceData = {
            id: crypto.randomUUID(),
            ...req.body,
            created_at: new Date(),
            updated_at: new Date()
        };

        await collections.streamingServices().insertOne(serviceData);
        logger.info(`Streaming service created: ${serviceData.name}`);
        res.status(201).json(serviceData);
    } catch (error) {
        logger.error('Error creating service:', error);
        res.status(500).json({ error: 'Erro ao criar serviço' });
    }
};

export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, updated_at: new Date() };
        delete updateData.id;
        delete updateData._id;
        delete updateData.created_at;

        const result = await collections.streamingServices().findOneAndUpdate(
            { id },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Serviço não encontrado' });
        }
        res.json(result);
    } catch (error) {
        logger.error('Error updating service:', error);
        res.status(500).json({ error: 'Erro ao atualizar serviço' });
    }
};

export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        // Check for dependencies before delete? For now, just delete.
        await collections.streamingServices().deleteOne({ id });
        // Optionally delete accounts and profiles linked to this service
        res.json({ message: 'Serviço excluído com sucesso' });
    } catch (error) {
        logger.error('Error deleting service:', error);
        res.status(500).json({ error: 'Erro ao excluir serviço' });
    }
};

// --- Accounts & Profiles (Admin) ---

export const createAccount = async (req, res) => {
    try {
        const { service_id, email, password, profiles } = req.body;

        if (!service_id || !email || !password) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        const accountId = crypto.randomUUID();
        const accountData = {
            id: accountId,
            service_id,
            email,
            password, // In a real app, encrypt this!
            created_at: new Date()
        };

        await collections.streamingAccounts().insertOne(accountData);

        // Create profiles if provided
        if (profiles && Array.isArray(profiles)) {
            const profileDocs = profiles.map(p => ({
                id: crypto.randomUUID(),
                account_id: accountId,
                service_id, // Denormalized for easier querying
                profile_name: p.name || p.profile_name, // Nome do perfil (user1, user2, etc)
                email: email, // Email da conta (denormalizado para facilitar exibição)
                password: password, // Senha da conta (denormalizado)
                pin: p.pin,
                status: 'available',
                assigned_to: null,
                assigned_at: null,
                created_at: new Date()
            }));

            if (profileDocs.length > 0) {
                await collections.streamingProfiles().insertMany(profileDocs);
            }
        }

        res.status(201).json(accountData);
    } catch (error) {
        logger.error('Error creating account:', error);
        res.status(500).json({ error: 'Erro ao criar conta' });
    }
};

export const getAccountsByService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const accounts = await collections.streamingAccounts().find({ service_id: serviceId }).toArray();

        // Fetch profiles for each account
        const accountsWithProfiles = await Promise.all(accounts.map(async (acc) => {
            const profiles = await collections.streamingProfiles().find({ account_id: acc.id }).toArray();
            return { ...acc, profiles };
        }));

        res.json(accountsWithProfiles);
    } catch (error) {
        logger.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Erro ao buscar contas' });
    }
};

// --- User Logic ---

export const getMyProfileForService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const userId = req.user.id; // From auth middleware

        // Find profile assigned to this user for this service
        const profile = await collections.streamingProfiles().findOne({
            service_id: serviceId,
            assigned_to: userId
        });

        if (!profile) {
            return res.status(404).json({ message: 'Nenhum perfil atribuído' });
        }

        // Get account details (email/pass)
        const account = await collections.streamingAccounts().findOne({ id: profile.account_id });

        res.json({
            profile,
            account: {
                email: account.email,
                password: account.password
            }
        });
    } catch (error) {
        logger.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Erro ao buscar perfil do usuário' });
    }
};

export const assignProfile = async (req, res) => {
    try {
        const { serviceId } = req.body;
        const userId = req.user.id;

        // 1. Check if user already has a profile
        const existingProfile = await collections.streamingProfiles().findOne({
            service_id: serviceId,
            assigned_to: userId
        });

        if (existingProfile) {
            return res.status(400).json({ error: 'Você já possui um perfil para este serviço' });
        }

        // 2. Find an available profile
        // Use findOneAndUpdate to atomically find and lock
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
            return res.status(404).json({ error: 'Nenhum perfil disponível no momento. Tente novamente mais tarde.' });
        }

        logger.info(`Profile assigned: ${assignedProfile.id} to user ${userId}`);
        res.json(assignedProfile);
    } catch (error) {
        logger.error('Error assigning profile:', error);
        res.status(500).json({ error: 'Erro ao atribuir perfil' });
    }
};

/**
 * Cancela/Desvincula o próprio perfil (User)
 */
export const cancelMyProfile = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const userId = req.user.id;

        // Buscar perfil atribuído ao usuário
        const profile = await collections.streamingProfiles().findOne({
            service_id: serviceId,
            assigned_to: userId
        });

        if (!profile) {
            return res.status(404).json({ error: 'Você não possui perfil ativo neste serviço' });
        }

        // Desatribuir o perfil
        await collections.streamingProfiles().updateOne(
            { id: profile.id },
            {
                $set: {
                    status: 'available',
                    assigned_to: null,
                    assigned_at: null
                }
            }
        );

        logger.info(`User ${userId} cancelled their profile ${profile.id} for service ${serviceId}`);
        res.json({ message: 'Perfil cancelado com sucesso' });
    } catch (error) {
        logger.error('Error cancelling user profile:', error);
        res.status(500).json({ error: 'Erro ao cancelar perfil' });
    }
};

// --- Admin: Gerenciamento de Atribuições ---

/**
 * Lista todos os perfis atribuídos com informações do usuário
 */
export const getAssignedProfiles = async (req, res) => {
    try {
        const { serviceId } = req.params;

        // Buscar perfis atribuídos para o serviço
        const assignedProfiles = await collections.streamingProfiles()
            .find({
                service_id: serviceId,
                assigned_to: { $exists: true, $ne: null }
            })
            .toArray();

        // Enriquecer com informações do usuário
        const profilesWithUsers = await Promise.all(
            assignedProfiles.map(async (profile) => {
                const user = await collections.profiles().findOne({ id: profile.assigned_to });
                
                // Calcular dias restantes (30 dias desde assigned_at)
                const assignedDate = new Date(profile.assigned_at);
                const expirationDate = new Date(assignedDate);
                expirationDate.setDate(expirationDate.getDate() + 30);
                
                const now = new Date();
                const daysRemaining = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
                const isExpired = daysRemaining <= 0;

                return {
                    ...profile,
                    user: user ? {
                        id: user.id,
                        email: user.email,
                        full_name: user.full_name
                    } : null,
                    assignment_info: {
                        assigned_at: profile.assigned_at,
                        expiration_date: expirationDate,
                        days_remaining: daysRemaining,
                        is_expired: isExpired
                    }
                };
            })
        );

        res.json(profilesWithUsers);
    } catch (error) {
        logger.error('Error fetching assigned profiles:', error);
        res.status(500).json({ error: 'Erro ao buscar perfis atribuídos' });
    }
};

/**
 * Desvincula um perfil manualmente (Admin)
 */
export const unassignProfile = async (req, res) => {
    try {
        const { profileId } = req.params;

        const profile = await collections.streamingProfiles().findOne({ id: profileId });

        if (!profile) {
            return res.status(404).json({ error: 'Perfil não encontrado' });
        }

        if (!profile.assigned_to) {
            return res.status(400).json({ error: 'Perfil não está atribuído' });
        }

        // Desatribuir o perfil
        await collections.streamingProfiles().updateOne(
            { id: profileId },
            {
                $set: {
                    status: 'available',
                    assigned_to: null,
                    assigned_at: null
                }
            }
        );

        logger.info(`Profile ${profileId} manually unassigned from user ${profile.assigned_to}`);
        res.json({ message: 'Perfil desvinculado com sucesso' });
    } catch (error) {
        logger.error('Error unassigning profile:', error);
        res.status(500).json({ error: 'Erro ao desvincular perfil' });
    }
};

/**
 * Verifica e remove atribuições expiradas (30 dias)
 * Esta função deve ser chamada por um cron job
 */
export const checkExpiredAssignments = async () => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Buscar perfis atribuídos há mais de 30 dias
        const expiredProfiles = await collections.streamingProfiles()
            .find({
                assigned_to: { $exists: true, $ne: null },
                assigned_at: { $lt: thirtyDaysAgo }
            })
            .toArray();

        if (expiredProfiles.length === 0) {
            logger.info('Nenhum perfil expirado encontrado');
            return { expired: 0 };
        }

        // Desatribuir perfis expirados
        const result = await collections.streamingProfiles().updateMany(
            {
                assigned_to: { $exists: true, $ne: null },
                assigned_at: { $lt: thirtyDaysAgo }
            },
            {
                $set: {
                    status: 'available',
                    assigned_to: null,
                    assigned_at: null
                }
            }
        );

        logger.info(`${result.modifiedCount} perfis expirados desvinculados automaticamente`);
        
        // Log cada perfil expirado
        expiredProfiles.forEach(profile => {
            logger.info(`Perfil expirado: ${profile.profile_name} (${profile.id}) - Usuário: ${profile.assigned_to}`);
        });

        return { expired: result.modifiedCount };
    } catch (error) {
        logger.error('Error checking expired assignments:', error);
        throw error;
    }
};

/**
 * Endpoint manual para verificar expirados (Admin pode chamar)
 */
export const runExpirationCheck = async (req, res) => {
    try {
        const result = await checkExpiredAssignments();
        res.json({
            message: 'Verificação de expiração executada',
            profiles_expired: result.expired
        });
    } catch (error) {
        logger.error('Error running expiration check:', error);
        res.status(500).json({ error: 'Erro ao verificar expirações' });
    }
};

/**
 * Atualiza informações de um perfil (nome e/ou PIN)
 */
export const updateProfile = async (req, res) => {
    try {
        const { profileId } = req.params;
        const { name, pin } = req.body;

        const profile = await collections.streamingProfiles().findOne({ id: profileId });

        if (!profile) {
            return res.status(404).json({ error: 'Perfil não encontrado' });
        }

        // Preparar dados de atualização
        const updateData = {};
        if (name !== undefined) {
            updateData.profile_name = name;
        }
        if (pin !== undefined) {
            updateData.pin = pin;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'Nenhum dado para atualizar' });
        }

        // Atualizar perfil
        const result = await collections.streamingProfiles().findOneAndUpdate(
            { id: profileId },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        logger.info(`Profile ${profileId} updated by admin`);
        res.json(result);
    } catch (error) {
        logger.error('Error updating profile:', error);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
};
