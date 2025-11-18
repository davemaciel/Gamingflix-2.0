export type Language = 'pt-BR' | 'en' | 'es';

export interface Translations {
  // Header
  searchPlaceholder: string;
  subscribe: string;
  admin: string;
  logout: string;
  plans: string;
  login: string;
  viewCatalog: string;
  
  // Footer links
  changelog: string;
  terms: string;
  privacy: string;

  // Landing Hero
  limitedSpots: string;
  heroTitle: string;
  heroSubtitle: string;
  secureFoundersSpot: string;
  exploreCatalog: string;

  // Benefits
  originalTitle: string;
  originalDescription: string;
  immediateAccessTitle: string;
  immediateAccessDescription: string;
  freeSwapTitle: string;
  freeSwapDescription: string;

  // How it Works
  howItWorksTitle: string;
  step1Title: string;
  step1Description: string;
  step2Title: string;
  step2Description: string;
  step3Title: string;
  step3Description: string;
  step4Title: string;
  step4Description: string;
  step5Title: string;
  step5Description: string;
  step6Title: string;
  step6Description: string;

  // Pricing
  exclusiveOffer: string;
  pricingTitle: string;
  pricingSubtitle: string;
  foundersLimitedSpots: string;
  ultimateFounders: string;
  lifetimePriceDescription: string;
  perMonth: string;
  regularPriceSoon: string;
  guaranteeLifetimePrice: string;
  whatsappPurchase: string;

  // Features
  features: {
    unlimitedAccess: string;
    lifetimePrice: string;
    founderBadge: string;
    unlimitedSwap: string;
    allNewReleases: string;
    guarantee30Days: string;
    vipSupport: string;
    offlineAccess: string;
    earlyAccess: string;
    catalogPriority: string;
  };

  // FAQ
  faqTitle: string;
  faqs: {
    foundersProgram: {
      question: string;
      answer: string;
    };
    whatsappPurchase: {
      question: string;
      answer: string;
    };
    lifetimePrice: {
      question: string;
      answer: string;
    };
    international: {
      question: string;
      answer: string;
    };
    accountOwnership: {
      question: string;
      answer: string;
    };
    onlinePlay: {
      question: string;
      answer: string;
    };
    mobile: {
      question: string;
      answer: string;
    };
    verification: {
      question: string;
      answer: string;
    };
    modifyAccount: {
      question: string;
      answer: string;
    };
    familySharing: {
      question: string;
      answer: string;
    };
    swapGames: {
      question: string;
      answer: string;
    };
    guarantee: {
      question: string;
      answer: string;
    };
    cancelSubscription: {
      question: string;
      answer: string;
    };
  };

  // Footer
  footerTagline: string;
  allRightsReserved: string;

  // Catalog
  loadingGames: string;
  noGamesFound: string;
  tryAnotherSearch: string;

  // Game Card
  addGame: string;
  removeGame: string;
  upgradeRequired: string;

  // WhatsApp Message
  whatsappMessage: string;

  // What You're Buying Section
  whatYoureBuying: string;
  sharedAccountTitle: string;
  sharedAccountDescription: string;
  offlineUseTitle: string;
  offlineUseDescription: string;
  originalGamesTitle: string;
  originalGamesDescription: string;
  accessGuaranteeTitle: string;
  accessGuaranteeDescription: string;

  // Final CTA
  readyToBeFounder: string;
  secureSpotCTA: string;
  limitedSpotsWarning: string;
  secureMySpotNow: string;

  // Auth Page
  authTagline: string;
  loginTab: string;
  signupTab: string;
  loginTitle: string;
  loginDescription: string;
  signupTitle: string;
  signupDescription: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  whatsappLabel: string;
  whatsappPlaceholder: string;
  loginButton: string;
  loggingInButton: string;
  signupButton: string;
  signingUpButton: string;

  // Forgot Password Page
  forgotPasswordTitle: string;
  forgotPasswordDescription: string;
  sendEmailButton: string;
  sendingEmailButton: string;
  backToLogin: string;
  emailSentTitle: string;
  emailSentDescription: string;
  checkSpamFolder: string;
  emailSentSuccess: string;

  // Language Toggle
  languageToggle: {
    ariaLabel: string;
    switchToEnglish: string;
    switchToPortuguese: string;
    switchToSpanish: string;
  };

  // Landing Extras
  regularPriceLabel: string;
  lifetimeBadge: string;
  unlimitedBadge: string;
  whatsappButtonLabel: string;
  whatsappButtonDescription: string;
  foundersFullAccessHighlight: string;
  foundersLimitedSpotsHighlight: string;

  // Common
  back: string;
  backToCatalog: string;
  viewPlans: string;

  // Catalog
  catalogTitle: string;
  catalogCountSingular: string;
  catalogCountPlural: string;
  catalogPreviewTitle: string;
  catalogPreviewDescription: string;
  catalogErrorTitle: string;
  catalogErrorDescription: string;

  // Loading
  loadingGame: string;
  loadingCatalog: string;
  loadingGames: string;
  loadingAdmin: string;

  // Auth Modal
  authModalTitle: string;
  authModalDescription: string;
  authLoginErrorTitle: string;
  authLoginErrorDescription: string;
  authLoginInvalid: string;
  authQuickSignupButton: string;
  authLoginSuccessTitle: string;
  authLoginSuccessDescription: string;
  authRequiredFieldTitle: string;
  authRequiredFieldDescription: string;
  authSignupSuccessTitle: string;
  authSignupSuccessDescription: string;

  // Upgrade Modal
  upgradeTitle: string;
  upgradeDescription: string;
  upgradeBenefitsTitle: string;
  upgradeBack: string;
  upgradeViewPlans: string;

  // Game Detail
  gameDetail: {
    errorTitle: string;
    errorDescription: string;
    waitTitle: string;
    waitDescription: string;
    timeoutMessage: string;
    timeoutToastTitle: string;
    timeoutToastDescription: string;
    unknownError: string;
    accessInfoTitle: string;
    loginLabel: string;
    passwordLabel: string;
    familyCodeLabel: string;
    tutorialTitle: string;
    steamGuardTitle: string;
    steamGuardButtonIdle: string;
    steamGuardButtonLoading: string;
    steamGuardProgress: string;
    steamGuardSuccessTitle: string;
    steamGuardSuccessDescription: string;
    steamGuardErrorTitle: string;
    steamGuardErrorDescription: string;
    steamGuardHint: string;
    copySuccessTitle: string;
    copySuccessDescription: string;
    copyErrorTitle: string;
    copyErrorDescription: string;
    copyFallbackDescription: string;
    clipboardLabels: {
      login: string;
      password: string;
      familyCode: string;
      steamGuard: string;
    };
  };

  // Admin Panel
  adminPanel: {
    title: string;
    subtitle: string;
    footerLabel: string;
    tabs: {
      games: string;
      users: string;
    };
  };

  // Complete Profile Dialog
  completeProfile: {
    title: string;
    description: string;
    usernameLabel: string;
    usernameHint: string;
    usernamePlaceholder: string;
    usernameInUse: string;
    usernameAvailable: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    whatsappLabel: string;
    whatsappPlaceholder: string;
    importantNote: string;
    importantNoteText: string;
    submitButton: string;
    submittingButton: string;
    attentionTitle: string;
    mustCompleteProfile: string;
    errorTitle: string;
    usernameMinLength: string;
    usernameAlreadyInUse: string;
    fullNameRequired: string;
    whatsappRequired: string;
    successTitle: string;
    successDescription: string;
    errorUpdating: string;
  };

  // Profile Page
  profilePage: {
    personalInfoTab: string;
    securityTab: string;
    personalInfoTitle: string;
    personalInfoDescription: string;
    usernameLabel: string;
    usernameHint: string;
    usernamePlaceholder: string;
    usernameInUse: string;
    usernameAvailable: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    whatsappLabel: string;
    whatsappPlaceholder: string;
    updateProfileButton: string;
    updatingButton: string;
    passwordTitle: string;
    passwordDescription: string;
    currentPasswordLabel: string;
    currentPasswordPlaceholder: string;
    newPasswordLabel: string;
    newPasswordPlaceholder: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    updatePasswordButton: string;
    updatingPasswordButton: string;
    successTitle: string;
    profileUpdated: string;
    passwordUpdated: string;
    errorTitle: string;
    fillAllFields: string;
    usernameMinLength: string;
    passwordMinLength: string;
    passwordsDontMatch: string;
    errorUpdatingProfile: string;
    errorUpdatingPassword: string;
  };

  // Releases/Changelog Page
  releasesPage: {
    title: string;
    subtitle: string;
    released: string;
    newFeature: string;
    improvement: string;
    bugfix: string;
    security: string;
    features: string;
    improvements: string;
    fixes: string;
    securityUpdates: string;
    suggestionsTitle: string;
    suggestionsText: string;
  };

  // Terms Page
  termsPage: {
    title: string;
    subtitle: string;
    lastUpdated: string;
    importantTitle: string;
    importantText: string;
    contactTitle: string;
    contactText: string;
    section1Title: string;
    section1Content: string[];
    section2Title: string;
    section2Content: string[];
    section3Title: string;
    section3Content: string[];
    section4Title: string;
    section4Content: string[];
    section5Title: string;
    section5Content: string[];
    section6Title: string;
    section6Content: string[];
  };

  // Privacy Page
  privacyPage: {
    title: string;
    subtitle: string;
    lastUpdated: string;
    trustBadgeTitle: string;
    trustBadgeText: string;
    dataRetentionTitle: string;
    contactTitle: string;
    contactText: string;
    dataOfficer: string;
    section1Title: string;
    section1Content: string[];
    section2Title: string;
    section2Content: string[];
    section3Title: string;
    section3Content: string[];
    section4Title: string;
    section4Content: string[];
    section5Title: string;
    section5Content: string[];
    section6Title: string;
    section6Content: string[];
  };
}

