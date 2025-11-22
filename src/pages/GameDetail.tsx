import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gamesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Copy, Loader2, CheckCircle, XCircle, Shield, AlertTriangle } from 'lucide-react';
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
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30">
      <Header onSearch={() => { }} />

      {/* Hero Section with Background Image */}
      <div className="relative w-full h-[50vh] min-h-[400px] lg:h-[60vh] overflow-hidden">
        {/* Background Image with Blur and Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={game.cover_url}
            alt={game.title}
            className="w-full h-full object-cover opacity-60 blur-sm scale-105 transform transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-12 sm:pb-16">
          <Link to="/catalogo" className="absolute top-6 left-4 sm:left-8">
            <Button variant="outline" className="bg-black/20 backdrop-blur-md border-white/10 hover:bg-white/10 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.backToCatalog}
            </Button>
          </Link>

          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-end gap-6 mb-6">
              <div className="hidden sm:block w-32 h-44 rounded-lg overflow-hidden shadow-2xl border-2 border-white/10 rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <img
                  src={game.cover_url}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
                  {game.title}
                </h1>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-sm font-medium">
                    {t.gameDetail.accessInfoTitle}
                  </span>
                  {hasCatalogAccess && (
                    <span className="px-3 py-1 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-400 text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {t.gameDetail.steamGuardSuccessTitle}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-lg sm:text-xl text-gray-200 max-w-2xl leading-relaxed drop-shadow-md">
              {localizedDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">

          {/* Step 1: Credentials */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
                1
              </div>
              <h2 className="text-2xl font-bold text-foreground">{t.gameDetail.accessInfoTitle}</h2>
            </div>

            {user && hasCatalogAccess ? (
              <Card className="bg-card/50 backdrop-blur-xl border-white/5 shadow-xl overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <div className="group relative overflow-hidden rounded-xl bg-black/20 border border-white/5 p-4 transition-all hover:bg-black/30 hover:border-primary/20">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="min-w-0 flex-1 mr-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                          {t.gameDetail.loginLabel}
                        </p>
                        <p className="text-lg text-foreground font-mono font-semibold truncate select-all">
                          {game.login}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(game.login, t.gameDetail.clipboardLabels.login)}
                        className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-xl bg-black/20 border border-white/5 p-4 transition-all hover:bg-black/30 hover:border-primary/20">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="min-w-0 flex-1 mr-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                          {t.gameDetail.passwordLabel}
                        </p>
                        <p className="text-lg text-foreground font-mono font-semibold truncate select-all">
                          {game.password}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(game.password, t.gameDetail.clipboardLabels.password)
                        }
                        className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {game.family_code && (
                    <div className="group relative overflow-hidden rounded-xl bg-black/20 border border-white/5 p-4 transition-all hover:bg-black/30 hover:border-primary/20">
                      <div className="flex items-center justify-between relative z-10">
                        <div className="min-w-0 flex-1 mr-4">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                            {t.gameDetail.familyCodeLabel}
                          </p>
                          <p className="text-lg text-foreground font-mono font-semibold truncate select-all">
                            {game.family_code}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            copyToClipboard(game.family_code!, t.gameDetail.clipboardLabels.familyCode)
                          }
                          className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Copy className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/50 backdrop-blur-xl border-primary/20 shadow-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <CardContent className="p-8 text-center relative z-10">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {!user ? 'Faça Login para Acessar' : 'Assine para Desbloquear'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                    {!user
                      ? 'Você precisa fazer login para visualizar as informações de acesso deste jogo.'
                      : 'Assine um plano para ter acesso ilimitado a todos os jogos do catálogo.'}
                  </p>
                  <Button
                    onClick={() => !user ? setShowAuthDialog(true) : setShowUpgradeModal(true)}
                    className="w-full sm:w-auto shadow-lg shadow-primary/20"
                    size="lg"
                  >
                    {!user ? 'Fazer Login' : 'Ver Planos'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Step 2: Steam Guard */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-lg shadow-lg shadow-secondary/20">
                2
              </div>
              <h2 className="text-2xl font-bold text-foreground">{t.gameDetail.steamGuardTitle}</h2>
            </div>

            {user && hasCatalogAccess ? (
              <Card className="bg-card/50 backdrop-blur-xl border-white/5 shadow-xl h-full min-h-[300px] flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col justify-center space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                      <Shield className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">
                      {t.gameDetail.steamGuardHint}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Solicite o código apenas quando a Steam pedir. O código expira em breve.
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button
                      className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      size="lg"
                      onClick={requestSteamGuard}
                      disabled={searchingCode}
                    >
                      {searchingCode ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t.gameDetail.steamGuardButtonLoading}
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-5 w-5" />
                          {t.gameDetail.steamGuardButtonIdle}
                        </>
                      )}
                    </Button>
                  </div>

                  {searchingCode && (
                    <div className="space-y-2">
                      <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                          style={{ width: `${searchProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-center text-muted-foreground animate-pulse">
                        {t.gameDetail.steamGuardProgress.replace(
                          '{{progress}}',
                          String(searchProgress)
                        )}
                      </p>
                    </div>
                  )}

                  {steamCode && !searchingCode && (
                    <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl animate-in zoom-in-95 duration-300">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <p className="text-sm font-semibold text-green-500">
                          {t.gameDetail.steamGuardSuccessTitle}
                        </p>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-white/5 shadow-inner">
                        <div className="flex-1 text-center">
                          <p className="text-4xl font-black tracking-[0.3em] text-foreground font-mono">
                            {steamCode}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            copyToClipboard(steamCode, t.gameDetail.clipboardLabels.steamGuard)
                          }
                          className="flex-shrink-0 h-12 w-12 hover:bg-green-500/10 hover:text-green-500 transition-colors"
                        >
                          <Copy className="h-6 w-6" />
                        </Button>
                      </div>
                      <p className="text-xs text-center text-muted-foreground mt-4 opacity-70">
                        {t.gameDetail.steamGuardSuccessDescription}
                      </p>
                    </div>
                  )}

                  {codeError && !searchingCode && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in shake duration-300">
                      <div className="flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="text-sm font-semibold text-red-500">
                            {t.gameDetail.steamGuardErrorTitle}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{codeError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="h-full min-h-[300px] rounded-xl border-2 border-dashed border-muted flex items-center justify-center p-6 text-center">
                <div className="space-y-2 opacity-50">
                  <Shield className="h-12 w-12 mx-auto" />
                  <p className="text-lg font-medium">Bloqueado</p>
                </div>
              </div>
            )}
          </div>
        </div>
        < div className="max-w-3xl mx-auto mt-20 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300" >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xl shadow-inner">
              3
            </div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {t.gameDetail.tutorialTitle}
            </h2>
          </div>

          {/* Important Alert */}
          <div className="mb-10 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-4 animate-in zoom-in-95 duration-500">
            <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-base font-bold text-yellow-500 mb-1">Atenção Necessária</h4>
              <p className="text-sm text-yellow-500/90 leading-relaxed">
                Siga os passos abaixo atentamente para garantir que você consiga jogar com
                tranquilidade e sem interrupções.
              </p>
            </div>
          </div>

          <div className="relative pl-8 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-primary/50 before:to-transparent">
            {localizedTutorial.map((step: string, index: number) => (
              <div key={index} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[2.25rem] sm:-left-[2.5rem] top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary" />
                </div>

                {/* Content Card */}
                <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl p-6 transition-all duration-300 hover:bg-card/60 hover:border-primary/20 hover:translate-x-2 shadow-lg">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl font-black text-white/5 select-none absolute right-4 top-2">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed relative z-10">
                      {step}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div >
      </div >

      {/* Auth Dialog */}
      < AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        redirectTo={`/game/${id}`}
      />

      {/* Upgrade Modal */}
      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div >
  );
};

export default GameDetail;
