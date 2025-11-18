import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, Gamepad2, Shield, Clock, Repeat, Zap, LogOut, ShoppingCart } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from '@/components/LanguageSelector';
import { getFoundersPricing } from '@/config/founders';
import { checkoutApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Landing = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    try {
      setLoading(true);
      const session = await checkoutApi.getSession();
      window.open(session.checkout_url, '_blank');
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

  const { founders: foundersPrice, regular: regularPrice } = getFoundersPricing(language);
  const foundersLimitedText = t.foundersLimitedSpotsHighlight.replace('{{price}}', foundersPrice);

  const foundersFeatures = [
    t.features.unlimitedAccess,
    t.features.lifetimePrice,
    t.features.founderBadge,
    t.features.unlimitedSwap,
    t.features.allNewReleases,
    t.features.guarantee30Days,
    t.features.vipSupport,
    t.features.offlineAccess,
    t.features.earlyAccess,
    t.features.catalogPriority,
  ];

  const faqs = [
    {
      question: t.faqs.foundersProgram.question,
      answer: t.faqs.foundersProgram.answer,
    },
    {
      question: t.faqs.whatsappPurchase.question,
      answer: t.faqs.whatsappPurchase.answer,
    },
    {
      question: t.faqs.lifetimePrice.question,
      answer: t.faqs.lifetimePrice.answer,
    },
    {
      question: t.faqs.international.question,
      answer: t.faqs.international.answer,
    },
    {
      question: t.faqs.accountOwnership.question,
      answer: t.faqs.accountOwnership.answer,
    },
    {
      question: t.faqs.onlinePlay.question,
      answer: t.faqs.onlinePlay.answer,
    },
    {
      question: t.faqs.mobile.question,
      answer: t.faqs.mobile.answer,
    },
    {
      question: t.faqs.verification.question,
      answer: t.faqs.verification.answer,
    },
    {
      question: t.faqs.modifyAccount.question,
      answer: t.faqs.modifyAccount.answer,
    },
    {
      question: t.faqs.familySharing.question,
      answer: t.faqs.familySharing.answer,
    },
    {
      question: t.faqs.swapGames.question,
      answer: t.faqs.swapGames.answer,
    },
    {
      question: t.faqs.guarantee.question,
      answer: t.faqs.guarantee.answer,
    },
    {
      question: t.faqs.cancelSubscription.question,
      answer: t.faqs.cancelSubscription.answer,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-8" />
          </Link>
          <nav className="flex items-center gap-2 md:gap-4">
            <LanguageSelector />
            <Link to="/catalogo" className="hidden md:inline-flex">
              <Button variant="ghost" className="gap-2">
                <Gamepad2 className="h-4 w-4" />
                {t.viewCatalog}
              </Button>
            </Link>
            <Link to="/catalogo" className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                aria-label={t.viewCatalog}
              >
                <Gamepad2 className="h-4 w-4" />
              </Button>
            </Link>
            {user ? (
              <Button
                onClick={handleSignOut}
                variant="ghost"
                aria-label={t.logout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">{t.logout}</span>
              </Button>
            ) : (
              <Link to="/auth">
                <Button>{t.login}</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" variant="outline">
            {t.limitedSpots}
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t.heroTitle}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              className="text-lg px-8 gap-2 bg-primary hover:bg-primary/90" 
              onClick={handleCheckout}
              disabled={loading}
            >
              <ShoppingCart className="h-5 w-5" />
              {loading ? 'Carregando...' : t.secureFoundersSpot}
            </Button>
            <Link to="/catalogo">
              <Button size="lg" variant="outline" className="text-lg px-8">
                {t.exploreCatalog}
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
                <CardTitle>{t.originalTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.originalDescription}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t.immediateAccessTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.immediateAccessDescription}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Repeat className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t.freeSwapTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.freeSwapDescription}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12">{t.howItWorksTitle}</h2>
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t.step1Title}</h3>
                <p className="text-muted-foreground">
                  {t.step1Description}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t.step2Title}</h3>
                <p className="text-muted-foreground">
                  {t.step2Description}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t.step3Title}</h3>
                <p className="text-muted-foreground">
                  {t.step3Description}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t.step4Title}</h3>
                <p className="text-muted-foreground">
                  {t.step4Description}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                5
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t.step5Title}</h3>
                <p className="text-muted-foreground">
                  {t.step5Description}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                6
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t.step6Title}</h3>
                <p className="text-muted-foreground">
                  {t.step6Description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - PLANO ÃšNICO FOUNDERS */}
      <section id="planos" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 text-base px-4 py-2 bg-primary text-primary-foreground" variant="default">
              {t.exclusiveOffer}
            </Badge>
            <h2 className="text-4xl font-bold mb-4">{t.pricingTitle}</h2>
            <p className="text-xl text-muted-foreground">
              {t.pricingSubtitle}
            </p>
          </div>

          {/* Card do Plano Founders - Centralizado */}
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">

              <CardHeader>
                <CardTitle className="text-2xl">{t.ultimateFounders}</CardTitle>
                <CardDescription className="text-sm min-h-[40px]">
                  {t.lifetimePriceDescription}
                </CardDescription>
                
                <div className="mt-4">
                  <div className="text-lg text-muted-foreground line-through mb-1">
                    {t.regularPriceLabel} {regularPrice}
                  </div>
                  <div>
                    <span className="text-4xl font-bold text-primary">{foundersPrice}</span>
                    <span className="text-muted-foreground text-sm">{t.perMonth}</span>
                  </div>
                  <div className="text-sm font-semibold text-primary mt-2">
                    {t.lifetimeBadge}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t.unlimitedBadge}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {foundersFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  className="w-full py-5 sm:py-6 text-sm sm:text-base gap-2 bg-primary hover:bg-primary/90" 
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {loading ? 'Carregando...' : t.whatsappButtonLabel}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {t.whatsappButtonDescription}
                </p>
              </CardFooter>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              {t.foundersFullAccessHighlight}
            </p>
            <p className="text-sm text-primary font-semibold mt-2">
              {foundersLimitedText}
            </p>
          </div>
        </div>
      </section>

      {/* What You're Buying */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12">{t.whatYoureBuying}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                  {t.sharedAccountTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.sharedAccountDescription}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {t.offlineUseTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.offlineUseDescription}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {t.originalGamesTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.originalGamesDescription}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  {t.accessGuaranteeTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.accessGuaranteeDescription}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-12">{t.faqTitle}</h2>
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
            {t.readyToBeFounder}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t.secureSpotCTA} {foundersPrice}{t.perMonth}.
            <strong className="text-primary"> {t.limitedSpotsWarning}</strong>
          </p>
          <Button 
            size="lg" 
            className="text-lg px-12 gap-2 bg-primary hover:bg-primary/90" 
            onClick={handleCheckout}
            disabled={loading}
          >
            <ShoppingCart className="h-5 w-5" />
            {loading ? 'Carregando...' : t.secureMySpotNow}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 mb-4 text-sm">
            <a href="/releases" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <span className="text-lg">📋</span>
              <span>{t.changelog}</span>
            </a>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <span className="text-lg">📄</span>
              <span>{t.terms}</span>
            </a>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <span>{t.privacy}</span>
            </a>
          </div>
          <p className="text-muted-foreground text-sm">Â© 2025 GamingFlix. {t.allRightsReserved}</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;





















