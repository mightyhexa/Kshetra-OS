import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 
  | 'en' // English
  | 'hi' // Hindi
  | 'bn' // Bengali
  | 'mr' // Marathi
  | 'ta' // Tamil
  | 'gu' // Gujarati
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'pa' // Punjabi
  | 'or'; // Odia

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' }
];

export type TranslationKey = 
  | 'prototypeNotice'
  | 'softwareTitle'
  | 'tagline'
  | 'skipToMain'
  | 'navHome'
  | 'navCitizen'
  | 'navOfficer'
  | 'navAudit'
  | 'navBhuAadhaar'
  | 'navApis'
  | 'navMore'
  | 'searchPlaceholder'
  | 'verifiedCadastre'
  | 'downloadPdf'
  | 'previewDossier'
  | 'initiateRequest'
  | 'roleCitizen'
  | 'roleOfficer'
  | 'roleAdmin';

const TRANSLATIONS: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  en: {
    prototypeNotice: 'Smart India Hackathon 2026 Prototype · Not an official Government of India website',
    softwareTitle: 'KSHETRA OS',
    tagline: 'Integrated GIS-based Digital Public Infrastructure for Land Governance (SIH26014)',
    skipToMain: 'SKIP TO MAIN CONTENT',
    navHome: 'Cadastral Map',
    navCitizen: 'Citizen Services',
    navOfficer: 'Officer Console',
    navAudit: 'Audit Ledger',
    navBhuAadhaar: 'Bhu-Aadhaar Specs',
    navApis: 'API Sandbox',
    navMore: 'More',
    searchPlaceholder: 'Search 14-digit ULPIN, Survey No, Owner, District...',
    verifiedCadastre: 'VERIFIED CADASTRE',
    downloadPdf: 'Download PDF',
    previewDossier: 'Preview Dossier',
    initiateRequest: 'Apply for Service',
    roleCitizen: 'Citizen User',
    roleOfficer: 'Land Officer (Tahsildar)',
    roleAdmin: 'Policy Administrator'
  },
  hi: {
    prototypeNotice: 'स्मार्ट इंडिया हैकाथॉन 2026 प्रोटोटाइप · यह भारत सरकार की आधिकारिक वेबसाइट नहीं है',
    softwareTitle: 'क्षेत्र ओएस (KSHETRA OS)',
    tagline: 'भू-प्रशासन हेतु एकीकृत जीआईएस डिजिटल सार्वजनिक अवसंरचना (SIH26014)',
    skipToMain: 'मुख्य सामग्री पर जाएं',
    navHome: 'कैडस्ट्रल नक्शा',
    navCitizen: 'नागरिक सेवाएं',
    navOfficer: 'अधिकारी कंसोल',
    navAudit: 'ऑडिट लेजर',
    navBhuAadhaar: 'भू-आधार मानक',
    navApis: 'एपीआई सैंडबॉक्स',
    navMore: 'अन्य विवरण',
    searchPlaceholder: '14-अंकीय भू-आधार (यूलपिन), खसरा संख्या, नाम से खोजें...',
    verifiedCadastre: 'सत्यापित कैडस्ट्रे',
    downloadPdf: 'पीडीएफ डाउनलोड',
    previewDossier: 'भू-दस्तावेज पूर्वावलोकन',
    initiateRequest: 'सेवा आवेदन करें',
    roleCitizen: 'नागरिक',
    roleOfficer: 'तहसीलदार (भू-अधिकारी)',
    roleAdmin: 'नीति प्रशासक'
  },
  kn: {
    prototypeNotice: 'ಸ್ಮಾರ್ಟ್ ಇಂಡಿಯಾ ಹ್ಯಾಕಥಾನ್ 2026 ಪ್ರೋಟೋಟೈಪ್ · ಇದು ಭಾರತ ಸರ್ಕಾರದ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ ಅಲ್ಲ',
    softwareTitle: 'ಕ್ಷೇತ್ರ ಓಎಸ್ (KSHETRA OS)',
    tagline: 'ಭೂ-ಆಡಳಿತಕ್ಕಾಗಿ ಜಿಐಎಸ್ ಡಿಜಿಟಲ್ ಸಾರ್ವಜನಿಕ ಮೂಲಸೌಕರ್ಯ (SIH26014)',
    skipToMain: 'ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ಹೋಗಿ',
    navHome: 'ಭೂಪಟ ನಕ್ಷೆ',
    navCitizen: 'ನಾಗರಿಕ ಸೇವೆಗಳು',
    navOfficer: 'ಅಧಿಕಾರಿ ಕನ್ಸೋಲ್',
    navAudit: 'ಆಡಿಟ್ ಲೆಡ್ಜರ್',
    navBhuAadhaar: 'ಭೂ-ಆಧಾರ್ ಮಾನದಂಡ',
    navApis: 'ಎಪಿಐ ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್',
    navMore: 'ಇನ್ನಷ್ಟು',
    searchPlaceholder: '14-ಅಂಕಿಯ ಯುಎಲ್‌ಪಿಐಎನ್, ಸರ್ವೆ ನಂ, ಮಾಲೀಕರಿಂದ ಹುಡುಕಿ...',
    verifiedCadastre: 'ದೃಢೀಕೃತ ಕ್ಯಾಡಸ್ಟ್ರೆ',
    downloadPdf: 'ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್',
    previewDossier: 'ದಾಖಲೆ ಪೂರ್ವವೀಕ್ಷಣೆ',
    initiateRequest: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
    roleCitizen: 'ನಾಗರಿಕ',
    roleOfficer: 'ತಹಶೀಲ್ದಾರ್',
    roleAdmin: 'ಆಡಳಿತಾಧಿಕಾರಿ'
  },
  bn: {} as any, mr: {} as any, ta: {} as any, gu: {} as any, ml: {} as any, pa: {} as any, or: {} as any
};

