import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gamesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Copy, Loader2, CheckCircle, XCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { getSteamCode } from '@/services/steamGuard';
import { useLanguage } from '@/hooks/useLanguage';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { AuthDialog } from '@/components/AuthDialog';
import { UpgradeModal } from '@/components/UpgradeModal';

interface Game {
  id: string;
  title: string;
  cover_url: string;
  description: string;
  description_en?: string | null;
  description_es?: string | null;
  gradient: string;
  login: string;
  password: string;
  family_code?: string | null;
  tutorial: string[] | any;
  tutorial_en?: string[] | any;
  tutorial_es?: string[] | any;
}

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { hasCatalogAccess, loading: subscriptionLoading } = useSubscription();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [steamCode, setSteamCode] = useState<string>('');
  const [searchingCode, setSearchingCode] = useState(false);
  const [codeError, setCodeError] = useState<string>('');
  const [searchProgress, setSearchProgress] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(0);

  useEffect(() => {
    fetchGame();
  }, [id]);

  // Verificar autenticação e plano quando carregar (com pequeno delay)
  useEffect(() => {
    if (!loading && !subscriptionLoading && game) {
      // Delay de 300ms para evitar flash de modal durante navegação
      const timer = setTimeout(() => {
        if (!user) {
          setShowAuthDialog(true);
        } else if (!hasCatalogAccess) {
          setShowUpgradeModal(true);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [user, hasCatalogAccess, loading, subscriptionLoading, game]);


  const fetchGame = async () => {
    try {
      if (!id) {
        throw new Error('Game ID is required');
      }
      
      const data = await gamesApi.getById(id);
      setGame(data);
    } catch (error) {
      console.error('Error fetching game:', error);
      toast({
        title: t.gameDetail.errorTitle,
        description: t.gameDetail.errorDescription,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const requestSteamGuard = async () => {
    const now = Date.now();
    if (now - lastRequestTime < 60000) {
      const remaining = Math.ceil((60000 - (now - lastRequestTime)) / 1000);
      toast({
        title: t.gameDetail.waitTitle,
        description: t.gameDetail.waitDescription.replace('{{seconds}}', String(remaining)),
        variant: 'destructive',
      });
      return;
    }

    setSearchingCode(true);
    setSteamCode('');
    setCodeError('');
    setSearchProgress(0);
    setLastRequestTime(now);

    const progressInterval = setInterval(() => {
      setSearchProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + 5;
      });
    }, 500);

    const timeout = setTimeout(() => {
      clearInterval(progressInterval);
      setSearchingCode(false);
      setCodeError(t.gameDetail.timeoutMessage);
      setSearchProgress(0);
      toast({
        title: t.gameDetail.timeoutToastTitle,
        description: t.gameDetail.timeoutToastDescription,
        variant: 'destructive',
      });
    }, 45000);

    try {
      const response = await getSteamCode();

      clearTimeout(timeout);
      clearInterval(progressInterval);
      setSearchProgress(100);

      if (response.success && response.code) {
        setSteamCode(response.code);
        setCodeError('');
        toast({
          title: t.gameDetail.steamGuardSuccessTitle,
          description: t.gameDetail.steamGuardSuccessDescription,
        });
      } else {
        throw new Error(response.error || t.gameDetail.steamGuardErrorDescription);
      }
    } catch (error) {
      clearTimeout(timeout);
      clearInterval(progressInterval);
      setSearchProgress(0);
      const errorMessage = error instanceof Error ? error.message : t.gameDetail.unknownError;
      setCodeError(errorMessage);
      toast({
        title: t.gameDetail.steamGuardErrorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSearchingCode(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    const successMessage = t.gameDetail.copySuccessDescription.replace('{{label}}', label);
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t.gameDetail.copySuccessTitle,
        description: successMessage,
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: t.gameDetail.copySuccessTitle,
          description: successMessage,
        });
      } catch (err) {
        toast({
          title: t.gameDetail.copyErrorTitle,
          description: t.gameDetail.copyErrorDescription,
          variant: 'destructive',
        });
      }
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingOverlay
          open={loading}
          title={t.loadingGame}
          footerLabel="GamingFlix Ultimate Founders"
        />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>{t.gameDetail.errorTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t.gameDetail.errorDescription}</p>
            <Button onClick={() => navigate('/catalogo')}>{t.backToCatalog}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const parseTutorial = (value: Game['tutorial']) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value as unknown as string);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  let localizedDescription = game.description;
  if (language === 'en' && game.description_en) {
    localizedDescription = game.description_en;
  } else if (language === 'es' && game.description_es) {
    localizedDescription = game.description_es;
  }

  const tutorialPt = parseTutorial(game.tutorial);
  const tutorialEn = parseTutorial(game.tutorial_en);
  const tutorialEs = parseTutorial(game.tutorial_es);

  let localizedTutorial = tutorialPt;
  if (language === 'en' && tutorialEn.length > 0) {
    localizedTutorial = tutorialEn;
  } else if (language === 'es' && tutorialEs.length > 0) {
    localizedTutorial = tutorialEs;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header onSearch={() => {}} />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <Link to="/catalogo">
          <Button variant="ghost" className="mb-4 sm:mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t.backToCatalog}</span>
            <span className="sm:hidden">{t.back}</span>
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden">
              <img
                src={game.cover_url}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                {game.title}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {localizedDescription}
              </p>
            </div>

            {/* Informações de Acesso - Apenas para usuários autenticados com plano */}
            {user && hasCatalogAccess ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-primary text-base sm:text-lg">
                    {t.gameDetail.accessInfoTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        {t.gameDetail.loginLabel}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {game.login}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(game.login, t.gameDetail.clipboardLabels.login)}
                      className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        {t.gameDetail.passwordLabel}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {game.password}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(game.password, t.gameDetail.clipboardLabels.password)
                      }
                      className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>

                  {game.family_code && (
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="text-xs sm:text-sm font-semibold text-foreground">
                          {t.gameDetail.familyCodeLabel}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {game.family_code}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(game.family_code!, t.gameDetail.clipboardLabels.familyCode)
                        }
                        className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                      >
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border border-2 border-primary/30">
                <CardContent className="p-8 text-center">
                  <Shield className="h-16 w-16 mx-auto text-primary/50 mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    {!user ? 'Faça Login para Acessar' : 'Assine para Desbloquear'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {!user
                      ? 'Você precisa fazer login para visualizar as informações de acesso deste jogo.'
                      : 'Assine um plano para ter acesso ilimitado a todos os jogos do catálogo.'}
                  </p>
                  <Button
                    onClick={() => !user ? setShowAuthDialog(true) : setShowUpgradeModal(true)}
                    className="w-full sm:w-auto"
                  >
                    {!user ? 'Fazer Login' : 'Ver Planos'}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{t.gameDetail.tutorialTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 sm:space-y-3">
                  {localizedTutorial.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                      <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs sm:text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Steam Guard - Apenas para usuários autenticados com plano */}
            {user && hasCatalogAccess && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-primary text-base sm:text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t.gameDetail.steamGuardTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full text-sm sm:text-base"
                    size="lg"
                    onClick={requestSteamGuard}
                    disabled={searchingCode}
                  >
                  {searchingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.gameDetail.steamGuardButtonLoading}
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      {t.gameDetail.steamGuardButtonIdle}
                    </>
                  )}
                </Button>

                {searchingCode && (
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${searchProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      {t.gameDetail.steamGuardProgress.replace(
                        '{{progress}}',
                        String(searchProgress)
                      )}
                    </p>
                  </div>
                )}

                {steamCode && !searchingCode && (
                  <div className="p-4 bg-green-500/10 border-2 border-green-500/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {t.gameDetail.steamGuardSuccessTitle}
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background rounded-md">
                      <div className="flex-1">
                        <p className="text-2xl font-bold tracking-widest text-foreground text-center">
                          {steamCode}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(steamCode, t.gameDetail.clipboardLabels.steamGuard)
                        }
                        className="flex-shrink-0 h-10 w-10"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      {t.gameDetail.steamGuardSuccessDescription}
                    </p>
                  </div>
                )}

                {codeError && !searchingCode && (
                  <div className="p-4 bg-red-500/10 border-2 border-red-500/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {t.gameDetail.steamGuardErrorTitle}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{codeError}</p>
                  </div>
                )}

                {!steamCode && !searchingCode && !codeError && (
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    {t.gameDetail.steamGuardHint}
                  </p>
                )}
              </CardContent>
            </Card>
            )}
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        redirectTo={`/game/${id}`}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
      />
    </div>
  );
};

export default GameDetail;
