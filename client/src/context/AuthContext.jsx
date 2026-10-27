import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest, getToken, setToken } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    apiRequest('/auth/me')
      .then((data) => {
        if (!cancelled) {
          setUser(data.user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleExpired() {
      setUser(null);
    }

    window.addEventListener('auth:expired', handleExpired);

    return () => {
      window.removeEventListener('auth:expired', handleExpired);
    };
  }, []);

  async function login(credentials) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
      auth: false
    });

    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(details) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: details,
      auth: false
    });

    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
