import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  X, 
  User, 
  ShieldCheck, 
  Key, 
  Lock, 
  Check, 
  Copy, 
  Smartphone, 
  Mail, 
  MapPin, 
  Calendar, 
  LogOut,
  Save,
  CheckCircle2
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin
}) => {
  const { currentUser, currentRole, switchRole, updateProfile, sessionToken, logout } = useAuth();

  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [jurisdictionDistrict, setJurisdictionDistrict] = useState(currentUser.jurisdictionDistrict);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(currentUser.twoFactorEnabled);
  const [copiedToken, setCopiedToken] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      fullName,
      email,
      phone,
      jurisdictionDistrict,
      twoFactorEnabled
    });
    setSaveSuccessNotice('User profile credentials updated successfully.');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(sessionToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleRoleSelect = async (role: UserRole) => {
    await switchRole(role);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#0B3D6E] text-white flex items-center justify-center font-bold text-sm">
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">User Profile & Access Management</h2>
              <p className="text-xs text-slate-500">Government Portal Single Sign-On (SSO)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saveSuccessNotice && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* Role Selector Cards */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-600 block">
            Select Active Profile Role (Demo Elevation):
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleRoleSelect('citizen')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                currentRole === 'citizen'
                  ? 'bg-blue-50 border-[#0B3D6E] text-[#0B3D6E] ring-1 ring-[#0B3D6E] font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold">Citizen</div>
              <div className="text-[10px] text-slate-500 font-normal">Public Registry</div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('officer')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                currentRole === 'officer'
                  ? 'bg-blue-50 border-[#0B3D6E] text-[#0B3D6E] ring-1 ring-[#0B3D6E] font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold">Land Officer</div>
              <div className="text-[10px] text-slate-500 font-normal">Tahsildar / RoR</div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('policy_admin')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                currentRole === 'policy_admin'
                  ? 'bg-blue-50 border-[#0B3D6E] text-[#0B3D6E] ring-1 ring-[#0B3D6E] font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold">Policy Admin</div>
              <div className="text-[10px] text-slate-500 font-normal">MoRD / NSDI</div>
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Government Aadhaar ID</label>
              <input
                type="text"
                value={currentUser.aadhaarMasked}
                disabled
                className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono cursor-not-allowed"
                title="Aadhaar is locked to eKYC token"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Mobile Phone (2FA)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Designated District</label>
              <input
                type="text"
                value={jurisdictionDistrict}
                onChange={(e) => setJurisdictionDistrict(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Designated State</label>
              <input
                type="text"
                value={currentUser.jurisdictionState}
                disabled
                className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Security & 2FA Toggle */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Two-Factor Authentication (2FA)</span>
                <span className="text-[11px] text-slate-500">Require OTP on sign-in and deed mutations</span>
              </div>
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                className="w-4 h-4 text-[#0B3D6E] rounded"
              />
            </div>
          </div>

          {/* Session Token & API Auth Header */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[10px]">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-sans font-semibold text-slate-700">Active Bearer Token:</span>
              <button
                type="button"
                onClick={handleCopyToken}
                className="text-[#0B3D6E] hover:underline font-sans font-semibold flex items-center gap-1"
              >
                {copiedToken ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
              </button>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200 text-slate-700 truncate">
              {sessionToken}
            </div>
          </div>

          {/* Save & Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
                onOpenLogin();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-900 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Account / Sign Out</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B3D6E] hover:bg-[#082a4d] text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
