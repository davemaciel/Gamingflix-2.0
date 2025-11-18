import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X, Gift, Clock } from 'lucide-react';
import { checkoutApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';

export const CheckoutAbandonedModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    if (checkoutStatus === 'abandoned') {
      setOpen(true);
      // Remove o parâmetro da URL sem recarregar a página
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('checkout');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleRetryCheckout = async () => {
    try {
      setLoading(true);
      const session = await checkoutApi.getSession();
      window.open(session.checkout_url, '_blank');
      setOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao abrir checkout',
        description: error.message || 'Tente novamente',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Ainda está interessado? 🎮
          </DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <p className="text-base">
              Notamos que você não completou sua compra. Não perca a oportunidade de se tornar um <strong>Founder</strong>!
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefícios em destaque */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">Preço Vitalício Garantido</h4>
                <p className="text-sm text-muted-foreground">
                  R$ 59,90/mês para sempre - nunca aumenta!
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">Vagas Limitadas</h4>
                <p className="text-sm text-muted-foreground">
                  Apenas 100 Founders - depois o preço sobe para R$ 87,90/mês
                </p>
              </div>
            </div>
          </div>

          {/* Urgência */}
          <div className="text-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500">
              ⚡ Outras pessoas estão garantindo suas vagas agora!
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleRetryCheckout}
            disabled={loading}
            className="w-full h-12 text-base font-semibold"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {loading ? 'Abrindo...' : 'Sim, quero garantir minha vaga!'}
          </Button>
          
          <Button
            onClick={() => setOpen(false)}
            variant="ghost"
            className="w-full"
          >
            <X className="mr-2 h-4 w-4" />
            Não, obrigado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
