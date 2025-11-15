import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';

export function CompleteProfileDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    whatsapp: '',
  });

  // Verifica se usuário precisa completar perfil
  useEffect(() => {
    console.log('CompleteProfileDialog - User:', user);
    console.log('CompleteProfileDialog - Username:', user?.username);
    console.log('CompleteProfileDialog - Deve abrir?', user && !user.username);
    
    if (user && !user.username) {
      console.log('Abrindo CompleteProfileDialog');
      setOpen(true);
      setFormData({
        username: '',
        full_name: user.full_name || '',
        whatsapp: user.whatsapp || '',
      });
    } else {
      console.log('CompleteProfileDialog NÃO será aberto');
      setOpen(false);
    }
  }, [user]);

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (formData.username) {
        checkUsernameAvailability(formData.username);
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [formData.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || formData.username.length < 3) {
      toast({
        title: t.completeProfile.errorTitle,
        description: t.completeProfile.usernameMinLength,
        variant: 'destructive',
      });
      return;
    }

    if (usernameAvailable === false) {
      toast({
        title: t.completeProfile.errorTitle,
        description: t.completeProfile.usernameAlreadyInUse,
        variant: 'destructive',
      });
      return;
    }

    if (!formData.full_name) {
      toast({
        title: t.completeProfile.errorTitle,
        description: t.completeProfile.fullNameRequired,
        variant: 'destructive',
      });
      return;
    }

    if (!formData.whatsapp) {
      toast({
        title: t.completeProfile.errorTitle,
        description: t.completeProfile.whatsappRequired,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await authApi.updateProfile(formData);
      toast({
        title: t.completeProfile.successTitle,
        description: t.completeProfile.successDescription,
      });
      setOpen(false);
      // Recarrega a página para atualizar os dados do usuário
      window.location.reload();
    } catch (error: any) {
      toast({
        title: t.completeProfile.errorTitle,
        description: error.message || t.completeProfile.errorUpdating,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.username) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Não permite fechar o dialog até completar o perfil
      if (!isOpen) {
        toast({
          title: t.completeProfile.attentionTitle,
          description: t.completeProfile.mustCompleteProfile,
          variant: 'destructive',
        });
      }
    }}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-500">
            <AlertCircle className="h-6 w-6" />
            <DialogTitle className="text-xl">{t.completeProfile.title}</DialogTitle>
          </div>
          <DialogDescription>
            {t.completeProfile.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">
              {t.completeProfile.usernameLabel}{' '}
              <span className="text-xs text-muted-foreground ml-2">
                {t.completeProfile.usernameHint}
              </span>
            </Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder={t.completeProfile.usernamePlaceholder}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
                className="rounded-xl pr-10"
                required
                minLength={3}
                autoFocus
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
              <p className="text-xs text-red-500">{t.completeProfile.usernameInUse}</p>
            )}
            {usernameAvailable === true && (
              <p className="text-xs text-green-500">{t.completeProfile.usernameAvailable}</p>
            )}
          </div>

          {/* Nome Completo */}
          <div className="space-y-2">
            <Label htmlFor="full_name">{t.completeProfile.fullNameLabel}</Label>
            <Input
              id="full_name"
              type="text"
              placeholder={t.completeProfile.fullNamePlaceholder}
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="rounded-xl"
              required
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp">{t.completeProfile.whatsappLabel}</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder={t.completeProfile.whatsappPlaceholder}
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="rounded-xl"
              required
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>{t.completeProfile.importantNote}</strong> {t.completeProfile.importantNoteText}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl"
            disabled={loading || usernameAvailable === false || checkingUsername}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t.completeProfile.submittingButton}
              </>
            ) : (
              t.completeProfile.submitButton
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
