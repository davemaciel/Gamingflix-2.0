import crypto from 'crypto';
import { collections } from '../config/database.js';
import { logger } from '../utils/logger.js';

// --- Configurações Globais ---

export const getGlobalSettings = async (req, res) => {
    try {
        let settings = await collections.globalSettings().findOne({ id: 'global' });
        
        // Se não existir, criar com valores padrão
        if (!settings) {
            settings = {
                id: 'global',
                show_latest_additions: true,
                latest_additions_limit: 12,
                show_popular: false,
                hero_type: 'carousel',
                theme_mode: 'dark',
                updated_at: new Date()
            };
            await collections.globalSettings().insertOne(settings);
        }
        
        res.json(settings);
    } catch (error) {
        logger.error('Error fetching global settings:', error);
        res.status(500).json({ error: 'Erro ao buscar configurações globais' });
    }
};

export const updateGlobalSettings = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updated_at: new Date()
        };
        
        delete updateData.id;
        delete updateData._id;
        
        const result = await collections.globalSettings().findOneAndUpdate(
            { id: 'global' },
            { $set: updateData },
            { returnDocument: 'after', upsert: true }
        );
        
        logger.info('Global settings updated');
        res.json(result);
    } catch (error) {
        logger.error('Error updating global settings:', error);
        res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
};

// --- Categorias ---

export const getAllCategories = async (req, res) => {
    try {
        const categories = await collections.categories()
            .find({})
            .sort({ order: 1, name: 1 })
            .toArray();
        
        res.json(categories);
    } catch (error) {
        logger.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
};

export const getActiveCategories = async (req, res) => {
    try {
        const categories = await collections.categories()
            .find({ is_active: true })
            .sort({ order: 1 })
            .toArray();
        
        res.json(categories);
    } catch (error) {
        logger.error('Error fetching active categories:', error);
        res.status(500).json({ error: 'Erro ao buscar categorias ativas' });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await collections.categories().findOne({ id });
        
        if (!category) {
            return res.status(404).json({ error: 'Categoria não encontrada' });
        }
        
        res.json(category);
    } catch (error) {
        logger.error('Error fetching category:', error);
        res.status(500).json({ error: 'Erro ao buscar categoria' });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, slug, description, type, content_type, icon, color, max_items } = req.body;
        
        // Verificar se slug já existe
        const existing = await collections.categories().findOne({ slug });
        if (existing) {
            return res.status(400).json({ error: 'Já existe uma categoria com este slug' });
        }
        
        // Buscar maior ordem para colocar no final
        const categories = await collections.categories().find({}).sort({ order: -1 }).limit(1).toArray();
        const maxOrder = categories.length > 0 ? categories[0].order : 0;
        
        const categoryData = {
            id: crypto.randomUUID(),
            name,
            slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
            description: description || '',
            type: type || 'manual',
            content_type: content_type || 'mixed',
            is_active: true,
            order: maxOrder + 1,
            icon: icon || null,
            color: color || null,
            max_items: max_items || null,
            created_at: new Date(),
            updated_at: new Date()
        };
        
        await collections.categories().insertOne(categoryData);
        logger.info(`Category created: ${categoryData.name}`);
        res.status(201).json(categoryData);
    } catch (error) {
        logger.error('Error creating category:', error);
        res.status(500).json({ error: 'Erro ao criar categoria' });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updated_at: new Date()
        };
        
        delete updateData.id;
        delete updateData._id;
        delete updateData.created_at;
        
        const result = await collections.categories().findOneAndUpdate(
            { id },
            { $set: updateData },
            { returnDocument: 'after' }
        );
        
        if (!result) {
            return res.status(404).json({ error: 'Categoria não encontrada' });
        }
        
        logger.info(`Category updated: ${id}`);
        res.json(result);
    } catch (error) {
        logger.error('Error updating category:', error);
        res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Remover categoria
        await collections.categories().deleteOne({ id });
        
        // Remover itens da categoria
        await collections.categoryItems().deleteMany({ category_id: id });
        
        logger.info(`Category deleted: ${id}`);
        res.json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
        logger.error('Error deleting category:', error);
        res.status(500).json({ error: 'Erro ao excluir categoria' });
    }
};

export const reorderCategories = async (req, res) => {
    try {
        const { categories } = req.body; // Array de { id, order }
        
        const bulkOps = categories.map(({ id, order }) => ({
            updateOne: {
                filter: { id },
                update: { $set: { order, updated_at: new Date() } }
            }
        }));
        
        await collections.categories().bulkWrite(bulkOps);
        
        logger.info('Categories reordered');
        res.json({ message: 'Ordem atualizada com sucesso' });
    } catch (error) {
        logger.error('Error reordering categories:', error);
        res.status(500).json({ error: 'Erro ao reordenar categorias' });
    }
};

