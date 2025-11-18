import { Header } from '@/components/Header';
import { useLanguage } from '@/hooks/useLanguage';
import { Calendar, Sparkles, Bug, Lock, Globe, Zap } from 'lucide-react';

interface ChangeItem {
  type: 'feature' | 'improvement' | 'bugfix' | 'security';
  description: string;
  caseNumber?: string;
}

interface Release {
  version: string;
  date: string;
  changes: ChangeItem[];
}

const releases: Release[] = [
  {
    version: 'v1.3.0',
    date: '18 de Novembro, 2025',
    changes: [
      {
        type: 'feature',
        description: 'Integração completa com GGCheckout - pagamentos via PIX e Cartão de Crédito',
      },
      {
        type: 'feature',
        description: 'Sistema de webhook automático para confirmação de pagamentos em tempo real',
      },
      {
        type: 'feature',
        description: 'Redirecionamento automático pós-pagamento para página do catálogo',
      },
      {
        type: 'feature',
        description: 'Sistema de polling inteligente - verifica automaticamente quando o pagamento é aprovado',
      },
      {
        type: 'feature',
        description: 'Emails transacionais profissionais com branding GamingFlix (cor vermelha)',
      },
      {
        type: 'feature',
        description: 'Sistema unificado de envio de emails - Resend API com fallback SMTP',
      },
      {
        type: 'feature',
        description: 'Templates de email para: assinatura criada, expirando (7 e 3 dias), expirada, cancelada e renovada',
      },
      {
        type: 'feature',
        description: 'Email de recuperação de senha com design moderno e instruções de segurança',
      },
      {
        type: 'feature',
        description: 'Sistema de logs detalhados para debug completo do fluxo de pagamento',
      },
      {
        type: 'feature',
        description: 'Endpoint de teste de webhook para simulação de pagamentos em desenvolvimento',
      },
      {
        type: 'improvement',
        description: 'Documentação completa do GGCheckout em CHECKOUT-SETUP.md e GGCHECKOUT-REDIRECT.md',
      },
      {
        type: 'improvement',
        description: 'Guia de debug de webhooks em DEBUG-WEBHOOK.md com instruções detalhadas',
      },
      {
        type: 'improvement',
        description: 'Plano "Ultimate Founders" criado automaticamente no primeiro pagamento',
      },
      {
        type: 'improvement',
        description: 'Usuários marcados como Founders automaticamente após primeiro pagamento',
      },
      {
        type: 'security',
        description: 'Validação de webhooks com verificação de origem e tipo de evento',
      },
      {
        type: 'security',
        description: 'Cancelamento automático de assinaturas antigas ao criar nova assinatura',
      },
      {
        type: 'bugfix',
        description: 'Corrigido erro de valor vazio em SelectItem do filtro de transações',
      },
    ],
  },
  {
    version: 'v1.2.0',
    date: '14 de Novembro, 2025',
    changes: [
      {
        type: 'feature',
        description: 'Implementado catálogo público - visualização de jogos sem necessidade de login',
      },
      {
        type: 'feature',
        description: 'Sistema de proteção de conteúdo sensível em duas camadas (autenticação + plano ativo)',
      },
      {
        type: 'feature',
        description: 'Modais inteligentes de login e upgrade ao tentar acessar conteúdo restrito',
      },
      {
        type: 'feature',
        description: 'Internacionalização completa em Português, Inglês e Espanhol para telas de perfil',
      },
      {
        type: 'improvement',
        description: 'Rota GET /api/games agora é pública para melhor experiência do usuário',
      },
      {
        type: 'improvement',
        description: 'Página de detalhes do jogo com card de bloqueio visual para usuários sem acesso',
      },
      {
        type: 'improvement',
        description: 'Traduções completas para CompleteProfileDialog em 3 idiomas',
      },
      {
        type: 'improvement',
        description: 'Profile Page 100% multilíngue com validações traduzidas',
      },
      {
        type: 'bugfix',
        description: 'Removidas todas as referências ao Supabase - migração completa para MongoDB',
      },
      {
        type: 'bugfix',
        description: 'Corrigido erro que impedia exibição do catálogo de jogos',
      },
      {
        type: 'bugfix',
        description: 'Mensagens de erro atualizadas para refletir arquitetura atual (MongoDB)',
      },
      {
        type: 'security',
        description: 'Proteção de informações sensíveis (login, senha, family code) apenas para usuários autenticados',
      },
      {
        type: 'security',
        description: 'Steam Guard restrito exclusivamente para assinantes ativos',
      },
      {
        type: 'security',
        description: 'Validação frontend + backend para dupla camada de proteção',
      },
    ],
  },
  {
    version: 'v1.1.0',
    date: '13 de Novembro, 2025',
    changes: [
      {
        type: 'feature',
        description: 'Sistema de gerenciamento de usuários no painel administrativo',
      },
      {
        type: 'feature',
        description: 'Criação e gerenciamento de assinaturas pelo admin',
      },
      {
        type: 'improvement',
        description: 'Interface do admin responsiva para dispositivos móveis',
      },
      {
        type: 'bugfix',
        description: 'Corrigida expiração de tokens JWT',
      },
    ],
  },
  {
    version: 'v1.0.0',
    date: '10 de Novembro, 2025',
    changes: [
      {
        type: 'feature',
        description: 'Lançamento inicial da plataforma GamingFlix',
      },
      {
        type: 'feature',
        description: 'Sistema de autenticação com JWT',
      },
      {
        type: 'feature',
        description: 'Catálogo de jogos com filtros e busca',
      },
      {
        type: 'feature',
        description: 'Sistema de planos e assinaturas',
      },
      {
        type: 'feature',
        description: 'Integração com Steam Guard',
      },
    ],
  },
];

