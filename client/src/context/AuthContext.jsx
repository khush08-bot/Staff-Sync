import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [employee, setEmployee] = useState(() => {
    const savedEmp = localStorage.getItem('employee');
    return savedEmp ? JSON.parse(savedEmp) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Sync state changes with localStorage and fetch fresh profile
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success) {
            setUser(res.user);
            setEmployee(res.employee);
            localStorage.setItem('user', JSON.stringify(res.user));
            if (res.employee) {
              localStorage.setItem('employee', JSON.stringify(res.employee));
            }
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      setEmployee(res.employee);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      if (res.employee) {
        localStorage.setItem('employee', JSON.stringify(res.employee));
      }
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      setEmployee(res.employee);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      if (res.employee) {
        localStorage.setItem('employee', JSON.stringify(res.employee));
      }
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('employee');
    setToken(null);
    setUser(null);
    setEmployee(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success) {
        setUser(res.user);
        setEmployee(res.employee);
        localStorage.setItem('user', JSON.stringify(res.user));
        if (res.employee) {
          localStorage.setItem('employee', JSON.stringify(res.employee));
        }
      }
    } catch (err) {
      console.warn('Could not refresh profile:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!token && !!user,
        role: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
