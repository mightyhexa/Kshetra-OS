import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../../shared/types';
import { KshetraMark } from './KshetraMark';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Tabs } from './ui/Tabs';
import { Chip } from './ui/Chip';
import { 
  ShieldCheck, 
  User, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Fingerprint, 
  KeyRound,
  Sparkles,
  Info
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onOpenTechDoc: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onOpenTechDoc }) => {
  const { switchRole, requestOtp, verifyOtp, ssoLogin, isLoading } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'quick' | 'aadhaar' | 'sso'>('quick');
  const [aadhaarInput, setAadhaarInput] = useState('542188910019');
  const [otpInput, setOtpInput] = useState('123456');
  const [demoOtpHitted, setDemoOtpHitted] = useState<string | null>(null);
  const [badgeId, setBadgeId] = useState('KA-REV-2026-081');
  const [ssoRole, setSsoRole] = useState<'officer' | 'policy_admin'>('officer');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQuickLogin = async (role: UserRole) => {
    setErrorMessage(null);
    try {
      await switchRole(role);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    }
  };

  const handleRequestOtp = async () => {
    setErrorMessage(null);
    try {
      const res = await requestOtp(aadhaarInput);
      setDemoOtpHitted(res.demoOtp);
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP dispatch failed');
    }
  };

  const handleAadhaarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await verifyOtp(aadhaarInput, otpInput);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid simulated OTP');
    }
  };

  const handleSsoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await ssoLogin(badgeId, ssoRole);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'SSO token verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-between">
      {/* Tricolour Accent Line */}
      <div className="tricolour-ribbon" />

      {/* Main Split Grid */}
      <div className="grow grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-6px)]">
        {/* Left Side: Contour Hero Section */}
        <div className="lg:col-span-5 contour-hero-bg text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 z-10">
            <div className="flex items-center gap-3">
              <KshetraMark size={44} />
              <div>
                <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
                  {t('appTitle')}
                </h1>
                <span className="inline-block px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[10px] font-mono mt-0.5">
                  SIH26014 · DPI Cadastre
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                {t('loginHeroTitle')}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {t('loginHeroDesc')}
              </p>
            </div>

            {/* Bhu-Aadhaar 14-digit ULPIN Visual Architecture */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 text-xs">
              <div className="flex items-center justify-between text-blue-200 font-semibold border-b border-white/10 pb-2">
                <span>{t('bhuAadhaarStructure')}</span>
                <span className="font-mono text-[11px] text-amber-300">ISO 19115 / OGC</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-xs">
                <div className="p-2 rounded bg-white/10 border border-white/10">
                  <div className="text-amber-300 font-bold">29</div>
                  <div className="text-[9px] text-slate-300 font-sans mt-0.5">{t('stateCode')}</div>
                </div>
                <div className="p-2 rounded bg-white/10 border border-white/10">
                  <div className="text-blue-200 font-bold">7891</div>
                  <div className="text-[9px] text-slate-300 font-sans mt-0.5">{t('districtTahsil')}</div>
                </div>
                <div className="p-2 rounded bg-white/10 border border-white/10">
                  <div className="text-blue-200 font-bold">4402</div>
                  <div className="text-[9px] text-slate-300 font-sans mt-0.5">{t('villageSheet')}</div>
                </div>
                <div className="p-2 rounded bg-white/10 border border-white/10">
                  <div className="text-emerald-300 font-bold">8910</div>
                  <div className="text-[9px] text-slate-300 font-sans mt-0.5">{t('plotChecksum')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Left Note */}
          <div className="pt-8 z-10 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>{t('prototypeBadge')}</span>
            <button
              onClick={onOpenTechDoc}
              className="text-amber-300 hover:text-amber-200 hover:underline font-semibold cursor-pointer"
            >
              {t('viewSpecifications')}
            </button>
          </div>
        </div>

        {/* Right Side: Role Cards & Simulated Auth Methods */}
        <div className="lg:col-span-7 p-6 sm:p-12 flex flex-col justify-center max-w-2xl mx-auto w-full">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Chip severity="statutory" label={t('simulatedDpiPortal')} />
                <span className="text-xs text-slate-500 font-mono">v0.3.0-prototype</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#0B3D6E]">
                {t('loginEnterPortal')}
              </h2>
              <p className="text-sm text-[#64748B] mt-1">
                {t('loginSubtitle')}
              </p>
            </div>

            {/* Simulated Tabs */}
            <Tabs
              tabs={[
                { id: 'quick', label: t('loginTabQuickRole') },
                { id: 'aadhaar', label: t('loginTabAadhaar') },
                { id: 'sso', label: t('loginTabSso') }
              ]}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as any)}
              variant="segmented"
            />

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-medium">
                {errorMessage}
              </div>
            )}

            {/* TAB 1: 1-Click Role Cards */}
            {activeTab === 'quick' && (
              <div className="space-y-4">
                {/* 1. Citizen Role Card */}
                <Card
                  variant="default"
                  className="hover:border-[#0B3D6E] transition-all cursor-pointer group hover:shadow-md"
                  onClick={() => handleQuickLogin('citizen')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-blue-50 text-[#0B3D6E] group-hover:bg-[#0B3D6E] group-hover:text-white transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-semibold text-[#0F172A]">
                          {t('roleCitizen')}
                        </h3>
                        <p className="text-xs text-slate-500">{t('citizenDemoName')}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      {t('loginBtn')}
                    </Button>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('loginCitizenCanSee')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{t('loginCitizenCannotSee')}</span>
                    </div>
                  </div>
                </Card>

                {/* 2. Land Officer (Tahsildar) Role Card */}
                <Card
                  variant="accent"
                  className="hover:border-[#0B3D6E] transition-all cursor-pointer group hover:shadow-md"
                  onClick={() => handleQuickLogin('officer')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-[#0B3D6E]/10 text-[#0B3D6E] group-hover:bg-[#0B3D6E] group-hover:text-white transition-colors">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-semibold text-[#0F172A]">
                          {t('roleOfficer')}
                        </h3>
                        <p className="text-xs text-slate-500">{t('officerDemoName')}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      {t('loginBtn')}
                    </Button>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('loginOfficerCanSee')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{t('loginOfficerCannotSee')}</span>
                    </div>
                  </div>
                </Card>

                {/* 3. Policy Administrator Role Card */}
                <Card
                  variant="default"
                  className="hover:border-[#0B3D6E] transition-all cursor-pointer group hover:shadow-md"
                  onClick={() => handleQuickLogin('policy_admin')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-amber-50 text-amber-800 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-semibold text-[#0F172A]">
                          {t('roleAdmin')}
                        </h3>
                        <p className="text-xs text-slate-500">{t('adminDemoName')}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      {t('loginBtn')}
                    </Button>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('loginAdminCanSee')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{t('loginAdminCannotSee')}</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* TAB 2: Aadhaar eKYC OTP */}
            {activeTab === 'aadhaar' && (
              <form onSubmit={handleAadhaarSubmit} className="space-y-4">
                <Card variant="default">
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        {t('aadhaarIdentifierLabel')}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aadhaarInput}
                          onChange={(e) => setAadhaarInput(e.target.value)}
                          className="grow px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D6E]"
                          placeholder="5421 8891 0019"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRequestOtp}
                        >
                          {t('requestOtpBtn')}
                        </Button>
                      </div>
                    </div>

                    {demoOtpHitted && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-mono text-xs flex items-center justify-between">
                        <span>{t('simulatedOtpLabel')} <strong>{demoOtpHitted}</strong></span>
                        <span className="text-[10px] text-emerald-700">{t('validFor10Min')}</span>
                      </div>
                    )}

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        {t('ekycOtpLabel')}
                      </label>
                      <input
                        type="text"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D6E]"
                        placeholder="123456"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="w-full"
                      isLoading={isLoading}
                      leftIcon={<Fingerprint className="w-4 h-4" />}
                    >
                      {t('authWithAadhaarBtn')}
                    </Button>
                  </div>
                </Card>
              </form>
            )}

            {/* TAB 3: Revenue Officer SSO */}
            {activeTab === 'sso' && (
              <form onSubmit={handleSsoSubmit} className="space-y-4">
                <Card variant="default">
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        {t('ssoBadgeLabel')}
                      </label>
                      <input
                        type="text"
                        value={badgeId}
                        onChange={(e) => setBadgeId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D6E]"
                        placeholder="KA-REV-2026-081"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        {t('ssoAuthorityLabel')}
                      </label>
                      <select
                        value={ssoRole}
                        onChange={(e) => setSsoRole(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D6E]"
                      >
                        <option value="officer">{t('ssoOfficerOption')}</option>
                        <option value="policy_admin">{t('ssoAdminOption')}</option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="w-full"
                      isLoading={isLoading}
                      leftIcon={<KeyRound className="w-4 h-4" />}
                    >
                      {t('verifySsoBtn')}
                    </Button>
                  </div>
                </Card>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
