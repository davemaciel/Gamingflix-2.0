import { useEffect, useState } from 'react';
import { categoriesApi, gamesApi, streamingApi } from '@/lib/api';
import { Category } from '@/types/category';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Layers, ListOrdered } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export const CategoriesManagement = () => {
    const { toast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [showItemsDialog, setShowItemsDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        slug: '',
        description: '',
        type: 'manual' as 'manual' | 'auto_latest' | 'auto_popular',
        content_type: 'mixed' as 'games' | 'streaming' | 'mixed',
        icon: '',
        color: '#3b82f6',
        max_items: 12,
    });

    // Items management
    const [categoryItems, setCategoryItems] = useState<any[]>([]);
    const [availableGames, setAvailableGames] = useState<any[]>([]);
    const [availableStreamings, setAvailableStreamings] = useState<any[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchAvailableContent();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await categoriesApi.getAllCategories();
            setCategories(data);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao carregar categorias',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableContent = async () => {
        try {
            const [games, streamings] = await Promise.all([
                gamesApi.getAll(),
                streamingApi.getAllServices(),
            ]);
            setAvailableGames(games);
            setAvailableStreamings(streamings);
        } catch (error) {
            console.error('Error fetching content:', error);
        }
    };

    const openCreateDialog = () => {
        setEditingCategory(null);
        setCategoryForm({
            name: '',
            slug: '',
            description: '',
            type: 'manual',
            content_type: 'mixed',
            icon: '',
            color: '#3b82f6',
            max_items: 12,
        });
        setShowDialog(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            type: category.type,
            content_type: category.content_type,
            icon: category.icon || '',
            color: category.color || '#3b82f6',
            max_items: category.max_items || 12,
        });
        setShowDialog(true);
    };

    const handleSaveCategory = async () => {
        try {
            if (editingCategory) {
                await categoriesApi.updateCategory(editingCategory.id, categoryForm);
                toast({ title: 'Sucesso', description: 'Categoria atualizada' });
            } else {
                await categoriesApi.createCategory(categoryForm);
                toast({ title: 'Sucesso', description: 'Categoria criada' });
            }
            setShowDialog(false);
            fetchCategories();
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao salvar categoria',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

        try {
            await categoriesApi.deleteCategory(id);
            toast({ title: 'Sucesso', description: 'Categoria excluída' });
            fetchCategories();
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao excluir categoria',
                variant: 'destructive',
            });
        }
    };

    const handleToggleActive = async (category: Category) => {
        try {
            await categoriesApi.updateCategory(category.id, {
                is_active: !category.is_active,
            });
            fetchCategories();
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao atualizar categoria',
                variant: 'destructive',
            });
        }
    };

    const openItemsManager = async (category: Category) => {
        setSelectedCategory(category);
        setLoadingItems(true);
        setShowItemsDialog(true);

        try {
            const data = await categoriesApi.getCategoryItems(category.id);
            setCategoryItems(data.items || []);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao carregar itens da categoria',
                variant: 'destructive',
            });
        } finally {
            setLoadingItems(false);
        }
    };

    const handleAddItem = async (itemId: string, itemType: 'game' | 'streaming') => {
        if (!selectedCategory) return;

        try {
            await categoriesApi.addItemToCategory(selectedCategory.id, {
                item_id: itemId,
                item_type: itemType,
            });
            toast({ title: 'Sucesso', description: 'Item adicionado à categoria' });
            
            // Recarregar itens
            const data = await categoriesApi.getCategoryItems(selectedCategory.id);
            setCategoryItems(data.items || []);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao adicionar item',
                variant: 'destructive',
            });
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        if (!selectedCategory) return;

        try {
            await categoriesApi.removeItemFromCategory(selectedCategory.id, itemId);
            toast({ title: 'Sucesso', description: 'Item removido da categoria' });
            
            const data = await categoriesApi.getCategoryItems(selectedCategory.id);
            setCategoryItems(data.items || []);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao remover item',
                variant: 'destructive',
            });
        }
    };

    const getTypeLabel = (type: string) => {
        const labels = {
            manual: 'Manual',
            auto_latest: 'Últimas Adições',
            auto_popular: 'Populares',
        };
        return labels[type as keyof typeof labels] || type;
    };

    const getContentTypeLabel = (type: string) => {
        const labels = {
            games: 'Jogos',
            streaming: 'Streamings',
            mixed: 'Misto',
        };
        return labels[type as keyof typeof labels] || type;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Layers className="h-6 w-6" />
                        Gerenciamento de Categorias
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Crie e organize categorias para jogos e streamings
                    </p>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Categoria
                </Button>
            </div>

            <div className="grid gap-4">
                {categories.map((category) => (
                    <Card key={category.id} className={!category.is_active ? 'opacity-60' : ''}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                
                                {category.color && (
                                    <div
                                        className="w-4 h-4 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: category.color }}
                                    />
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{category.name}</h3>
                                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                            {getTypeLabel(category.type)}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                                            {getContentTypeLabel(category.content_type)}
                                        </span>
                                    </div>
                                    {category.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {category.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Slug: {category.slug} • Ordem: {category.order}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openItemsManager(category)}
                                    >
                                        <ListOrdered className="h-4 w-4 mr-2" />
                                        Itens
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleToggleActive(category)}
                                    >
                                        {category.is_active ? (
                                            <Eye className="h-4 w-4" />
                                        ) : (
                                            <EyeOff className="h-4 w-4" />
                                        )}
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => openEditDialog(category)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteCategory(category.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {categories.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                Nenhuma categoria criada ainda. Clique em "Nova Categoria" para começar.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Dialog de Criar/Editar Categoria */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome *</Label>
                                <Input
                                    id="name"
                                    value={categoryForm.name}
                                    onChange={(e) =>
                                        setCategoryForm({ ...categoryForm, name: e.target.value })
                                    }
                                    placeholder="Ex: Ação e Aventura"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    value={categoryForm.slug}
                                    onChange={(e) =>
                                        setCategoryForm({ ...categoryForm, slug: e.target.value })
                                    }
                                    placeholder="Ex: acao-aventura"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={categoryForm.description}
                                onChange={(e) =>
                                    setCategoryForm({ ...categoryForm, description: e.target.value })
                                }
                                placeholder="Descreva a categoria..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Tipo de Categoria</Label>
                                <select
                                    id="type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={categoryForm.type}
                                    onChange={(e) =>
                                        setCategoryForm({
                                            ...categoryForm,
                                            type: e.target.value as any,
                                        })
                                    }
                                >
                                    <option value="manual">Manual</option>
                                    <option value="auto_latest">Últimas Adições (Auto)</option>
                                    <option value="auto_popular">Populares (Auto)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content_type">Tipo de Conteúdo</Label>
                                <select
                                    id="content_type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={categoryForm.content_type}
                                    onChange={(e) =>
                                        setCategoryForm({
                                            ...categoryForm,
                                            content_type: e.target.value as any,
                                        })
                                    }
                                >
                                    <option value="mixed">Misto (Jogos + Streamings)</option>
                                    <option value="games">Apenas Jogos</option>
                                    <option value="streaming">Apenas Streamings</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="color">Cor do Tema</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={categoryForm.color}
                                        onChange={(e) =>
                                            setCategoryForm({ ...categoryForm, color: e.target.value })
                                        }
                                        className="w-20 h-10"
                                    />
                                    <Input
                                        value={categoryForm.color}
                                        onChange={(e) =>
                                            setCategoryForm({ ...categoryForm, color: e.target.value })
                                        }
                                        placeholder="#3b82f6"
                                    />
                                </div>
                            </div>

                            {categoryForm.type !== 'manual' && (
                                <div className="space-y-2">
                                    <Label htmlFor="max_items">Máximo de Itens</Label>
                                    <Input
                                        id="max_items"
                                        type="number"
                                        min="4"
                                        max="24"
                                        value={categoryForm.max_items}
                                        onChange={(e) =>
                                            setCategoryForm({
                                                ...categoryForm,
                                                max_items: parseInt(e.target.value) || 12,
                                            })
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveCategory}>
                                {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog de Gerenciar Itens */}
            <Dialog open={showItemsDialog} onOpenChange={setShowItemsDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Gerenciar Itens - {selectedCategory?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {loadingItems ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : selectedCategory?.type === 'manual' ? (
                        <div className="space-y-6">
                            {/* Itens Atuais */}
                            <div>
                                <h3 className="font-semibold mb-3">Itens na Categoria ({categoryItems.length})</h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {categoryItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                            <img
                                                src={item.cover_url}
                                                alt={item.title}
                                                className="w-12 h-12 rounded object-cover"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">{item.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.item_type === 'game' ? 'Jogo' : 'Streaming'}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleRemoveItem(item.item_id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {categoryItems.length === 0 && (
                                        <p className="text-center text-muted-foreground py-4">
                                            Nenhum item adicionado ainda
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Adicionar Jogos */}
                            {(selectedCategory.content_type === 'games' || selectedCategory.content_type === 'mixed') && (
                                <div>
                                    <h3 className="font-semibold mb-3">Adicionar Jogos</h3>
                                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                        {availableGames.map((game) => (
                                            <button
                                                key={game.id}
                                                onClick={() => handleAddItem(game.id, 'game')}
                                                className="p-2 border rounded hover:border-primary transition-colors text-left"
                                                disabled={categoryItems.some(i => i.item_id === game.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={game.cover_url}
                                                        alt={game.title}
                                                        className="w-8 h-8 rounded object-cover"
                                                    />
                                                    <span className="text-sm truncate">{game.title}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Adicionar Streamings */}
                            {(selectedCategory.content_type === 'streaming' || selectedCategory.content_type === 'mixed') && (
                                <div>
                                    <h3 className="font-semibold mb-3">Adicionar Streamings</h3>
                                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                        {availableStreamings.map((streaming) => (
                                            <button
                                                key={streaming.id}
                                                onClick={() => handleAddItem(streaming.id, 'streaming')}
                                                className="p-2 border rounded hover:border-primary transition-colors text-left"
                                                disabled={categoryItems.some(i => i.item_id === streaming.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={streaming.logo_url}
                                                        alt={streaming.name}
                                                        className="w-8 h-8 rounded object-contain"
                                                    />
                                                    <span className="text-sm truncate">{streaming.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                Esta é uma categoria automática. Os itens são gerenciados automaticamente pelo sistema.
                            </p>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {categoryItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                        <img
                                            src={item.cover_url}
                                            alt={item.title}
                                            className="w-12 h-12 rounded object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.item_type === 'game' ? 'Jogo' : 'Streaming'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
