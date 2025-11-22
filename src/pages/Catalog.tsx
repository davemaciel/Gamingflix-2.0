import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { categoriesApi, gamesApi, streamingApi } from '@/lib/api';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { GameCard } from '@/components/GameCard';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { AuthDialog } from '@/components/AuthDialog';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Category } from '@/types/category';
import { Search, Sparkles } from 'lucide-react';

const Catalog = () => {
    const { user } = useAuth();
    const { hasCatalogAccess, loading: subscriptionLoading } = useSubscription();
    const [searchParams] = useSearchParams();
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryData, setCategoryData] = useState<Map<string, any[]>>(new Map());
    const [heroItems, setHeroItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    
    // Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const urlQuery = searchParams.get('q') || '';

    useEffect(() => {
        if (urlQuery) {
            setSearchQuery(urlQuery);
            handleSearch(urlQuery);
        }
    }, [urlQuery]);

    useEffect(() => {
        fetchData();
    }, []);

    // Check access after loading
    useEffect(() => {
        if (!loading && !subscriptionLoading) {
            const timer = setTimeout(() => {
                if (!user) {
                    setShowAuthDialog(true);
                } else if (!hasCatalogAccess) {
                    setShowUpgradeModal(true);
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [user, hasCatalogAccess, loading, subscriptionLoading]);

    const fetchData = async () => {
        try {
            // Fetch active categories
            const activeCategories = await categoriesApi.getActiveCategories();
            setCategories(activeCategories);

            // Fetch category items in parallel
            const categoryPromises = activeCategories.map(cat =>
                categoriesApi.getCategoryItems(cat.id)
            );
            const categoryResults = await Promise.all(categoryPromises);

            const dataMap = new Map();
            categoryResults.forEach((result, index) => {
                dataMap.set(activeCategories[index].id, result.items || []);
            });
            setCategoryData(dataMap);

            // Setup hero items - Get 5 random items from all categories
            const allItems: any[] = [];
            categoryResults.forEach(result => {
                if (result.items) {
                    allItems.push(...result.items);
                }
            });

            // Shuffle and take first 5 for hero
            const shuffled = allItems.sort(() => 0.5 - Math.random());
            setHeroItems(shuffled.slice(0, 5));

        } catch (error) {
            console.error('Error fetching catalog data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            // Search in games and streamings
            const [games, streamings] = await Promise.all([
                gamesApi.getAll(),
                streamingApi.getAllServices(),
            ]);

            const lowerQuery = query.toLowerCase();
            
            const gameResults = games
                .filter(g => g.title.toLowerCase().includes(lowerQuery))
                .map(g => ({ ...g, item_type: 'game', item_id: g.id }));
            
            const streamingResults = streamings
                .filter(s => s.name.toLowerCase().includes(lowerQuery))
                .map(s => ({ 
                    ...s, 
                    item_type: 'streaming', 
                    item_id: s.id, 
                    title: s.name, 
                    cover_url: s.logo_url 
                }));

            setSearchResults([...gameResults, ...streamingResults]);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <LoadingOverlay
                    open={loading}
                    title="Carregando catálogo premium..."
                    footerLabel="GamingFlix"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header 
                onSearch={handleSearch}
                initialQuery={searchQuery}
            />

            {/* Search Results */}
            {searchQuery && (
                <div className="container mx-auto px-4 sm:px-6 md:px-12 py-8 mt-16">
                    <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                            <Search className="h-7 w-7 text-primary" />
                            Resultados para "{searchQuery}"
                        </h2>
                        <p className="text-muted-foreground mt-2 text-lg">
                            {searchResults.length} {searchResults.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                        </p>
                    </div>

                    {isSearching ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {searchResults.map((item) => (
                                <GameCard
                                    key={item.id}
                                    game={item}
                                    user={user}
                                    hasCatalogAccess={hasCatalogAccess}
                                    subscriptionLoading={subscriptionLoading}
                                />
                            ))}
                        </div>
                    )}

                    {!isSearching && searchResults.length === 0 && (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                                <Search className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
                            <p className="text-muted-foreground">
                                Não encontramos nada para "{searchQuery}". Tente outro termo.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Main Catalog - Only show if not searching */}
            {!searchQuery && (
                <div className="space-y-0">
                    {/* Hero Section */}
                    {heroItems.length > 0 && (
                        <HeroSection items={heroItems} autoPlay={true} interval={6000} />
                    )}

                    {/* Categories Section */}
                    <div className="relative py-8 space-y-12">
                        {/* Featured Label */}
                        {categories.length > 0 && (
                            <div className="container mx-auto px-4 sm:px-6 md:px-12 mb-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold text-primary">
                                        Conteúdo Exclusivo
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Category Carousels */}
                        {categories.map((category) => {
                            const items = categoryData.get(category.id) || [];
                            if (items.length === 0) return null;

                            return (
                                <CategoryCarousel
                                    key={category.id}
                                    title={category.name}
                                    items={items}
                                    color={category.color}
                                />
                            );
                        })}

                        {/* Empty State */}
                        {categories.length === 0 && (
                            <div className="container mx-auto px-4 sm:px-6 md:px-12 py-20 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                                    <Sparkles className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Nenhuma categoria disponível</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    O catálogo está sendo organizado. Em breve teremos categorias incríveis para você explorar!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Auth Dialog */}
            <AuthDialog
                open={showAuthDialog}
                onOpenChange={setShowAuthDialog}
                redirectTo="/catalogo"
            />

            {/* Upgrade Modal */}
            <UpgradeModal
                open={showUpgradeModal}
                onOpenChange={setShowUpgradeModal}
            />
        </div>
    );
};

export default Catalog;
