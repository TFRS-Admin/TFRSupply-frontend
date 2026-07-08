import React, { createContext, useContext, type ReactNode } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthErrorState {
  type: string;
  message: string;
}

export interface RegisterResult {
  requiresVerification: boolean;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: AuthErrorState | null;
  appPublicSettings: unknown;
  authChecked: boolean;
  logout: (shouldRedirect?: boolean) => void;
  navigateToLogin: () => void;
  checkUserAuth: () => Promise<void>;
  checkAppState: () => Promise<void>;
  // Stubbed auth actions — simulate success until Shopify Auth replaces them.
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  register: (email: string, password: string) => Promise<RegisterResult>;
  verifyOtp: (email: string, otpCode: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
}

// Mock identity used until real Shopify-backed auth replaces this stub.
// Shopify owns auth/checkout/orders per architecture; this context only
// satisfies the existing React consumer shape (App.jsx, ProtectedRoute.jsx).
const MOCK_USER: AuthUser = {
  id: 'mock-user',
  email: 'demo@tfrsupply.com',
  role: 'admin',
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value: AuthContextValue = {
    user: MOCK_USER,
    isAuthenticated: true,
    isLoadingAuth: false,
    isLoadingPublicSettings: false,
    authError: null,
    appPublicSettings: null,
    authChecked: true,
    logout: () => {},
    navigateToLogin: () => {},
    checkUserAuth: async () => {},
    checkAppState: async () => {},
    login: async () => {},
    loginWithGoogle: () => {},
    register: async () => ({ requiresVerification: true }),
    verifyOtp: async () => {},
    resendOtp: async () => {},
    requestPasswordReset: async () => {},
    resetPassword: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
