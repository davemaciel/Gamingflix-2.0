import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import type { Language } from '@/i18n/translations';

import flagBrazilImg from '../../lang_img/bandeira-do-brasil.png';
import flagUSAImg from '../../lang_img/bandeira-estados-unidos-da-america.png';
import flagSpainImg from '../../lang_img/bandeira-da-espanha.png';

type ToggleVariant = 'default' | 'compact';

const languages: Language[] = ['pt-BR', 'en', 'es'];

const flagByLanguage: Record<Language, string> = {
  'pt-BR': flagBrazilImg,
  en: flagUSAImg,
  es: flagSpainImg,
};

const LanguageToggle = ({ variant = 'default' }: { variant?: ToggleVariant }) => {
  const { language, setLanguage, t } = useLanguage();
  const currentIndex = languages.indexOf(language);
  const nextLanguage = languages[(currentIndex + 1) % languages.length];

  const nextLanguageLabelMap: Record<Language, string> = {
    'pt-BR': t.languageToggle.switchToEnglish,
    en: t.languageToggle.switchToSpanish,
    es: t.languageToggle.switchToPortuguese,
  };

  const isMobile = variant === 'compact';

  const buttonClasses = cn(
    'inline-flex items-center justify-center bg-transparent transition-transform hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    isMobile
      ? 'h-10 w-10 rounded-full border border-input p-0' // Mobile style: circular, bordered, larger
      : 'h-9 rounded-full p-0' // Desktop style
  );

  // Flag size increased for mobile as requested
  const flagClasses = isMobile
    ? 'h-6 w-6 object-contain'
    : 'h-7 w-auto object-contain';

  const handleToggle = () => {
    setLanguage(nextLanguage);
  };

  return (
    <Button
      type="button"
      variant={isMobile ? "outline" : "ghost"}
      size={isMobile ? "icon" : "sm"}
      onClick={handleToggle}
      className={buttonClasses}
      aria-label={nextLanguageLabelMap[language]}
      title={nextLanguageLabelMap[language]}
    >
      <img
        src={flagByLanguage[language]}
        alt=""
        className={flagClasses}
        draggable={false}
      />
    </Button>
  );
};

export const LanguageSelector = () => <LanguageToggle variant="default" />;

export const LanguageSelectorCompact = () => <LanguageToggle variant="compact" />;
