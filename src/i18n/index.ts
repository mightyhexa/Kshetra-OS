import { en } from './en';
import { hi } from './hi';
import { kn } from './kn';
import { SupportedLanguage, TranslationSchema } from './types';

export const dictionaries: Record<SupportedLanguage, TranslationSchema> = {
  en,
  hi,
  kn
};

export function getDictionary(lang: SupportedLanguage): TranslationSchema {
  return dictionaries[lang] || dictionaries.en;
}

export * from './types';
