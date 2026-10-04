import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TranslationSchema, getDictionary, dictionaries } from '../i18n';

export type FontSizeOption = 'sm' | 'md' | 'lg';

interface LanguageContextType {
  language: SupportedLanguage;
  currentLang: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof TranslationSchema, fallback?: string) => string;
  tRule: (ruleId: string, type: 'title' | 'desc', params?: Record<string, any>) => string;
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  fontSizeLevel: number;
  setFontScale: (level: number) => void;
  cycleFontSize: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('kshetra_lang');
    return (saved === 'hi' || saved === 'kn') ? saved : 'en';
  });

  const [fontSize, setFontSize] = useState<FontSizeOption>(() => {
    const saved = localStorage.getItem('kshetra_font_size');
    return (saved === 'sm' || saved === 'lg') ? saved : 'md';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('kshetra_high_contrast') === 'true';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('kshetra_lang', lang);
    document.documentElement.lang = lang;
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => {
      const next = !prev;
      localStorage.setItem('kshetra_high_contrast', String(next));
      if (next) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      return next;
    });
  };

  const cycleFontSize = () => {
    setFontSize(prev => {
      const next: FontSizeOption = prev === 'sm' ? 'md' : prev === 'md' ? 'lg' : 'sm';
      localStorage.setItem('kshetra_font_size', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.classList.remove('text-size-sm', 'text-size-md', 'text-size-lg');
    document.documentElement.classList.add(`text-size-${fontSize}`);
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [language, fontSize, highContrast]);

  const dict = getDictionary(language);

  const t = (key: keyof TranslationSchema, fallback?: string): string => {
    return dict[key] || fallback || (dictionaries.en[key] as string) || key;
  };

  const tRule = (ruleId: string, type: 'title' | 'desc', _params?: Record<string, any>): string => {
    const ruleKeyMap: Record<string, { title: keyof TranslationSchema; desc: keyof TranslationSchema }> = {
      'R1': { title: 'ruleR1Title', desc: 'ruleR1Desc' },
      'R2': { title: 'ruleR2OverlapTitle', desc: 'ruleR2OverlapDesc' },
      'R2_TOLERANCE': { title: 'ruleR2ToleranceTitle', desc: 'ruleR2ToleranceDesc' },
      'R3': { title: 'ruleR3EcoBufferTitle', desc: 'ruleR3EcoBufferDesc' },
      'R4': { title: 'ruleR4ZoningMismatchTitle', desc: 'ruleR4ZoningMismatchDesc' },
      'R5': { title: 'ruleR5FarTitle', desc: 'ruleR5FarDesc' },
      'R6': { title: 'ruleR6DuplicateSaleTitle', desc: 'ruleR6DuplicateSaleDesc' },
      'R7': { title: 'ruleR7LienTitle', desc: 'ruleR7LienDesc' },
      'R8': { title: 'ruleR8TaxTitle', desc: 'ruleR8TaxDesc' },
      'R9': { title: 'ruleR9LineageTitle', desc: 'ruleR9LineageDesc' }
    };

    const mapping = ruleKeyMap[ruleId];
    if (!mapping) return ruleId;
    const key = type === 'title' ? mapping.title : mapping.desc;
    return dict[key] || (dictionaries.en[key] as string);
  };

  const fontSizeLevel = fontSize === 'sm' ? 0 : fontSize === 'md' ? 1 : 2;
  const setFontScale = (level: number) => {
    setFontSize(level === 0 ? 'sm' : level === 1 ? 'md' : 'lg');
  };

  return (
    <LanguageContext.Provider value={{
      language,
      currentLang: language,
      setLanguage,
      t,
      tRule,
      fontSize,
      setFontSize,
      fontSizeLevel,
      setFontScale,
      cycleFontSize,
      highContrast,
      toggleHighContrast
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export { SUPPORTED_LANGUAGES };
export type { SupportedLanguage };
