import React, { createContext, useContext } from 'react';

interface AuthContextValue {
  user: null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  authError: null;
  authChecked: boolean;
  appPublicSettings: null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, isAuthenticated: false, isLoadingAuth: false,
  authError: null, authChecked: true, appPublicSettings: null,
  logout: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthContext.Provider value={{ user: null, isAuthenticated: false, isLoadingAuth: false, authError: null, authChecked: true, appPublicSettings: null, logout: () => {} }}>
    {children}
  </AuthContext.Provider>
);

export const useAuth = () => useContext(AuthContext);
