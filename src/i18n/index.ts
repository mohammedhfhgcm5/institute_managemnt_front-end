import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { arTranslations, enTranslations } from '@/i18n/locales';

export type AppLanguage = 'en' | 'ar';

export const LANGUAGE_STORAGE_KEY = 'app_language';

export const isRtlLanguage = (language: string): boolean => language === 'ar';

export const getDirectionForLanguage = (
  language: string
): 'rtl' | 'ltr' => (isRtlLanguage(language) ? 'rtl' : 'ltr');

const resources = {
  en: {
    translation: enTranslations,
  },
  ar: {
    translation: arTranslations,
  },
} as const;

const resolveInitialLanguage = (): AppLanguage => {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === 'en' || stored === 'ar') return stored;
  if (navigator.language.toLowerCase().startsWith('ar')) return 'ar';
  return 'en';
};

const syncDocumentLanguage = (language: string): void => {
  const direction = getDirectionForLanguage(language);
  document.documentElement.lang = language;
  document.documentElement.dir = direction;
};

const initialLanguage = resolveInitialLanguage();
syncDocumentLanguage(initialLanguage);

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: 'en',
  showSupportNotice: false,
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (language) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  syncDocumentLanguage(language);
});

export default i18n;
