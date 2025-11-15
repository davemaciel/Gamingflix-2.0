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

  const buttonClasses = cn(
    'inline-flex items-center justify-center rounded-full bg-transparent p-0 transition-transform hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    variant === 'compact' ? 'h-8' : 'h-9'
  );

  const flagClasses = variant === 'compact' ? 'h-6 w-auto object-contain' : 'h-7 w-auto object-contain';

  const handleToggle = () => {
    setLanguage(nextLanguage);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
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
