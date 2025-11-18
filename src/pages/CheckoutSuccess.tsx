import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionsApi } from '@/lib/api';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'success' | 'pending'>('checking');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkSubscription = async () => {
      try {
        const subscription = await subscriptionsApi.getMySubscription();
        
        if (subscription && subscription.status === 'active') {
          setStatus('success');
          // Redirecionar para o catálogo após 2 segundos
          setTimeout(() => {
            navigate('/catalogo');
          }, 2000);
        } else {
          setAttempts(prev => prev + 1);
          
          // Após 20 tentativas (aproximadamente 1 minuto), mostrar mensagem de pendente
          if (attempts >= 20) {
            setStatus('pending');
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setAttempts(prev => prev + 1);
        
        if (attempts >= 20) {
          setStatus('pending');
        }
      }
    };

    // Verificar imediatamente
    checkSubscription();

    // Continuar verificando a cada 3 segundos
    if (status === 'checking') {
      interval = setInterval(checkSubscription, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [navigate, attempts, status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === 'checking' && (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Verificando seu pagamento...</h1>
              <p className="text-muted-foreground">
                Aguarde enquanto confirmamos sua assinatura.
              </p>
              <p className="text-sm text-muted-foreground">
                Tentativa {attempts + 1} de 20
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-green-500">🎉 Pagamento Confirmado!</h1>
              <p className="text-muted-foreground">
                Bem-vindo ao Ultimate Founders! Redirecionando para o catálogo...
              </p>
            </div>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-yellow-500" />
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Pagamento Pendente</h1>
              <p className="text-muted-foreground">
                Não conseguimos confirmar seu pagamento automaticamente.
              </p>
              <p className="text-sm text-muted-foreground">
                Se você já completou o pagamento, ele pode levar alguns minutos para ser processado.
                Você receberá um email de confirmação quando tudo estiver pronto.
              </p>
              <div className="space-y-2 pt-4">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                  variant="outline"
                >
                  🔄 Verificar Novamente
                </Button>
                <Button 
                  onClick={() => navigate('/catalogo')} 
                  className="w-full"
                >
                  Ir para o Catálogo
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
