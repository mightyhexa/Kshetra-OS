import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import { IndianEmblemLogo } from './IndianEmblemLogo';
import { GovernmentAgencyBanners } from './GovernmentAgencyBanners';
import { GovernmentHeroStrip } from './GovernmentHeroStrip';
import { 
  Home, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  Layers, 
  Terminal, 
  BookOpen, 
  User, 
  Sparkles,
  LogOut,
  Lock,
  Globe,
  Search,
  ChevronDown,
  Volume2
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'citizen' | 'officer' | 'audit';
  setActiveTab: (tab: 'map' | 'citizen' | 'officer' | 'audit') => void;
  onOpenProfile: () => void;
  onOpenApiInspector: () => void;
  onOpenTechDoc: () => void;
  onOpenRoadmap: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenApiInspector,
  onOpenTechDoc,
  onOpenRoadmap,
  onLogout
}) => {
  const { currentUser, currentRole, switchRole } = useAuth();
  const { currentLang, setLanguage, t, adjustFontSize, resetFontSize } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchRole(e.target.value as UserRole);
  };

  const handleSkipToContent = () => {
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      mainEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* 1. TOP UTILITY ACCESSIBILITY BAR (Exact Government Standard as in image) */}
      <div className="bg-[#F1F5F9] border-b border-slate-200 text-slate-700 text-[11px] px-3 sm:px-8 py-1">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Sovereign State Affiliation */}
          <div className="flex items-center gap-2 font-semibold">
            <span className="font-hindi text-slate-800">भारत सरकार</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-700 tracking-wide">GOVERNMENT OF INDIA</span>
          </div>

          {/* Right: Accessibility Links & Language Selector */}
          <div className="flex items-center gap-3 sm:gap-4 font-medium text-[11px]">
            {/* Skip to Main Content */}
            <button
              onClick={handleSkipToContent}
              className="hidden sm:inline hover:underline text-slate-600 focus:text-[#0B3D6E] uppercase tracking-wider text-[10px]"
            >
              {t('skipToMain')}
            </button>

            {/* Font Sizing Accessibility Scaler (A- / A / A+) */}
            <div className="flex items-center border border-slate-300 rounded bg-white overflow-hidden shadow-2xs">
              <button
                onClick={() => adjustFontSize(-1)}
                className="px-1.5 py-0.5 hover:bg-slate-100 font-bold text-slate-700 text-[10px] border-r border-slate-200"
                aria-label="Decrease font size"
              >
                A-
              </button>
              <button
                onClick={resetFontSize}
                className="px-1.5 py-0.5 hover:bg-slate-100 font-bold text-slate-700 text-[10px] border-r border-slate-200"
                aria-label="Default font size"
              >
                A
              </button>
              <button
                onClick={() => adjustFontSize(1)}
                className="px-1.5 py-0.5 hover:bg-slate-100 font-bold text-slate-700 text-[10px]"
                aria-label="Increase font size"
              >
                A+
              </button>
            </div>

            {/* Pan-India Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-slate-300 hover:border-slate-400 font-semibold text-slate-800 transition-colors shadow-2xs"
                aria-label="Select portal language"
              >
                <Globe className="w-3.5 h-3.5 text-[#0B3D6E]" />
                <span>{SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.nativeName || 'Language'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                    Indian Languages (भाषाई चयन)
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-colors ${
                          currentLang === lang.code
                            ? 'bg-blue-50 text-[#0B3D6E] font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL MINISTRY MASTHEAD (White Background with National Emblem & Initiative Badges) */}
      <div className="bg-white border-b border-slate-200 py-2 sm:py-3 px-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: State Emblem + Official Ministry Titles */}
          <div className="flex items-center gap-3 sm:gap-4">
            <IndianEmblemLogo size="lg" variant="navy" showChakraSpin={true} />
            <div className="space-y-0.5">
              <div className="text-[11px] sm:text-xs font-bold text-slate-700 font-hindi leading-tight">
                ग्रामीण विकास मंत्रालय / भूमि संसाधन विभाग
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-800 tracking-wide uppercase font-rajdhani">
                MINISTRY OF RURAL DEVELOPMENT • GOVERNMENT OF INDIA
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-[#0B3D6E] font-cinzel">
                  KSHETRA OS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-[#0B3D6E] font-rajdhani font-bold border border-blue-200">
                  SIH26014
                </span>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  Unified Cadastral DPI
                </span>
              </div>
            </div>
          </div>

          {/* Right: Authentic Initiative Campaign Badges (Swachh Bharat, G20, Bhu-Aadhaar, Azadi) */}
          <GovernmentAgencyBanners />
        </div>
      </div>

      {/* 3. PRIMARY NAVIGATION BAR (Deep Navy Blue #0B3D6E matching government portals) */}
      <nav className="bg-[#0B3D6E] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 flex items-center justify-between h-11">
          {/* Main Navigation Tabs */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 text-xs font-semibold overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t transition-colors whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-white text-[#0B3D6E] font-bold shadow-xs'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('navHome')}</span>
            </button>

            <button
              onClick={() => setActiveTab('citizen')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t transition-colors whitespace-nowrap ${
                activeTab === 'citizen'
                  ? 'bg-white text-[#0B3D6E] font-bold shadow-xs'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('navCitizen')}</span>
            </button>

            <button
              onClick={() => setActiveTab('officer')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t transition-colors whitespace-nowrap ${
                activeTab === 'officer'
                  ? 'bg-white text-[#0B3D6E] font-bold shadow-xs'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('navOfficer')}</span>
              {currentRole === 'citizen' && (
                <span className="text-[9px] px-1 bg-amber-400 text-slate-900 rounded font-bold">
                  Gated
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t transition-colors whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-white text-[#0B3D6E] font-bold shadow-xs'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t('navAudit')}</span>
            </button>

            {/* Quick Tools */}
            <button
              onClick={onOpenTechDoc}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>DILRMP Specs</span>
            </button>

            <button
              onClick={onOpenApiInspector}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>APIs</span>
            </button>

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <span>{t('navMore')}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      onOpenRoadmap();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Feature Matrix & Roadmap</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenTechDoc();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#0B3D6E]" />
                    <span>Technical Architecture</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenApiInspector();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Terminal className="w-3.5 h-3.5 text-slate-700" />
                    <span>Raw JSON API Endpoints</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Active Role Selector & Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Demo Mode Role Switcher */}
            <div className="flex items-center gap-1 bg-[#072442] border border-blue-400/30 rounded px-2 py-0.5 text-xs text-blue-200">
              <span className="text-[10px] text-blue-300 hidden sm:inline">Role:</span>
              <select
                value={currentRole}
                onChange={handleRoleChange}
                aria-label="Switch active demo user role"
                className="bg-transparent font-bold text-white focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="citizen" className="text-slate-900">Citizen (Public)</option>
                <option value="officer" className="text-slate-900">Land Officer (Tahsildar)</option>
                <option value="policy_admin" className="text-slate-900">Policy Administrator (NSDI)</option>
              </select>
            </div>

            {/* Profile Avatar Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
              aria-label="View authenticated profile"
            >
              <div className="w-6 h-6 rounded-full bg-white text-[#0B3D6E] flex items-center justify-center text-xs font-bold shadow-2xs">
                {currentUser.fullName.charAt(0)}
              </div>
              <span className="hidden xl:inline text-xs font-medium text-white pr-1">
                {currentUser.fullName.split(' ')[0]}
              </span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-1 text-blue-200 hover:text-rose-300 hover:bg-white/10 rounded transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* 4. PHOTOGRAPHIC HERO MONTAGE STRIP (Matches image.png exactly) */}
      <GovernmentHeroStrip />
    </header>
  );
};
