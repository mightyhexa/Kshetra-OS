import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { UserRole } from '../../shared/types';
import { KshetraMark } from './KshetraMark';
import { GovernmentAgencyBanners } from './GovernmentAgencyBanners';
import { 
  MapPin, 
  FileText, 
  ShieldCheck, 
  Terminal, 
  BookOpen, 
  User, 
  LogOut, 
  Globe, 
  ChevronDown,
  Database
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
  const { currentLang, setLanguage, t, fontSizeLevel, setFontScale } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchRole(e.target.value as UserRole);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* 1. TOP UTILITY ACCESSIBILITY & DISCLAIMER BAR */}
      <div className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 text-[11px] px-3 sm:px-6 py-1">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          {/* Sovereign Prototype Disclaimer */}
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="tracking-tight text-[11px] font-semibold text-slate-800">
              {t('prototypeNotice')}
            </span>
          </div>

          {/* Right: Accessibility Controls & Language Selector */}
          <div className="flex items-center gap-3 font-medium text-[11px]">
            {/* Font Sizing Accessibility Scaler (A- / A / A+) - Connected to root HTML */}
            <div className="flex items-center border border-slate-300 rounded bg-white overflow-hidden shadow-2xs">
              <button
                onClick={() => setFontScale(0)}
                className={`px-2 py-0.5 font-bold text-[10px] border-r border-slate-200 transition-colors ${
                  fontSizeLevel === 0 ? 'bg-[#0B3D6E] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Default scale: 100%"
                aria-label="Font size 100%"
              >
                A-
              </button>
              <button
                onClick={() => setFontScale(1)}
                className={`px-2 py-0.5 font-bold text-[10px] border-r border-slate-200 transition-colors ${
                  fontSizeLevel === 1 ? 'bg-[#0B3D6E] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Medium scale: 112.5%"
                aria-label="Font size 112.5%"
              >
                A
              </button>
              <button
                onClick={() => setFontScale(2)}
                className={`px-2 py-0.5 font-bold text-[10px] transition-colors ${
                  fontSizeLevel === 2 ? 'bg-[#0B3D6E] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Large scale: 125%"
                aria-label="Font size 125%"
              >
                A+
              </button>
            </div>

            {/* Language Selector */}
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
                  <div className="max-h-64 overflow-y-auto">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                          currentLang === lang.code ? 'bg-blue-50 text-[#0B3D6E] font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tricolour Hairline Divider */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <KshetraMark size={36} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-[#0B3D6E] font-cinzel">
                {t('softwareTitle')}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-[#0B3D6E] font-bold font-mono">
                SIH26014
              </span>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-1">
              {t('tagline')}
            </p>
          </div>
        </div>

        <GovernmentAgencyBanners />
      </div>

      {/* 3. NATIONAL NAVY PRIMARY NAVIGATION */}
      <div className="bg-[#0B3D6E] text-white px-4 sm:px-6 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none py-0.5">
          <nav className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t transition-colors ${
                activeTab === 'map' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('navHome')}</span>
            </button>

            <button
              onClick={() => setActiveTab('citizen')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t transition-colors ${
                activeTab === 'citizen' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('navCitizen')}</span>
            </button>

            <button
              onClick={() => setActiveTab('officer')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t transition-colors ${
                activeTab === 'officer' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('navOfficer')}</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t transition-colors ${
                activeTab === 'audit' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{t('navAudit')}</span>
            </button>

            <button
              onClick={onOpenTechDoc}
              className="flex items-center gap-1.5 px-3 py-2 text-blue-100 hover:bg-white/10 hover:text-white rounded-t"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t('navBhuAadhaar')}</span>
            </button>

            <button
              onClick={onOpenApiInspector}
              className="flex items-center gap-1.5 px-3 py-2 text-blue-100 hover:bg-white/10 hover:text-white rounded-t"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{t('navApis')}</span>
            </button>
          </nav>

          {/* Right: Active Role Selector & Profile */}
          <div className="flex items-center gap-2 shrink-0 py-1">
            <div className="flex items-center gap-1 bg-[#072442] border border-blue-400/30 rounded px-2 py-0.5 text-xs text-blue-200">
              <span className="text-[10px] text-blue-300 hidden sm:inline">Role:</span>
              <select
                value={currentRole}
                onChange={handleRoleChange}
                className="bg-transparent text-white font-semibold focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="citizen" className="text-slate-900">Citizen User</option>
                <option value="officer" className="text-slate-900">Land Officer (Tahsildar)</option>
                <option value="policy_admin" className="text-slate-900">Policy Administrator</option>
              </select>
            </div>

            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-2 py-1 text-blue-200 hover:text-white rounded hover:bg-white/10 text-xs"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline font-medium">{currentUser.fullName}</span>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 text-blue-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Logout session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
