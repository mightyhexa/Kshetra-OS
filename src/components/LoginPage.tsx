import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../../shared/types';
import { KshetraMark } from './KshetraMark';
import { 
  ShieldCheck, 
  MapPin, 
  Layers, 
  Lock, 
  ArrowRight, 
  Smartphone,
  Info,
  KeyRound,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onOpenTechDoc: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onOpenTechDoc }) => {
  const { switchRole, requestOtp, verifyOtp, ssoLogin, isLoading } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'persona' | 'aadhaar' | 'official'>('persona');
  const [aadhaarInput, setAadhaarInput] = useState('542188910019');
  const [otpInput, setOtpInput] = useState('123456');
  const [demoOtpHitted, setDemoOtpHitted] = useState<string | null>(null);
  const [badgeId, setBadgeId] = useState('KA-REV-2026-081');
  const [ssoRole, setSsoRole] = useState<'officer' | 'policy_admin'>('officer');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePersonaLogin = async (role: UserRole) => {
    setErrorMessage(null);
    try {
      await switchRole(role);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    }
  };

  const handleRequestOtp = async () => {
    setErrorMessage(null);
    try {
      const res = await requestOtp(aadhaarInput);
      setDemoOtpHitted(res.demoOtp);
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP request failed');
    }
  };

  const handleAadhaarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await verifyOtp(aadhaarInput, otpInput);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed');
    }
  };

  const handleSsoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await ssoLogin(badgeId, ssoRole);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'SSO authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between antialiased">
      {/* Tricolour Hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KshetraMark size={36} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight font-cinzel">
                  KSHETRA OS
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-[#0B3D6E] font-bold">
                  SIH26014
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Integrated GIS Digital Public Infrastructure for Land Governance
              </p>
            </div>
          </div>

          <button
            onClick={onOpenTechDoc}
            className="text-xs font-semibold text-[#0B3D6E] hover:underline px-3 py-1.5 rounded-lg border border-slate-200"
          >
            DILRMP Technical Specs
          </button>
        </div>
      </header>

      {/* Disclaimer Strip */}
      <div className="bg-amber-50 border-y border-amber-200 py-1.5 px-4 text-center text-xs text-amber-900 font-medium">
        Smart India Hackathon 2026 Prototype · Not an official Government of India website · Synthetic Sandbox Dataset (26 Parcels)
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-center">
          {/* Left Column: Context & Architectural Pillars */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-[#0B3D6E]">
                <ShieldCheck className="w-4 h-4 text-[#0B3D6E]" />
                <span>Smart India Hackathon 2026 — Problem Statement SIH26014</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight font-cinzel">
                Unified Cadastral Operating System for Modern Land Governance
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Interlinks <strong>Land Records & Survey</strong>, <strong>Sub-Registrar Conveyances</strong>, <strong>Town Planning GIS</strong>, and <strong>Municipal Fiscal Assessment</strong> into a single interoperable, tamper-evident public stack.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <MapPin className="w-3.5 h-3.5 text-blue-700" />
                  <span>14-Digit ULPIN Engine</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Bhu-Aadhaar spatial resolution with closed GeoJSON polygons.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Layers className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Automated Risk Rules</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Real-time detection of overlaps, stay orders, and 65m waterbody buffers.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Server-Side Role Gating</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Physical serialization stripping of sensitive banking liens for citizens.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>SHA-256 Audit Ledger</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Cryptographically chained append-only ledger tracking all actions.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Authenticated Access Card */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-lg space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Access KSHETRA OS</h2>
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Simulated authentication
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Select an access persona below to generate an authenticated 2-hour JWT session.
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Auth Method Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setLoginMethod('persona')}
                className={`py-1.5 rounded-lg transition-colors ${loginMethod === 'persona' ? 'bg-white text-[#0B3D6E] shadow-2xs font-bold' : 'text-slate-600'}`}
              >
                1-Click Role Login
              </button>
              <button
                onClick={() => setLoginMethod('aadhaar')}
                className={`py-1.5 rounded-lg transition-colors ${loginMethod === 'aadhaar' ? 'bg-white text-[#0B3D6E] shadow-2xs font-bold' : 'text-slate-600'}`}
              >
                Aadhaar OTP
              </button>
              <button
                onClick={() => setLoginMethod('official')}
                className={`py-1.5 rounded-lg transition-colors ${loginMethod === 'official' ? 'bg-white text-[#0B3D6E] shadow-2xs font-bold' : 'text-slate-600'}`}
              >
                Officer SSO
              </button>
            </div>

            {/* Method 1: 1-Click Persona Cards */}
            {loginMethod === 'persona' && (
              <div className="space-y-2.5">
                <button
                  disabled={isLoading}
                  onClick={() => handlePersonaLogin('citizen')}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">Citizen User</span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-slate-100 text-slate-700 font-mono">Rajesh K. Verma</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Public RoR lookup, service applications, transaction status tracking, protected financial privacy.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => handlePersonaLogin('officer')}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">Land Officer (Tahsildar)</span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-blue-100 text-blue-800 font-mono">Anil Kumar Sharma</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Full mortgage charges unlocked, workflow transition actions, dispute docket review.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => handlePersonaLogin('policy_admin')}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">Policy Administrator</span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-purple-100 text-purple-800 font-mono">Dr. Sunita Deshmukh, IAS</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      National NSDI spatial analytics, complete SHA-256 audit ledger verification, cross-state governance.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            )}

            {/* Method 2: Aadhaar OTP */}
            {loginMethod === 'aadhaar' && (
              <form onSubmit={handleAadhaarLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Aadhaar Number (12-Digit)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aadhaarInput}
                      onChange={(e) => setAadhaarInput(e.target.value)}
                      placeholder="12-digit Aadhaar"
                      className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="px-3 py-1.5 bg-[#0B3D6E] text-white rounded-lg text-xs font-semibold hover:bg-blue-900"
                    >
                      Get OTP
                    </button>
                  </div>
                </div>

                {demoOtpHitted && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Demo OTP Generated: <strong className="font-mono">{demoOtpHitted}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpInput(demoOtpHitted)}
                      className="text-emerald-700 hover:underline font-bold"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    maxLength={6}
                    placeholder="123456"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono tracking-widest text-center"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Rate-limited security: 5 attempts per minute.</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#0B3D6E] text-white rounded-xl text-xs font-semibold hover:bg-blue-900 transition-colors shadow-xs"
                >
                  Verify & Sign In (Citizen Session)
                </button>
              </form>
            )}

            {/* Method 3: Officer SSO */}
            {loginMethod === 'official' && (
              <form onSubmit={handleSsoLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Officer Badge ID</label>
                  <input
                    type="text"
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Privilege Level</label>
                  <select
                    value={ssoRole}
                    onChange={(e) => setSsoRole(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="officer">Land Officer (Tahsildar)</option>
                    <option value="policy_admin">Policy Administrator</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#0B3D6E] text-white rounded-xl text-xs font-semibold hover:bg-blue-900 transition-colors shadow-xs"
                >
                  Authenticate via SSO
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="bg-white border-t border-slate-200 py-3 px-4 text-center text-xs text-slate-700 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>KSHETRA OS — Smart India Hackathon 2026 (PS SIH26014) • Land Stack</span>
          <span className="font-mono text-[11px] text-slate-500">
            Open Standards: OGC GeoJSON • EPSG:4326 • SHA-256 Ledger • 26 Parcels
          </span>
        </div>
      </footer>
    </div>
  );
};
