import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';

const AuthContext = createContext(undefined);
const TOKEN_STORAGE_KEY = 'uniconnect_auth_token';
const USER_STORAGE_KEY = 'uniconnect_auth_user';

function readStoredUser() {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_STORAGE_KEY) || ''
  );
  const [user, setUser] = useState(() => readStoredUser());
  const [isInitializing, setIsInitializing] = useState(
    () => Boolean(localStorage.getItem(TOKEN_STORAGE_KEY))
  );

  const applySession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const clearSession = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  useEffect(() => {
    if (!token) {
      setIsInitializing(false);
      return;
    }

    let isMounted = true;

    apiRequest('/auth/me', {
      method: 'GET',
      token
    })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        applySession(token, response.user);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        clearSession();
      })
      .finally(() => {
        if (isMounted) {
          setIsInitializing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      role: user?.role || null,
      isAuthenticated: Boolean(token && user),
      isInitializing,
      async login(credentials) {
        const response = await apiRequest('/auth/login', {
          method: 'POST',
          body: credentials
        });

        applySession(response.token, response.user);
        return response;
      },
      async register(payload) {
        const response = await apiRequest('/auth/register', {
          method: 'POST',
          body: payload
        });

        applySession(response.token, response.user);
        return response;
      },
      logout() {
        clearSession();
      }
    }),
    [isInitializing, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
