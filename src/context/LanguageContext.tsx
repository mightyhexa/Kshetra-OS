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
  | 'govOfIndia'
  | 'mordDolr'
  | 'deptLandResources'
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
  | 'disputeAlert'
  | 'downloadPdf'
  | 'generateForm15'
  | 'viewDossier'
  | 'initiateRequest'
  | 'roleCitizen'
  | 'roleOfficer'
  | 'roleAdmin'
  | 'swachhBharat'
  | 'g20Motto';

const TRANSLATIONS: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  en: {
    govOfIndia: 'GOVERNMENT OF INDIA',
    mordDolr: 'MINISTRY OF RURAL DEVELOPMENT',
    deptLandResources: 'DEPARTMENT OF LAND RESOURCES (DoLR)',
    softwareTitle: 'KSHETRA OS',
    tagline: 'Integrated GIS-based Digital Public Infrastructure for Land Governance (SIH26014)',
    skipToMain: 'SKIP TO MAIN CONTENT',
    navHome: 'Home / Cadastre',
    navCitizen: 'Citizen Services',
    navOfficer: 'Officer Console',
    navAudit: 'Audit Ledger',
    navBhuAadhaar: 'Bhu-Aadhaar & DILRMP',
    navApis: 'APIs & NSDI',
    navMore: 'More',
    searchPlaceholder: 'Search by ULPIN (14-digit), Survey No, Owner Name, District...',
    verifiedCadastre: 'Status: VERIFIED CADASTRE',
    disputeAlert: '⚠️ Active Judicial Litigation Docket',
    downloadPdf: 'Download PDF',
    generateForm15: 'Generate Form 15',
    viewDossier: 'NSDI Dossier',
    initiateRequest: 'Initiate Service Request',
    roleCitizen: 'Citizen',
    roleOfficer: 'Land Officer',
    roleAdmin: 'Policy Admin',
    swachhBharat: 'एक कदम स्वच्छता की ओर',
    g20Motto: 'वसुधैव कुटुम्बकम् • ONE EARTH · ONE FAMILY · ONE FUTURE'
  },
  hi: {
    govOfIndia: 'भारत सरकार',
    mordDolr: 'ग्रामीण विकास मंत्रालय',
    deptLandResources: 'भूमि संसाधन विभाग (DoLR)',
    softwareTitle: 'क्षेत्र ओएस (KSHETRA OS)',
    tagline: 'भू-प्रशासन हेतु एकीकृत जीआईएस डिजिटल सार्वजनिक अवसंरचना (SIH26014)',
    skipToMain: 'मुख्य सामग्री पर जाएं',
    navHome: 'मुखपृष्ठ / कैडस्ट्रे',
    navCitizen: 'नागरिक सेवाएं',
    navOfficer: 'अधिकारी कंसोल',
    navAudit: 'ऑडिट लेजर',
    navBhuAadhaar: 'भू-आधार एवं डीआईएलआरएमपी',
    navApis: 'एपीआई और एनएसडीआई',
    navMore: 'अन्य विवरण',
    searchPlaceholder: 'यूलपिन (14-अंकीय भू-आधार), खसरा/सर्वेक्षण संख्या, नाम से खोजें...',
    verifiedCadastre: 'स्थिति: सत्यापित कैडस्ट्रे',
    disputeAlert: '⚠️ सक्रिय न्यायालय वाद / स्थगन आदेश',
    downloadPdf: 'पीडीएफ डाउनलोड करें',
    generateForm15: 'फॉर्म 15 प्रमाणपत्र',
    viewDossier: 'एनएसडीआई भू-डॉक्यूमेंट',
    initiateRequest: 'सेवा अनुरोध दर्ज करें',
    roleCitizen: 'नागरिक',
    roleOfficer: 'तहसीलदार / भू-अधिकारी',
    roleAdmin: 'नीति प्रशासक',
    swachhBharat: 'एक कदम स्वच्छता की ओर',
    g20Motto: 'वसुधैव कुटुम्बकम् • एक पृथ्वी · एक परिवार · एक भविष्य'
  },
  bn: {
    govOfIndia: 'ভারত সরকার',
    mordDolr: 'পল্লী উন্নয়ন মন্ত্রক',
    deptLandResources: 'ভূমি সম্পদ বিভাগ',
    softwareTitle: 'ক্ষেত্র ওএস (KSHETRA OS)',
    tagline: 'ভূমি শাসনের জন্য ডিজিটাল পাবলিক পরিকাঠামো',
    skipToMain: 'মূল বিষয়বস্তুতে যান',
    navHome: 'হোম / ক্যাডাস্ট্রে',
    navCitizen: 'নাগরিক পরিষেবা',
    navOfficer: 'অফিসার কনসোল',
    navAudit: 'অডিট লেজার',
    navBhuAadhaar: 'ভূ-আধার এবং ডিআইএলআরএমপি',
    navApis: 'এপিআই ও এনএসডিআই',
    navMore: 'আরও',
    searchPlaceholder: 'ইউলপিন, দাগ নং, খতিয়ান বা নাম দিয়ে অনুসন্ধান করুন...',
    verifiedCadastre: 'স্থিতি: যাচাইকৃত ক্যাডাস্ট্রে',
    disputeAlert: '⚠️ সক্রিয় আইনি বিরোধ',
    downloadPdf: 'পিডিএফ ডাউনলোড',
    generateForm15: 'ফর্ম ১৫ শংসাপত্র',
    viewDossier: 'সরকারি ডসিয়ার',
    initiateRequest: 'আবেদন শুরু করুন',
    roleCitizen: 'নাগরিক',
    roleOfficer: 'ভূমি রাজস্ব কর্মকর্তা',
    roleAdmin: 'প্রশাসক',
    swachhBharat: 'এক কদম স্বচ্ছতার দিকে',
    g20Motto: 'বসুধৈব কুটুম্বকম'
  },
  mr: {
    govOfIndia: 'भारत सरकार',
    mordDolr: 'ग्रामविकास मंत्रालय',
    deptLandResources: 'भूमि संसाधन विभाग',
    softwareTitle: 'क्षेत्र ओएस (KSHETRA OS)',
    tagline: 'जमीन प्रशासनासाठी एकात्मिक जीआयएस डिजिटल पब्लिक इन्फ्रास्ट्रक्चर',
    skipToMain: 'मुख्य मजकुरावर जा',
    navHome: 'मुख्यपृष्ठ / भूकर',
    navCitizen: 'नागरी सेवा',
    navOfficer: 'अधिकारी कन्सोल',
    navAudit: 'ऑडिट लेजर',
    navBhuAadhaar: 'भू-आधार आणि योजना',
    navApis: 'एपीआय आणि एनएसडीआय',
    navMore: 'अधिक',
    searchPlaceholder: 'यूलपिन, सर्व्हे नंबर, गट नंबर किंवा नावाने शोधा...',
    verifiedCadastre: 'स्थिती: प्रमाणित भूकर',
    disputeAlert: '⚠️ न्यायालयीन वाद नोंदणीकृत',
    downloadPdf: 'पीडीएफ डाउनलोड',
    generateForm15: 'फॉर्म १५ प्रमाणपत्र',
    viewDossier: 'अधिकृत डॉसियर',
    initiateRequest: 'अर्ज सादर करा',
    roleCitizen: 'नागरिक',
    roleOfficer: 'तहसीलदार / भूमी अधिकारी',
    roleAdmin: 'प्रशासक',
    swachhBharat: 'एक पाऊल स्वच्छतेकडे',
    g20Motto: 'वसुधैव कुटुंबकम्'
  },
  ta: {
    govOfIndia: 'இந்திய அரசு',
    mordDolr: 'ஊரக வளர்ச்சி அமைச்சகம்',
    deptLandResources: 'நில வளத்துறை',
    softwareTitle: 'க்ஷேத்ரா ஓஎஸ் (KSHETRA OS)',
    tagline: 'நில நிர்வாகத்திற்கான ஒருங்கிணைந்த ஜிஐஎஸ் டிஜிட்டல் பொது உள்கட்டமைப்பு',
    skipToMain: 'முதன்மை உள்ளடக்கத்திற்குச் செல்லவும்',
    navHome: 'முகப்பு / நில வரைபடம்',
    navCitizen: 'குடிமக்கள் சேவைகள்',
    navOfficer: 'அதிகாரி பணியகம்',
    navAudit: 'தணிக்கை பதிவு',
    navBhuAadhaar: 'பூ-ஆதார் திட்டம்',
    navApis: 'ஏபிஐ மற்றும் என்எஸ்டிஐ',
    navMore: 'மேலும்',
    searchPlaceholder: 'யூல்ப்பின், சர்வே எண், உரிமையாளர் பெயர் மூலம் தேடவும்...',
    verifiedCadastre: 'நிலை: சரிபார்க்கப்பட்ட நிலப்பதிவு',
    disputeAlert: '⚠️ நீதிமன்ற வழக்கு நிலுவையில் உள்ளது',
    downloadPdf: 'பிடிஎஃப் பதிவிறக்கு',
    generateForm15: 'படிவம் 15 சான்றிதழ்',
    viewDossier: 'அரசு ஆவணம்',
    initiateRequest: 'விண்ணப்பத்தைத் தொடங்கு',
    roleCitizen: 'குடிமகன்',
    roleOfficer: 'வட்டாட்சியர்',
    roleAdmin: 'நிர்வாகி',
    swachhBharat: 'தூய்மையை நோக்கி ஒரு படி',
    g20Motto: 'ஒரே பூமி · ஒரே குடும்பம்'
  },
  gu: {
    govOfIndia: 'ભારત સરકાર',
    mordDolr: 'ગ્રામીણ વિકાસ મંત્રાલય',
    deptLandResources: 'જમીન સંસાધન વિભાગ',
    softwareTitle: 'ક્ષેત્ર ઓએસ (KSHETRA OS)',
    tagline: 'જમીન શાસન માટે ડિજિટલ પબ્લિક ઇન્ફ્રાસ્ટ્રક્ચર',
    skipToMain: 'મુખ્ય વિષયવસ્તુ પર જાઓ',
    navHome: 'મુખ્યપૃષ્ઠ / કડાસ્ટ્રે',
    navCitizen: 'નાગરિક સેવાઓ',
    navOfficer: 'અધિકારી કન્સોલ',
    navAudit: 'ઓડિટ લેજર',
    navBhuAadhaar: 'ભૂ-આધાર અને ડીઆઈએલઆરએમપી',
    navApis: 'એપીઆઈ અને એનએસડીઆઈ',
    navMore: 'વધુ',
    searchPlaceholder: 'યુએલપીઆઈએન, સર્વે નંબર અથવા નામ દ્વારા શોધો...',
    verifiedCadastre: 'સ્થિતિ: પ્રમાણિત જમીન રેકોર્ડ',
    disputeAlert: '⚠️ અદાલતી વિવાદ ચાલુ છે',
    downloadPdf: 'પીડીએફ ડાઉનલોડ કરો',
    generateForm15: 'ફોર્મ ૧૫ પ્રમાણપત્ર',
    viewDossier: 'સરકારી ડોઝિયર',
    initiateRequest: 'અરજી શરૂ કરો',
    roleCitizen: 'નાગરિક',
    roleOfficer: 'મામલતદાર',
    roleAdmin: 'નીતિ સંચાલક',
    swachhBharat: 'એક કદમ સ્વચ્છતા તરફ',
    g20Motto: 'વસુધૈવ કુટુમ્બકમ્'
  },
  kn: {
    govOfIndia: 'ಭಾರತ ಸರ್ಕಾರ',
    mordDolr: 'ಗ್ರಾಮೀಣಾಭಿವೃದ್ಧಿ ಸಚಿವಾಲಯ',
    deptLandResources: 'ಭೂ ಸಂಪನ್ಮೂಲಗಳ ಇಲಾಖೆ',
    softwareTitle: 'ಕ್ಷೇತ್ರ ಓಎಸ್ (KSHETRA OS)',
    tagline: 'ಭೂ ಆಡಳಿತಕ್ಕಾಗಿ ಸಮಗ್ರ ಜಿಐಎಸ್ ಡಿಜಿಟಲ್ ಸಾರ್ವಜನಿಕ ಮೂಲಸೌಕರ್ಯ',
    skipToMain: 'ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ಹೋಗಿ',
    navHome: 'ಮುಖಪುಟ / ಕಡಾಸ್ಟ್ರೆ',
    navCitizen: 'ನಾಗರಿಕ ಸೇವೆಗಳು',
    navOfficer: 'ಅಧಿಕಾರಿ ಕನ್ಸೋಲ್',
    navAudit: 'ಆಡಿಟ್ ಲೆಡ್ಜರ್',
    navBhuAadhaar: 'ಭೂ-ಆಧಾರ್ ಮತ್ತು ಯೋಜನೆಗಳು',
    navApis: 'ಎಪಿಐ ಮತ್ತು ಎನ್‌ಎಸ್‌ಡಿಐ',
    navMore: 'ಇನ್ನಷ್ಟು',
    searchPlaceholder: 'ಯುಎಲ್‌ಪಿಐಎನ್, ಸರ್ವೆ ನಂಬರ್, ಮಾಲೀಕರ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ...',
    verifiedCadastre: 'ಸ್ಥಿತಿ: ಪರಿಶೀಲಿಸಿದ ಭೂದಾಖಲೆ',
    disputeAlert: '⚠️ ಸಕ್ರಿಯ ನ್ಯಾಯಾಲಯದ ವ್ಯಾಜ್ಯ',
    downloadPdf: 'ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್',
    generateForm15: 'ಫಾರ್ಮ್ 15 ಪ್ರಮಾಣಪತ್ರ',
    viewDossier: 'ಸರ್ಕಾರಿ ಕಡತ',
    initiateRequest: 'ಅರ್ಜಿ ಪ್ರಾರಂಭಿಸಿ',
    roleCitizen: 'ನಾಗರಿಕ',
    roleOfficer: 'ತಹಶೀಲ್ದಾರ್',
    roleAdmin: 'ಆಡಳಿತಾಧಿಕಾರಿ',
    swachhBharat: 'ಸ್ವಚ್ಛತೆಯತ್ತ ಒಂದು ಹೆಜ್ಜೆ',
    g20Motto: 'ವಸುಧೈವ ಕುಟುಂಬಕಮ್'
  },
  ml: {
    govOfIndia: 'ഭാരത സർക്കാർ',
    mordDolr: 'ഗ്രാമവികസന മന്ത്രാലയം',
    deptLandResources: 'ഭൂവിഭവ വകുപ്പ്',
    softwareTitle: 'ക്ഷേത്ര ഒഎസ് (KSHETRA OS)',
    tagline: 'ഭൂഭരണത്തിനായുള്ള സമഗ്ര ജിഐഎസ് ഡിജിറ്റൽ പൊതു പശ്ചാത്തലസൗകര്യം',
    skipToMain: 'പ്രധാന ഉള്ളടക്കത്തിലേക്ക് പോകുക',
    navHome: 'ഹോം / ഭൂരേഖ',
    navCitizen: 'പൗര സേവനങ്ങൾ',
    navOfficer: 'ഉദ്യോഗസ്ഥ കൺസോൾ',
    navAudit: 'ഓഡിറ്റ് ലെഡ്ജർ',
    navBhuAadhaar: 'ഭൂ-ആധാർ പദ്ധതി',
    navApis: 'എപിഐകളും എൻഎസ്ഡിഐയും',
    navMore: 'കൂടുതൽ',
    searchPlaceholder: 'യുഎൽപിഐഎൻ, സർവേ നമ്പർ, പേര് എന്നിവ പ്രകാരം തിരയുക...',
    verifiedCadastre: 'നില: പരിശോധിച്ചുറപ്പിച്ച ഭൂരേഖ',
    disputeAlert: '⚠️ കോടതി കേസ് നിലവിലുണ്ട്',
    downloadPdf: 'പിഡിഎഫ് ഡൗൺലോഡ്',
    generateForm15: 'ഫോം 15 സർട്ടിഫിക്കറ്റ്',
    viewDossier: 'സർക്കാർ രേഖ',
    initiateRequest: 'അപേക്ഷ ആരംഭിക്കുക',
    roleCitizen: 'പൗരൻ',
    roleOfficer: 'തഹസിൽദാർ',
    roleAdmin: 'അഡ്മിനിസ്ട്രേറ്റർ',
    swachhBharat: 'ശുചിത്വത്തിലേക്ക് ഒരടി',
    g20Motto: 'വസുധൈവ കുടുംബകം'
  },
  pa: {
    govOfIndia: 'ਭਾਰਤ ਸਰਕਾਰ',
    mordDolr: 'ਪੇਂਡੂ ਵਿਕਾਸ ਮੰਤਰਾਲਾ',
    deptLandResources: 'ਜ਼ਮੀਨੀ ਸਰੋਤ ਵਿਭਾਗ',
    softwareTitle: 'ਖੇਤਰ ਓਐਸ (KSHETRA OS)',
    tagline: 'ਜ਼ਮੀਨ ਪ੍ਰਸ਼ਾਸਨ ਲਈ ਡਿਜੀਟਲ ਪਬਲਿਕ ਬੁਨਿਆਦੀ ਢਾਂਚਾ',
    skipToMain: 'ਮੁੱਖ ਸਮੱਗਰੀ ਤੇ ਜਾਓ',
    navHome: 'ਮੁੱਖ ਪੰਨਾ / ਕੈਡਾਸਟਰੇ',
    navCitizen: 'ਨਾਗਰਿਕ ਸੇਵਾਵਾਂ',
    navOfficer: 'ਅਧਿਕਾਰੀ ਕੰਸੋਲ',
    navAudit: 'ਆਡਿਟ ਲੇਜ਼ਰ',
    navBhuAadhaar: 'ਭੂ-ਆਧਾਰ ਅਤੇ ਪ੍ਰੋਜੈਕਟ',
    navApis: 'ਏਪੀਆਈ ਅਤੇ ਐਨਐਸਡੀਆਈ',
    navMore: 'ਹੋਰ',
    searchPlaceholder: 'ਯੂਐਲਪੀਆਈਐਨ, ਖਸਰਾ ਨੰਬਰ ਜਾਂ ਨਾਮ ਨਾਲ ਖੋਜੋ...',
    verifiedCadastre: 'ਸਥਿਤੀ: ਪ੍ਰਮਾਣਿਤ ਜ਼ਮੀਨੀ ਰਿਕਾਰਡ',
    disputeAlert: '⚠️ ਅਦਾਲਤੀ ਵਿਵਾਦ ਦਰਜ ਹੈ',
    downloadPdf: 'ਪੀਡੀਐਫ ਡਾਊਨਲੋਡ ਕਰੋ',
    generateForm15: 'ਫਾਰਮ 15 ਸਰਟੀਫਿਕੇਟ',
    viewDossier: 'ਸਰਕਾਰੀ ਦਸਤਾਵੇਜ਼',
    initiateRequest: 'ਅਰਜ਼ੀ ਸ਼ੁਰੂ ਕਰੋ',
    roleCitizen: 'ਨਾਗਰਿਕ',
    roleOfficer: 'ਤਹਿਸੀਲਦਾਰ',
    roleAdmin: 'ਪ੍ਰਸ਼ਾਸਕ',
    swachhBharat: 'ਸਵੱਛਤਾ ਵੱਲ ਇੱਕ ਕਦਮ',
    g20Motto: 'ਵਸੁਧੈਵ ਕੁਟੁੰਬਕਮ'
  },
  or: {
    govOfIndia: 'ଭାରତ ସରକାର',
    mordDolr: 'ଗ୍ରାମ୍ୟ ଉନ୍ନୟନ ମନ୍ତ୍ରଣାଳୟ',
    deptLandResources: 'ଭୂ-ସମ୍ପଦ ବିଭାଗ',
    softwareTitle: 'କ୍ଷେତ୍ର ଓଏସ (KSHETRA OS)',
    tagline: 'ଭୂ-ପ୍ରଶାସନ ପାଇଁ ଡିଜିଟାଲ ସର୍ବସାଧାରଣ ଭିତ୍ତିଭୂମି',
    skipToMain: 'ମୁଖ୍ୟ ବିଷୟବସ୍ତୁକୁ ଯାଆନ୍ତୁ',
    navHome: 'ମୂଳପୃଷ୍ଠା / କାଡାଷ୍ଟ୍ରେ',
    navCitizen: 'ନାଗରିକ ସେବା',
    navOfficer: 'ଅଧିକାରୀ କନସୋଲ',
    navAudit: 'ଅଡିଟ ଲେଜର',
    navBhuAadhaar: 'ଭୂ-ଆଧାର ଓ ଯୋଜନା',
    navApis: 'ଏପିଆଇ ଏବଂ ଏନଏସଡିଆଇ',
    navMore: 'ଅଧିକ',
    searchPlaceholder: 'ୟୁଏଲପିଆଇଏନ, ଖତିୟାନ ନମ୍ବର କିମ୍ବା ନାମ ଅନୁସନ୍ଧାନ କରନ୍ତୁ...',
    verifiedCadastre: 'ସ୍ଥିତି: ଯାଞ୍ଚ ହୋଇଥିବା ଭୂ-ରେକର୍ଡ',
    disputeAlert: '⚠️ ନ୍ୟାୟାଳୟ ବିବାଦ ଉପସ୍ଥିତ',
    downloadPdf: 'ପିଡିଏଫ ଡାଉନଲୋଡ କରନ୍ତୁ',
    generateForm15: 'ଫର୍ମ ୧୫ ପ୍ରମାଣପତ୍ର',
    viewDossier: 'ସରକାରୀ ଦଲିଲ',
    initiateRequest: 'ଆବେଦନ କରନ୍ତୁ',
    roleCitizen: 'ନାଗରିକ',
    roleOfficer: 'ତହସିଲଦାର',
    roleAdmin: 'ପ୍ରଶାସକ',
    swachhBharat: 'ସ୍ୱଚ୍ଛତା ଆଡକୁ ପାଦେ',
    g20Motto: 'ବସୁଧୈବ କୁଟୁମ୍ବକମ'
  }
};

interface LanguageContextType {
  currentLang: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey) => string;
  fontSizeLevel: number; // -1 = small, 0 = normal, +1 = large, +2 = extra large
  adjustFontSize: (delta: number) => void;
  resetFontSize: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('kshetra_preferred_lang');
    return (saved as SupportedLanguage) || 'en';
  });

  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0);

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    localStorage.setItem('kshetra_preferred_lang', lang);
  };

  const adjustFontSize = (delta: number) => {
    setFontSizeLevel(prev => Math.min(2, Math.max(-1, prev + delta)));
  };

  const resetFontSize = () => {
    setFontSizeLevel(0);
  };

  const t = (key: TranslationKey): string => {
    const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  };

  // Apply html document lang attribute and font sizing class
  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        setLanguage,
        t,
        fontSizeLevel,
        adjustFontSize,
        resetFontSize
      }}
    >
      <div
        style={{
          fontSize:
            fontSizeLevel === -1
              ? '94%'
              : fontSizeLevel === 1
              ? '106%'
              : fontSizeLevel === 2
              ? '112%'
              : '100%'
        }}
      >
        {children}
      </div>
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
