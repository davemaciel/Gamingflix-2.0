import type { Language } from '@/i18n/translations';

const FOUNDERS_PRICE_MAP: Record<Language, { founders: string; regular: string }> = {
  'pt-BR': { founders: 'R$ 67,90', regular: 'R$ 87,90' },
  en: { founders: '$12.90', regular: '$16.90' },
};

export const getFoundersPricing = (language: Language) =>
  FOUNDERS_PRICE_MAP[language] ?? FOUNDERS_PRICE_MAP['pt-BR'];
