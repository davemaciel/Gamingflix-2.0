import { Header } from '@/components/Header';
import { useLanguage } from '@/hooks/useLanguage';
import { FileText, Shield, AlertCircle, Ban, CreditCard, Lock } from 'lucide-react';

const Terms = () => {
  const { t } = useLanguage();

  const sections = [
    {
      icon: FileText,
      title: t.termsPage.section1Title,
      content: t.termsPage.section1Content,
    },
    {
      icon: Shield,
      title: t.termsPage.section2Title,
      content: t.termsPage.section2Content,
    },
    {
      icon: Ban,
      title: t.termsPage.section3Title,
      content: t.termsPage.section3Content,
    },
    {
      icon: Lock,
      title: t.termsPage.section4Title,
      content: t.termsPage.section4Content,
    },
    {
      icon: CreditCard,
      title: t.termsPage.section5Title,
      content: t.termsPage.section5Content,
    },
    {
      icon: AlertCircle,
      title: t.termsPage.section6Title,
      content: t.termsPage.section6Content,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t.termsPage.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t.termsPage.subtitle}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t.termsPage.lastUpdated}: 14 de Novembro de 2025
          </p>
        </div>

        {/* Important Notice */}
        <div className="mb-8 p-6 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t.termsPage.importantTitle}</h3>
              <p className="text-muted-foreground">
                {t.termsPage.importantText}
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                className="bg-card border-2 border-border rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground flex-1">
                    {section.title}
                  </h2>
                </div>

                <ul className="space-y-3 ml-16">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-muted-foreground leading-relaxed flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="mt-12 p-8 bg-primary/10 border-2 border-primary/30 rounded-2xl text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            {t.termsPage.contactTitle}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t.termsPage.contactText}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 mb-4 text-sm">
            <a href="/releases" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <span className="text-lg">📋</span>
              <span>{t.changelog}</span>
            </a>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <a href="/terms" className="text-primary font-semibold flex items-center gap-2">
              <span className="text-lg">📄</span>
              <span>{t.terms}</span>
            </a>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <span>{t.privacy}</span>
            </a>
          </div>
          <p className="text-muted-foreground text-sm">© 2025 GamingFlix. {t.allRightsReserved}</p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
