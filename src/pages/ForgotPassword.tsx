import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.png';
import { LanguageSelector } from '@/components/LanguageSelector';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast({
        title: t.emailSentTitle,
        description: t.emailSentSuccess,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao processar solicitação',
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
            <CardTitle className="text-xl sm:text-2xl">{t.forgotPasswordTitle}</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {t.forgotPasswordDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">
                    {t.emailLabel}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 sm:h-11 rounded-xl text-sm sm:text-base"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 sm:h-11 rounded-xl text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? t.sendingEmailButton : t.sendEmailButton}
                </Button>
                <div className="text-center mt-4">
                  <Link
                    to="/auth"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t.backToLogin}
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t.emailSentDescription}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.checkSpamFolder}
                </p>
                <Link to="/auth">
                  <Button className="w-full h-10 sm:h-11 rounded-xl text-sm sm:text-base">
                    {t.backToLogin}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
