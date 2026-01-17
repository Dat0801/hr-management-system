import { useState, useCallback, useEffect } from 'react';
import { authService } from '@/api/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      const userData = authService.getUserData();
      const employeeData = authService.getEmployeeData();
      setUser(userData);
      setEmployee(employeeData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      const { user: userData, employee: employeeData, token } = response.data;

      authService.setToken(token);
      authService.setUserData(userData);
      if (employeeData) {
        authService.setEmployeeData(employeeData);
      }

      setUser(userData);
      setEmployee(employeeData);
      setIsAuthenticated(true);

      return { success: true, user: userData, employee: employeeData };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setEmployee(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setEmployee(null);
      setIsAuthenticated(false);
      return { success: true };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      setLoading(true);
      const response = await authService.register(name, email, password);
      const { user: userData, token } = response.data;

      authService.setToken(token);
      authService.setUserData(userData);

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await authService.getProfile();
      const userData = response.data.data;
      setUser(userData);
      authService.setUserData(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      return null;
    }
  }, []);

  return {
    user,
    employee,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    refreshProfile,
  };
};
