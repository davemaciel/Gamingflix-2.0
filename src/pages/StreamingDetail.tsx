import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { streamingApi } from '@/lib/api';
import { StreamingService, UserProfileResponse } from '@/types/streaming';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ArrowLeft, Copy, Shield } from 'lucide-react';
import { AuthDialog } from '@/components/AuthDialog';
import { UpgradeModal } from '@/components/UpgradeModal';

const StreamingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { hasCatalogAccess } = useSubscription();
    const [service, setService] = useState<StreamingService | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        loadServiceAndProfile();
    }, [id, user]);

    const loadServiceAndProfile = async () => {
        try {
            const serviceData = await streamingApi.getServiceById(id!);
            setService(serviceData);

            if (user) {
                try {
                    const profileData = await streamingApi.getMyProfile(id!);
                    setUserProfile(profileData);
                } catch (error) {
                    setUserProfile(null);
                }
            }
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao carregar serviço',
                variant: 'destructive',
            });
            navigate('/streaming');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAccess = async () => {
        if (!user) {
            setShowAuthDialog(true);
            return;
        }

        // If service has checkout URL, redirect to payment page
        if (service?.checkout_url) {
            window.open(service.checkout_url, '_blank');
            return;
        }

        // Fallback: direct assignment (for services without checkout)
        if (!hasCatalogAccess) {
            setShowUpgradeModal(true);
            return;
        }

        setRequesting(true);
        try {
            await streamingApi.assignProfile(id!);
            toast({
                title: 'Sucesso',
                description: 'Perfil atribuído!',
            });
            await loadServiceAndProfile();
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: error.message || 'Falha ao solicitar acesso',
                variant: 'destructive',
            });
        } finally {
            setRequesting(false);
        }
    };

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast({
                title: 'Copiado',
                description: `${label} copiado para a área de transferência`,
            });
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao copiar',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <LoadingOverlay
                    open={loading}
                    title="Carregando Streaming"
                    footerLabel="GamingFlix Ultimate Founders"
                />
            </div>
        );
    }

    if (!service) return null;

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Header onSearch={() => { }} />
            <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
                <Link to="/streaming">
                    <Button variant="ghost" className="mb-4 sm:mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span>Voltar</span>
                    </Button>
                </Link>

                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                        {service.cover_url ? (
                            <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden">
                                <img
                                    src={service.cover_url}
                                    alt={service.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="aspect-square rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <span className="text-6xl font-bold text-primary">
                                    {service.name.charAt(0)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                                {service.name}
                            </h1>
                            {service.description && (
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                    {service.description}
                                </p>
                            )}
                        </div>

                        {userProfile ? (
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <CardTitle className="text-primary text-base sm:text-lg">
                                        Suas Credenciais
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 sm:space-y-3">
                                    <div className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
                                        <div className="min-w-0 flex-1 mr-2">
                                            <p className="text-xs sm:text-sm font-semibold text-foreground">Email</p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                {userProfile.account.email}
                                            </p>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(userProfile.account.email, 'Email')} className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9">
                                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
                                        <div className="min-w-0 flex-1 mr-2">
                                            <p className="text-xs sm:text-sm font-semibold text-foreground">Senha</p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                {userProfile.account.password}
                                            </p>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(userProfile.account.password, 'Senha')} className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9">
                                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
                                        <div className="min-w-0 flex-1 mr-2">
                                            <p className="text-xs sm:text-sm font-semibold text-foreground">Perfil</p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                {userProfile.profile.name}
                                            </p>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(userProfile.profile.name, 'Perfil')} className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9">
                                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
                                        <div className="min-w-0 flex-1 mr-2">
                                            <p className="text-xs sm:text-sm font-semibold text-foreground">PIN</p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                {userProfile.profile.pin}
                                            </p>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(userProfile.profile.pin, 'PIN')} className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9">
                                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-card border-border border-2 border-primary/30">
                                <CardContent className="p-8 text-center">
                                    <Shield className="h-16 w-16 mx-auto text-primary/50 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">
                                        {!user ? 'Faça Login para Acessar' : 'Obter Acesso'}
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        {!user
                                            ? 'Você precisa fazer login para acessar este serviço.'
                                            : service.checkout_url
                                                ? 'Clique no botão abaixo para comprar acesso a este serviço.'
                                                : 'Clique no botão abaixo para solicitar um perfil exclusivo neste serviço.'
                                        }
                                    </p>
                                    <Button onClick={handleRequestAccess} disabled={requesting} className="w-full sm:w-auto">
                                        {requesting ? 'Processando...' : !user ? 'Fazer Login' : service.checkout_url ? 'Comprar Acesso' : 'Solicitar Acesso'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <AuthDialog
                open={showAuthDialog}
                onOpenChange={setShowAuthDialog}
                redirectTo={`/streaming/${id}`}
            />

            <UpgradeModal
                open={showUpgradeModal}
                onOpenChange={setShowUpgradeModal}
            />
        </div>
    );
};

export default StreamingDetail;
