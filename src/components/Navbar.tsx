import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { UserRole } from '../../shared/types';
import { KshetraMark } from './KshetraMark';
import { NotificationBell } from './NotificationBell';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Tooltip } from './ui/Tooltip';
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
  Database,
  FileCheck2,
  BarChart3,
  SunMoon,
  Sparkles,
  Info
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'citizen' | 'officer' | 'audit' | 'verify' | 'analytics';
  setActiveTab: (tab: 'map' | 'citizen' | 'officer' | 'audit' | 'verify' | 'analytics') => void;
  onOpenProfile: () => void;
  onOpenApiInspector: () => void;
  onOpenTechDoc: () => void;
  onOpenRoadmap: () => void;
  onStartGuidedDemo?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenApiInspector,
  onOpenTechDoc,
  onStartGuidedDemo,
  onLogout
}) => {
  const { currentUser, currentRole, switchRole } = useAuth();
  const { 
    language, 
    setLanguage, 
    t, 
    fontSize, 
    setFontSize, 
    highContrast, 
    toggleHighContrast 
  } = useLanguage();
  
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextRole = e.target.value as UserRole;
    await switchRole(nextRole);
    if (nextRole === 'citizen' && (activeTab === 'officer' || activeTab === 'analytics')) {
      setActiveTab('map');
    }
  };

  const isOfficerOrAdmin = currentRole === 'officer' || currentRole === 'policy_admin';
  const isAdmin = currentRole === 'policy_admin';

  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 shadow-xs select-none">
      {/* Accessible Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0B3D6E] focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg focus:outline-none"
      >
        {t('skipToContent')}
      </a>

      {/* 1. TOP UTILITY ACCESSIBILITY & PROTOCOL BAR */}
      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-700 text-xs px-3 sm:px-6 py-1">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          {/* Decluttered: Single Prototype Badge */}
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>{t('prototypeBadge')}</span>
            </span>
            <button
              onClick={() => setIsAboutModalOpen(true)}
              className="text-[11px] text-[#0B3D6E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3 h-3 text-[#0B3D6E]" />
              <span>About this prototype (SIH26014)</span>
            </button>

            {onStartGuidedDemo && (
              <button
                onClick={onStartGuidedDemo}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Start Guided Demo</span>
              </button>
            )}
          </div>

          {/* Right: Accessibility Controls & Language Picker */}
          <div className="flex items-center gap-3 font-medium text-xs">
            {/* Font Sizer (A- / A / A+) */}
            <div className="flex items-center border border-slate-300 rounded-md bg-white overflow-hidden shadow-2xs">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-0.5 font-bold text-[11px] border-r border-slate-200 transition-colors cursor-pointer ${
                  fontSize === 'sm' ? 'bg-[#0B3D6E] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
                title={t('fontSizeDecrease')}
                aria-label={t('fontSizeDecrease')}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('md')}
                className={`px-2 py-0.5 font-bold text-[11px] border-r border-slate-200 transition-colors cursor-pointer ${
                  fontSize === 'md' ? 'bg-[#0B3D6E] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
                title={t('fontSizeNormal')}
                aria-label={t('fontSizeNormal')}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 font-bold text-[11px] transition-colors cursor-pointer ${
                  fontSize === 'lg' ? 'bg-[#0B3D6E] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
                title={t('fontSizeIncrease')}
                aria-label={t('fontSizeIncrease')}
              >
                A+
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              onClick={toggleHighContrast}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer ${
                highContrast
                  ? 'bg-slate-900 text-yellow-300 border-yellow-400'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title={t('highContrastToggle')}
              aria-label={t('highContrastToggle')}
            >
              <SunMoon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('highContrastBtn')}</span>
            </button>

            {/* Language Picker (English, Hindi, Kannada active) */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:border-slate-400 font-semibold text-slate-800 transition-colors shadow-2xs text-[11px] cursor-pointer"
                aria-label={t('selectLanguage')}
                aria-expanded={isLangDropdownOpen}
              >
                <Globe className="w-3.5 h-3.5 text-[#0B3D6E]" />
                <span>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeName || 'English'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs">
                  <div className="max-h-64 overflow-y-auto">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        disabled={!lang.available}
                        onClick={() => {
                          if (lang.available) {
                            setLanguage(lang.code as any);
                            setIsLangDropdownOpen(false);
                          }
                        }}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-colors ${
                          !lang.available
                            ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                            : language === lang.code
                            ? 'bg-blue-50 text-[#0B3D6E] font-bold'
                            : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                        }`}
                      >
                        <span>{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400">
                          {lang.available ? lang.name : t('comingSoon')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tricolour Hairline Accent Ribbon */}
      <div className="tricolour-ribbon" />

      {/* 2. DECLUTTERED BRAND & NAVIGATION BAR */}
      <div className="bg-[#0B3D6E] text-white px-4 sm:px-6 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand Mark */}
          <div className="flex items-center gap-3 shrink-0">
            <KshetraMark size={32} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-tight text-white">
                  {t('appTitle')}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-100 font-mono font-bold">
                  SIH26014
                </span>
              </div>
            </div>
          </div>

          {/* Middle: Role-Gated Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium" aria-label="Primary navigation">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'map' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('navCadastre')}</span>
            </button>

            <button
              onClick={() => setActiveTab('citizen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'citizen' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('navCitizenServices')}</span>
            </button>

            {isOfficerOrAdmin && (
              <button
                onClick={() => setActiveTab('officer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'officer' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('navOfficerConsole')}</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'analytics' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{t('navAnalytics')}</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'audit' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{t('navAuditLedger')}</span>
            </button>

            <button
              onClick={() => setActiveTab('verify')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'verify' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{t('navVerifyDoc')}</span>
            </button>

            <button
              onClick={onOpenTechDoc}
              className="flex items-center gap-1.5 px-3 py-1.5 text-blue-100 hover:bg-white/10 hover:text-white rounded-md cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t('navSpecs')}</span>
            </button>

            <button
              onClick={onOpenApiInspector}
              className="flex items-center gap-1.5 px-3 py-1.5 text-blue-100 hover:bg-white/10 hover:text-white rounded-md cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{t('navApiConsole')}</span>
            </button>
          </nav>

          {/* Right: Notification Bell, Role Switcher & Full User Name */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live SSE Event Notification Bell */}
            <NotificationBell />

            {/* Real API Role Switcher */}
            <div className="flex items-center gap-1.5 bg-[#072A4D] border border-blue-400/30 rounded-md px-2 py-1 text-xs text-blue-200">
              <span className="text-[10px] text-blue-300 hidden sm:inline">{t('roleActive')}:</span>
              <select
                value={currentRole}
                onChange={handleRoleChange}
                aria-label={t('roleActive')}
                className="bg-transparent text-white font-semibold focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="citizen" className="text-slate-900">{t('roleCitizen')}</option>
                <option value="officer" className="text-slate-900">{t('roleOfficer')}</option>
                <option value="policy_admin" className="text-slate-900">{t('roleAdmin')}</option>
              </select>
            </div>

            {/* User Persona with Full Name and Designation */}
            <Tooltip content={`${currentUser.fullName} (${currentUser.designation || currentRole})`}>
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 px-2 py-1 text-blue-100 hover:text-white rounded hover:bg-white/10 text-xs cursor-pointer max-w-[200px]"
              >
                <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate font-medium">{currentUser.fullName}</span>
              </button>
            </Tooltip>

            <button
              onClick={onLogout}
              className="p-1.5 text-blue-300 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              title={t('logoutSession')}
              aria-label={t('logoutSession')}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* About Prototype Modal */}
      <Modal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        title={t('aboutModalTitle')}
        subtitle={t('aboutModalSubtitle')}
      >
        <div className="space-y-4 text-xs text-[#334155] leading-relaxed">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[#0B3D6E]">
            <p className="font-semibold text-sm">Problem Statement SIH26014</p>
            <p className="mt-1">{t('aboutProblemStatement')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-800 block">{t('bhuAadhaarStructure')}</span>
              <span className="text-slate-500">{t('aboutUlpinDesc')}</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-800 block">{t('ledgerTitle')}</span>
              <span className="text-slate-500">{t('aboutLedgerDesc')}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={() => setIsAboutModalOpen(false)}>{t('closeBtn')}</Button>
          </div>
        </div>
      </Modal>
    </header>
  );
};
