import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPersona, UserRole } from '../../shared/types';
import { PERSONAS } from '../../shared/roles';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
  currentUser: UserPersona;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string;
  switchRole: (role: UserRole) => Promise<void>;
  updateProfile: (updates: Partial<UserPersona>) => Promise<void>;
  requestOtp: (aadhaarNumber: string) => Promise<{ demoOtp: string; message: string }>;
  verifyOtp: (aadhaarNumber: string, otp: string) => Promise<void>;
  ssoLogin: (badgeId: string, role?: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserPersona>(PERSONAS.citizen);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate existing JWT session on boot
  useEffect(() => {
    async function verifySession() {
      try {
        const token = apiClient.getToken();
        if (token) {
          const user = await apiClient.getCurrentUser();
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
    verifySession();
  }, []);

  const switchRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const { user } = await apiClient.login(role);
      setCurrentUser(user);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const requestOtp = async (aadhaarNumber: string) => {
    return apiClient.requestOtp(aadhaarNumber);
  };

  const verifyOtp = async (aadhaarNumber: string, otp: string) => {
    setIsLoading(true);
    try {
      const { user } = await apiClient.verifyOtp(aadhaarNumber, otp);
      setCurrentUser(user);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const ssoLogin = async (badgeId: string, role: UserRole = 'officer') => {
    setIsLoading(true);
    try {
      const { user } = await apiClient.ssoLogin(badgeId, role);
      setCurrentUser(user);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserPersona>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  const logout = () => {
    apiClient.logout();
    setIsAuthenticated(false);
    setCurrentUser(PERSONAS.citizen);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        isAuthenticated,
        isLoading,
        sessionToken: apiClient.getToken() || '',
        switchRole,
        updateProfile,
        requestOtp,
        verifyOtp,
        ssoLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
