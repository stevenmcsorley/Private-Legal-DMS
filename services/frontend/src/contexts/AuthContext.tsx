import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  display_name: string;
  roles: string[];
  firm_id: string;
  attributes: {
    firm_id: string;
    clearance_level?: number;
    is_partner?: boolean;
    teams?: string[];
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Backend returns { user: { ... } }
        const apiUser = data?.user || data;
        // Normalize to our User shape
        const normalized = {
          id: apiUser.id || apiUser.sub,
          email: apiUser.email,
          display_name: apiUser.display_name || apiUser.name || apiUser.username || apiUser.preferred_username,
          roles: apiUser.roles || [],
          firm_id: apiUser.firmId || apiUser.firm_id,
          attributes: apiUser.attributes || {},
        } as User;
        setUser(normalized);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    window.location.href = '/api/auth/login?redirect=' + encodeURIComponent(window.location.href);
  };

  const logout = async () => {
    try {
      // Prefer a full redirect so the server can clear session/cookies and then bounce back
      const redirect = encodeURIComponent(window.location.origin);
      window.location.href = `/api/auth/logout?redirect=${redirect}`;
    } catch (error) {
      console.error('Logout redirect failed:', error);
      setUser(null);
      window.location.href = '/';
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
