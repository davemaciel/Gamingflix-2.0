import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import logo from '@/assets/logo.png';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
}

export const AuthDialog = ({ open, onOpenChange, redirectTo = '/' }: AuthDialogProps) => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [signupData, setSignupData] = useState({
    email: '',
    emailConfirm: '',
    username: '',
    password: '',
    passwordConfirm: '',
    fullName: '',
    whatsapp: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    setLoading(false);

    if (error) {
      toast({
        title: t.authLoginErrorTitle,
        description: error.message || t.authLoginErrorDescription,
        variant: 'destructive',
      });
      return;
    }

    onOpenChange(false);
    navigate(redirectTo);
    toast({
      title: t.authLoginSuccessTitle,
      description: t.authLoginSuccessDescription,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (signupData.email !== signupData.emailConfirm) {
      toast({
        title: 'Erro',
        description: 'Os emails não coincidem',
        variant: 'destructive',
      });
      return;
    }

    if (signupData.password !== signupData.passwordConfirm) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive',
      });
      return;
    }

    if (!signupData.username || signupData.username.length < 3) {
      toast({
        title: 'Erro',
        description: 'Nome de usuário deve ter no mínimo 3 caracteres',
        variant: 'destructive',
      });
      return;
    }

    if (usernameAvailable === false) {
      toast({
        title: 'Erro',
        description: 'Nome de usuário já está em uso',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(
      signupData.email,
      signupData.password,
      signupData.fullName,
      signupData.whatsapp,
      signupData.username
    );
    setLoading(false);

    if (!error) {
      setSignupData({
        email: '',
        emailConfirm: '',
        username: '',
        password: '',
        passwordConfirm: '',
        fullName: '',
        whatsapp: '',
      });
      onOpenChange(false);
      navigate(redirectTo);
      toast({
        title: t.authSignupSuccessTitle,
        description: t.authSignupSuccessDescription,
      });
    }
  };

  // Verifica disponibilidade de username
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
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

  // Debounce username check
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (signupData.username) {
        checkUsernameAvailability(signupData.username);
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [signupData.username]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-w-[90vw] rounded-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex justify-center mb-2">
            <img src={logo} alt="GamingFlix" className="h-8 w-auto" />
            <span className="sr-only">{t.authModalTitle}</span>
          </DialogTitle>
          <DialogDescription>{t.authModalDescription}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl flex-shrink-0">
            <TabsTrigger value="login" className="rounded-xl">
              {t.loginTab}
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl">
              {t.signupTab}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dialog-login-email">{t.emailLabel}</Label>
                <Input
                  id="dialog-login-email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dialog-login-password">{t.passwordLabel}</Label>
                <div className="relative">
                  <Input
                    id="dialog-login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="rounded-2xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Button type="submit" className="w-full rounded-2xl" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.loginButton}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4 overflow-y-auto pr-2">
            <form onSubmit={handleSignup} className="space-y-3 pb-2">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="dialog-signup-name">{t.fullNameLabel}</Label>
                <Input
                  id="dialog-signup-name"
                  type="text"
                  placeholder={t.fullNamePlaceholder}
                  value={signupData.fullName}
                  onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                  required
                  className="rounded-2xl"
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="dialog-signup-username">Nome de Usuário</Label>
                <div className="relative">
                  <Input
                    id="dialog-signup-username"
                    type="text"
                    placeholder="ex: jogador123"
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value.toLowerCase().trim() })}
                    required
                    minLength={3}
                    className="rounded-2xl pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!checkingUsername && usernameAvailable === true && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                {usernameAvailable === false && (
                  <p className="text-xs text-red-500">Nome de usuário já está em uso</p>
                )}
                {usernameAvailable === true && (
                  <p className="text-xs text-green-500">Nome de usuário disponível!</p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="dialog-signup-whatsapp">{t.whatsappLabel}</Label>
                <Input
                  id="dialog-signup-whatsapp"
                  type="tel"
                  placeholder={t.whatsappPlaceholder}
                  value={signupData.whatsapp}
                  onChange={(e) => setSignupData({ ...signupData, whatsapp: e.target.value })}
                  required
                  className="rounded-2xl"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="dialog-signup-email">{t.emailLabel}</Label>
                <Input
                  id="dialog-signup-email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                  className="rounded-2xl"
                />
              </div>

              {/* Confirmar Email */}
              <div className="space-y-2">
                <Label htmlFor="dialog-signup-email-confirm">Confirmar Email</Label>
                <Input
                  id="dialog-signup-email-confirm"
                  type="email"
                  placeholder="Digite o email novamente"
                  value={signupData.emailConfirm}
                  onChange={(e) => setSignupData({ ...signupData, emailConfirm: e.target.value })}
                  required
                  className="rounded-2xl"
                />
                {signupData.emailConfirm && signupData.email !== signupData.emailConfirm && (
                  <p className="text-xs text-red-500">Os emails não coincidem</p>
                )}
                {signupData.emailConfirm && signupData.email === signupData.emailConfirm && (
                  <p className="text-xs text-green-500">Emails coincidem ✓</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="dialog-signup-password">{t.passwordLabel}</Label>
                <div className="relative">
                  <Input
                    id="dialog-signup-password"
                    type={showSignupPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    minLength={6}
                    className="rounded-2xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="dialog-signup-password-confirm">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="dialog-signup-password-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Digite a senha novamente"
                    value={signupData.passwordConfirm}
                    onChange={(e) => setSignupData({ ...signupData, passwordConfirm: e.target.value })}
                    required
                    minLength={6}
                    className="rounded-2xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signupData.passwordConfirm && signupData.password !== signupData.passwordConfirm && (
                  <p className="text-xs text-red-500">As senhas não coincidem</p>
                )}
                {signupData.passwordConfirm && signupData.password === signupData.passwordConfirm && signupData.password.length >= 6 && (
                  <p className="text-xs text-green-500">Senhas coincidem ✓</p>
                )}
              </div>

              <Button type="submit" className="w-full rounded-2xl" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.signupButton}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
