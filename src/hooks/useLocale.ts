import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getDirectionForLanguage } from '@/i18n';

export function useLocale() {
  const { i18n, t } = useTranslation();

  const language = (i18n.resolvedLanguage === 'ar' ? 'ar' : 'en') as
    | 'ar'
    | 'en';
  const isArabic = language === 'ar';
  const direction = getDirectionForLanguage(language);

  const setLanguage = async (nextLanguage: 'ar' | 'en') => {
    if (nextLanguage === language) return;
    await i18n.changeLanguage(nextLanguage);
  };

  const toggleLanguage = async () => {
    await setLanguage(isArabic ? 'en' : 'ar');
  };

  const text = useMemo(
    () => (_arabicText: string, englishText: string) =>
      t(englishText, {
        defaultValue: englishText,
        keySeparator: false,
        nsSeparator: false,
      }),
    [t]
  );

  return {
    t,
    language,
    direction,
    isArabic,
    text,
    setLanguage,
    toggleLanguage,
  };
}
