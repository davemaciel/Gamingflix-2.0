import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Loader2, User, Lock, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  console.log('🔵 Profile component renderizado');
  
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const [profileData, setProfileData] = useState({
    username: '',
    full_name: '',
    whatsapp: '',
    avatar_url: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    console.log('Profile Page - User:', user);
    console.log('Profile Page - User exists?', !!user);
    console.log('Profile Page - Auth Loading?', authLoading);
    
    // Aguarda o carregamento da autenticação terminar
    if (authLoading) {
      console.log('Profile Page - Aguardando autenticação...');
      return;
    }
    
    // Só redireciona se realmente não tiver user E não estiver carregando
    if (!user) {
      console.log('Profile Page - Sem user, redirecionando para /auth');
      navigate('/auth');
      return;
    }

    console.log('Profile Page - User OK, configurando dados do perfil');
    setProfileData({
      username: user.username || '',
      full_name: user.full_name || '',
      whatsapp: user.whatsapp || '',
      avatar_url: user.avatar_url || '',
    });
  }, [user, authLoading, navigate]);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3 || username === user?.username) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await authApi.checkUsername(username);
      setUsernameAvailable(response.available);
    } catch (error) {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (profileData.username && profileData.username !== user?.username) {
        checkUsernameAvailability(profileData.username);
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [profileData.username, user?.username]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameAvailable === false) {
      toast({
        title: t.profilePage.errorTitle,
        description: t.profilePage.usernameInUse,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await authApi.updateProfile(profileData);
      toast({
        title: t.profilePage.successTitle,
        description: t.profilePage.profileUpdated,
      });
      
      // Recarrega dados do usuário
      window.location.reload();
    } catch (error: any) {
      toast({
        title: t.profilePage.errorTitle,
        description: error.message || t.profilePage.errorUpdatingProfile,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t.profilePage.errorTitle,
        description: t.profilePage.passwordsDontMatch,
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: t.profilePage.errorTitle,
        description: t.profilePage.passwordMinLength,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast({
        title: t.profilePage.successTitle,
        description: t.profilePage.passwordUpdated,
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        title: t.profilePage.errorTitle,
        description: error.message || t.profilePage.errorUpdatingPassword,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mostra loading enquanto carrega autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">{t.loadingAdmin}</p>
        </div>
      </div>
    );
  }

  // Se não tem user após carregar, não renderiza nada (vai redirecionar)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground mt-2">Gerencie suas informações pessoais e segurança</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t.profilePage.personalInfoTab}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {t.profilePage.securityTab}
            </TabsTrigger>
          </TabsList>

          {/* TAB PERFIL */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{t.profilePage.personalInfoTitle}</CardTitle>
                <CardDescription>
                  {t.profilePage.personalInfoDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {/* Avatar */}
                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">URL do Avatar (opcional)</Label>
                    <Input
                      id="avatar_url"
                      type="url"
                      placeholder="https://exemplo.com/avatar.jpg"
                      value={profileData.avatar_url}
                      onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                      className="rounded-xl"
                    />
                    {profileData.avatar_url && (
                      <div className="mt-2">
                        <img
                          src={profileData.avatar_url}
                          alt="Preview"
                          className="h-20 w-20 rounded-full object-cover border-2 border-border"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.full_name)}&background=6366f1&color=fff`;
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">{t.profilePage.usernameLabel} *</Label>
                    <div className="relative">
                      <Input
                        id="username"
                        type="text"
                        placeholder={t.profilePage.usernamePlaceholder}
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value.toLowerCase().trim() })}
                        className="rounded-xl pr-10"
                        required
                        minLength={3}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {checkingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        {!checkingUsername && usernameAvailable === true && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                        {!checkingUsername && usernameAvailable === false && (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    {usernameAvailable === false && (
                      <p className="text-xs text-red-500">{t.profilePage.usernameInUse}</p>
                    )}
                    {usernameAvailable === true && (
                      <p className="text-xs text-green-500">{t.profilePage.usernameAvailable}</p>
                    )}
                  </div>

                  {/* Nome Completo */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name">{t.profilePage.fullNameLabel} *</Label>
                    <Input
                      id="full_name"
                      type="text"
                      placeholder={t.profilePage.fullNamePlaceholder}
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">{t.profilePage.whatsappLabel} *</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder={t.profilePage.whatsappPlaceholder}
                      value={profileData.whatsapp}
                      onChange={(e) => setProfileData({ ...profileData, whatsapp: e.target.value })}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  {/* Email (apenas visualização) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      className="rounded-xl bg-muted"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      O email não pode ser alterado
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl"
                    disabled={loading || usernameAvailable === false || checkingUsername}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {loading ? t.profilePage.updatingButton : t.profilePage.updateProfileButton}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB SEGURANÇA */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>{t.profilePage.passwordTitle}</CardTitle>
                <CardDescription>
                  {t.profilePage.passwordDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t.profilePage.currentPasswordLabel} *</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t.profilePage.newPasswordLabel} *</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="rounded-xl"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Mínimo de 6 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t.profilePage.confirmPasswordLabel} *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="rounded-xl"
                      required
                      minLength={6}
                    />
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-xs text-red-500">As senhas não coincidem</p>
                    )}
                    {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                      <p className="text-xs text-green-500">Senhas coincidem ✓</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl"
                    disabled={loading || passwordData.newPassword !== passwordData.confirmPassword}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {loading ? t.profilePage.updatingPasswordButton : t.profilePage.updatePasswordButton}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