// --- Itens da Categoria ---

export const getCategoryItems = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        const category = await collections.categories().findOne({ id: categoryId });
        if (!category) {
            return res.status(404).json({ error: 'Categoria não encontrada' });
        }
        
        let items = [];
        
        // Se for categoria automática de últimas adições
        if (category.type === 'auto_latest') {
            const limit = category.max_items || 12;
            
            // Buscar jogos e streamings recentes
            const recentGames = await collections.games()
                .find({})
                .sort({ created_at: -1 })
                .limit(limit)
                .toArray();
            
            const recentStreamings = await collections.streamingServices()
                .find({})
                .sort({ created_at: -1 })
                .limit(limit)
                .toArray();
            
            // Combinar e ordenar por data
            const allItems = [
                ...recentGames.map(g => ({ ...g, item_type: 'game', date: g.created_at })),
                ...recentStreamings.map(s => ({ ...s, item_type: 'streaming', date: s.created_at }))
            ];
            
            items = allItems
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, limit)
                .map((item, index) => ({
                    id: crypto.randomUUID(),
                    item_id: item.id,
                    item_type: item.item_type,
                    order: index,
                    title: item.title || item.name,
                    cover_url: item.cover_url || item.logo_url,
                    description: item.description
                }));
        } else {
            // Categoria manual - buscar itens vinculados
            const categoryItems = await collections.categoryItems()
                .find({ category_id: categoryId })
                .sort({ order: 1 })
                .toArray();
            
            // Enriquecer com dados dos itens
            items = await Promise.all(categoryItems.map(async (ci) => {
                let itemData = null;
                
                if (ci.item_type === 'game') {
                    itemData = await collections.games().findOne({ id: ci.item_id });
                } else {
                    itemData = await collections.streamingServices().findOne({ id: ci.item_id });
                }
                
                return {
                    id: ci.id,
                    item_id: ci.item_id,
                    item_type: ci.item_type,
                    order: ci.order,
                    title: itemData?.title || itemData?.name || 'Desconhecido',
                    cover_url: itemData?.cover_url || itemData?.logo_url,
                    description: itemData?.description
                };
            }));
        }
        
        res.json({
            category,
            items
        });
    } catch (error) {
        logger.error('Error fetching category items:', error);
        res.status(500).json({ error: 'Erro ao buscar itens da categoria' });
    }
};

export const addItemToCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { item_id, item_type } = req.body;
        
        // Verificar se já existe
        const existing = await collections.categoryItems().findOne({
            category_id: categoryId,
            item_id
        });
        
        if (existing) {
            return res.status(400).json({ error: 'Item já está nesta categoria' });
        }
        
        // Buscar maior ordem
        const items = await collections.categoryItems()
            .find({ category_id: categoryId })
            .sort({ order: -1 })
            .limit(1)
            .toArray();
        const maxOrder = items.length > 0 ? items[0].order : 0;
        
        const itemData = {
            id: crypto.randomUUID(),
            category_id: categoryId,
            item_id,
            item_type,
            order: maxOrder + 1,
            added_at: new Date()
        };
        
        await collections.categoryItems().insertOne(itemData);
        logger.info(`Item added to category ${categoryId}`);
        res.status(201).json(itemData);
    } catch (error) {
        logger.error('Error adding item to category:', error);
        res.status(500).json({ error: 'Erro ao adicionar item à categoria' });
    }
};

export const removeItemFromCategory = async (req, res) => {
    try {
        const { categoryId, itemId } = req.params;
        
        await collections.categoryItems().deleteOne({
            category_id: categoryId,
            item_id: itemId
        });
        
        logger.info(`Item removed from category ${categoryId}`);
        res.json({ message: 'Item removido da categoria' });
    } catch (error) {
        logger.error('Error removing item from category:', error);
        res.status(500).json({ error: 'Erro ao remover item da categoria' });
    }
};

export const reorderCategoryItems = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { items } = req.body; // Array de { item_id, order }
        
        const bulkOps = items.map(({ item_id, order }) => ({
            updateOne: {
                filter: { category_id: categoryId, item_id },
                update: { $set: { order } }
            }
        }));
        
        await collections.categoryItems().bulkWrite(bulkOps);
        
        logger.info(`Category items reordered for ${categoryId}`);
        res.json({ message: 'Ordem dos itens atualizada' });
    } catch (error) {
        logger.error('Error reordering category items:', error);
        res.status(500).json({ error: 'Erro ao reordenar itens' });
    }
};
