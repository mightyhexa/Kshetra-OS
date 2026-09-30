import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { auditLedger } from '../services/auditLedger';

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  isAuthenticated: boolean;
  switchRole: (newRole: UserRole) => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  login: (role: UserRole, email?: string) => Promise<void>;
  logout: () => void;
  sessionToken: string;
}

const PRESET_USERS: Record<UserRole, UserProfile> = {
  citizen: {
    id: 'USR-CTZ-0891',
    fullName: 'Rajesh K. Verma',
    email: 'rajesh.verma@example.com',
    phone: '+91 98450 12345',
    role: 'citizen',
    aadhaarMasked: 'XXXX-XXXX-9182',
    jurisdictionState: 'Karnataka',
    jurisdictionDistrict: 'Bengaluru Urban',
    createdAt: '2023-01-15T09:00:00.000Z',
    lastLogin: new Date().toISOString(),
    twoFactorEnabled: true,
    avatarSeed: 'rajesh'
  },
  officer: {
    id: 'OFF-REV-0412',
    fullName: 'Anil Kumar Sharma',
    email: 'anil.sharma@landrecords.gov.in',
    phone: '+91 94480 88219',
    role: 'officer',
    aadhaarMasked: 'XXXX-XXXX-4412',
    designation: 'Tahsildar & Revenue Divisional Officer',
    department: 'Department of Land Records & Survey',
    officerBadgeId: 'KA-REV-OFF-2021-09',
    jurisdictionState: 'Karnataka',
    jurisdictionDistrict: 'Bengaluru Urban',
    createdAt: '2021-04-10T10:00:00.000Z',
    lastLogin: new Date().toISOString(),
    twoFactorEnabled: true,
    avatarSeed: 'anil'
  },
  policy_admin: {
    id: 'ADM-POL-0001',
    fullName: 'Dr. Sunita Deshmukh, IAS',
    email: 'sunita.deshmukh@dolr.gov.in',
    phone: '+91 99801 77312',
    role: 'policy_admin',
    aadhaarMasked: 'XXXX-XXXX-0019',
    designation: 'Joint Secretary (Land Governance DPI)',
    department: 'Ministry of Rural Development / Dept of Land Resources',
    officerBadgeId: 'GOI-IAS-2009-LKO',
    jurisdictionState: 'National / All States',
    jurisdictionDistrict: 'All Districts (Central Repository)',
    createdAt: '2020-08-01T08:00:00.000Z',
    lastLogin: new Date().toISOString(),
    twoFactorEnabled: true,
    avatarSeed: 'sunita'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [currentUser, setCurrentUser] = useState<UserProfile>(PRESET_USERS.citizen);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.kshetra.demo.session.0891'
  );

  const switchRole = async (newRole: UserRole) => {
    const newUser = { ...PRESET_USERS[newRole], lastLogin: new Date().toISOString() };
    setCurrentRole(newRole);
    setCurrentUser(newUser);
    const newToken = `eyJhbGciOiJIUzI1NiJ9.kshetra.${newRole}.${Date.now().toString().slice(-6)}`;
    setSessionToken(newToken);

    // Append to immutable audit ledger
    await auditLedger.appendEntry({
      action: 'ROLE_SWITCH',
      actorRole: newRole,
      actorName: newUser.fullName,
      actorId: newUser.id,
      details: `Active session elevated/switched to ${newRole.toUpperCase()} role [${newUser.fullName}]`,
      metadataPayload: { previousRole: currentRole, newRole, sessionTokenPrefix: newToken.slice(0, 15) }
    });
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    const updatedUser = { ...currentUser, ...updated };
    setCurrentUser(updatedUser);

    await auditLedger.appendEntry({
      action: 'PROFILE_UPDATE',
      actorRole: currentRole,
      actorName: updatedUser.fullName,
      actorId: updatedUser.id,
      details: `User profile fields updated for ${updatedUser.fullName}`,
      metadataPayload: { updatedFields: Object.keys(updated) }
    });
  };

  const login = async (role: UserRole, email?: string) => {
    const base = PRESET_USERS[role];
    const user: UserProfile = {
      ...base,
      email: email || base.email,
      lastLogin: new Date().toISOString()
    };
    setCurrentRole(role);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setSessionToken(`eyJhbGciOiJIUzI1NiJ9.landstack.${role}.${Date.now().toString().slice(-6)}`);

    await auditLedger.appendEntry({
      action: 'ROLE_SWITCH',
      actorRole: role,
      actorName: user.fullName,
      actorId: user.id,
      details: `User authenticated via Portal SSO as ${role.toUpperCase()}`,
      metadataPayload: { loginMethod: 'DigiLocker-eSign-Mock', role }
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        switchRole,
        updateProfile,
        login,
        logout,
        sessionToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
