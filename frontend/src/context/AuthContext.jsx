import { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../store/auth';

/**
 * AuthContext - provides authentication state throughout the app
 * This wraps the Zustand store to provide React Context compatibility
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuth();

  // Fetch current user on app load if token exists
  useEffect(() => {
    if (auth.token && !auth.user) {
      auth.fetchMe();
    }
  }, [auth.token]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 * Returns current auth state and methods
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
