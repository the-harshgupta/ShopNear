import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nexretail_auth_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('nexretail_auth_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Validate existing token with backend on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('nexretail_auth_token');
      if (savedToken) {
        try {
          const res = await api.getCurrentUser();
          if (res && res.user) {
            setUser(res.user);
            localStorage.setItem('nexretail_auth_user', JSON.stringify(res.user));
          }
        } catch (e) {
          // Token invalid or expired — clear stale auth
          localStorage.removeItem('nexretail_auth_token');
          localStorage.removeItem('nexretail_auth_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, selectedRole = null) => {
    const res = await api.login(email, password, selectedRole);
    if (res && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('nexretail_auth_token', res.token);
      localStorage.setItem('nexretail_auth_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res?.error || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('nexretail_auth_token', res.token);
      localStorage.setItem('nexretail_auth_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res?.error || 'Registration failed');
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexretail_auth_token');
    localStorage.removeItem('nexretail_auth_user');
    localStorage.removeItem('nexretail_selected_store');
    localStorage.removeItem('nexretail_products');
    localStorage.removeItem('nexretail_sales');
    localStorage.removeItem('nexretail_stores');
    localStorage.removeItem('nexretail_shopping_list');
    localStorage.removeItem('nexretail_cart');
  }, []);

  const getDashboardPath = (role) => {
    switch (role) {
      case 'CUSTOMER':
        return '/customer/dashboard';
      case 'SHOPKEEPER':
        return '/shopkeeper/dashboard';
      case 'SUPERMARKET_MANAGER':
      case 'STORE_MANAGER':
        return '/manager/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role: user?.role || null,
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      register,
      logout,
      getDashboardPath
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
