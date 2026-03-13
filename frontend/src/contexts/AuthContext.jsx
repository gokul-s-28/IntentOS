import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Use a relative path so the Vite dev proxy routes to the correct backend port (5001)
const API = '/api/users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('intent_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  /* Restore user from localStorage on mount */
  useEffect(() => {
    const stored = localStorage.getItem('intent_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  /* Shared axios instance with token header */
  const authAxios = useCallback(() =>
    axios.create({
      baseURL: API,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
    [token]
  );

  const _persist = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('intent_token', jwt);
    localStorage.setItem('intent_user', JSON.stringify(userData));
  };

  /* ── Sign In ── */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API}/login`, { email, password });
      if (data.success) {
        _persist(data.data, data.token);
        return { success: true };
      }
      throw new Error(data.message || 'Login failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  /* ── Register ── */
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API}/register`, { name, email, password });
      if (data.success) {
        _persist(data.data, data.token);
        return { success: true };
      }
      throw new Error(data.message || 'Registration failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  /* ── Sign Out ── */
  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('intent_token');
    localStorage.removeItem('intent_user');
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, clearError, authAxios }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
