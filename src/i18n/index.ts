import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/i18n/locales/en';
import ro from '@/i18n/locales/ro';

const resources = {
  en: { translation: en },
  ro: { translation: ro },
} as const;

export type AppLanguage = keyof typeof resources;
const SUPPORTED_LANGUAGES: AppLanguage[] = ['en', 'ro'];

function resolveDeviceLanguage(): AppLanguage {
  for (const locale of getLocales()) {
    const languageCode = locale.languageCode?.toLowerCase() as AppLanguage | undefined;

    if (languageCode && SUPPORTED_LANGUAGES.includes(languageCode)) {
      return languageCode;
    }
  }

  return 'en';
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources,
    lng: resolveDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
}

export function getCurrentLanguage(): AppLanguage {
  return i18n.resolvedLanguage === 'ro' ? 'ro' : 'en';
}

export default i18n;
