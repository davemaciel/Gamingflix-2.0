import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.png';
import { LanguageSelector } from '@/components/LanguageSelector';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { t } = useLanguage();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-md rounded-2xl border-border shadow-lg">
          <CardHeader>
            <CardTitle>Token inválido</CardTitle>
            <CardDescription>O link de recuperação é inválido ou expirou.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/auth">
              <Button className="w-full">Voltar para o login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter no mínimo 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, password);
      toast({
        title: 'Sucesso!',
        description: 'Senha redefinida com sucesso. Faça login com sua nova senha.',
      });
      setTimeout(() => navigate('/auth'), 2000);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao redefinir senha',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
        </div>

        <Card className="rounded-2xl border-border shadow-lg">
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
            <CardTitle className="text-xl sm:text-2xl">Nova Senha</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Digite sua nova senha
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 sm:h-11 rounded-xl text-sm sm:text-base pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm sm:text-base">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 sm:h-11 rounded-xl text-sm sm:text-base pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-10 sm:h-11 rounded-xl text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>
              <div className="text-center mt-4">
                <Link
                  to="/auth"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para o login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
