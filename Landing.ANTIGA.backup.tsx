import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, Gamepad2, Shield, Clock, Repeat, Zap, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';

const Landing = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const plans = [
    {
      name: 'Ultimate - Mensal',
      price: 'R$ 87,90',
      description: 'Acesso total a biblioteca completa',
      period: '1 m├¬s',
      games: 'Ilimitado',
      features: [
        'Acesso ILIMITADO a todos os jogos',
        'Troca ilimitada de jogos',
        'Garantia de 30 dias',
        'Suporte VIP 24/7',
        'Acesso offline',
        'Todos os lan├ºamentos dispon├¡veis',
        'Flexibilidade mensal'
      ],
      popular: false
    },
    {
      name: 'Ultimate - Trimestral',
      price: 'R$ 79,90',
      originalPrice: 'R$ 87,90',
      description: 'Economize 10% - Ideal para jogar mais',
      period: '3 meses',
      discount: '10% OFF',
      games: 'Ilimitado',
      features: [
        'Acesso ILIMITADO a todos os jogos',
        'Troca ilimitada de jogos',
        'Garantia de 30 dias',
        'Suporte VIP 24/7',
        'Acesso offline',
        'Todos os lan├ºamentos dispon├¡veis',
        'Economia de R$ 24,00 no total'
      ],
      popular: false
    },
    {
      name: 'Ultimate - Semestral',
      price: 'R$ 74,90',
      originalPrice: 'R$ 87,90',
      description: 'Economize 15% - Mais tempo para jogar',
      period: '6 meses',
      discount: '15% OFF',
      games: 'Ilimitado',
      features: [
        'Acesso ILIMITADO a todos os jogos',
        'Troca ilimitada de jogos',
        'Garantia de 30 dias',
        'Suporte VIP 24/7',
        'Acesso offline',
        'Todos os lan├ºamentos dispon├¡veis',
        'Economia de R$ 78,00 no total'
      ],
      popular: false
    },
    {
      name: 'Ultimate - Anual',
      price: 'R$ 69,90',
      originalPrice: 'R$ 87,90',
      description: 'MELHOR OFERTA - 1 ano de acesso total',
      period: '12 meses',
      discount: '20% OFF',
      highlight: 'MAIS VANTAJOSO',
      games: 'Ilimitado',
      features: [
        'Acesso ILIMITADO a todos os jogos',
        'Troca ilimitada de jogos',
        'TODOS OS LAN├çAMENTOS NOVOS inclusos',
        'Garantia de 30 dias',
        'Suporte VIP 24/7',
        'Acesso offline',
        'Acesso antecipado a novos jogos',
        'Economia de R$ 216,00 no total'
      ],
      popular: true
    }
  ];

  const faqs = [
    {
      question: 'Consigo acessar mesmo n├úo morando no Brasil?',
      answer: 'Sim! ├ë poss├¡vel acessar em qualquer pa├¡s.'
    },
    {
      question: 'A conta ├⌐ s├│ minha para sempre?',
      answer: 'A conta ├⌐ compartilhada com garantia de uso de 30 dias. Se mantiver o acesso ap├│s o prazo da garantia e continuar com a assinatura ativa, o acesso permanece enquanto sua assinatura estiver ativa.'
    },
    {
      question: 'Vou poder jogar online?',
      answer: 'Apenas offline. Este servi├ºo ├⌐ destinado exclusivamente para jogos no modo offline.'
    },
    {
      question: 'Posso utilizar no celular ou em nuvem?',
      answer: 'O uso deste produto destina-se exclusivamente a PCs (computadores).'
    },
    {
      question: 'Existe alguma verifica├º├úo nos jogos?',
      answer: 'Sim! Ocasionalmente, alguns jogos podem ter a verifica├º├úo do Denuvo, um sistema antipirataria que dura aproximadamente 24 horas at├⌐ a restaura├º├úo do jogo.'
    },
    {
      question: 'Posso modificar os dados da conta?',
      answer: 'N├úo. Tentar alterar dados da conta ├⌐ contra as regras e pode levar ao bloqueio de seu acesso.'
    },
    {
      question: 'Posso compartilhar o jogo via modo fam├¡lia?',
      answer: 'Infelizmente, n├úo ├⌐ poss├¡vel. Nossas contas na categoria Offline n├úo oferecem esse recurso.'
    },
    {
      question: 'Posso trocar os jogos do meu plano?',
      answer: 'Sim! Voc├¬ pode trocar os jogos selecionados a qualquer momento sem custo adicional, desde que sua assinatura esteja ativa.'
    },
    {
      question: 'Como funciona a garantia de 30 dias?',
      answer: 'Fornecemos garantia de 30 dias ap├│s a compra. Durante este per├¡odo, oferecemos suporte a quaisquer problemas que voc├¬ venha ter. Ap├│s o vencimento da garantia, voc├¬ permanece com o acesso por├⌐m sem o suporte t├⌐cnico incluso.'
    },
    {
      question: 'Posso cancelar minha assinatura a qualquer momento?',
      answer: 'Sim! Voc├¬ pode cancelar sua assinatura a qualquer momento. Voc├¬ manter├í acesso at├⌐ o fim do per├¡odo j├í pago.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-8" />
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/catalogo">
              <Button variant="ghost">Ver Cat├ílogo</Button>
            </Link>
            {user ? (
              <Button onClick={handleSignOut} variant="ghost">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            ) : (
              <Link to="/auth">
                <Button>Entrar</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-4" variant="secondary">Acesso Imediato Ap├│s Pagamento</Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            GamingFlix Ultimate
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Cat├ílogo completo de jogos da Steam por uma assinatura mensal. Jogue quantos jogos quiser, sem limites.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="#planos">
              <Button size="lg" className="text-lg px-8">
                Ver Planos Ultimate
              </Button>
            </Link>
            <Link to="/catalogo">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Explorar Cat├ílogo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>100% Original</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Todos os jogos s├úo originais da Steam com garantia de 30 dias de suporte completo.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Acesso Imediato</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receba suas credenciais instantaneamente ap├│s o pagamento aprovado.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Repeat className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Troca Livre</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Troque os jogos do seu plano a qualquer momento, sem burocracia.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12">Como Funciona?</h2>
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Escolha seu Plano Ultimate</h3>
                <p className="text-muted-foreground">
                  Selecione o per├¡odo ideal para voc├¬. Quanto mais tempo, maior o desconto e economia!
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Escolha QUANTOS Jogos Quiser</h3>
                <p className="text-muted-foreground">
                  Navegue pelo nosso cat├ílogo completo e escolha TODOS os jogos que deseja. Acesso 100% ilimitado!
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Receba as Credenciais</h3>
                <p className="text-muted-foreground">
                  Ap├│s o pagamento, receba instantaneamente login e senha da conta Steam compartilhada.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Jogue Offline</h3>
                <p className="text-muted-foreground">
                  Configure o modo offline na Steam e aproveite seus jogos sem necessidade de conex├úo constante.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                5
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Troque Quando Quiser</h3>
                <p className="text-muted-foreground">
                  Cansou de um jogo? Troque por outro do cat├ílogo a qualquer momento pelo painel.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                6
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Aproveite com Garantia</h3>
                <p className="text-muted-foreground">
                  30 dias de garantia completa com suporte para qualquer problema t├⌐cnico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 text-base px-4 py-2" variant="default">GAMINGFLIX ULTIMATE - ACESSO ILIMITADO</Badge>
            <h2 className="text-4xl font-bold mb-4">Escolha Seu Plano Ultimate</h2>
            <p className="text-xl text-muted-foreground">
              Como no Game Pass, mas melhor ΓÇó Cat├ílogo completo ΓÇó Sem limites
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.popular ? 'border-primary border-2 relative lg:scale-105' : 'relative'}>
                {plan.popular && plan.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm px-3 py-1">
                    {plan.highlight}
                  </Badge>
                )}
                {!plan.popular && plan.discount && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm px-3 py-1 bg-green-600">
                    {plan.discount}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm min-h-[40px]">{plan.description}</CardDescription>
                  <div className="mt-3">
                    {plan.originalPrice && (
                      <div className="text-lg text-muted-foreground line-through mb-1">
                        {plan.originalPrice}
                      </div>
                    )}
                    <div>
                      <span className="text-3xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">/m├¬s</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-primary mt-2">
                    {plan.period}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ≡ƒÄ« Acesso ILIMITADO
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/auth" className="w-full">
                    <Button 
                      className="w-full text-sm py-5" 
                      variant={plan.popular ? 'default' : 'outline'}
                      size="default"
                    >
                      {plan.popular ? '≡ƒÜÇ Assinar Agora' : 'Assinar Plano'}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Γ£ô Todos os planos GamingFlix Ultimate incluem acesso TOTAL e ILIMITADO a biblioteca completa
            </p>
          </div>
        </div>
      </section>

      {/* What You're Buying */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12">O que Voc├¬ Est├í Comprando?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                  Conta Compartilhada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Acesso garantido a uma conta Steam para uso no modo offline, permitindo que voc├¬ jogue sempre que desejar.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Uso Offline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Acesse os jogos exclusivamente no modo offline da Steam. Este modo permite jogar sem estar conectado online.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  100% Original
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Todos os jogos s├úo aut├¬nticos e originais da Steam, proporcionando seguran├ºa e a melhor experi├¬ncia.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Garantia de Acesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  30 dias de garantia completa para resolver qualquer problema relacionado ├á perda de acesso.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para o GamingFlix Ultimate?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Escolha seu plano Ultimate e comece a jogar agora mesmo. Acesso ilimitado a biblioteca completa!
          </p>
          <Link to="#planos">
            <Button size="lg" className="text-lg px-12">
              Assinar Ultimate
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>┬⌐ 2025 GamingFlix. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