export const translations: Record<Language, Translations> = {
  'pt-BR': {
    searchPlaceholder: 'Buscar jogos...',
    subscribe: 'Assinar',
    admin: 'Admin',
    logout: 'Sair',
    plans: 'Planos',
    login: 'Entrar',
    viewCatalog: 'Ver Catálogo',
    
    changelog: 'Changelog',
    terms: 'Termos de Uso',
    privacy: 'Política de Privacidade',

    limitedSpots: '🔥 Vagas Limitadas - Primeiros 100 Founders',
    heroTitle: 'GamingFlix Ultimate Founders',
    heroSubtitle: 'Catálogo completo de jogos da Steam por uma assinatura mensal. Jogue quantos jogos quiser, sem limites. Seja um dos primeiros 100 Founders e garanta preço vitalício!',
    secureFoundersSpot: 'Garantir Vaga Founders',
    exploreCatalog: 'Explorar Catálogo',

    originalTitle: '100% Original',
    originalDescription: 'Todos os jogos são originais da Steam com garantia de 30 dias de suporte completo.',
    immediateAccessTitle: 'Acesso Imediato',
    immediateAccessDescription: 'Receba suas credenciais instantaneamente após confirmação do pagamento via WhatsApp.',
    freeSwapTitle: 'Troca Livre',
    freeSwapDescription: 'Troque os jogos do seu plano a qualquer momento, sem burocracia.',

    howItWorksTitle: 'Como Funciona?',
    step1Title: 'Clique em "Garantir Vaga Founders"',
    step1Description: 'O botão abrirá o WhatsApp com uma mensagem automática. É rápido e fácil!',
    step2Title: 'Confirme Seus Dados',
    step2Description: 'Nossa equipe responderá imediatamente pedindo seu nome, e-mail e forma de pagamento preferida (Pix, Cartão ou Transferência).',
    step3Title: 'Efetue o Pagamento',
    step3Description: 'Você receberá os dados para pagamento. Após confirmação, suas credenciais são enviadas instantaneamente!',
    step4Title: 'Escolha QUANTOS Jogos Quiser',
    step4Description: 'Navegue pelo nosso catálogo completo e escolha TODOS os jogos que deseja. Acesso 100% ilimitado!',
    step5Title: 'Jogue Offline',
    step5Description: 'Configure o modo offline na Steam e aproveite seus jogos sem necessidade de conexão constante.',
    step6Title: 'Aproveite com Garantia',
    step6Description: '30 dias de garantia completa com suporte para qualquer problema técnico. Founders têm prioridade no atendimento!',

    exclusiveOffer: '🏆 OFERTA EXCLUSIVA - PRIMEIROS 100 FOUNDERS',
    pricingTitle: 'Ultimate Founders - Preço Vitalício',
    pricingSubtitle: 'Como no Game Pass, mas melhor • Catálogo completo • Sem limites • Preço garantido para sempre',
    foundersLimitedSpots: '🔥 FOUNDERS - VAGAS LIMITADAS',
    ultimateFounders: 'Ultimate Founders',
    lifetimePriceDescription: 'Acesso total vitalício com preço bloqueado para sempre',
    perMonth: '/mês',
    regularPriceSoon: 'Em breve',
    guaranteeLifetimePrice: 'Garantir Preço Vitalício',
    whatsappPurchase: 'Comprar via WhatsApp',

    features: {
      unlimitedAccess: 'Acesso ILIMITADO a todos os jogos',
      lifetimePrice: 'Preço vitalício de R$ 59,90/mês (nunca aumenta)',
      founderBadge: 'Badge exclusivo de FOUNDER no seu perfil',
      unlimitedSwap: 'Troca ilimitada de jogos',
      allNewReleases: 'TODOS OS LANÇAMENTOS NOVOS inclusos',
      guarantee30Days: 'Garantia de 30 dias',
      vipSupport: 'Suporte VIP 24/7',
      offlineAccess: 'Acesso offline',
      earlyAccess: 'Acesso antecipado a novos jogos',
      catalogPriority: 'Prioridade em atualizações do catálogo',
    },

    faqTitle: 'Perguntas Frequentes',
    faqs: {
      foundersProgram: {
        question: 'O que é o programa Founders?',
        answer: 'Os primeiros 100 assinantes do GamingFlix Ultimate ganham o status de FOUNDER: preço vitalício de R$ 59,90/mês (mesmo quando o preço normal subir para R$ 87,90), badge exclusivo e benefícios permanentes.',
      },
      whatsappPurchase: {
        question: 'Como funciona a compra via WhatsApp?',
        answer: 'Clique no botão de WhatsApp, envie a mensagem automática e nossa equipe responderá imediatamente com os dados para pagamento (Pix, cartão ou transferência). Após confirmação do pagamento, você recebe suas credenciais na hora.',
      },
      lifetimePrice: {
        question: 'O preço de R$ 59,90 é realmente vitalício?',
        answer: 'Sim! Founders pagam R$ 59,90/mês para sempre, mesmo quando o preço regular aumentar para R$ 87,90. É um benefício exclusivo e permanente registrado no seu perfil.',
      },
      international: {
        question: 'Consigo acessar mesmo não morando no Brasil?',
        answer: 'Sim! É possível acessar em qualquer país.',
      },
      accountOwnership: {
        question: 'A conta é só minha para sempre?',
        answer: 'A conta é compartilhada com garantia de uso de 30 dias. Se mantiver o acesso após o prazo da garantia e continuar com a assinatura ativa, o acesso permanece enquanto sua assinatura estiver ativa.',
      },
      onlinePlay: {
        question: 'Vou poder jogar online?',
        answer: 'Apenas offline. Este serviço é destinado exclusivamente para jogos no modo offline.',
      },
      mobile: {
        question: 'Posso utilizar no celular ou em nuvem?',
        answer: 'O uso deste produto destina-se exclusivamente a PCs (computadores).',
      },
      verification: {
        question: 'Existe alguma verificação nos jogos?',
        answer: 'Sim! Ocasionalmente, alguns jogos podem ter a verificação do Denuvo, um sistema antipirataria que dura aproximadamente 24 horas até a restauração do jogo.',
      },
      modifyAccount: {
        question: 'Posso modificar os dados da conta?',
        answer: 'Não. Tentar alterar dados da conta é contra as regras e pode levar ao bloqueio de seu acesso.',
      },
      familySharing: {
        question: 'Posso compartilhar o jogo via modo família?',
        answer: 'Infelizmente, não é possível. Nossas contas na categoria Offline não oferecem esse recurso.',
      },
      swapGames: {
        question: 'Posso trocar os jogos do meu plano?',
        answer: 'Sim! Você pode trocar os jogos selecionados a qualquer momento sem custo adicional, desde que sua assinatura esteja ativa.',
      },
      guarantee: {
        question: 'Como funciona a garantia de 30 dias?',
        answer: 'Fornecemos garantia de 30 dias após a compra. Durante este período, oferecemos suporte a quaisquer problemas que você venha ter. Após o vencimento da garantia, você permanece com o acesso porém sem o suporte técnico incluso.',
      },
      cancelSubscription: {
        question: 'Posso cancelar minha assinatura a qualquer momento?',
        answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento. Você manterá acesso até o fim do período já pago.',
      },
    },

    footerTagline: 'Jogue sem limites • Catálogo completo de Steam • Founders com preço vitalício',
    allRightsReserved: 'Todos os direitos reservados.',

    loadingGames: 'Carregando jogos...',
    loadingAdmin: 'Carregando área administrativa...',
    noGamesFound: 'Nenhum jogo encontrado',
    tryAnotherSearch: 'Tente outro termo de busca',

    addGame: 'Adicionar Jogo',
    removeGame: 'Remover Jogo',
    upgradeRequired: 'Faça upgrade para acessar',

    whatsappMessage: '🎮 Olá! Quero garantir minha vaga como FOUNDER do GamingFlix Ultimate por R$ 59,90/mês vitalício!',

    whatYoureBuying: 'O que Você Está Comprando?',
    sharedAccountTitle: 'Conta Compartilhada',
    sharedAccountDescription: 'Acesso garantido a uma conta Steam para uso no modo offline, permitindo que você jogue sempre que desejar.',
    offlineUseTitle: 'Uso Offline',
    offlineUseDescription: 'Acesse os jogos exclusivamente no modo offline da Steam. Este modo permite jogar sem estar conectado online.',
    originalGamesTitle: '100% Original',
    originalGamesDescription: 'Todos os jogos são autênticos e originais da Steam, proporcionando segurança e a melhor experiência.',
    accessGuaranteeTitle: 'Garantia de Acesso',
    accessGuaranteeDescription: '30 dias de garantia completa para resolver qualquer problema relacionado à perda de acesso.',

    readyToBeFounder: 'Pronto para Ser um Founder?',
    secureSpotCTA: 'Garanta seu lugar entre os primeiros 100 Founders e tenha preço vitalício de',
    limitedSpotsWarning: 'Vagas limitadas!',
    secureMySpotNow: 'Garantir Minha Vaga Agora',

    authTagline: 'Seu catálogo de jogos',
    loginTab: 'Entrar',
    signupTab: 'Cadastrar',
    loginTitle: 'Login',
    loginDescription: 'Entre com sua conta',
    signupTitle: 'Cadastro',
    signupDescription: 'Crie sua conta',
    emailLabel: 'Email',
    emailPlaceholder: 'seu@email.com',
    passwordLabel: 'Senha',
    fullNameLabel: 'Nome completo',
    fullNamePlaceholder: 'Seu nome',
    whatsappLabel: 'WhatsApp',
    whatsappPlaceholder: '(00) 00000-0000',
    loginButton: 'Entrar',
    loggingInButton: 'Entrando...',
    signupButton: 'Cadastrar',
    signingUpButton: 'Cadastrando...',

    // Forgot Password
    forgotPasswordTitle: 'Recuperar Senha',
    forgotPasswordDescription: 'Digite seu email para receber instruções de recuperação',
    sendEmailButton: 'Enviar Email',
    sendingEmailButton: 'Enviando...',
    backToLogin: 'Voltar para o login',
    emailSentTitle: 'Email enviado!',
    emailSentDescription: 'Se o email existir em nossa base, você receberá um link para recuperar sua senha.',
    checkSpamFolder: 'Verifique sua caixa de entrada e spam.',
    emailSentSuccess: 'Se o email existir, um link de recuperação será enviado',

    languageToggle: {
      ariaLabel: 'Alternar idioma',
      switchToEnglish: 'Mudar para inglês',
      switchToPortuguese: 'Mudar para português',
      switchToSpanish: 'Mudar para espanhol',
    },
    regularPriceLabel: 'Preço regular:',
    lifetimeBadge: '🎯 Preço vitalício - nunca aumenta',
    unlimitedBadge: '🎮 Acesso ILIMITADO',
    whatsappButtonLabel: 'Garantir Vaga Founders',
    whatsappButtonDescription: '✅ Resposta imediata • Pagamento facilitado • Acesso instantâneo',
    foundersFullAccessHighlight: '⚡ Plano GamingFlix Ultimate Founders inclui acesso TOTAL e ILIMITADO à biblioteca completa',
    foundersLimitedSpotsHighlight: '🏆 Apenas os primeiros 100 assinantes garantem o preço de {{price}} para sempre',
    back: 'Voltar',
    backToCatalog: 'Voltar ao catálogo',
    viewPlans: 'Ver Planos',
    catalogTitle: 'Catálogo de Jogos',
    catalogCountSingular: '{{count}} jogo disponível',
    catalogCountPlural: '{{count}} jogos disponíveis',
    catalogPreviewTitle: 'Prévia do Catálogo Founders',
    catalogPreviewDescription: 'Faça login ou garanta o Ultimate Founders para liberar todos os jogos com credenciais imediatas e trocas ilimitadas.',
    catalogErrorTitle: 'Erro ao carregar catálogo',
    catalogErrorDescription: 'Verifique sua conexão com o servidor',
    loadingGame: 'Carregando jogo...',
    loadingCatalog: 'Carregando catálogo...',
    authModalTitle: 'Acesse sua conta',
    authModalDescription: 'Entre ou cadastre-se para acessar os jogos',
    authLoginErrorTitle: 'Erro ao fazer login',
    authLoginErrorDescription: 'Verifique seu email e senha',
    authLoginInvalid: 'Credenciais inválidas ou conta inexistente. Você pode se cadastrar com estes dados.',
    authQuickSignupButton: 'Cadastrar com estes dados',
    authLoginSuccessTitle: 'Bem-vindo!',
    authLoginSuccessDescription: 'Login realizado com sucesso',
    authRequiredFieldTitle: 'Campo obrigatório',
    authRequiredFieldDescription: 'Por favor, preencha o cadastro completo incluindo o WhatsApp',
    authSignupSuccessTitle: 'Conta criada!',
    authSignupSuccessDescription: 'Faça login para continuar',
    upgradeTitle: 'Garanta sua vaga Ultimate Founders',
    upgradeDescription: 'Desbloqueie acesso ilimitado ao catálogo completo, trocas livres e preço vitalício garantido para os primeiros 100 Founders.',
    upgradeBenefitsTitle: 'Ao entrar no Ultimate Founders você recebe:',
    upgradeBack: 'Agora não',
    upgradeViewPlans: 'Falar com especialista',
    gameDetail: {
      errorTitle: 'Erro',
      errorDescription: 'Não foi possível carregar o jogo',
      waitTitle: 'Aguarde',
      waitDescription: 'Você pode solicitar novamente em {{seconds}} segundos',
      timeoutMessage: 'Tempo esgotado: Nenhum código encontrado em 45 segundos',
      timeoutToastTitle: 'Tempo esgotado',
      timeoutToastDescription: 'Não foi possível encontrar o código. Tente novamente.',
      unknownError: 'Erro desconhecido',
      accessInfoTitle: 'Informações de Acesso',
      loginLabel: 'Login Steam',
      passwordLabel: 'Senha',
      familyCodeLabel: 'Código Modo Família',
      tutorialTitle: 'Passo a Passo',
      steamGuardTitle: 'Código Steam Guard',
      steamGuardButtonIdle: 'Buscar Código Steam Guard',
      steamGuardButtonLoading: 'Buscando código...',
      steamGuardProgress: 'Pesquisando emails do Steam... {{progress}}%',
      steamGuardSuccessTitle: 'Código encontrado!',
      steamGuardSuccessDescription: 'Use este código para fazer login no Steam',
      steamGuardErrorTitle: 'Erro ao buscar código',
      steamGuardErrorDescription: 'Não foi possível buscar o código. Tente novamente.',
      steamGuardHint: 'Clique no botão acima para buscar o código 2FA do Steam automaticamente',
      copySuccessTitle: 'Copiado!',
      copySuccessDescription: '{{label}} copiado para a área de transferência',
      copyErrorTitle: 'Erro ao copiar',
      copyErrorDescription: 'Não foi possível copiar. Por favor, copie manualmente.',
      copyFallbackDescription: '{{label}} copiado para a área de transferência',
      clipboardLabels: {
        login: 'Login Steam',
        password: 'Senha',
        familyCode: 'Código',
        steamGuard: 'Código Steam Guard',
      },
    },
    adminPanel: {
      title: 'Painel Administrativo',
      subtitle: 'Gerencie jogos e usuários da plataforma',
      footerLabel: 'Painel Administrativo',
      tabs: {
        games: 'Jogos',
        users: 'Usuários',
      },
    },
    completeProfile: {
      title: 'Complete seu Perfil',
      description: 'Para continuar usando o GamingFlix, precisamos que você complete algumas informações do seu perfil.',
      usernameLabel: 'Nome de Usuário *',
      usernameHint: '(como você será identificado)',
      usernamePlaceholder: 'ex: jogador123',
      usernameInUse: 'Nome de usuário já está em uso',
      usernameAvailable: 'Nome de usuário disponível!',
      fullNameLabel: 'Nome Completo *',
      fullNamePlaceholder: 'Seu nome completo',
      whatsappLabel: 'WhatsApp *',
      whatsappPlaceholder: '+55 (11) 99999-9999',
      importantNote: 'Importante:',
      importantNoteText: 'Esses dados são necessários para você acessar o catálogo e gerenciar sua conta.',
      submitButton: 'Completar Perfil e Continuar',
      submittingButton: 'Salvando...',
      attentionTitle: 'Atenção',
      mustCompleteProfile: 'Você precisa completar seu perfil para continuar',
      errorTitle: 'Erro',
      usernameMinLength: 'Nome de usuário deve ter no mínimo 3 caracteres',
      usernameAlreadyInUse: 'Nome de usuário já está em uso',
      fullNameRequired: 'Nome completo é obrigatório',
      whatsappRequired: 'WhatsApp é obrigatório',
      successTitle: 'Sucesso!',
      successDescription: 'Perfil completado com sucesso',
      errorUpdating: 'Erro ao completar perfil',
    },
    profilePage: {
      personalInfoTab: 'Informações Pessoais',
      securityTab: 'Segurança',
      personalInfoTitle: 'Informações Pessoais',
      personalInfoDescription: 'Atualize suas informações de perfil',
      usernameLabel: 'Nome de Usuário',
      usernameHint: '(como você é identificado)',
      usernamePlaceholder: 'seu_usuario',
      usernameInUse: 'Nome de usuário já está em uso',
      usernameAvailable: 'Nome de usuário disponível!',
      fullNameLabel: 'Nome Completo',
      fullNamePlaceholder: 'Seu nome completo',
      whatsappLabel: 'WhatsApp',
      whatsappPlaceholder: '+55 (11) 99999-9999',
      updateProfileButton: 'Atualizar Perfil',
      updatingButton: 'Atualizando...',
      passwordTitle: 'Alterar Senha',
      passwordDescription: 'Atualize sua senha de acesso',
      currentPasswordLabel: 'Senha Atual',
      currentPasswordPlaceholder: 'Digite sua senha atual',
      newPasswordLabel: 'Nova Senha',
      newPasswordPlaceholder: 'Digite sua nova senha',
      confirmPasswordLabel: 'Confirmar Nova Senha',
      confirmPasswordPlaceholder: 'Digite novamente a nova senha',
      updatePasswordButton: 'Atualizar Senha',
      updatingPasswordButton: 'Atualizando...',
      successTitle: 'Sucesso!',
      profileUpdated: 'Perfil atualizado com sucesso',
      passwordUpdated: 'Senha atualizada com sucesso',
      errorTitle: 'Erro',
      fillAllFields: 'Por favor, preencha todos os campos',
      usernameMinLength: 'Nome de usuário deve ter no mínimo 3 caracteres',
      passwordMinLength: 'A nova senha deve ter no mínimo 6 caracteres',
      passwordsDontMatch: 'As senhas não coincidem',
      errorUpdatingProfile: 'Erro ao atualizar perfil',
      errorUpdatingPassword: 'Erro ao atualizar senha',
    },
    releasesPage: {
      title: '📋 Changelog',
      subtitle: 'Acompanhe todas as atualizações, melhorias e correções da plataforma',
      released: 'Lançado em',
      newFeature: 'NOVIDADE',
      improvement: 'MELHORIA',
      bugfix: 'CORREÇÃO',
      security: 'SEGURANÇA',
      features: 'novidades',
      improvements: 'melhorias',
      fixes: 'correções',
      securityUpdates: 'segurança',
      suggestionsTitle: '🚀 Tem alguma sugestão?',
      suggestionsText: 'Entre em contato conosco e ajude a melhorar a plataforma!',
    },
    termsPage: {
      title: '📄 Termos de Uso',
      subtitle: 'Leia atentamente antes de usar nossos serviços',
      lastUpdated: 'Última atualização',
      importantTitle: '⚠️ Importante',
      importantText: 'Ao usar o GamingFlix, você concorda com todos os termos descritos abaixo. Jogar online pode resultar em banimento permanente.',
      contactTitle: '📱 Dúvidas sobre os Termos?',
      contactText: 'Entre em contato via WhatsApp para esclarecimentos',
      section1Title: '1. Sobre o Serviço',
      section1Content: [
        'O GamingFlix é uma plataforma de compartilhamento de contas de jogos digitais.',
        'Oferecemos acesso temporário a jogos através de contas compartilhadas da Steam.',
        'Você pode jogar offline nos jogos disponíveis no catálogo durante sua assinatura ativa.',
        'Não vendemos jogos, mas sim acesso compartilhado às contas.',
      ],
      section2Title: '2. Uso Permitido',
      section2Content: [
        '✅ Jogar os jogos disponíveis no catálogo',
        '✅ Usar o modo offline da Steam',
        '✅ Trocar de jogo quantas vezes quiser (planos ilimitados)',
        '✅ Solicitar suporte via WhatsApp',
        '❌ NÃO alterar dados da conta Steam',
        '❌ NÃO jogar online (banimento)',
        '❌ NÃO compartilhar credenciais com terceiros',
        '❌ NÃO usar ferramentas de hack ou trapaça',
      ],
      section3Title: '3. Proibições e Penalidades',
      section3Content: [
        '🚫 Jogar online resultará em banimento permanente da plataforma',
        '🚫 Compartilhar credenciais com outras pessoas',
        '🚫 Tentar hackear ou invadir o sistema',
        '🚫 Usar múltiplas contas para burlar limitações',
        '⚠️ Violações resultam em suspensão imediata sem reembolso',
      ],
      section4Title: '4. Responsabilidade e Segurança',
      section4Content: [
        'As contas são de propriedade do GamingFlix, você apenas aluga o acesso.',
        'Não nos responsabilizamos por banimentos da Steam devido ao mau uso.',
        'Recomendamos sempre jogar no modo offline.',
        'Mantenha suas credenciais de acesso ao GamingFlix em segurança.',
        'Steam Guard é fornecido automaticamente pela plataforma.',
      ],
      section5Title: '5. Pagamentos e Cancelamento',
      section5Content: [
        '💳 Pagamentos via WhatsApp (Pix ou cartão)',
        '📅 Planos mensais com renovação manual',
        '🏆 Plano Founders: preço fixo garantido para sempre',
        '❌ Não oferecemos reembolso após ativação da conta',
        '✅ Você pode cancelar a qualquer momento (sem cobrança futura)',
      ],
      section6Title: '6. Alterações nos Termos',
      section6Content: [
        'Podemos atualizar estes termos a qualquer momento.',
        'Mudanças serão notificadas via email e na página de Changelog.',
        'O uso continuado após mudanças indica aceitação dos novos termos.',
        'Termos antigos permanecem válidos para assinantes Founders.',
      ],
    },
    privacyPage: {
      title: '🔒 Política de Privacidade',
      subtitle: 'Como protegemos e utilizamos seus dados',
      lastUpdated: 'Última atualização',
      trustBadgeTitle: '🛡️ Seus Dados Estão Seguros',
      trustBadgeText: 'Seguimos as melhores práticas de segurança e cumprimos a LGPD (Lei Geral de Proteção de Dados). Seus dados são criptografados e nunca compartilhados com terceiros.',
      dataRetentionTitle: 'Retenção de Dados',
      contactTitle: '📱 Dúvidas sobre Privacidade?',
      contactText: 'Entre em contato via WhatsApp para exercer seus direitos LGPD',
      dataOfficer: 'Encarregado de Dados: GamingFlix Suporte',
      section1Title: '1. Dados Coletados',
      section1Content: [
        '📧 Email - Para autenticação e comunicação',
        '👤 Nome completo - Identificação da conta',
        '📱 WhatsApp - Suporte e notificações',
        '🎮 Histórico de jogos acessados',
        '🕐 Logs de acesso (data, hora, IP)',
        '💳 Dados de pagamento (processados por gateway externo)',
      ],
      section2Title: '2. Como Usamos Seus Dados',
      section2Content: [
        '✅ Fornecer acesso aos jogos e serviços',
        '✅ Processar pagamentos e renovações',
        '✅ Enviar notificações sobre sua conta',
        '✅ Melhorar a plataforma e experiência',
        '✅ Prevenir fraudes e abusos',
        '❌ NUNCA vendemos seus dados para terceiros',
        '❌ NUNCA compartilhamos com empresas de marketing',
      ],
      section3Title: '3. Segurança dos Dados',
      section3Content: [
        '🔒 Senhas criptografadas com bcrypt',
        '🔐 Tokens JWT para autenticação segura',
        '🛡️ MongoDB com autenticação habilitada',
        '📊 Logs de acesso monitorados',
        '⚡ Cache local temporário (5 minutos)',
        '🔄 Backups automáticos diários',
      ],
      section4Title: '4. Cookies e Armazenamento Local',
      section4Content: [
        '🍪 Usamos localStorage para cache de sessão',
        '⏱️ Tokens JWT com validade de 7 dias',
        '💾 Cache de dados do usuário (5 minutos)',
        '🎮 Cache de assinatura (5 minutos)',
        '🗑️ Dados limpos automaticamente ao logout',
        'ℹ️ Não usamos cookies de rastreamento',
      ],
      section5Title: '5. Comunicações',
      section5Content: [
        '📨 Email de boas-vindas ao cadastrar',
        '💌 Notificações de assinatura (ativação, expiração)',
        '🔔 Avisos de sistema importantes',
        '📋 Changelog de atualizações',
        '🚫 Você pode solicitar opt-out de emails promocionais',
        '✅ Emails transacionais não podem ser desativados',
      ],
      section6Title: '6. Seus Direitos (LGPD)',
      section6Content: [
        '📄 Solicitar cópia dos seus dados',
        '✏️ Corrigir dados incorretos',
        '🗑️ Deletar sua conta e dados',
        '❌ Revogar consentimento de uso',
        '📞 Entrar em contato via WhatsApp para exercer direitos',
        '⏱️ Resposta em até 5 dias úteis',
      ],
    },
  },

  'en': {
    searchPlaceholder: 'Search games...',
    subscribe: 'Subscribe',
    admin: 'Admin',
    logout: 'Logout',
    plans: 'Plans',
    login: 'Login',
    viewCatalog: 'View Catalog',
    
    changelog: 'Changelog',
    terms: 'Terms of Use',
    privacy: 'Privacy Policy',

    limitedSpots: '🔥 Limited Spots - First 100 Founders',
    heroTitle: 'GamingFlix Ultimate Founders',
    heroSubtitle: 'Complete Steam game catalog for a monthly subscription. Play as many games as you want, no limits. Be one of the first 100 Founders and secure lifetime pricing!',
    secureFoundersSpot: 'Secure Founders Spot',
    exploreCatalog: 'Explore Catalog',

    originalTitle: '100% Original',
    originalDescription: 'All games are original Steam games with a 30-day full support guarantee.',
    immediateAccessTitle: 'Immediate Access',
    immediateAccessDescription: 'Receive your credentials instantly after payment confirmation via WhatsApp.',
    freeSwapTitle: 'Free Swap',
    freeSwapDescription: 'Swap your plan games anytime, no hassle.',

    howItWorksTitle: 'How It Works?',
    step1Title: 'Click "Secure Founders Spot"',
    step1Description: 'The button will open WhatsApp with an automatic message. Quick and easy!',
    step2Title: 'Confirm Your Details',
    step2Description: 'Our team will respond immediately asking for your name, email, and preferred payment method (Credit Card, PayPal, or Bank Transfer).',
    step3Title: 'Complete Payment',
    step3Description: 'You will receive payment details. After confirmation, your credentials are sent instantly!',
    step4Title: 'Choose AS MANY Games as You Want',
    step4Description: 'Browse our complete catalog and choose ALL the games you want. 100% unlimited access!',
    step5Title: 'Play Offline',
    step5Description: 'Set up offline mode on Steam and enjoy your games without constant connection.',
    step6Title: 'Enjoy with Guarantee',
    step6Description: '30-day full guarantee with support for any technical issues. Founders get priority support!',

    exclusiveOffer: '🏆 EXCLUSIVE OFFER - FIRST 100 FOUNDERS',
    pricingTitle: 'Ultimate Founders - Lifetime Price',
    pricingSubtitle: 'Like Game Pass, but better • Complete catalog • No limits • Price guaranteed forever',
    foundersLimitedSpots: '🔥 FOUNDERS - LIMITED SPOTS',
    ultimateFounders: 'Ultimate Founders',
    lifetimePriceDescription: 'Full lifetime access with price locked forever',
    perMonth: '/month',
    regularPriceSoon: 'Coming soon',
    guaranteeLifetimePrice: 'Guarantee Lifetime Price',
    whatsappPurchase: 'Purchase via WhatsApp',

    features: {
      unlimitedAccess: 'UNLIMITED access to all games',
      lifetimePrice: 'Lifetime price of $12.90/month (never increases)',
      founderBadge: 'Exclusive FOUNDER badge on your profile',
      unlimitedSwap: 'Unlimited game swapping',
      allNewReleases: 'ALL NEW RELEASES included',
      guarantee30Days: '30-day guarantee',
      vipSupport: 'VIP Support 24/7',
      offlineAccess: 'Offline access',
      earlyAccess: 'Early access to new games',
      catalogPriority: 'Priority on catalog updates',
    },

    faqTitle: 'Frequently Asked Questions',
    faqs: {
      foundersProgram: {
        question: 'What is the Founders program?',
        answer: 'The first 100 subscribers of GamingFlix Ultimate get FOUNDER status: lifetime price of $12.90/month (even when regular price rises to $16.90), exclusive badge, and permanent benefits.',
      },
      whatsappPurchase: {
        question: 'How does WhatsApp purchase work?',
        answer: 'Click the WhatsApp button, send the automatic message, and our team will respond immediately with payment details (Credit Card, PayPal, or Bank Transfer). After payment confirmation, you receive your credentials instantly.',
      },
      lifetimePrice: {
        question: 'Is the $12.90 price really lifetime?',
        answer: 'Yes! Founders pay $12.90/month forever, even when the regular price increases to $16.90. It\'s an exclusive and permanent benefit registered in your profile.',
      },
      international: {
        question: 'Can I access from outside Brazil?',
        answer: 'Yes! Access is available from any country.',
      },
      accountOwnership: {
        question: 'Is the account exclusively mine forever?',
        answer: 'The account is shared with a 30-day usage guarantee. If you maintain access after the guarantee period and keep your subscription active, access remains while your subscription is active.',
      },
      onlinePlay: {
        question: 'Can I play online?',
        answer: 'Offline only. This service is exclusively for offline gameplay.',
      },
      mobile: {
        question: 'Can I use on mobile or cloud?',
        answer: 'This product is exclusively for PCs (computers).',
      },
      verification: {
        question: 'Is there any verification in games?',
        answer: 'Yes! Occasionally, some games may have Denuvo verification, an anti-piracy system that lasts approximately 24 hours until game restoration.',
      },
      modifyAccount: {
        question: 'Can I modify account details?',
        answer: 'No. Attempting to change account details is against the rules and may lead to access blocking.',
      },
      familySharing: {
        question: 'Can I share games via family mode?',
        answer: 'Unfortunately, no. Our Offline category accounts don\'t offer this feature.',
      },
      swapGames: {
        question: 'Can I swap games in my plan?',
        answer: 'Yes! You can swap selected games anytime at no additional cost, as long as your subscription is active.',
      },
      guarantee: {
        question: 'How does the 30-day guarantee work?',
        answer: 'We provide a 30-day guarantee after purchase. During this period, we offer support for any issues you may have. After the guarantee expires, you maintain access but without technical support included.',
      },
      cancelSubscription: {
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes! You can cancel your subscription anytime. You\'ll maintain access until the end of the already paid period.',
      },
    },

    footerTagline: 'Play without limits • Complete Steam catalog • Founders with lifetime pricing',
    allRightsReserved: 'All rights reserved.',

    loadingGames: 'Loading games...',
    loadingAdmin: 'Loading admin area...',
    noGamesFound: 'No games found',
    tryAnotherSearch: 'Try another search term',

    addGame: 'Add Game',
    removeGame: 'Remove Game',
    upgradeRequired: 'Upgrade required to access',

    whatsappMessage: '🎮 Hi! I want to secure my FOUNDER spot for GamingFlix Ultimate at $12.90/month lifetime!',

    whatYoureBuying: 'What You\'re Buying?',
    sharedAccountTitle: 'Shared Account',
    sharedAccountDescription: 'Guaranteed access to a Steam account for offline use, allowing you to play whenever you want.',
    offlineUseTitle: 'Offline Use',
    offlineUseDescription: 'Access games exclusively in Steam offline mode. This mode allows you to play without being online.',
    originalGamesTitle: '100% Original',
    originalGamesDescription: 'All games are authentic and original from Steam, providing security and the best experience.',
    accessGuaranteeTitle: 'Access Guarantee',
    accessGuaranteeDescription: '30-day full guarantee to resolve any issues related to loss of access.',

    readyToBeFounder: 'Ready to Become a Founder?',
    secureSpotCTA: 'Secure your spot among the first 100 Founders and get lifetime pricing at',
    limitedSpotsWarning: 'Limited spots!',
    secureMySpotNow: 'Secure My Spot Now',

    authTagline: 'Your game catalog',
    loginTab: 'Login',
    signupTab: 'Sign Up',
    loginTitle: 'Login',
    loginDescription: 'Sign in to your account',
    signupTitle: 'Sign Up',
    signupDescription: 'Create your account',
    emailLabel: 'Email',
    emailPlaceholder: 'your@email.com',
    passwordLabel: 'Password',
    fullNameLabel: 'Full name',
    fullNamePlaceholder: 'Your name',
    whatsappLabel: 'WhatsApp',
    whatsappPlaceholder: '+1 (000) 000-0000',
    loginButton: 'Sign In',
    loggingInButton: 'Signing in...',
    signupButton: 'Sign Up',
    signingUpButton: 'Signing up...',

    // Forgot Password
    forgotPasswordTitle: 'Reset Password',
    forgotPasswordDescription: 'Enter your email to receive recovery instructions',
    sendEmailButton: 'Send Email',
    sendingEmailButton: 'Sending...',
    backToLogin: 'Back to login',
    emailSentTitle: 'Email sent!',
    emailSentDescription: 'If the email exists in our database, you will receive a password reset link.',
    checkSpamFolder: 'Check your inbox and spam folder.',
    emailSentSuccess: 'If the email exists, a recovery link will be sent',

    languageToggle: {
      ariaLabel: 'Change language',
      switchToEnglish: 'Switch to English',
      switchToPortuguese: 'Switch to Portuguese',
      switchToSpanish: 'Switch to Spanish',
    },
    regularPriceLabel: 'Regular price:',
    lifetimeBadge: '🎯 Lifetime price - never increases',
    unlimitedBadge: '🎮 UNLIMITED access',
    whatsappButtonLabel: 'Secure Founders Spot',
    whatsappButtonDescription: '✅ Immediate response • Easy payment • Instant access',
    foundersFullAccessHighlight: '⚡ GamingFlix Ultimate Founders plan includes FULL and UNLIMITED access to the complete library',
    foundersLimitedSpotsHighlight: '🏆 Only the first 100 subscribers guarantee the {{price}} price forever',
    back: 'Back',
    backToCatalog: 'Back to catalog',
    viewPlans: 'View Plans',
    catalogTitle: 'Game Catalog',
    catalogCountSingular: '{{count}} game available',
    catalogCountPlural: '{{count}} games available',
    catalogPreviewTitle: 'Founders Catalog Preview',
    catalogPreviewDescription: 'Log in or secure the Ultimate Founders plan to unlock every game, instant credentials, and unlimited swaps.',
    catalogErrorTitle: 'Error loading catalog',
    catalogErrorDescription: 'Check your server connection',
    loadingGame: 'Loading game...',
    loadingCatalog: 'Loading catalog...',
    authModalTitle: 'Access your account',
    authModalDescription: 'Sign in or create an account to access the games',
    authLoginErrorTitle: 'Login failed',
    authLoginErrorDescription: 'Check your email and password',
    authLoginInvalid: 'Invalid credentials or account not found. You can sign up with these details.',
    authQuickSignupButton: 'Sign up with these details',
    authLoginSuccessTitle: 'Welcome!',
    authLoginSuccessDescription: 'Signed in successfully',
    authRequiredFieldTitle: 'Required field',
    authRequiredFieldDescription: 'Please complete the sign-up form including WhatsApp',
    authSignupSuccessTitle: 'Account created!',
    authSignupSuccessDescription: 'Sign in to continue',
    upgradeTitle: 'Secure your Ultimate Founders spot',
    upgradeDescription: 'Unlock unlimited access to the full catalog, free swaps and lifetime pricing reserved for the first 100 Founders.',
    upgradeBenefitsTitle: 'With the Ultimate Founders plan you get:',
    upgradeBack: 'Maybe later',
    upgradeViewPlans: 'Talk to a specialist',
    gameDetail: {
      errorTitle: 'Error',
      errorDescription: 'Could not load the game',
      waitTitle: 'Please wait',
      waitDescription: 'You can request again in {{seconds}} seconds',
      timeoutMessage: 'Time out: No code found within 45 seconds',
      timeoutToastTitle: 'Time out',
      timeoutToastDescription: 'Could not find the code. Try again.',
      unknownError: 'Unknown error',
      accessInfoTitle: 'Access Information',
      loginLabel: 'Steam Login',
      passwordLabel: 'Password',
      familyCodeLabel: 'Family Mode Code',
      tutorialTitle: 'Step by Step',
      steamGuardTitle: 'Steam Guard Code',
      steamGuardButtonIdle: 'Fetch Steam Guard Code',
      steamGuardButtonLoading: 'Fetching code...',
      steamGuardProgress: 'Scanning Steam emails... {{progress}}%',
      steamGuardSuccessTitle: 'Code found!',
      steamGuardSuccessDescription: 'Use this code to log into Steam',
      steamGuardErrorTitle: 'Error fetching code',
      steamGuardErrorDescription: 'We could not fetch the code. Please try again.',
      steamGuardHint: 'Click the button above to automatically request the Steam 2FA code',
      copySuccessTitle: 'Copied!',
      copySuccessDescription: '{{label}} copied to the clipboard',
      copyErrorTitle: 'Copy failed',
      copyErrorDescription: 'Could not copy. Please copy it manually.',
      copyFallbackDescription: '{{label}} copied to the clipboard',
      clipboardLabels: {
        login: 'Steam login',
        password: 'Password',
        familyCode: 'Code',
        steamGuard: 'Steam Guard code',
      },
    },
    adminPanel: {
      title: 'Admin Panel',
      subtitle: 'Manage games and users on the platform',
      footerLabel: 'Admin Panel',
      tabs: {
        games: 'Games',
        users: 'Users',
      },
    },
    completeProfile: {
      title: 'Complete Your Profile',
      description: 'To continue using GamingFlix, we need you to complete some profile information.',
      usernameLabel: 'Username *',
      usernameHint: '(how you will be identified)',
      usernamePlaceholder: 'e.g., player123',
      usernameInUse: 'Username is already taken',
      usernameAvailable: 'Username is available!',
      fullNameLabel: 'Full Name *',
      fullNamePlaceholder: 'Your full name',
      whatsappLabel: 'WhatsApp *',
      whatsappPlaceholder: '+1 (555) 123-4567',
      importantNote: 'Important:',
      importantNoteText: 'This information is required to access the catalog and manage your account.',
      submitButton: 'Complete Profile and Continue',
      submittingButton: 'Saving...',
      attentionTitle: 'Attention',
      mustCompleteProfile: 'You need to complete your profile to continue',
      errorTitle: 'Error',
      usernameMinLength: 'Username must be at least 3 characters',
      usernameAlreadyInUse: 'Username is already in use',
      fullNameRequired: 'Full name is required',
      whatsappRequired: 'WhatsApp is required',
      successTitle: 'Success!',
      successDescription: 'Profile completed successfully',
      errorUpdating: 'Error completing profile',
    },
    profilePage: {
      personalInfoTab: 'Personal Information',
      securityTab: 'Security',
      personalInfoTitle: 'Personal Information',
      personalInfoDescription: 'Update your profile information',
      usernameLabel: 'Username',
      usernameHint: '(how you are identified)',
      usernamePlaceholder: 'your_username',
      usernameInUse: 'Username is already taken',
      usernameAvailable: 'Username is available!',
      fullNameLabel: 'Full Name',
      fullNamePlaceholder: 'Your full name',
      whatsappLabel: 'WhatsApp',
      whatsappPlaceholder: '+1 (555) 123-4567',
      updateProfileButton: 'Update Profile',
      updatingButton: 'Updating...',
      passwordTitle: 'Change Password',
      passwordDescription: 'Update your access password',
      currentPasswordLabel: 'Current Password',
      currentPasswordPlaceholder: 'Enter your current password',
      newPasswordLabel: 'New Password',
      newPasswordPlaceholder: 'Enter your new password',
      confirmPasswordLabel: 'Confirm New Password',
      confirmPasswordPlaceholder: 'Re-enter your new password',
      updatePasswordButton: 'Update Password',
      updatingPasswordButton: 'Updating...',
      successTitle: 'Success!',
      profileUpdated: 'Profile updated successfully',
      passwordUpdated: 'Password updated successfully',
      errorTitle: 'Error',
      fillAllFields: 'Please fill in all fields',
      usernameMinLength: 'Username must be at least 3 characters',
      passwordMinLength: 'New password must be at least 6 characters',
      passwordsDontMatch: 'Passwords do not match',
      errorUpdatingProfile: 'Error updating profile',
      errorUpdatingPassword: 'Error updating password',
    },
    releasesPage: {
      title: '📋 Changelog',
      subtitle: 'Track all platform updates, improvements and fixes',
      released: 'Released on',
      newFeature: 'NEW FEATURE',
      improvement: 'IMPROVEMENT',
      bugfix: 'BUG FIX',
      security: 'SECURITY',
      features: 'new features',
      improvements: 'improvements',
      fixes: 'fixes',
      securityUpdates: 'security',
      suggestionsTitle: '🚀 Have a suggestion?',
      suggestionsText: 'Contact us and help improve the platform!',
    },
    termsPage: {
      title: '📄 Terms of Use',
      subtitle: 'Read carefully before using our services',
      lastUpdated: 'Last updated',
      importantTitle: '⚠️ Important',
      importantText: 'By using GamingFlix, you agree to all terms described below. Playing online may result in permanent ban.',
      contactTitle: '📱 Questions about the Terms?',
      contactText: 'Contact us via WhatsApp for clarifications',
      section1Title: '1. About the Service',
      section1Content: [
        'GamingFlix is a digital game account sharing platform.',
        'We offer temporary access to games through shared Steam accounts.',
        'You can play offline on available games during your active subscription.',
        'We don\'t sell games, but shared account access.',
      ],
      section2Title: '2. Permitted Use',
      section2Content: [
        '✅ Play games available in the catalog',
        '✅ Use Steam offline mode',
        '✅ Switch games as many times as you want (unlimited plans)',
        '✅ Request support via WhatsApp',
        '❌ DO NOT change Steam account data',
        '❌ DO NOT play online (ban risk)',
        '❌ DO NOT share credentials with third parties',
        '❌ DO NOT use hacking or cheating tools',
      ],
      section3Title: '3. Prohibitions and Penalties',
      section3Content: [
        '🚫 Playing online will result in permanent platform ban',
        '🚫 Sharing credentials with other people',
        '🚫 Attempting to hack or invade the system',
        '🚫 Using multiple accounts to bypass limitations',
        '⚠️ Violations result in immediate suspension without refund',
      ],
      section4Title: '4. Responsibility and Security',
      section4Content: [
        'Accounts are owned by GamingFlix, you only rent access.',
        'We are not responsible for Steam bans due to misuse.',
        'We recommend always playing in offline mode.',
        'Keep your GamingFlix login credentials secure.',
        'Steam Guard is provided automatically by the platform.',
      ],
      section5Title: '5. Payments and Cancellation',
      section5Content: [
        '💳 Payments via WhatsApp (Pix or card)',
        '📅 Monthly plans with manual renewal',
        '🏆 Founders Plan: guaranteed lifetime price',
        '❌ No refunds after account activation',
        '✅ You can cancel anytime (no future charges)',
      ],
      section6Title: '6. Changes to Terms',
      section6Content: [
        'We may update these terms at any time.',
        'Changes will be notified via email and on the Changelog page.',
        'Continued use after changes indicates acceptance of new terms.',
        'Old terms remain valid for Founders subscribers.',
      ],
    },
    privacyPage: {
      title: '🔒 Privacy Policy',
      subtitle: 'How we protect and use your data',
      lastUpdated: 'Last updated',
      trustBadgeTitle: '🛡️ Your Data is Safe',
      trustBadgeText: 'We follow best security practices and comply with GDPR. Your data is encrypted and never shared with third parties.',
      dataRetentionTitle: 'Data Retention',
      contactTitle: '📱 Questions about Privacy?',
      contactText: 'Contact us via WhatsApp to exercise your GDPR rights',
      dataOfficer: 'Data Officer: GamingFlix Support',
      section1Title: '1. Data Collected',
      section1Content: [
        '📧 Email - For authentication and communication',
        '👤 Full name - Account identification',
        '📱 WhatsApp - Support and notifications',
        '🎮 Game access history',
        '🕐 Access logs (date, time, IP)',
        '💳 Payment data (processed by external gateway)',
      ],
      section2Title: '2. How We Use Your Data',
      section2Content: [
        '✅ Provide game and service access',
        '✅ Process payments and renewals',
        '✅ Send account notifications',
        '✅ Improve platform and experience',
        '✅ Prevent fraud and abuse',
        '❌ We NEVER sell your data to third parties',
        '❌ We NEVER share with marketing companies',
      ],
      section3Title: '3. Data Security',
      section3Content: [
        '🔒 Passwords encrypted with bcrypt',
        '🔐 JWT tokens for secure authentication',
        '🛡️ MongoDB with authentication enabled',
        '📊 Monitored access logs',
        '⚡ Temporary local cache (5 minutes)',
        '🔄 Daily automatic backups',
      ],
      section4Title: '4. Cookies and Local Storage',
      section4Content: [
        '🍪 We use localStorage for session cache',
        '⏱️ JWT tokens valid for 7 days',
        '💾 User data cache (5 minutes)',
        '🎮 Subscription cache (5 minutes)',
        '🗑️ Data automatically cleared on logout',
        'ℹ️ We don\'t use tracking cookies',
      ],
      section5Title: '5. Communications',
      section5Content: [
        '📨 Welcome email on registration',
        '💌 Subscription notifications (activation, expiration)',
        '🔔 Important system notices',
        '📋 Update changelog',
        '🚫 You can request opt-out from promotional emails',
        '✅ Transactional emails cannot be disabled',
      ],
      section6Title: '6. Your Rights (GDPR)',
      section6Content: [
        '📄 Request copy of your data',
        '✏️ Correct incorrect data',
        '🗑️ Delete your account and data',
        '❌ Revoke usage consent',
        '📞 Contact via WhatsApp to exercise rights',
        '⏱️ Response within 5 business days',
      ],
    },
  },
  es: {
    searchPlaceholder: 'Buscar juegos...',
    subscribe: 'Suscribirse',
    admin: 'Admin',
    logout: 'Salir',
    plans: 'Planes',
    login: 'Iniciar sesión',
    viewCatalog: 'Ver Catálogo',
    
    changelog: 'Registro de Cambios',
    terms: 'Términos de Uso',
    privacy: 'Política de Privacidad',

    limitedSpots: '🔥 Plazas limitadas - Primeros 100 Founders',
    heroTitle: 'GamingFlix Ultimate Founders',
    heroSubtitle: 'Catálogo completo de juegos de Steam por una suscripción mensual. Juega tantos juegos como quieras, sin límites. Sé uno de los primeros 100 Founders y asegura un precio de por vida.',
    secureFoundersSpot: 'Asegurar Plaza Founders',
    exploreCatalog: 'Explorar Catálogo',

    originalTitle: '100 % original',
    originalDescription: 'Todos los juegos son originales de Steam con garantía completa de 30 días.',
    immediateAccessTitle: 'Acceso inmediato',
    immediateAccessDescription: 'Recibe tus credenciales al instante tras confirmar el pago por WhatsApp.',
    freeSwapTitle: 'Cambio libre',
    freeSwapDescription: 'Cambia los juegos de tu plan en cualquier momento, sin burocracia.',

    howItWorksTitle: '¿Cómo funciona?',
    step1Title: 'Haz clic en "Asegurar Plaza Founders"',
    step1Description: 'El botón abrirá WhatsApp con un mensaje automático. ¡Es rápido y sencillo!',
    step2Title: 'Confirma tus datos',
    step2Description: 'Nuestro equipo responderá inmediatamente solicitando tu nombre, correo electrónico y forma de pago preferida (Pix, tarjeta o transferencia).',
    step3Title: 'Realiza el pago',
    step3Description: 'Recibirás los datos para el pago. Tras la confirmación, tus credenciales se envían al instante.',
    step4Title: 'Elige TODOS los juegos que quieras',
    step4Description: 'Navega por nuestro catálogo completo y elige TODOS los juegos que desees. ¡Acceso 100 % ilimitado!',
    step5Title: 'Juega sin conexión',
    step5Description: 'Configura el modo sin conexión en Steam y disfruta de tus juegos sin necesidad de estar conectado.',
    step6Title: 'Disfruta con garantía',
    step6Description: '30 días de garantía completa con soporte para cualquier problema técnico. ¡Los Founders tienen prioridad!',

    exclusiveOffer: '🏆 OFERTA EXCLUSIVA - PRIMEROS 100 FOUNDERS',
    pricingTitle: 'Ultimate Founders - Precio vitalicio',
    pricingSubtitle: 'Como Game Pass, pero mejor • Catálogo completo • Sin límites • Precio garantizado para siempre',
    foundersLimitedSpots: '🔥 FOUNDERS - PLAZAS LIMITADAS',
    ultimateFounders: 'Ultimate Founders',
    lifetimePriceDescription: 'Acceso vitalicio total con precio congelado para siempre',
    perMonth: '/mes',
    regularPriceSoon: 'Próximamente',
    guaranteeLifetimePrice: 'Garantizar precio vitalicio',
    whatsappPurchase: 'Comprar por WhatsApp',

    features: {
      unlimitedAccess: 'ACCESO ILIMITADO a todos los juegos',
      lifetimePrice: 'Precio vitalicio de $12,90/mes (nunca aumenta)',
      founderBadge: 'Insignia exclusiva de FOUNDER en tu perfil',
      unlimitedSwap: 'Cambios ilimitados de juegos',
      allNewReleases: 'TODOS LOS NUEVOS LANZAMIENTOS incluidos',
      guarantee30Days: 'Garantía de 30 días',
      vipSupport: 'Soporte VIP 24/7',
      offlineAccess: 'Acceso sin conexión',
      earlyAccess: 'Acceso anticipado a nuevos juegos',
      catalogPriority: 'Prioridad en las actualizaciones del catálogo',
    },

    faqTitle: 'Preguntas frecuentes',
    faqs: {
      foundersProgram: {
        question: '¿Qué es el programa Founders?',
        answer: 'Los primeros 100 suscriptores de GamingFlix Ultimate reciben el estatus FOUNDER: precio vitalicio de $12,90/mes (aunque el precio regular suba a $16,90), insignia exclusiva y beneficios permanentes.',
      },
      whatsappPurchase: {
        question: '¿Cómo funciona la compra por WhatsApp?',
        answer: 'Haz clic en el botón de WhatsApp, envía el mensaje automático y nuestro equipo responderá de inmediato con los datos de pago (tarjeta de crédito, PayPal o transferencia). Tras confirmar el pago, recibes tus credenciales al instante.',
      },
      lifetimePrice: {
        question: '¿El precio de $12,90 es realmente vitalicio?',
        answer: '¡Sí! Los Founders pagan $12,90/mes para siempre, incluso cuando el precio regular suba a $16,90. Es un beneficio exclusivo y permanente registrado en tu perfil.',
      },
      international: {
        question: '¿Puedo acceder desde fuera de Brasil?',
        answer: '¡Sí! El acceso está disponible desde cualquier país.',
      },
      accountOwnership: {
        question: '¿La cuenta será exclusivamente mía para siempre?',
        answer: 'La cuenta es compartida con garantía de uso por 30 días. Si mantienes el acceso después de ese período y tu suscripción activa, seguirás jugando mientras tu plan esté vigente.',
      },
      onlinePlay: {
        question: '¿Puedo jugar en línea?',
        answer: 'Solo offline. Este servicio es exclusivamente para jugar sin conexión.',
      },
      mobile: {
        question: '¿Puedo usarlo en el móvil o en la nube?',
        answer: 'Este producto es exclusivamente para PC (computadoras).',
      },
      verification: {
        question: '¿Existe alguna verificación en los juegos?',
        answer: 'Sí. De vez en cuando algunos juegos pueden requerir la verificación Denuvo, un sistema antipiratería que dura aproximadamente 24 horas hasta la restauración del juego.',
      },
      modifyAccount: {
        question: '¿Puedo modificar los datos de la cuenta?',
        answer: 'No. Intentar cambiar los datos va en contra de las reglas y puede provocar el bloqueo de tu acceso.',
      },
      familySharing: {
        question: '¿Puedo compartir los juegos con el modo familiar?',
        answer: 'Lamentablemente no. Nuestras cuentas de la categoría Offline no ofrecen esa función.',
      },
      swapGames: {
        question: '¿Puedo cambiar los juegos de mi plan?',
        answer: 'Sí. Puedes cambiar los juegos seleccionados en cualquier momento sin costo adicional, siempre que tu suscripción esté activa.',
      },
      guarantee: {
        question: '¿Cómo funciona la garantía de 30 días?',
        answer: 'Ofrecemos una garantía de 30 días después de la compra. Durante ese período, brindamos soporte para cualquier inconveniente. Tras la garantía, mantienes el acceso pero sin soporte técnico incluido.',
      },
      cancelSubscription: {
        question: '¿Puedo cancelar mi suscripción en cualquier momento?',
        answer: 'Sí. Puedes cancelarla cuando quieras. Mantendrás el acceso hasta que termine el período ya pagado.',
      },
    },

    footerTagline: 'Juega sin límites • Catálogo completo de Steam • Founders con precio vitalicio',
    allRightsReserved: 'Todos los derechos reservados.',

    loadingGames: 'Cargando juegos...',
    loadingCatalog: 'Cargando catálogo...',
    loadingAdmin: 'Cargando área administrativa...',
    noGamesFound: 'No se encontraron juegos',
    tryAnotherSearch: 'Prueba con otro término de búsqueda',

    addGame: 'Agregar juego',
    removeGame: 'Eliminar juego',
    upgradeRequired: 'Se requiere upgrade para acceder',

    whatsappMessage: '👾 ¡Hola! Quiero asegurar mi plaza como FOUNDER de GamingFlix Ultimate por $12,90/mes de por vida.',

    whatYoureBuying: 'Qué estás comprando',
    sharedAccountTitle: 'Cuenta compartida',
    sharedAccountDescription: 'Acceso garantizado a una cuenta de Steam para uso sin conexión, para jugar cuando quieras.',
    offlineUseTitle: 'Uso sin conexión',
    offlineUseDescription: 'Accede a los juegos exclusivamente en el modo sin conexión de Steam. Este modo te permite jugar sin estar en línea.',
    originalGamesTitle: '100 % original',
    originalGamesDescription: 'Todos los juegos son auténticos de Steam, ofreciendo seguridad y la mejor experiencia.',
    accessGuaranteeTitle: 'Garantía de acceso',
    accessGuaranteeDescription: '30 días de garantía completa para resolver cualquier problema relacionado al acceso.',

    readyToBeFounder: '¿Listo para ser Founder?',
    secureSpotCTA: 'Asegura tu lugar entre los primeros 100 Founders y obtén un precio vitalicio de',
    limitedSpotsWarning: '¡Plazas limitadas!',
    secureMySpotNow: 'Asegurar mi plaza ahora',

    authTagline: 'Tu catálogo de juegos',
    loginTab: 'Iniciar sesión',
    signupTab: 'Registrarse',
    loginTitle: 'Inicia sesión',
    loginDescription: 'Ingresa con tu cuenta para continuar.',
    signupTitle: 'Crear cuenta',
    signupDescription: 'Completa tus datos para unirte a GamingFlix.',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@email.com',
    passwordLabel: 'Contraseña',
    fullNameLabel: 'Nombre completo',
    fullNamePlaceholder: 'Introduce tu nombre completo',
    whatsappLabel: 'WhatsApp',
    whatsappPlaceholder: '+34 600 000 000',
    loginButton: 'Iniciar sesión',
    loggingInButton: 'Iniciando...',
    signupButton: 'Registrarse',
    signingUpButton: 'Registrándose...',

    // Forgot Password
    forgotPasswordTitle: 'Recuperar Contraseña',
    forgotPasswordDescription: 'Ingresa tu correo para recibir instrucciones de recuperación',
    sendEmailButton: 'Enviar Correo',
    sendingEmailButton: 'Enviando...',
    backToLogin: 'Volver al inicio de sesión',
    emailSentTitle: '¡Correo enviado!',
    emailSentDescription: 'Si el correo existe en nuestra base, recibirás un enlace para recuperar tu contraseña.',
    checkSpamFolder: 'Revisa tu bandeja de entrada y spam.',
    emailSentSuccess: 'Si el correo existe, se enviará un enlace de recuperación',

    languageToggle: {
      ariaLabel: 'Cambiar idioma',
      switchToEnglish: 'Cambiar a inglés',
      switchToPortuguese: 'Cambiar a portugués',
      switchToSpanish: 'Cambiar a español',
    },

    regularPriceLabel: 'Precio regular:',
    lifetimeBadge: '🏷️ Precio vitalicio - nunca aumenta',
    unlimitedBadge: '🎮 Acceso ILIMITADO',
    whatsappButtonLabel: 'Asegurar Plaza Founders',
    whatsappButtonDescription: 'Respuesta inmediata • Pago facilitado • Acceso instantáneo',
    foundersFullAccessHighlight: '⚡ El plan GamingFlix Ultimate Founders incluye acceso TOTAL e ILIMITADO a la biblioteca completa',
    foundersLimitedSpotsHighlight: '🏆 Solo los primeros 100 suscriptores garantizan el precio de {{price}} para siempre',

    back: 'Volver',
    backToCatalog: 'Volver al catálogo',
    viewPlans: 'Ver planes',

    catalogTitle: 'Catálogo de Juegos',
    catalogCountSingular: '{{count}} juego disponible',
    catalogCountPlural: '{{count}} juegos disponibles',
    catalogPreviewTitle: 'Vista previa del Catálogo Founders',
    catalogPreviewDescription: 'Inicia sesión o asegúrate el plan Ultimate Founders para desbloquear todos los juegos con credenciales inmediatas y cambios ilimitados.',
    catalogErrorTitle: 'Error al cargar el catálogo',
    catalogErrorDescription: 'Verifica tu conexión con el servidor',

    authModalTitle: 'Accede a tu cuenta',
    authModalDescription: 'Inicia sesión o regístrate para acceder a los juegos',
    authLoginErrorTitle: 'Error al iniciar sesión',
    authLoginErrorDescription: 'Verifica tu correo y contraseña',
    authLoginInvalid: 'Credenciales inválidas o cuenta inexistente. Puedes registrarte con estos datos.',
    authQuickSignupButton: 'Crear cuenta con estos datos',
    authLoginSuccessTitle: '¡Bienvenido!',
    authLoginSuccessDescription: 'Inicio de sesión realizado con éxito',
    authRequiredFieldTitle: 'Campo obligatorio',
    authRequiredFieldDescription: 'Por favor completa el registro incluyendo tu WhatsApp',
    authSignupSuccessTitle: '¡Cuenta creada!',
    authSignupSuccessDescription: 'Inicia sesión para continuar',

    upgradeTitle: 'Asegura tu plaza Ultimate Founders',
    upgradeDescription: 'Desbloquea acceso ilimitado al catálogo completo, cambios libres y precio vitalicio reservado para los primeros 100 Founders.',
    upgradeBenefitsTitle: 'Con el plan Ultimate Founders obtienes:',
    upgradeBack: 'Tal vez después',
    upgradeViewPlans: 'Hablar con un especialista',

    gameDetail: {
      errorTitle: 'Error',
      errorDescription: 'No fue posible cargar el juego',
      waitTitle: 'Espera',
      waitDescription: 'Puedes solicitar nuevamente en {{seconds}} segundos',
      timeoutMessage: 'Tiempo agotado: No se encontró ningún código en 45 segundos',
      timeoutToastTitle: 'Tiempo agotado',
      timeoutToastDescription: 'No fue posible encontrar el código. Inténtalo nuevamente.',
      unknownError: 'Error desconocido',
      accessInfoTitle: 'Información de Acceso',
      loginLabel: 'Login de Steam',
      passwordLabel: 'Contraseña',
      familyCodeLabel: 'Código Modo Familia',
      tutorialTitle: 'Paso a Paso',
      steamGuardTitle: 'Código Steam Guard',
      steamGuardButtonIdle: 'Buscar Código Steam Guard',
      steamGuardButtonLoading: 'Buscando código...',
      steamGuardProgress: 'Buscando correos de Steam... {{progress}}%',
      steamGuardSuccessTitle: '¡Código encontrado!',
      steamGuardSuccessDescription: 'Usa este código para iniciar sesión en Steam',
      steamGuardErrorTitle: 'Error al buscar código',
      steamGuardErrorDescription: 'No fue posible buscar el código. Inténtalo nuevamente.',
      steamGuardHint: 'Haz clic en el botón de arriba para buscar automáticamente el código 2FA de Steam',
      copySuccessTitle: '¡Copiado!',
      copySuccessDescription: '{{label}} copiado al portapapeles',
      copyErrorTitle: 'Error al copiar',
      copyErrorDescription: 'No fue posible copiar. Copia manualmente, por favor.',
      copyFallbackDescription: '{{label}} copiado al portapapeles',
      clipboardLabels: {
        login: 'Login de Steam',
        password: 'Contraseña',
        familyCode: 'Código',
        steamGuard: 'Código Steam Guard',
      },
    },
    adminPanel: {
      title: 'Panel Administrativo',
      subtitle: 'Gestionar juegos y usuarios de la plataforma',
      footerLabel: 'Panel Administrativo',
      tabs: {
        games: 'Juegos',
        users: 'Usuarios',
      },
    },
    completeProfile: {
      title: 'Completa tu Perfil',
      description: 'Para continuar usando GamingFlix, necesitamos que completes alguna información de tu perfil.',
      usernameLabel: 'Nombre de Usuario *',
      usernameHint: '(cómo serás identificado)',
      usernamePlaceholder: 'ej: jugador123',
      usernameInUse: 'El nombre de usuario ya está en uso',
      usernameAvailable: '¡Nombre de usuario disponible!',
      fullNameLabel: 'Nombre Completo *',
      fullNamePlaceholder: 'Tu nombre completo',
      whatsappLabel: 'WhatsApp *',
      whatsappPlaceholder: '+34 600 12 34 56',
      importantNote: 'Importante:',
      importantNoteText: 'Esta información es necesaria para acceder al catálogo y gestionar tu cuenta.',
      submitButton: 'Completar Perfil y Continuar',
      submittingButton: 'Guardando...',
      attentionTitle: 'Atención',
      mustCompleteProfile: 'Necesitas completar tu perfil para continuar',
      errorTitle: 'Error',
      usernameMinLength: 'El nombre de usuario debe tener al menos 3 caracteres',
      usernameAlreadyInUse: 'El nombre de usuario ya está en uso',
      fullNameRequired: 'El nombre completo es obligatorio',
      whatsappRequired: 'WhatsApp es obligatorio',
      successTitle: '¡Éxito!',
      successDescription: 'Perfil completado con éxito',
      errorUpdating: 'Error al completar el perfil',
    },
    profilePage: {
      personalInfoTab: 'Información Personal',
      securityTab: 'Seguridad',
      personalInfoTitle: 'Información Personal',
      personalInfoDescription: 'Actualiza tu información de perfil',
      usernameLabel: 'Nombre de Usuario',
      usernameHint: '(cómo eres identificado)',
      usernamePlaceholder: 'tu_usuario',
      usernameInUse: 'El nombre de usuario ya está en uso',
      usernameAvailable: '¡Nombre de usuario disponible!',
      fullNameLabel: 'Nombre Completo',
      fullNamePlaceholder: 'Tu nombre completo',
      whatsappLabel: 'WhatsApp',
      whatsappPlaceholder: '+34 600 12 34 56',
      updateProfileButton: 'Actualizar Perfil',
      updatingButton: 'Actualizando...',
      passwordTitle: 'Cambiar Contraseña',
      passwordDescription: 'Actualiza tu contraseña de acceso',
      currentPasswordLabel: 'Contraseña Actual',
      currentPasswordPlaceholder: 'Ingresa tu contraseña actual',
      newPasswordLabel: 'Nueva Contraseña',
      newPasswordPlaceholder: 'Ingresa tu nueva contraseña',
      confirmPasswordLabel: 'Confirmar Nueva Contraseña',
      confirmPasswordPlaceholder: 'Vuelve a ingresar tu nueva contraseña',
      updatePasswordButton: 'Actualizar Contraseña',
      updatingPasswordButton: 'Actualizando...',
      successTitle: '¡Éxito!',
      profileUpdated: 'Perfil actualizado con éxito',
      passwordUpdated: 'Contraseña actualizada con éxito',
      errorTitle: 'Error',
      fillAllFields: 'Por favor, completa todos los campos',
      usernameMinLength: 'El nombre de usuario debe tener al menos 3 caracteres',
      passwordMinLength: 'La nueva contraseña debe tener al menos 6 caracteres',
      passwordsDontMatch: 'Las contraseñas no coinciden',
      errorUpdatingProfile: 'Error al actualizar el perfil',
      errorUpdatingPassword: 'Error al actualizar la contraseña',
    },
    releasesPage: {
      title: '📋 Registro de Cambios',
      subtitle: 'Sigue todas las actualizaciones, mejoras y correcciones de la plataforma',
      released: 'Lanzado el',
      newFeature: 'NOVEDAD',
      improvement: 'MEJORA',
      bugfix: 'CORRECCIÓN',
      security: 'SEGURIDAD',
      features: 'novedades',
      improvements: 'mejoras',
      fixes: 'correcciones',
      securityUpdates: 'seguridad',
      suggestionsTitle: '🚀 ¿Tienes alguna sugerencia?',
      suggestionsText: '¡Contáctanos y ayuda a mejorar la plataforma!',
    },
    termsPage: {
      title: '📄 Términos de Uso',
      subtitle: 'Lee atentamente antes de usar nuestros servicios',
      lastUpdated: 'Última actualización',
      importantTitle: '⚠️ Importante',
      importantText: 'Al usar GamingFlix, aceptas todos los términos descritos a continuación. Jugar en línea puede resultar en prohibición permanente.',
      contactTitle: '📱 ¿Dudas sobre los Términos?',
      contactText: 'Contáctanos vía WhatsApp para aclaraciones',
      section1Title: '1. Sobre el Servicio',
      section1Content: [
        'GamingFlix es una plataforma de compartir cuentas de juegos digitales.',
        'Ofrecemos acceso temporal a juegos a través de cuentas compartidas de Steam.',
        'Puedes jugar offline en los juegos disponibles durante tu suscripción activa.',
        'No vendemos juegos, sino acceso compartido a cuentas.',
      ],
      section2Title: '2. Uso Permitido',
      section2Content: [
        '✅ Jugar los juegos disponibles en el catálogo',
        '✅ Usar el modo offline de Steam',
        '✅ Cambiar de juego cuantas veces quieras (planes ilimitados)',
        '✅ Solicitar soporte vía WhatsApp',
        '❌ NO cambiar datos de la cuenta Steam',
        '❌ NO jugar en línea (riesgo de baneo)',
        '❌ NO compartir credenciales con terceros',
        '❌ NO usar herramientas de hack o trampa',
      ],
      section3Title: '3. Prohibiciones y Penalidades',
      section3Content: [
        '🚫 Jugar en línea resultará en prohibición permanente de la plataforma',
        '🚫 Compartir credenciales con otras personas',
        '🚫 Intentar hackear o invadir el sistema',
        '🚫 Usar múltiples cuentas para burlar limitaciones',
        '⚠️ Las violaciones resultan en suspensión inmediata sin reembolso',
      ],
      section4Title: '4. Responsabilidad y Seguridad',
      section4Content: [
        'Las cuentas son propiedad de GamingFlix, solo alquilas el acceso.',
        'No somos responsables de baneos de Steam debido al mal uso.',
        'Recomendamos siempre jugar en modo offline.',
        'Mantén tus credenciales de acceso a GamingFlix seguras.',
        'Steam Guard es proporcionado automáticamente por la plataforma.',
      ],
      section5Title: '5. Pagos y Cancelación',
      section5Content: [
        '💳 Pagos vía WhatsApp (Pix o tarjeta)',
        '📅 Planes mensuales con renovación manual',
        '🏆 Plan Founders: precio fijo garantizado para siempre',
        '❌ No ofrecemos reembolsos después de la activación',
        '✅ Puedes cancelar en cualquier momento (sin cargos futuros)',
      ],
      section6Title: '6. Cambios en los Términos',
      section6Content: [
        'Podemos actualizar estos términos en cualquier momento.',
        'Los cambios serán notificados vía email y en la página de Changelog.',
        'El uso continuado después de cambios indica aceptación de nuevos términos.',
        'Los términos antiguos permanecen válidos para suscriptores Founders.',
      ],
    },
    privacyPage: {
      title: '🔒 Política de Privacidad',
      subtitle: 'Cómo protegemos y utilizamos tus datos',
      lastUpdated: 'Última actualización',
      trustBadgeTitle: '🛡️ Tus Datos Están Seguros',
      trustBadgeText: 'Seguimos las mejores prácticas de seguridad y cumplimos con el RGPD. Tus datos están encriptados y nunca se comparten con terceros.',
      dataRetentionTitle: 'Retención de Datos',
      contactTitle: '📱 ¿Dudas sobre Privacidad?',
      contactText: 'Contáctanos vía WhatsApp para ejercer tus derechos RGPD',
      dataOfficer: 'Responsable de Datos: Soporte GamingFlix',
      section1Title: '1. Datos Recopilados',
      section1Content: [
        '📧 Email - Para autenticación y comunicación',
        '👤 Nombre completo - Identificación de cuenta',
        '📱 WhatsApp - Soporte y notificaciones',
        '🎮 Historial de juegos accedidos',
        '🕐 Logs de acceso (fecha, hora, IP)',
        '💳 Datos de pago (procesados por gateway externo)',
      ],
      section2Title: '2. Cómo Usamos Tus Datos',
      section2Content: [
        '✅ Proporcionar acceso a juegos y servicios',
        '✅ Procesar pagos y renovaciones',
        '✅ Enviar notificaciones sobre tu cuenta',
        '✅ Mejorar la plataforma y experiencia',
        '✅ Prevenir fraudes y abusos',
        '❌ NUNCA vendemos tus datos a terceros',
        '❌ NUNCA compartimos con empresas de marketing',
      ],
      section3Title: '3. Seguridad de los Datos',
      section3Content: [
        '🔒 Contraseñas encriptadas con bcrypt',
        '🔐 Tokens JWT para autenticación segura',
        '🛡️ MongoDB con autenticación habilitada',
        '📊 Logs de acceso monitoreados',
        '⚡ Caché local temporal (5 minutos)',
        '🔄 Copias de seguridad automáticas diarias',
      ],
      section4Title: '4. Cookies y Almacenamiento Local',
      section4Content: [
        '🍪 Usamos localStorage para caché de sesión',
        '⏱️ Tokens JWT válidos por 7 días',
        '💾 Caché de datos del usuario (5 minutos)',
        '🎮 Caché de suscripción (5 minutos)',
        '🗑️ Datos limpiados automáticamente al salir',
        'ℹ️ No usamos cookies de rastreo',
      ],
      section5Title: '5. Comunicaciones',
      section5Content: [
        '📨 Email de bienvenida al registrarse',
        '💌 Notificaciones de suscripción (activación, expiración)',
        '🔔 Avisos importantes del sistema',
        '📋 Changelog de actualizaciones',
        '🚫 Puedes solicitar opt-out de emails promocionales',
        '✅ Los emails transaccionales no pueden desactivarse',
      ],
      section6Title: '6. Tus Derechos (RGPD)',
      section6Content: [
        '📄 Solicitar copia de tus datos',
        '✏️ Corregir datos incorrectos',
        '🗑️ Eliminar tu cuenta y datos',
        '❌ Revocar consentimiento de uso',
        '📞 Contactar vía WhatsApp para ejercer derechos',
        '⏱️ Respuesta en hasta 5 días hábiles',
      ],
    },
  },
};
