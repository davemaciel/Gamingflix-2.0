import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/hooks/useLanguage';
import { gamesApi } from '@/lib/api';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';
import { useToast } from '@/hooks/use-toast';
import { LoadingOverlay } from '@/components/LoadingOverlay';

interface Game {
  id: string;
  title: string;
  cover_url: string;
  description: string;
  gradient: string;
  created_at?: string;
}

const CATALOG_CACHE_TTL = 1000 * 60 * 5; // 5 minutos
let catalogCache: { games: Game[]; timestamp: number } | null = null;
let catalogPromise: Promise<Game[]> | null = null;

const Index = () => {
  const { user } = useAuth();
  const { hasCatalogAccess, loading: subscriptionLoading } = useSubscription();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const hydrateFromCache = () => {
      if (
        catalogCache &&
        Date.now() - catalogCache.timestamp < CATALOG_CACHE_TTL &&
        catalogCache.games.length > 0
      ) {
        setGames(catalogCache.games);
        setFilteredGames(catalogCache.games);
        setLoading(false);
        return true;
      }
      return false;
    };

    const fetchGames = async () => {
      try {
        const promise =
          catalogPromise ||
          (catalogPromise = gamesApi.getAll()
            .then((data) => {
              catalogPromise = null;
              const list = data ?? [];
              catalogCache = { games: list, timestamp: Date.now() };
              return list;
            }));

        const fetchedGames = await promise;
        if (!cancelled) {
          setGames(fetchedGames);
          setFilteredGames(fetchedGames);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
        if (!cancelled) {
          toast({
            title: t.catalogErrorTitle,
            description: t.catalogErrorDescription,
            variant: 'destructive',
          });
          setGames([]);
          setFilteredGames([]);
          setLoading(false);
        }
      }
    };

    if (!initializedRef.current) {
      initializedRef.current = true;
      const hasCache = hydrateFromCache();
      if (!hasCache) {
        fetchGames();
      } else {
        // Atualiza em background para manter dados frescos
        fetchGames();
      }
    } else if (!catalogCache || Date.now() - catalogCache.timestamp >= CATALOG_CACHE_TTL) {
      fetchGames();
    }

    return () => {
      cancelled = true;
    };
  }, [t, toast]);

  useEffect(() => {
    if (!user) return;
    if (!catalogCache || Date.now() - catalogCache.timestamp >= 30_000) {
      gamesApi.getAll()
        .then((data) => {
          const list = data ?? [];
          catalogCache = { games: list, timestamp: Date.now() };
          setGames(list);
          setFilteredGames(list);
        })
        .catch((error) => {
          console.error('Error refreshing games for authenticated user:', error);
        });
    }
  }, [user]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredGames(games);
      return;
    }

    const filtered = games.filter((game) =>
      game.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredGames(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingOverlay
          open={loading}
          title={t.loadingCatalog}
          footerLabel="GamingFlix Ultimate Founders"
        />
      </div>
    );
  }

  const gamesCountText =
    filteredGames.length === 1
      ? t.catalogCountSingular.replace('{{count}}', '1')
      : t.catalogCountPlural.replace('{{count}}', String(filteredGames.length));

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header onSearch={handleSearch} />

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            {t.catalogTitle}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">{gamesCountText}</p>
        </div>

        {filteredGames.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-base sm:text-lg">{t.noGamesFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredGames.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                user={user}
                hasCatalogAccess={hasCatalogAccess}
                subscriptionLoading={subscriptionLoading}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-12 sm:mt-16 py-6 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 mb-4 text-xs sm:text-sm">
            <a href="/releases" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <span className="text-base sm:text-lg">📋</span>
              <span>{t.changelog}</span>
            </a>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <span className="text-base sm:text-lg">📄</span>
              <span>{t.terms}</span>
            </a>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <span className="text-base sm:text-lg">🔒</span>
              <span>{t.privacy}</span>
            </a>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">© 2025 GamingFlix. {t.allRightsReserved}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
