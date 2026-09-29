import React from 'react';

import { AuthProvider, useAuth } from './AuthContext';
import { DataProvider, useData } from './DataContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

export function useApp() {
  const auth = useAuth();
  const data = useData();
  return {
    ...data,
    ...auth,
    loading: auth.loading || data.loading,
    error: auth.error ?? data.error,
    clearError: () => {
      auth.clearError();
      data.clearError();
    },
  };
}
