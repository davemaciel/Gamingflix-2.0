import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import logo from '@/assets/logo.png';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get('redirect') || '/';
      navigate(redirectTo);
    }
  }, [user, navigate, searchParams]);

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

    if (!error) {
      setLoginData({ email: '', password: '' });
    }
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
    }
  };

  // Verifica disponibilidade de username em tempo real
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
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-3 sm:mb-4">
          <LanguageSelector />
        </div>
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/catalogo" className="flex justify-center mb-3 sm:mb-4">
            <img src={logo} alt="GamingFlix" className="h-10 sm:h-12 w-auto hover:opacity-80 transition-opacity cursor-pointer" />
          </Link>
          <p className="text-muted-foreground text-sm sm:text-base">{t.authTagline}</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="login" className="rounded-lg text-sm sm:text-base">
              {t.loginTab}
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg text-sm sm:text-base">
              {t.signupTab}
            </TabsTrigger>
          </TabsList>

          {/* LOGIN TAB */}
          <TabsContent value="login">
            <Card className="rounded-2xl border-border shadow-lg">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                <CardTitle className="text-xl sm:text-2xl">{t.loginTitle}</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t.loginDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm sm:text-base">
                      {t.emailLabel}
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="h-10 sm:h-11 rounded-xl text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm sm:text-base">
                      {t.passwordLabel}
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="h-10 sm:h-11 rounded-xl text-sm sm:text-base pr-10"
                        required
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
                      className="text-xs sm:text-sm text-primary hover:underline"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-11 rounded-xl text-sm sm:text-base"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.loginButton}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SIGNUP TAB */}
          <TabsContent value="signup">
            <Card className="rounded-2xl border-border shadow-lg">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                <CardTitle className="text-xl sm:text-2xl">{t.signupTitle}</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t.signupDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
                  {/* Nome Completo */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm sm:text-base">
                      {t.fullNameLabel}
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder={t.fullNamePlaceholder}
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      className="h-10 sm:h-11 rounded-xl text-sm sm:text-base"
                      required
                    />
                  </div>

                  {/* Nome de Usuário */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-sm sm:text-base">
                      Nome de Usuário
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="ex: jogador123"
                        value={signupData.username}
                        onChange={(e) => setSignupData({ ...signupData, username: e.target.value.toLowerCase().trim() })}
                        className="h-10 sm:h-11 rounded-xl text-sm sm:text-base pr-10"
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
                      <p className="text-xs text-red-500">Nome de usuário já está em uso</p>
                    )}
                    {usernameAvailable === true && (
                      <p className="text-xs text-green-500">Nome de usuário disponível!</p>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-whatsapp" className="text-sm sm:text-base">
                      {t.whatsappLabel}
                    </Label>
                    <Input
                      id="signup-whatsapp"
                      type="tel"
                      placeholder={t.whatsappPlaceholder}
                      value={signupData.whatsapp}
                      onChange={(e) => setSignupData({ ...signupData, whatsapp: e.target.value })}
                      className="h-10 sm:h-11 rounded-xl text-sm sm:text-base"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm sm:text-base">
                      {t.emailLabel}
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="h-10 sm:h-11 rounded-xl text-sm sm:text-base"
                      required
                    />
                  </div>

                  {/* Confirmar Email */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email-confirm" className="text-sm sm:text-base">
                      Confirmar Email
                    </Label>
                    <Input
                      id="signup-email-confirm"
                      type="email"
                      placeholder="Digite o email novamente"
                      value={signupData.emailConfirm}
                      onChange={(e) => setSignupData({ ...signupData, emailConfirm: e.target.value })}
                      className="h-10 sm:h-11 rounded-xl text-sm sm:text-base"
                      required
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
                    <Label htmlFor="signup-password" className="text-sm sm:text-base">
                      {t.passwordLabel}
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="h-10 sm:h-11 rounded-xl text-sm sm:text-base pr-10"
                        required
                        minLength={6}
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
                    <Label htmlFor="signup-password-confirm" className="text-sm sm:text-base">
                      Confirmar Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signupData.passwordConfirm}
                        onChange={(e) => setSignupData({ ...signupData, passwordConfirm: e.target.value })}
                        className="h-10 sm:h-11 rounded-xl text-sm sm:text-base pr-10"
                        required
                        minLength={6}
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
                    {signupData.passwordConfirm && signupData.password === signupData.passwordConfirm && (
                      <p className="text-xs text-green-500">Senhas coincidem ✓</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-11 rounded-xl text-sm sm:text-base"
                    disabled={loading || usernameAvailable === false || checkingUsername}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.signupButton}
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

export default Auth;
