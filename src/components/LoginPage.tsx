import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { IndianEmblemLogo } from './IndianEmblemLogo';
import { 
  ShieldCheck, 
  MapPin, 
  Layers, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Key, 
  Building2, 
  Smartphone,
  Globe,
  ExternalLink,
  Info
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onOpenTechDoc: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onOpenTechDoc }) => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [loginMethod, setLoginMethod] = useState<'persona' | 'aadhaar' | 'official'>('persona');
  const [aadhaarInput, setAadhaarInput] = useState('5421 8891 0019');
  const [otpInput, setOtpInput] = useState('123456');
  const [officialEmail, setOfficialEmail] = useState('anil.sharma@landrecords.gov.in');
  const [officialPassword, setOfficialPassword] = useState('••••••••••••');
  const [otpSent, setOtpSent] = useState(false);
  const [currentLang, setCurrentLang] = useState<'EN' | 'HI' | 'KA'>('EN');

  const handlePersonaLogin = async (role: UserRole) => {
    await login(role);
    onLoginSuccess();
  };

  const handleAadhaarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(selectedRole, `citizen.${aadhaarInput.slice(-4)}@ekyc.gov.in`);
    onLoginSuccess();
  };

  const handleOfficialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login('officer', officialEmail);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-between antialiased selection:bg-blue-100 selection:text-[#0B3D6E]">
      {/* Official Government Tri-Color Banner Strip */}
      <div className="h-1.5 w-full bg-linear-to-r from-orange-500 via-white to-emerald-600" />

      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IndianEmblemLogo size="md" variant="navy" showChakraSpin={true} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight font-cinzel">
                  KSHETRA OS
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-[#0B3D6E] font-rajdhani font-bold border border-blue-200">
                  SIH26014
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                  Sample Data Authorized
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-rajdhani font-medium">
                Integrated GIS-based Digital Public Infrastructure for Land Governance • MoRD / DoLR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Pill */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1" />
              <button
                onClick={() => setCurrentLang('EN')}
                className={`px-2 py-0.5 rounded font-medium ${currentLang === 'EN' ? 'bg-white text-[#0B3D6E] shadow-xs' : 'text-slate-600'}`}
              >
                English
              </button>
              <button
                onClick={() => setCurrentLang('HI')}
                className={`px-2 py-0.5 rounded font-medium ${currentLang === 'HI' ? 'bg-white text-[#0B3D6E] shadow-xs' : 'text-slate-600'}`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setCurrentLang('KA')}
                className={`px-2 py-0.5 rounded font-medium ${currentLang === 'KA' ? 'bg-white text-[#0B3D6E] shadow-xs' : 'text-slate-600'}`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            <button
              onClick={onOpenTechDoc}
              className="text-xs text-slate-600 hover:text-[#0B3D6E] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors font-medium flex items-center gap-1"
            >
              <span>Standard Technical Spec</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Workspace Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Portal Overview & DPI Credentials */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-[#0B3D6E]">
                <ShieldCheck className="w-4 h-4 text-[#0B3D6E]" />
                <span>Smart India Hackathon 2026 — Problem Statement SIH26014</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight font-cinzel">
                Unified Cadastral Operating System for Modern Land Governance
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connects <strong>Land Records & Survey</strong>, <strong>Sub-Registrar Conveyances</strong>, <strong>Town Planning GIS</strong>, and <strong>Municipal Fiscal Assessment</strong> into a single interoperable, tamper-evident public stack.
              </p>
            </div>

            {/* Core DPI Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0B3D6E]" />
                  <span>ULPIN Cadastre Engine</span>
                </div>
                <p className="text-slate-700 text-[11px] font-medium">
                  14-digit Bhu-Aadhaar spatial resolution with closed GeoJSON boundary polygons in WGS 84.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#0B3D6E]" />
                  <span>3-Tier Data Model</span>
                </div>
                <p className="text-slate-700 text-[11px] font-medium">
                  Base Layer (spatial), Essential (RoR & zoning), and Additional (utilities & property tax).
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#0B3D6E]" />
                  <span>Zero-Leakage RBAC</span>
                </div>
                <p className="text-slate-700 text-[11px] font-medium">
                  Server-side role gating removes sensitive banking charges from public citizen responses.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0B3D6E]" />
                  <span>SHA-256 Audit Ledger</span>
                </div>
                <p className="text-slate-700 text-[11px] font-medium">
                  Cryptographically chained append-only ledger tracking all queries, views, and state changes.
                </p>
              </div>
            </div>

            {/* Pilot Status Bar */}
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="font-bold text-slate-900">Pilot Active:</span>
                <span className="text-slate-800">26 Parcels across BLR, HYD, PUN, LKO, AHM</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 shadow-2xs">
                v2.4-SIH
              </span>
            </div>
          </div>

          {/* Right Column: Portal Login Authentication Box */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5">
            <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Select Identity to Access KSHETRA OS
                </h2>
                <p className="text-xs text-slate-500">
                  National e-Pramaan Single Sign-On Simulation
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-bold">
                Demo Auth
              </span>
            </div>

            {/* Login Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLoginMethod('persona')}
                className={`py-1.5 rounded-md transition-all text-center ${
                  loginMethod === 'persona' ? 'bg-white text-[#0B3D6E] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1-Click Role Login
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('aadhaar')}
                className={`py-1.5 rounded-md transition-all text-center ${
                  loginMethod === 'aadhaar' ? 'bg-white text-[#0B3D6E] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Aadhaar eKYC OTP
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('official')}
                className={`py-1.5 rounded-md transition-all text-center ${
                  loginMethod === 'official' ? 'bg-white text-[#0B3D6E] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Officer Portal SSO
              </button>
            </div>

            {/* TAB 1: 1-Click Fast Role Login (Evaluator Friendly) */}
            {loginMethod === 'persona' && (
              <div className="space-y-3 pt-1">
                <span className="text-xs font-semibold text-slate-700 block">
                  Click any role card below to test the corresponding permission level:
                </span>

                {/* Citizen Card */}
                <div
                  onClick={() => handlePersonaLogin('citizen')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0B3D6E] bg-slate-50 hover:bg-blue-50/40 cursor-pointer transition-all flex items-center justify-between group shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-[#0B3D6E]">
                        Citizen User
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono">
                        Rajesh K. Verma
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Public RoR lookup, service applications, transaction status tracker, protected financial privacy.
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 group-hover:bg-[#0B3D6E] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Land Officer Card */}
                <div
                  onClick={() => handlePersonaLogin('officer')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0B3D6E] bg-slate-50 hover:bg-blue-50/40 cursor-pointer transition-all flex items-center justify-between group shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-[#0B3D6E]">
                        Land Officer (Tahsildar)
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-[#0B3D6E] font-mono">
                        Anil Kumar Sharma
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Full mortgage charges unlocked, workflow transition actions, dispute docket review.
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 group-hover:bg-[#0B3D6E] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Policy Admin Card */}
                <div
                  onClick={() => handlePersonaLogin('policy_admin')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0B3D6E] bg-slate-50 hover:bg-blue-50/40 cursor-pointer transition-all flex items-center justify-between group shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-[#0B3D6E]">
                        Policy Administrator
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-mono">
                        Dr. Sunita Deshmukh, IAS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      National NSDI spatial analytics, complete SHA-256 audit ledger verification, cross-state governance.
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 group-hover:bg-[#0B3D6E] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Aadhaar eKYC OTP Authentication */}
            {loginMethod === 'aadhaar' && (
              <form onSubmit={handleAadhaarLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Select Persona to Bind with Aadhaar:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('citizen')}
                      className={`p-2 rounded-lg border text-center font-medium ${
                        selectedRole === 'citizen' ? 'bg-blue-50 border-[#0B3D6E] text-[#0B3D6E] font-bold' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      Citizen Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('officer')}
                      className={`p-2 rounded-lg border text-center font-medium ${
                        selectedRole === 'officer' ? 'bg-blue-50 border-[#0B3D6E] text-[#0B3D6E] font-bold' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      Officer Profile
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    12-Digit Aadhaar / Virtual ID (VID)
                  </label>
                  <input
                    type="text"
                    value={aadhaarInput}
                    onChange={(e) => setAadhaarInput(e.target.value)}
                    required
                    placeholder="XXXX XXXX XXXX"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-1 focus:ring-[#0B3D6E]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Simulated 6-Digit OTP (Mock eKYC)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="123456"
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-1 focus:ring-[#0B3D6E]"
                    />
                    <button
                      type="button"
                      onClick={() => setOtpSent(true)}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-200 whitespace-nowrap"
                    >
                      {otpSent ? 'Resent (123456)' : 'Get OTP'}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Pre-filled with demo OTP 123456 for instant testing.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0B3D6E] hover:bg-[#082a4d] text-white font-semibold rounded-lg text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Aadhaar eKYC & Launch KSHETRA OS</span>
                </button>
              </form>
            )}

            {/* TAB 3: Officer Departmental SSO */}
            {loginMethod === 'official' && (
              <form onSubmit={handleOfficialLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Official Revenue / DoLR Email
                  </label>
                  <input
                    type="email"
                    value={officialEmail}
                    onChange={(e) => setOfficialEmail(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-[#0B3D6E]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Portal Security Token / Password
                  </label>
                  <input
                    type="password"
                    value={officialPassword}
                    onChange={(e) => setOfficialPassword(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-[#0B3D6E]"
                  />
                </div>

                <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200 text-[11px] text-[#0B3D6E]">
                  Logs into Karnataka Bhoomi & NSDI Integrated Officer Node as Tahsildar Anil Kumar Sharma.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0B3D6E] hover:bg-[#082a4d] text-white font-semibold rounded-lg text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Key className="w-4 h-4" />
                  <span>Authenticate Officer Credentials & Launch</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="bg-white border-t border-slate-200 py-3 px-4 text-center text-xs text-slate-700 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-slate-700 font-medium">
            KSHETRA OS — Designed for Smart India Hackathon 2026 (PS26014) • Ministry of Rural Development
          </span>
          <span className="font-mono text-[11px] text-slate-700 font-semibold">
            Open Standards: OGC GeoJSON • EPSG:4326 • SHA-256 Ledger
          </span>
        </div>
      </footer>
    </div>
  );
};
