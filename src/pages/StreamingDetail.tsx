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
import { ArrowLeft, Copy, Shield, Mail, Lock, User, Hash, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import { AuthDialog } from '@/components/AuthDialog';
import { UpgradeModal } from '@/components/UpgradeModal';

const StreamingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { hasCatalogAccess } = useSubscription();
    const [service, setService] = useState<StreamingService | null>(null);
    const [userProfiles, setUserProfiles] = useState<UserProfileResponse[]>([]);
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
                    const profilesData = await streamingApi.getMyProfile(id!);
                    // Ensure it's always an array
                    setUserProfiles(Array.isArray(profilesData) ? profilesData : [profilesData]);
                } catch (error) {
                    setUserProfiles([]);
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

    const hasProfile = userProfiles.length > 0;

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

                <div className="max-w-4xl mx-auto">
                    {/* Header com Logo Compacto */}
                    <div className="flex items-center gap-4 mb-6">
                        {service.logo_url ? (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-background border-2 border-border">
                                <img
                                    src={service.logo_url}
                                    alt={service.name}
                                    className="w-full h-full object-contain p-2"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl font-bold text-primary">
                                    {service.name.charAt(0)}
                                </span>
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {service.name}
                            </h1>
                            {service.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {service.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Conteúdo Principal */}
                    <div className="space-y-6">

                        {hasProfile ? (
                            <div className="space-y-6">
                                {/* Status Badge */}
                                <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm font-semibold text-green-500">Acesso Ativo</p>
                                            <p className="text-xs text-muted-foreground">Você possui {userProfiles.length} {userProfiles.length === 1 ? 'perfil' : 'perfis'} neste serviço</p>
                                        </div>
                                    </div>
                                    {service.checkout_url && (
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => window.open(service.checkout_url, '_blank')}
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Comprar Perfil Extra
                                        </Button>
                                    )}
                                </div>

                                {userProfiles.map((userProfile, index) => (
                                    <Card key={userProfile.profile.id} className="bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 bg-primary/10 rounded-bl-lg border-b border-l border-primary/20">
                                            <span className="text-xs font-bold text-primary">Perfil #{index + 1}</span>
                                        </div>
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-primary text-xl sm:text-2xl flex items-center gap-2">
                                                <Shield className="h-6 w-6" />
                                                Credenciais
                                            </CardTitle>
                                            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                                                Clique em <Copy className="inline h-3 w-3 mx-0.5" /> para copiar rapidamente
                                            </p>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Seção de Login */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="h-px bg-gradient-to-r from-primary/50 to-transparent flex-1"></div>
                                                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Login</span>
                                                    <div className="h-px bg-gradient-to-l from-primary/50 to-transparent flex-1"></div>
                                                </div>

                                                {/* Email */}
                                                <div className="group">
                                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        Email
                                                    </label>
                                                    <div className="flex items-center gap-2 p-3.5 bg-background border-2 border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                                                        <p className="text-sm sm:text-base font-mono text-foreground flex-1 break-all">
                                                            {userProfile.account.email}
                                                        </p>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => copyToClipboard(userProfile.account.email, 'Email')}
                                                            className="flex-shrink-0 h-9 w-9 hover:bg-primary/10 hover:scale-110 transition-transform"
                                                            title="Copiar email"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Senha */}
                                                <div className="group">
                                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                                                        <Lock className="h-3.5 w-3.5" />
                                                        Senha
                                                    </label>
                                                    <div className="flex items-center gap-2 p-3.5 bg-background border-2 border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                                                        <p className="text-sm sm:text-base font-mono text-foreground flex-1 break-all">
                                                            {userProfile.account.password}
                                                        </p>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => copyToClipboard(userProfile.account.password, 'Senha')}
                                                            className="flex-shrink-0 h-9 w-9 hover:bg-primary/10 hover:scale-110 transition-transform"
                                                            title="Copiar senha"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative py-2">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t-2 border-dashed border-border/60"></div>
                                                </div>
                                                <div className="relative flex justify-center">
                                                    <span className="bg-card px-3 text-xs text-muted-foreground font-medium">Após fazer login</span>
                                                </div>
                                            </div>

                                            {/* Seção de Perfil */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="h-px bg-gradient-to-r from-primary/50 to-transparent flex-1"></div>
                                                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Selecione este Perfil</span>
                                                    <div className="h-px bg-gradient-to-l from-primary/50 to-transparent flex-1"></div>
                                                </div>

                                                {/* Perfil */}
                                                <div className="group">
                                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                                                        <User className="h-3.5 w-3.5" />
                                                        Nome do Perfil
                                                    </label>
                                                    <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-lg">
                                                        <p className="text-xl sm:text-2xl font-bold text-primary mb-1">
                                                            {userProfile.profile.profile_name || userProfile.profile.name || 'Perfil Principal'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">Selecione exatamente este perfil</p>
                                                    </div>
                                                </div>

                                                {/* PIN */}
                                                <div className="group">
                                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                                                        <Hash className="h-3.5 w-3.5" />
                                                        PIN do Perfil
                                                    </label>
                                                    <div className="flex items-center gap-2 p-3.5 bg-background border-2 border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
                                                        <p className="text-sm sm:text-base font-mono text-foreground flex-1 break-all">
                                                            {userProfile.profile.pin}
                                                        </p>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => copyToClipboard(userProfile.profile.pin, 'PIN')}
                                                            className="flex-shrink-0 h-9 w-9 hover:bg-primary/10 hover:scale-110 transition-transform"
                                                            title="Copiar PIN"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Instruções */}
                                <div className="mt-4 p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-foreground mb-2 text-sm">📋 Como Usar:</p>
                                            <ol className="space-y-2 text-xs text-muted-foreground">
                                                <li className="flex items-start gap-2">
                                                    <span className="font-bold text-primary min-w-[20px]">1.</span>
                                                    <span>Acesse o site do {service.name} e clique em <strong>Login</strong></span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="font-bold text-primary min-w-[20px]">2.</span>
                                                    <span>Use o <strong>Email</strong> e <strong>Senha</strong> de uma das contas acima</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="font-bold text-primary min-w-[20px]">3.</span>
                                                    <span>Selecione o perfil indicado</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="font-bold text-primary min-w-[20px]">4.</span>
                                                    <span>Se solicitado, digite o <strong>PIN</strong> correspondente</span>
                                                </li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
