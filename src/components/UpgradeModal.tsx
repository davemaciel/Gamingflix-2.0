import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Check, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { getFoundersPricing } from '@/config/founders';
import { checkoutApi, subscriptionsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [waitingPayment, setWaitingPayment] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { founders: foundersPrice } = getFoundersPricing(language);
  const foundersHighlight = t.foundersLimitedSpotsHighlight.replace('{{price}}', foundersPrice);

  // Limpar polling quando o componente desmontar
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Verificar status de assinatura
  const checkSubscriptionStatus = async () => {
    try {
      const subscription = await subscriptionsApi.getMySubscription();
      if (subscription && subscription.status === 'active') {
        // Pagamento confirmado! Redirecionar para o catálogo
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        setWaitingPayment(false);
        onOpenChange(false);
        
        toast({
          title: '🎉 Pagamento confirmado!',
          description: 'Bem-vindo ao Ultimate Founders! Redirecionando...',
        });
        
        setTimeout(() => {
          navigate('/catalogo');
        }, 1000);
        
        return true;
      }
      return false;
    } catch (error) {
      // Erro ao verificar (pode ser que o usuário não esteja logado ainda)
      return false;
    }
  };

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const session = await checkoutApi.getSession();
      
      // Abrir checkout em nova aba
      window.open(session.checkout_url, '_blank');
      
      // Iniciar polling para verificar pagamento
      setWaitingPayment(true);
      
      toast({
        title: '🔄 Aguardando pagamento...',
        description: 'Complete o pagamento na aba aberta. Detectaremos automaticamente quando for confirmado.',
      });
      
      // Verificar a cada 5 segundos por até 5 minutos
      let attempts = 0;
      const maxAttempts = 60; // 5 minutos (60 * 5s)
      
      pollingIntervalRef.current = setInterval(async () => {
        attempts++;
        
        const hasActiveSubscription = await checkSubscriptionStatus();
        
        if (hasActiveSubscription || attempts >= maxAttempts) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          setWaitingPayment(false);
          
          if (!hasActiveSubscription && attempts >= maxAttempts) {
            toast({
              title: 'Tempo esgotado',
              description: 'Não detectamos o pagamento. Se você já pagou, aguarde alguns minutos e recarregue a página.',
            });
          }
        }
      }, 5000); // Verificar a cada 5 segundos
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao abrir checkout',
        description: error.message || 'Tente novamente',
      });
      setWaitingPayment(false);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    t.features.unlimitedAccess,
    t.features.lifetimePrice,
    t.features.founderBadge,
    t.features.unlimitedSwap,
    t.features.vipSupport,
    t.features.offlineAccess,
    t.features.earlyAccess,
    t.features.catalogPriority,
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            {t.upgradeTitle}
          </DialogTitle>
          <DialogDescription className="text-center text-base text-muted-foreground">
            {t.upgradeDescription}
          </DialogDescription>
          <p className="text-xs text-center font-semibold text-primary mt-2">
            {foundersHighlight}
          </p>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="rounded-2xl bg-muted/60 p-4 space-y-3">
            <h4 className="font-semibold text-sm text-foreground">
              {t.upgradeBenefitsTitle}
            </h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full rounded-2xl text-sm sm:text-base"
            >
              {t.upgradeBack}
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full rounded-2xl gap-2 bg-primary hover:bg-primary/90 text-sm sm:text-base"
            >
              <ShoppingCart className="h-4 w-4" />
              {loading ? 'Carregando...' : t.upgradeViewPlans}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
