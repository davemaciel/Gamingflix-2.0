import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/jwtAuth.js';
import {
    getGlobalSettings,
    updateGlobalSettings,
    getAllCategories,
    getActiveCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    getCategoryItems,
    addItemToCategory,
    removeItemFromCategory,
    reorderCategoryItems
} from '../controllers/categories.controller.js';

const router = express.Router();

// --- Configurações Globais ---
router.get('/settings', getGlobalSettings);
router.put('/settings', authenticateToken, requireAdmin, updateGlobalSettings);

// --- Categorias (Public) ---
router.get('/active', getActiveCategories);
router.get('/:id/items', getCategoryItems);

// --- Categorias (Admin) ---
router.get('/', authenticateToken, requireAdmin, getAllCategories);
router.get('/:id', authenticateToken, requireAdmin, getCategoryById);
router.post('/', authenticateToken, requireAdmin, createCategory);
router.put('/:id', authenticateToken, requireAdmin, updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);
router.post('/reorder', authenticateToken, requireAdmin, reorderCategories);

// --- Itens da Categoria (Admin) ---
router.post('/:categoryId/items', authenticateToken, requireAdmin, addItemToCategory);
router.delete('/:categoryId/items/:itemId', authenticateToken, requireAdmin, removeItemFromCategory);
router.post('/:categoryId/items/reorder', authenticateToken, requireAdmin, reorderCategoryItems);

export default router;
