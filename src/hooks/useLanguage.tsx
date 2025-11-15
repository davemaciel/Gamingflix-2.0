import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Language, translations, Translations } from '@/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'gamingflix-language';
const SUPPORTED_LANGUAGES: Language[] = ['pt-BR', 'en', 'es'];

const detectLanguage = (): Language => {
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      return savedLanguage;
    }
  } catch {
    // Ignora erros de acesso ao localStorage (SSR ou restrições do navegador)
  }

  const navigatorLanguage =
    typeof navigator !== 'undefined'
      ? (navigator.language || (navigator as any).userLanguage || '')
      : '';
  const normalized = navigatorLanguage.toLowerCase();

  if (normalized.startsWith('pt')) {
    return 'pt-BR';
  }

  if (normalized.startsWith('es')) {
    return 'es';
  }

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Sao_Paulo') || timezone.includes('Brasilia') || timezone.includes('Fortaleza')) {
      return 'pt-BR';
    }
  } catch {
    // Ignorar erro ao obter timezone
  }

  return 'en';
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => detectLanguage());

  useEffect(() => {
    setLanguageState(detectLanguage());
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      // Ignore falhas ao persistir preferência
    }
  };

  const t = useMemo(() => translations[language], [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
