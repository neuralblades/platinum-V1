'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  LoginCredentials,
  RegisterData,
  User
} from '@/services/userService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    const storedToken = localStorage.getItem('token');

    if (currentUser) {
      setUser(currentUser);
    }

    if (storedToken) {
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(credentials);
      if (response.success) {
        setUser(response.user);
        if (response.token) {
          setToken(response.token);
        }
        return;
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerUser(data);
      if (response.success) {
        setUser(response.user);
        if (response.token) {
          setToken(response.token);
        }
        return;
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
    router.push('/');
  };

  const clearError = () => {
    setError(null);
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  // Check if user is authenticated
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAdmin,
        isAuthenticated,
        token,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
