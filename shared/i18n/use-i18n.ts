import { useMemo } from 'react';

import {
  getLocale,
  translate,
  type TranslationKey,
} from '@/shared/i18n/messages';
import { useAppStore } from '@/shared/store/app-store';

export const useI18n = () => {
  const language = useAppStore((state) => state.preferences.language);

  return useMemo(
    () => ({
      language,
      locale: getLocale(language),
      t: (
        key: TranslationKey,
        params?: Record<string, string | number | null>,
      ) => translate(language, key, params),
    }),
    [language],
  );
};
