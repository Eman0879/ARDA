// ============================================
// FILE: lib/hooks/useAuth.ts
// ============================================

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@/lib/constants/roles';
import { ROLE_DEFAULT_ROUTES } from '@/lib/constants/routes';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  role: UserRole;
  displayName: string;
  email?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        
        // Redirect to role-specific dashboard
        const defaultRoute = ROLE_DEFAULT_ROUTES[data.user.role as UserRole];
        router.push(defaultRoute);
        
        return { success: true };
      }

      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: 'An error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
