import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { API_BASE_URL, setAuthToken, setUnauthorizedHandler } from '../services/api';
import { authService } from '../services/domainServices';
import { mapMatriculaToUi } from '../services/mappers';
import { clearSession, loadSession, saveSession } from '../services/session';
import type { AuthResponse } from '../types/ApiTypes';
import type { UserProfile } from '../types/ui';
import { getApiErrorMessage } from '../utils/errors';

interface AuthContextData {
  authenticated: boolean;
  bootstrapped: boolean;
  loading: boolean;
  error: string | null;
  user: UserProfile | null;
  login: (email: string, senha: string) => Promise<boolean>;
  register: (nome: string, email: string, senha: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function userFromAuth(response: AuthResponse): UserProfile {
  return {
    nome: `${response.usuario.primeiroNome} ${response.usuario.ultimoNome}`,
    email: response.usuario.emailInstitucional,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  const endSession = useCallback(async (message?: string) => {
    setAuthToken(null);
    setAuthenticated(false);
    setUser(null);
    setError(message ?? null);
    await clearSession();
  }, []);

  const loadProfile = useCallback(async (base: UserProfile): Promise<UserProfile> => {
    try {
      return mapMatriculaToUi(await authService.matricula(), base);
    } catch (err) {
      console.warn('Não foi possível carregar a matrícula:', err);
      return base;
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const stored = await loadSession();
      if (stored && active) {
        setAuthToken(stored.token);
        try {
          const profile = mapMatriculaToUi(await authService.matricula(), stored.user);
          if (!active) return;
          setUser(profile);
          setAuthenticated(true);
          await saveSession({ token: stored.token, user: profile });
        } catch (err) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status === 401 || status === 403) {
            await endSession();
          } else if (active) {
            setUser(stored.user);
            setAuthenticated(true);
          }
        }
      }
      if (active) setBootstrapped(true);
    })();
    return () => {
      active = false;
    };
  }, [endSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void endSession('Sua sessão expirou. Entre novamente.');
    });
    return () => setUnauthorizedHandler(null);
  }, [endSession]);

  const startSession = useCallback(
    async (response: AuthResponse) => {
      setAuthToken(response.token);
      const profile = await loadProfile(userFromAuth(response));
      setUser(profile);
      setAuthenticated(true);
      await saveSession({ token: response.token, user: profile });
    },
    [loadProfile],
  );

  const login = useCallback(
    async (email: string, senha: string) => {
      setLoading(true);
      setError(null);
      try {
        await startSession(await authService.login(email, senha));
        return true;
      } catch (err) {
        setError(getApiErrorMessage(err, 'E-mail ou senha inválidos.', API_BASE_URL));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [startSession],
  );

  const register = useCallback(
    async (nome: string, email: string, senha: string) => {
      setLoading(true);
      setError(null);
      try {
        const parts = nome.trim().split(' ');
        const primeiroNome = parts[0] || nome;
        const ultimoNome = parts.slice(1).join(' ') || 'Servidor';
        await startSession(await authService.register(primeiroNome, ultimoNome, email, senha));
        return true;
      } catch (err) {
        setError(getApiErrorMessage(err, 'Erro ao realizar cadastro.', API_BASE_URL));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [startSession],
  );

  const logout = useCallback(() => endSession(), [endSession]);
  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      authenticated,
      bootstrapped,
      loading,
      error,
      user,
      login,
      register,
      logout,
      clearError,
    }),
    [authenticated, bootstrapped, loading, error, user, login, register, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
