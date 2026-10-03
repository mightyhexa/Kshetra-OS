import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../../shared/types';
import { KshetraMark } from './KshetraMark';
import { X, Lock, ShieldCheck, User, CheckCircle2, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { switchRole, currentRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);

  if (!isOpen) return null;

  const handleQuickLogin = async (role: UserRole) => {
    await switchRole(role);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await switchRole(selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <KshetraMark size={32} />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-900">National Land Portal SSO</h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-[#0B3D6E] border border-blue-200 font-semibold">
                  Simulated
                </span>
              </div>
              <p className="text-xs text-slate-500">Ministry of Rural Development • Simulated Auth</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice on Honest Prototype Auth */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-slate-700">
          <strong>SIH26014 Evaluation Mode:</strong> Select any identity below to instantly sign in with pre-configured role permissions and credentials.
        </div>

        {/* Quick Role Select Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-700 block">Instant Role Login:</span>
          
          <button
            type="button"
            onClick={() => handleQuickLogin('citizen')}
            className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#0B3D6E] bg-slate-50 hover:bg-white text-left transition-all flex items-center justify-between group"
          >
            <div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-[#0B3D6E]">
                Citizen — Rajesh K. Verma
              </div>
              <div className="text-[11px] text-slate-500">
                Public RoR search, service request tracking, masked banking charges
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0B3D6E]" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('officer')}
            className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#0B3D6E] bg-slate-50 hover:bg-white text-left transition-all flex items-center justify-between group"
          >
            <div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-[#0B3D6E]">
                Land Officer (Tahsildar) — Anil Kumar Sharma
              </div>
              <div className="text-[11px] text-slate-500">
                Full mortgage charges unlocked, workflow transition actions, dispute docket review
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0B3D6E]" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('policy_admin')}
            className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#0B3D6E] bg-slate-50 hover:bg-white text-left transition-all flex items-center justify-between group"
          >
            <div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-[#0B3D6E]">
                Policy Administrator — Dr. Sunita Deshmukh, IAS
              </div>
              <div className="text-[11px] text-slate-500">
                National NSDI spatial analytics, complete SHA-256 audit ledger inspection
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0B3D6E]" />
          </button>
        </div>

        {/* Aadhaar eKYC Simulation */}
        <form onSubmit={handleSubmit} className="pt-2 border-t border-slate-200 space-y-3 text-xs">
          <span className="font-semibold text-slate-700 block">Or Sign In with Simulated Aadhaar OTP:</span>
          <div>
            <input
              type="text"
              placeholder="Enter Aadhaar Number (e.g. 5421 8891 0019)"
              defaultValue="5421 8891 0019"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="OTP (123456)"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setOtpSent(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs whitespace-nowrap"
            >
              {otpSent ? 'OTP Resent' : 'Get OTP'}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#0B3D6E] hover:bg-[#082a4d] text-white font-semibold rounded-lg shadow-sm text-xs transition-colors"
          >
            Verify eKYC & Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};
