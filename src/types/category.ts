export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    type: 'manual' | 'auto_latest' | 'auto_popular';
    content_type: 'games' | 'streaming' | 'mixed'; // Jogos, Streamings ou Ambos
    is_active: boolean;
    order: number; // Ordem de exibição
    icon?: string; // Ícone da categoria
    color?: string; // Cor tema da categoria
    max_items?: number; // Limite de itens (para categorias auto)
    created_at: string;
    updated_at: string;
}

export interface CategoryItem {
    id: string;
    category_id: string;
    item_id: string; // ID do jogo ou streaming
    item_type: 'game' | 'streaming';
    order: number;
    added_at: string;
}

export interface CategoryWithItems extends Category {
    items: Array<{
        id: string;
        item_id: string;
        item_type: 'game' | 'streaming';
        order: number;
        // Dados do item
        title?: string;
        name?: string;
        cover_url?: string;
        logo_url?: string;
        description?: string;
    }>;
}

export interface GlobalSettings {
    id: string;
    show_latest_additions: boolean; // Mostrar categoria "Últimas Adições"
    latest_additions_limit: number; // Quantos itens mostrar
    show_popular: boolean; // Mostrar categoria "Populares"
    featured_category_id?: string; // Categoria em destaque no topo
    hero_type: 'carousel' | 'static' | 'video'; // Tipo de hero section
    hero_items?: string[]; // IDs de itens para o hero
    theme_mode: 'dark' | 'light' | 'auto';
    updated_at: string;
}
