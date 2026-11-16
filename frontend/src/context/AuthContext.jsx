import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('tomat_token') || localStorage.getItem('tomat_token') || null;
  });

  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('tomat_user') || localStorage.getItem('tomat_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { access_token, user: userData } = response.data;
    // Use sessionStorage so each browser tab can have independent roles (Admin vs Customer)
    sessionStorage.setItem('tomat_token', access_token);
    sessionStorage.setItem('tomat_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/api/auth/register', { name, email, password });
    const { access_token, user: userData } = response.data;
    sessionStorage.setItem('tomat_token', access_token);
    sessionStorage.setItem('tomat_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    sessionStorage.removeItem('tomat_token');
    sessionStorage.removeItem('tomat_user');
    localStorage.removeItem('tomat_token');
    localStorage.removeItem('tomat_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