const Releases = () => {
  const { t } = useLanguage();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature':
        return { label: t.releasesPage.newFeature, color: 'bg-green-500', icon: Sparkles };
      case 'improvement':
        return { label: t.releasesPage.improvement, color: 'bg-blue-500', icon: Zap };
      case 'bugfix':
        return { label: t.releasesPage.bugfix, color: 'bg-red-500', icon: Bug };
      case 'security':
        return { label: t.releasesPage.security, color: 'bg-purple-500', icon: Lock };
      default:
        return { label: 'ATUALIZAÇÃO', color: 'bg-gray-500', icon: Globe };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t.releasesPage.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t.releasesPage.subtitle}
          </p>
        </div>

        {/* Releases List */}
        <div className="space-y-12">
          {releases.map((release, releaseIndex) => (
            <div
              key={release.version}
              className="bg-card border-2 border-border rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Version Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b border-border">
                <h2 className="text-3xl font-bold text-primary mb-2 md:mb-0">
                  {release.version}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{release.date}</span>
                </div>
              </div>

              {/* Changes List */}
              <div className="space-y-4">
                {release.changes.map((change, changeIndex) => {
                  const typeInfo = getTypeLabel(change.type);
                  const Icon = typeInfo.icon;

                  return (
                    <div
                      key={changeIndex}
                      className="flex items-start gap-4 group hover:bg-muted/50 p-3 rounded-lg transition-colors"
                    >
                      {/* Type Badge */}
                      <div
                        className={`${typeInfo.color} text-white text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1 flex-shrink-0 mt-0.5`}
                      >
                        <Icon className="h-3 w-3" />
                        {typeInfo.label}
                      </div>

                      {/* Description */}
                      <div className="flex-1">
                        <p className="text-foreground leading-relaxed">
                          {change.description}
                          {change.caseNumber && (
                            <span className="text-muted-foreground text-sm ml-2">
                              - {change.caseNumber}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats Footer */}
              <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>
                  ✨ {release.changes.filter((c) => c.type === 'feature').length} {t.releasesPage.features}
                </span>
                <span>
                  ⚡ {release.changes.filter((c) => c.type === 'improvement').length} {t.releasesPage.improvements}
                </span>
                <span>
                  🐛 {release.changes.filter((c) => c.type === 'bugfix').length} {t.releasesPage.fixes}
                </span>
                <span>
                  🔒 {release.changes.filter((c) => c.type === 'security').length} {t.releasesPage.securityUpdates}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center p-8 bg-primary/10 border-2 border-primary/30 rounded-2xl">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            {t.releasesPage.suggestionsTitle}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t.releasesPage.suggestionsText}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 mb-4 text-sm">
            <a href="/releases" className="text-primary font-semibold flex items-center gap-2">
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
          <p className="text-sm text-muted-foreground">© 2025 GamingFlix. {t.allRightsReserved}</p>
        </div>
      </footer>
    </div>
  );
};

export default Releases;
