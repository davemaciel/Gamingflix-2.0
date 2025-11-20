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
                name: p.name,
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
