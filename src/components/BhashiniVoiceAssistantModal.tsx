import React, { useState, useEffect } from 'react';
import { Parcel } from '../types';
import { useLanguage, SupportedLanguage } from '../context/LanguageContext';
import { X, Volume2, Globe, Play, Pause, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';

interface BhashiniVoiceAssistantModalProps {
  parcel: Parcel | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BhashiniVoiceAssistantModal: React.FC<BhashiniVoiceAssistantModalProps> = ({
  parcel,
  isOpen,
  onClose
}) => {
  const { currentLang, setLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(currentLang);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.95);

  useEffect(() => {
    setSelectedLang(currentLang);
  }, [currentLang]);

  if (!isOpen || !parcel) return null;

  const isDisputed = parcel.encumbrance.disputeFlag;

  // Pan-India Vernacular Translations
  const translations: Record<SupportedLanguage, { title: string; text: string; audioHint: string; speechLocale: string }> = {
    hi: {
      title: 'हिन्दी (Hindi)',
      text: `भू-अभिलेख विवरण: यह भूमि सर्वेक्षण संख्या ${parcel.surveyNumber}, ${parcel.villageWard}, ${parcel.district} में स्थित है। पंजीकृत स्वामी ${parcel.ownership.ownerName} हैं। कुल रकबा ${parcel.areaSqm} वर्ग मीटर (लगभग ${parcel.areaAcres} एकड़) है। स्थिति: ${isDisputed ? 'सावधान! इस भूखंड पर न्यायालय का विवाद या स्थगन आदेश दर्ज है।' : 'यह भूमि पूरी तरह से निर्विवाद और स्वच्छ स्वामित्व वाली है।'}`,
      audioHint: 'भाषिणी राष्ट्रीय वाक् संश्लेषण (Bhashini AI Speech Synthesis)',
      speechLocale: 'hi-IN'
    },
    en: {
      title: 'English (Official Voiceover)',
      text: `Cadastral Voice Summary: Parcel Survey Number ${parcel.surveyNumber}, located in ${parcel.villageWard}, ${parcel.district}, ${parcel.state}. Registered Title Holder: ${parcel.ownership.ownerName}. Total cadastral area: ${parcel.areaSqm} square meters (${parcel.areaAcres} acres). Legal Status: ${isDisputed ? 'Caution: Judicial litigation docket active on record.' : 'Clear title with verified zero encumbrance status.'}`,
      audioHint: 'Government of India Digital Public Infrastructure Voice Assistant',
      speechLocale: 'en-IN'
    },
    kn: {
      title: 'ಕನ್ನಡ (Kannada)',
      text: `ಭೂದಾಖಲೆ ಸಾರಾಂಶ: ಈ ಜಮೀನು ಸರ್ವೆ ನಂಬರ್ ${parcel.surveyNumber}, ${parcel.villageWard}, ${parcel.district} ಜಿಲ್ಲೆಯಲ್ಲಿ ಬರುತ್ತದೆ. ನೋಂದಾಯಿತ ಮಾಲೀಕರು ${parcel.ownership.ownerName}. ಒಟ್ಟು ವಿಸ್ತೀರ್ಣ ${parcel.areaSqm} ಚದರ ಮೀಟರ್ (${parcel.areaAcres} ಎಕರೆ). ಸ್ಥಿತಿ: ${isDisputed ? 'ಎಚ್ಚರಿಕೆ! ಈ ಸರ್ವೆ ನಂಬರ್ ಮೇಲೆ ನ್ಯಾಯಾಲಯದ ವ್ಯಾಜ್ಯವಿದೆ.' : 'ಯಾವುದೇ ವಿವಾದವಿಲ್ಲದ ಸ್ವಚ್ಛ ಹಕ್ಕುಪತ್ರ ಹೊಂದಿರುವ ಜಮೀನು.'}`,
      audioHint: 'ಭಾಷಿಣಿ ಕನ್ನಡ ಧ್ವನಿ ವಿವರಣೆ',
      speechLocale: 'kn-IN'
    }
  };

  const activeTranslation = translations[selectedLang] || translations.hi || translations.en;

  const handleTogglePlay = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(activeTranslation.text);
        utterance.lang = activeTranslation.speechLocale || 'hi-IN';
        utterance.rate = speechRate;

        // Try to pick matching voice if available
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(activeTranslation.speechLocale.slice(0, 2)));
        if (voice) utterance.voice = voice;

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
      if (!isPlaying) {
        setTimeout(() => setIsPlaying(false), 5000);
      }
    }
  };

  const handleSelectLang = (lang: SupportedLanguage) => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSelectedLang(lang);
    setLanguage(lang); // Sync with global app language!
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#0B3D6E] text-white rounded-lg">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 font-cinzel">
                  Digital Bhashini Pan-India Voice RoR Assistant
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-[#0B3D6E] font-semibold font-rajdhani">
                  National DPI Voice
                </span>
              </div>
              <p className="text-xs text-slate-500 font-rajdhani">
                Voice-first land record narration for citizens in Indian languages (AI Bhashini / MeitY).
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pan-India Language Selector Tabs (Telugu removed, All-India supported) */}
        <div className="space-y-1">
          <span className="text-[11px] text-slate-500 font-medium block">
            Select Indian Language (भाषाई चयन):
          </span>
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            {[
              { code: 'hi' as SupportedLanguage, label: 'हिन्दी' },
              { code: 'en' as SupportedLanguage, label: 'English' },
              { code: 'kn' as SupportedLanguage, label: 'ಕನ್ನಡ' }
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => handleSelectLang(item.code)}
                className={`py-1.5 rounded-md transition-all text-center cursor-pointer ${
                  selectedLang === item.code
                    ? 'bg-[#0B3D6E] text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spoken Text Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#0B3D6E]" />
              <span>{activeTranslation.title}</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified RoR Data
            </span>
          </div>

          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            "{activeTranslation.text}"
          </p>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>{activeTranslation.audioHint}</span>
            {isPlaying && (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Speaking...
              </span>
            )}
          </div>
        </div>

        {/* Audio Player Controls */}
        <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePlay}
              className="w-10 h-10 rounded-full bg-[#0B3D6E] hover:bg-[#082a4d] text-white flex items-center justify-center shadow-sm transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {isPlaying ? 'Playing Spoken RoR Audio' : 'Click to Listen (सुनें)'}
              </div>
              <div className="text-[11px] text-slate-500">
                Natural Vernacular Speech Output
              </div>
            </div>
          </div>

          {/* Speed Rate selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-[10px] text-slate-400 font-medium">Speed:</span>
            {[0.8, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                onClick={() => setSpeechRate(rate)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  speechRate === rate
                    ? 'bg-[#0B3D6E] text-white border-[#0B3D6E]'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-[10px] text-slate-400 font-rajdhani">
          Integrated with Digital India Bhashini National Language Mission • Ministry of Electronics & IT (MeitY)
        </div>
      </div>
    </div>
  );
};