// Fallback all other languages to en
(Object.keys(TRANSLATIONS) as SupportedLanguage[]).forEach(lang => {
  if (lang !== 'en' && Object.keys(TRANSLATIONS[lang]).length === 0) {
    TRANSLATIONS[lang] = TRANSLATIONS.en;
  }
});

export interface LanguageContextType {
  currentLang: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey) => string;
  fontSizeLevel: number;
  setFontScale: (level: number) => void;
  adjustFontSize: (delta: number) => void;
  resetFontSize: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(() => {
    const saved = localStorage.getItem('kshetra_font_level');
    const parsed = saved ? parseInt(saved, 10) : 0;
    return isNaN(parsed) || parsed < 0 || parsed > 2 ? 0 : parsed;
  });

  // Apply root font-size scaling directly to document.documentElement (100% / 112.5% / 125%)
  // This scales ALL rem units used by Tailwind classes across the entire application!
  useEffect(() => {
    const scale = fontSizeLevel === 1 ? '112.5%' : fontSizeLevel === 2 ? '125%' : '100%';
    document.documentElement.style.fontSize = scale;
    localStorage.setItem('kshetra_font_level', String(fontSizeLevel));
  }, [fontSizeLevel]);

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  const setFontScale = (level: number) => {
    const clamped = Math.max(0, Math.min(2, level));
    setFontSizeLevel(clamped);
  };

  const adjustFontSize = (delta: number) => {
    setFontSizeLevel(prev => {
      const next = prev + delta;
      return next >= 0 && next <= 2 ? next : prev;
    });
  };

  const resetFontSize = () => {
    setFontSizeLevel(0);
  };

  const t = (key: TranslationKey): string => {
    return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        setLanguage: setCurrentLang,
        t,
        fontSizeLevel,
        setFontScale,
        adjustFontSize,
        resetFontSize
      }}
    >
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
