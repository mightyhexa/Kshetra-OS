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
  Info,
  Menu,
  X,
  MoreHorizontal
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

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
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1.5">
          {/* Decluttered: Single Prototype Badge */}
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>{t('prototypeBadge')}</span>
            </span>
            <button
              onClick={() => setIsAboutModalOpen(true)}
              className="text-[11px] text-[#0B3D6E] hover:underline flex items-center gap-1 cursor-pointer min-h-[36px]"
            >
              <Info className="w-3 h-3 text-[#0B3D6E]" />
              <span>About this prototype (SIH26014)</span>
            </button>

            {onStartGuidedDemo && (
              <button
                onClick={onStartGuidedDemo}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-2xs transition-colors cursor-pointer min-h-[36px]"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Start Guided Demo</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#0B3D6E] hover:bg-slate-200 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Right: Accessibility Controls & Language Picker */}
          <div className="hidden md:flex items-center gap-3 font-medium text-xs">
            {/* Font Sizer (A- / A / A+) */}
            <div className="flex items-center border border-slate-300 rounded-md bg-white overflow-hidden shadow-2xs">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-1 font-bold text-[11px] border-r border-slate-200 transition-colors cursor-pointer min-h-[36px] ${
                  fontSize === 'sm' ? 'bg-[#0B3D6E] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
                title={t('fontSizeDecrease')}
                aria-label={t('fontSizeDecrease')}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('md')}
                className={`px-2 py-1 font-bold text-[11px] border-r border-slate-200 transition-colors cursor-pointer min-h-[36px] ${
                  fontSize === 'md' ? 'bg-[#0B3D6E] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
                title={t('fontSizeNormal')}
                aria-label={t('fontSizeNormal')}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-1 font-bold text-[11px] transition-colors cursor-pointer min-h-[36px] ${
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
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer min-h-[36px] ${
                highContrast
                  ? 'bg-slate-900 text-yellow-300 border-yellow-400'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title={t('highContrastToggle')}
              aria-label={t('highContrastToggle')}
            >
              <SunMoon className="w-3.5 h-3.5" />
              <span>{t('highContrastBtn')}</span>
            </button>

            {/* Language Picker */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:border-slate-400 font-semibold text-slate-800 transition-colors shadow-2xs text-[11px] cursor-pointer min-h-[36px]"
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
                        className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors min-h-[44px] ${
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

          {/* Desktop Middle: Role-Gated Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full text-xs font-medium" aria-label="Primary navigation">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors cursor-pointer min-h-[44px] ${
                activeTab === 'map' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('navCadastre')}</span>
            </button>

            <button
              onClick={() => setActiveTab('citizen')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors cursor-pointer min-h-[44px] ${
                activeTab === 'citizen' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('navCitizenServices')}</span>
            </button>

            {isOfficerOrAdmin && (
              <button
                onClick={() => setActiveTab('officer')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors cursor-pointer min-h-[44px] ${
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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors cursor-pointer min-h-[44px] ${
                  activeTab === 'analytics' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{t('navAnalytics')}</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors cursor-pointer min-h-[44px] ${
                activeTab === 'audit' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{t('navAuditLedger')}</span>
            </button>

            <button
              onClick={() => setActiveTab('verify')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors cursor-pointer min-h-[44px] ${
                activeTab === 'verify' ? 'bg-white text-[#0B3D6E] font-bold shadow-xs' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{t('navVerifyDoc')}</span>
            </button>

            <button
              onClick={onOpenTechDoc}
              className="flex items-center gap-1.5 px-3 py-2 text-blue-100 hover:bg-white/10 hover:text-white rounded-md cursor-pointer min-h-[44px]"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t('navSpecs')}</span>
            </button>

            <button
              onClick={onOpenApiInspector}
              className="flex items-center gap-1.5 px-3 py-2 text-blue-100 hover:bg-white/10 hover:text-white rounded-md cursor-pointer min-h-[44px]"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{t('navApiConsole')}</span>
            </button>
          </nav>

          {/* Desktop Right: Notification Bell, Role Switcher & Full User Name */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Live SSE Event Notification Bell */}
            <NotificationBell />

            {/* Real API Role Switcher */}
            <div className="flex items-center gap-1.5 bg-[#072A4D] border border-blue-400/30 rounded-md px-2.5 py-1 text-xs text-blue-200 min-h-[38px]">
              <span className="text-[10px] text-blue-300 hidden sm:inline">{t('roleActive')}:</span>
              <select
                value={currentRole}
                onChange={handleRoleChange}
                aria-label={t('roleActive')}
                className="bg-transparent text-white font-semibold focus:outline-hidden cursor-pointer text-xs min-h-[36px]"
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
                className="flex items-center gap-1.5 px-2.5 py-1 text-blue-100 hover:text-white rounded hover:bg-white/10 text-xs cursor-pointer max-w-[200px] min-h-[38px]"
              >
                <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate font-medium">{currentUser.fullName}</span>
              </button>
            </Tooltip>

            <button
              onClick={onLogout}
              className="p-2 text-blue-300 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title={t('logoutSession')}
              aria-label={t('logoutSession')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <KshetraMark size={28} />
                  <span className="font-serif font-bold text-[#0B3D6E] text-base">KSHETRA OS</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Signed-in User Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
                <div className="font-bold text-[#0B3D6E] text-xs flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>{currentUser.fullName}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  {currentUser.designation || currentRole.toUpperCase()} · {currentUser.email || 'MoRD Verified'}
                </div>
              </div>

              {/* Role Switcher */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {t('roleActive')}
                </label>
                <select
                  value={currentRole}
                  onChange={(e) => {
                    handleRoleChange(e);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 min-h-[44px]"
                >
                  <option value="citizen">{t('roleCitizen')}</option>
                  <option value="officer">{t('roleOfficer')}</option>
                  <option value="policy_admin">{t('roleAdmin')}</option>
                </select>
              </div>

              {/* Language & Accessibility Controls */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Accessibility & Language
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-700 font-medium">Text Size</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setFontSize('sm')} className={`px-2.5 py-1 text-xs font-bold rounded min-h-[36px] ${fontSize === 'sm' ? 'bg-[#0B3D6E] text-white' : 'bg-white border text-slate-700'}`}>A-</button>
                    <button onClick={() => setFontSize('md')} className={`px-2.5 py-1 text-xs font-bold rounded min-h-[36px] ${fontSize === 'md' ? 'bg-[#0B3D6E] text-white' : 'bg-white border text-slate-700'}`}>A</button>
                    <button onClick={() => setFontSize('lg')} className={`px-2.5 py-1 text-xs font-bold rounded min-h-[36px] ${fontSize === 'lg' ? 'bg-[#0B3D6E] text-white' : 'bg-white border text-slate-700'}`}>A+</button>
                  </div>
                </div>

                <button
                  onClick={toggleHighContrast}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold min-h-[44px] ${
                    highContrast ? 'bg-slate-900 text-yellow-300 border-yellow-400' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <span>High Contrast Mode</span>
                  <SunMoon className="w-4 h-4" />
                </button>
              </div>

              {/* Notification Bell */}
              <div className="pt-2">
                <NotificationBell />
              </div>
            </div>

            <Button
              variant="danger"
              size="md"
              leftIcon={<LogOut className="w-4 h-4" />}
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full mt-4 min-h-[44px]"
            >
              {t('logoutSession')}
            </Button>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM TAB BAR (Item 2) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#072A4D] text-white border-t border-blue-900/80 shadow-2xl flex items-center justify-around px-1 py-1.5 pb-safe"
      >
        {/* 1. Map */}
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer min-h-[44px] min-w-[60px] justify-center ${
            activeTab === 'map' ? 'bg-white text-[#0B3D6E] font-bold' : 'text-blue-200 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Map</span>
        </button>

        {/* 2. Services */}
        <button
          onClick={() => setActiveTab('citizen')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer min-h-[44px] min-w-[60px] justify-center ${
            activeTab === 'citizen' ? 'bg-white text-[#0B3D6E] font-bold' : 'text-blue-200 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Services</span>
        </button>

        {/* 3. Console (Officer / Admin only) */}
        {isOfficerOrAdmin && (
          <button
            onClick={() => setActiveTab('officer')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer min-h-[44px] min-w-[60px] justify-center ${
              activeTab === 'officer' ? 'bg-white text-[#0B3D6E] font-bold' : 'text-blue-200 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Console</span>
          </button>
        )}

        {/* 4. Ledger */}
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer min-h-[44px] min-w-[60px] justify-center ${
            activeTab === 'audit' ? 'bg-white text-[#0B3D6E] font-bold' : 'text-blue-200 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Ledger</span>
        </button>

        {/* 5. More Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer min-h-[44px] min-w-[60px] justify-center ${
              isMoreMenuOpen || activeTab === 'verify' || activeTab === 'analytics' ? 'bg-white text-[#0B3D6E] font-bold' : 'text-blue-200 hover:text-white'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
            <span>More</span>
          </button>

          {isMoreMenuOpen && (
            <div className="absolute right-0 bottom-14 w-52 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs font-semibold">
              <button
                onClick={() => {
                  setActiveTab('verify');
                  setIsMoreMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-100 flex items-center gap-2 cursor-pointer min-h-[44px]"
              >
                <FileCheck2 className="w-4 h-4 text-[#0B3D6E]" />
                <span>Verify Document</span>
              </button>

              <button
                onClick={() => {
                  onOpenApiInspector();
                  setIsMoreMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-100 flex items-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Terminal className="w-4 h-4 text-[#0B3D6E]" />
                <span>API Console</span>
              </button>

              <button
                onClick={() => {
                  onOpenTechDoc();
                  setIsMoreMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-100 flex items-center gap-2 cursor-pointer min-h-[44px]"
              >
                <BookOpen className="w-4 h-4 text-[#0B3D6E]" />
                <span>Technical Specs</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    setActiveTab('analytics');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-100 flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <BarChart3 className="w-4 h-4 text-[#0B3D6E]" />
                  <span>Analytics</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsAboutModalOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-100 flex items-center gap-2 cursor-pointer min-h-[44px] border-t border-slate-100"
              >
                <Info className="w-4 h-4 text-[#0B3D6E]" />
                <span>About Prototype</span>
              </button>
            </div>
          )}
        </div>
      </nav>

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
