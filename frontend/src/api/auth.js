import api from '../lib/api';

/**
 * Authentication API service
 * Handles all auth-related API calls
 */

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Response with user data and token
 */
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    return {
      success: true,
      data: response.data,
      message: 'Login successful'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed',
      error
    };
  }
};

/**
 * Register new user
 * @param {object} payload - User registration data
 * @returns {Promise} Response with user data and token
 */
export const registerUser = async (payload) => {
  try {
    const response = await api.post('/register', payload);
    return {
      success: true,
      data: response.data,
      message: 'Registration successful'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed',
      error
    };
  }
};

/**
 * Get current logged-in user
 * @returns {Promise} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/me');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user',
      error
    };
  }
};

/**
 * Logout user
 * @returns {Promise} Logout response
 */
export const logoutUser = async () => {
  try {
    await api.post('/logout');
    return {
      success: true,
      message: 'Logout successful'
    };
  } catch (error) {
    // Still clear local storage even if logout fails
    return {
      success: false,
      message: 'Logout failed',
      error
    };
  }
};

/**
 * Refresh authentication token
 * @returns {Promise} New token
 */
export const refreshToken = async () => {
  try {
    const response = await api.post('/refresh-token');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Token refresh failed',
      error
    };
  }
};

export default {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  refreshToken
};
