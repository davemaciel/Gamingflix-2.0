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
    assignProfile
} from '../controllers/streaming.controller.js';

const router = express.Router();

// Public/Auth (Services List)
router.get('/services', getAllServices);
router.get('/services/:id', authenticateToken, getServiceById);

// User Actions
router.get('/services/:serviceId/my-profile', authenticateToken, getMyProfileForService);
router.post('/assign', authenticateToken, assignProfile);

// Admin Actions
router.post('/services', authenticateToken, requireAdmin, createService);
router.put('/services/:id', authenticateToken, requireAdmin, updateService);
router.delete('/services/:id', authenticateToken, requireAdmin, deleteService);

router.post('/accounts', authenticateToken, requireAdmin, createAccount);
router.get('/services/:serviceId/accounts', authenticateToken, requireAdmin, getAccountsByService);

export default router;
