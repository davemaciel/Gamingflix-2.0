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
import { Category, CategoryWithItems, GlobalSettings } from '@/types/category';
import { Search } from 'lucide-react';

const CatalogNew = () => {
    const { user } = useAuth();
    const { hasCatalogAccess, loading: subscriptionLoading } = useSubscription();
    const [searchParams] = useSearchParams();
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryData, setCategoryData] = useState<Map<string, any[]>>(new Map());
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(null);
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
            // Fetch settings and categories in parallel
            const [settings, activeCategories] = await Promise.all([
                categoriesApi.getGlobalSettings(),
                categoriesApi.getActiveCategories(),
            ]);

            setGlobalSettings(settings);
            setCategories(activeCategories);

            // Fetch category items
            const categoryPromises = activeCategories.map(cat =>
                categoriesApi.getCategoryItems(cat.id)
            );
            const categoryResults = await Promise.all(categoryPromises);

            const dataMap = new Map();
            categoryResults.forEach((result, index) => {
                dataMap.set(activeCategories[index].id, result.items || []);
            });
            setCategoryData(dataMap);

            // Setup hero items (first 5 items from first category)
            if (categoryResults.length > 0 && categoryResults[0].items.length > 0) {
                setHeroItems(categoryResults[0].items.slice(0, 5));
            }

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
                    title="Carregando catálogo..."
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
                <div className="container mx-auto px-4 sm:px-6 md:px-12 py-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Search className="h-6 w-6" />
                            Resultados para "{searchQuery}"
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            {searchResults.length} {searchResults.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                        </p>
                    </div>

                    {isSearching ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                Nenhum resultado encontrado para "{searchQuery}"
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Main Catalog - Only show if not searching */}
            {!searchQuery && (
                <div className="space-y-8 pb-12">
                    {/* Hero Section */}
                    {heroItems.length > 0 && (
                        <HeroSection items={heroItems} autoPlay={true} interval={6000} />
                    )}

                    {/* Categories */}
                    <div className="space-y-8 mt-8">
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

                        {categories.length === 0 && (
                            <div className="container mx-auto px-4 sm:px-6 md:px-12 py-12 text-center">
                                <p className="text-muted-foreground">
                                    Nenhuma categoria disponível no momento.
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

export default CatalogNew;
