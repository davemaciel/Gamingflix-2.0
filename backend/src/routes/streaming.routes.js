import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/jwtAuth.js';
import {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    createAccount,
    getAccountsByService,
    getMyProfileForService,
    assignProfile,
    cancelMyProfile,
    getAssignedProfiles,
    unassignProfile,
    runExpirationCheck,
    updateProfile
} from '../controllers/streaming.controller.js';
import { handleStreamingPayment } from '../controllers/webhook-streaming.controller.js';

const router = express.Router();

// Webhooks (Public but secured by signature)
router.post('/webhook/payment', handleStreamingPayment);

// Public/Auth (Services List)
router.get('/services', getAllServices);
router.get('/services/:id', authenticateToken, getServiceById);

// User Actions
router.get('/services/:serviceId/my-profile', authenticateToken, getMyProfileForService);
router.post('/assign', authenticateToken, assignProfile);
router.delete('/services/:serviceId/cancel-my-profile', authenticateToken, cancelMyProfile);

// Admin Actions - Services
router.post('/services', authenticateToken, requireAdmin, createService);
router.put('/services/:id', authenticateToken, requireAdmin, updateService);
router.delete('/services/:id', authenticateToken, requireAdmin, deleteService);

// Admin Actions - Accounts
router.post('/accounts', authenticateToken, requireAdmin, createAccount);
router.get('/services/:serviceId/accounts', authenticateToken, requireAdmin, getAccountsByService);

// Admin Actions - Gerenciamento de Atribuições
router.get('/services/:serviceId/assigned-profiles', authenticateToken, requireAdmin, getAssignedProfiles);
router.delete('/profiles/:profileId/unassign', authenticateToken, requireAdmin, unassignProfile);
router.put('/profiles/:profileId', authenticateToken, requireAdmin, updateProfile);
router.post('/check-expirations', authenticateToken, requireAdmin, runExpirationCheck);

export default router;
