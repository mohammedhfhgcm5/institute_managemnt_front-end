import i18n from '@/i18n';

export const isArabic = (): boolean => i18n.resolvedLanguage === 'ar';

export const localize = (_arabicText: string, englishText: string): string =>
  i18n.t(englishText, {
    defaultValue: englishText,
    keySeparator: false,
    nsSeparator: false,
  });
