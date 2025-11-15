import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, Check, X, Zap, Clock, Users, GamepadIcon, Lock, Sparkles, ArrowRight, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';
import { useLanguage } from '@/hooks/useLanguage';

export const SteamGuard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'requesting' | 'received' | 'done'>('idle');
  const [code, setCode] = useState('');

  // Função para copiar código
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: '✅ Copiado!',
        description: 'Código Steam Guard copiado para a área de transferência',
      });
    } catch (error) {
      // Fallback para navegadores antigos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: '✅ Copiado!',
          description: 'Código Steam Guard copiado para a área de transferência',
        });
      } catch (err) {
        toast({
          title: '❌ Erro ao copiar',
          description: 'Não foi possível copiar. Por favor, copie manualmente.',
          variant: 'destructive'
        });
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  // Buscar código REAL do email via IMAP
  const requestSteamGuardCode = async () => {
    setLoading(true);
    setStep('requesting');
    setCode('');

    try {
      const response = await fetch('/api/steam-guard/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar código');
      }

      setStep('received');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCode(data.code);
      setStep('done');
      
      toast({
        title: '✅ Código encontrado!',
        description: `Código Steam Guard: ${data.code}`,
      });

    } catch (err: any) {
      setStep('idle');
      toast({
        title: '❌ Erro',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="GamingFlix" className="h-8 w-auto" />
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            Ver Catálogo
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Novidade para Clientes Antigos</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Steam Guard Automático
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sem espera, sem copiar códigos, sem complicação. <br/>
            Tudo <strong>automático</strong> para você.
          </p>
        </div>

        {/* Antes vs Agora */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* ANTES */}
          <Card className="p-6 border-2 border-destructive/20 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <div className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <X className="h-4 w-4" />
                Antes
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-2">Compra Individual</h3>
              <p className="text-muted-foreground text-sm">Como era antigamente</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-destructive/10 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium">Esperava código no WhatsApp</p>
                  <p className="text-sm text-muted-foreground">Podia demorar minutos ou horas</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-destructive/10 p-2 rounded-lg">
                  <GamepadIcon className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium">1 jogo por vez</p>
                  <p className="text-sm text-muted-foreground">Comprava cada jogo separado</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-destructive/10 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium">Conta compartilhada</p>
                  <p className="text-sm text-muted-foreground">Jogava quando estava livre</p>
                </div>
              </div>
            </div>
          </Card>

          {/* AGORA */}
          <Card className="p-6 border-2 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            
            <div className="absolute top-4 right-4">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                Agora
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-2">Catálogo Completo</h3>
              <p className="text-muted-foreground text-sm">A evolução chegou</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Steam Guard Automático</p>
                  <p className="text-sm text-muted-foreground">Código em segundos, sem esperar</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <GamepadIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">+50 Jogos AAA</p>
                  <p className="text-sm text-muted-foreground">Troca quando quiser, ilimitado</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Conta exclusiva no momento</p>
                  <p className="text-sm text-muted-foreground">Jogue sem preocupações</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Solicitar Código Steam Guard */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-primary/5 to-purple-500/5 border-2">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Buscar Código Steam Guard</h2>
            <p className="text-muted-foreground">
              Clique no botão e receba o código REAL do seu email em segundos
            </p>
          </div>

          <div className="max-w-2xl mx-auto">

            {/* Fluxo Visual */}
            <div className="bg-background/50 backdrop-blur rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                {/* Passo 1 */}
                <div className="flex-1 text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 transition-all ${
                    step === 'requesting' ? 'bg-primary text-primary-foreground' : 
                    step === 'received' || step === 'done' ? 'bg-primary/20 text-primary' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    <Clock className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium">Você solicita</p>
                </div>

                <ArrowRight className={`h-6 w-6 flex-shrink-0 ${
                  step === 'received' || step === 'done' ? 'text-primary' : 'text-muted-foreground'
                }`} />

                {/* Passo 2 */}
                <div className="flex-1 text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 transition-all ${
                    step === 'received' ? 'bg-primary text-primary-foreground' : 
                    step === 'done' ? 'bg-primary/20 text-primary' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    <Zap className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium">Sistema busca</p>
                </div>

                <ArrowRight className={`h-6 w-6 flex-shrink-0 ${
                  step === 'done' ? 'text-primary' : 'text-muted-foreground'
                }`} />

                {/* Passo 3 */}
                <div className="flex-1 text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 transition-all ${
                    step === 'done' ? 'bg-primary text-primary-foreground' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    <Check className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium">Código pronto!</p>
                </div>
              </div>

              {/* Display do Código */}
              {code && (
                <div className="mt-6 animate-in fade-in duration-300">
                  <p className="text-sm text-muted-foreground mb-2 text-center">Código Steam Guard:</p>
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border-2 border-primary">
                    <div className="flex-1">
                      <p className="text-4xl font-mono font-bold text-center tracking-wider text-primary">
                        {code}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(code)}
                      className="flex-shrink-0 h-10 w-10 ml-2"
                      title="Copiar código"
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Use este código para fazer login no Steam
                  </p>
                </div>
              )}
            </div>

            <Button 
              onClick={requestSteamGuardCode} 
              disabled={loading}
              size="lg"
              className="w-full text-lg h-14"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Buscando código...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Solicitar Código Steam Guard
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Tempo médio: <strong>2-5 segundos</strong>
            </p>
          </div>
        </Card>

        {/* Benefícios do Catálogo */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            O Que Você Ganha com o Catálogo
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <GamepadIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">+50 Jogos AAA</h3>
              <p className="text-muted-foreground">
                Assassin's Creed, GTA, Elden Ring, God of War e muito mais
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Trocas Ilimitadas</h3>
              <p className="text-muted-foreground">
                Enjoou? Troque de jogo na hora, quantas vezes quiser
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Steam Guard Auto</h3>
              <p className="text-muted-foreground">
                Sem esperar, código em segundos automaticamente
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Final */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-primary to-purple-600 text-primary-foreground text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para Evoluir?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Você já conhece a qualidade da GamingFlix. <br/>
            Agora é hora de conhecer o <strong>futuro</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg h-14 px-8"
              onClick={() => navigate('/catalogo')}
            >
              <GamepadIcon className="h-5 w-5 mr-2" />
              Ver Catálogo Completo
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg h-14 px-8 bg-white/10 border-white/20 hover:bg-white/20 text-white"
              onClick={() => navigate('/')}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Assinar Agora
            </Button>
          </div>

          <p className="mt-6 text-sm opacity-75">
            💎 Preço especial Founders por tempo limitado
          </p>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-12 text-muted-foreground">
          <p className="mb-2">
            <strong>5 anos</strong> de experiência • <strong>+50 jogos</strong> no catálogo • <strong>Suporte VIP</strong>
          </p>
          <p className="text-sm">
            A GamingFlix que você conhece e confia, agora ainda melhor.
          </p>
        </div>
      </div>
    </div>
  );
};
