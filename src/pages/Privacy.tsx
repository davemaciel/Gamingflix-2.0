import { Header } from '@/components/Header';
import { useLanguage } from '@/hooks/useLanguage';
import { Lock, Eye, Database, Shield, Mail, Trash2 } from 'lucide-react';

const Privacy = () => {
  const { t } = useLanguage();

  const sections = [
    {
      icon: Database,
      title: t.privacyPage.section1Title,
      content: t.privacyPage.section1Content,
    },
    {
      icon: Eye,
      title: t.privacyPage.section2Title,
      content: t.privacyPage.section2Content,
    },
    {
      icon: Shield,
      title: t.privacyPage.section3Title,
      content: t.privacyPage.section3Content,
    },
    {
      icon: Lock,
      title: t.privacyPage.section4Title,
      content: t.privacyPage.section4Content,
    },
    {
      icon: Mail,
      title: t.privacyPage.section5Title,
      content: t.privacyPage.section5Content,
    },
    {
      icon: Trash2,
      title: t.privacyPage.section6Title,
      content: t.privacyPage.section6Content,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t.privacyPage.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t.privacyPage.subtitle}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t.privacyPage.lastUpdated}: 14 de Novembro de 2025
          </p>
        </div>

        {/* Trust Badge */}
        <div className="mb-8 p-6 bg-green-500/10 border-2 border-green-500/30 rounded-2xl">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t.privacyPage.trustBadgeTitle}</h3>
              <p className="text-muted-foreground">
                {t.privacyPage.trustBadgeText}
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Sections */}
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

        {/* Data Retention */}
        <div className="mt-8 p-6 bg-card border-2 border-border rounded-2xl">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            {t.privacyPage.dataRetentionTitle}
          </h3>
          <div className="space-y-2 text-muted-foreground">
            <p>• <strong>Conta ativa:</strong> Dados mantidos enquanto usar o serviço</p>
            <p>• <strong>Após cancelamento:</strong> Dados mantidos por 90 dias</p>
            <p>• <strong>Após solicitação de exclusão:</strong> Dados deletados em até 30 dias</p>
            <p>• <strong>Logs de segurança:</strong> Mantidos por 180 dias (obrigatório)</p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 p-8 bg-primary/10 border-2 border-primary/30 rounded-2xl text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            {t.privacyPage.contactTitle}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t.privacyPage.contactText}
          </p>
          <p className="text-sm text-muted-foreground">
            {t.privacyPage.dataOfficer}
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
            <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <span className="text-lg">📄</span>
              <span>{t.terms}</span>
            </a>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <a href="/privacy" className="text-primary font-semibold flex items-center gap-2">
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

export default Privacy;
