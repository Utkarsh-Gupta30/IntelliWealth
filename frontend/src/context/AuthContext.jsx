import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('intelliwealth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('intelliwealth_token');
    if (token) {
      apiClient.get('/auth/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('intelliwealth_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('intelliwealth_token', access_token);
    localStorage.setItem('intelliwealth_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (payload) => {
    const response = await apiClient.post('/auth/register', payload);
    const { access_token, user: userData } = response.data;
    localStorage.setItem('intelliwealth_token', access_token);
    localStorage.setItem('intelliwealth_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const updateProfile = async (payload) => {
    const response = await apiClient.put('/auth/profile', payload);
    setUser(response.data);
    localStorage.setItem('intelliwealth_user', JSON.stringify(response.data));
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('intelliwealth_token');
    localStorage.removeItem('intelliwealth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
