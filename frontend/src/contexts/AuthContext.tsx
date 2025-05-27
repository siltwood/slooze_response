import React, { createContext, useContext, useReducer, useEffect } from 'react';

// User interface - defines the structure of authenticated user data
interface User {
  id: number;
  email: string;
  name: string;
  role: 'Manager' | 'Store Keeper';
}

// Authentication state interface - manages current auth status
interface AuthState {
  user: User | null;      // Current logged-in user (null if not authenticated)
  token: string | null;   // JWT token for API authentication
  isLoading: boolean;     // Loading state for auth operations
  error: string | null;   // Error message for failed operations
}

// Action types for auth state reducer pattern
type AuthAction =
  | { type: 'LOGIN_START' }                                      // Start login process
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }  // Successful login
  | { type: 'LOGIN_FAILURE'; payload: string }                   // Failed login
  | { type: 'LOGOUT' }                                          // User logout
  | { type: 'CLEAR_ERROR' }                                     // Clear error messages
  | { type: 'SET_LOADING'; payload: boolean };                  // Set loading state

// Context interface - defines available auth methods and state
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Initial state - default values before authentication
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// Auth reducer - manages state transitions based on actions
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create React context for authentication
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider Component - Provides authentication state and methods to child components
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const API_BASE_URL = 'http://localhost:3001';

  // Check for existing authentication on app startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    // If we have stored auth data, restore the session
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
      } catch (error) {
        // Clear corrupted data if JSON parsing fails
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Login function - authenticates user with email and password
  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Send login request to backend API
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful - store token and user data in localStorage for persistence
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Update state with successful login
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data.user,
            token: data.token,
          },
        });
      } else {
        // Login failed - dispatch error and throw for component handling
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: data.error || 'Login failed',
        });
        throw new Error(data.error || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Network error occurred';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      throw error; // Re-throw for component error handling
    }
  };

  // Logout function - clears user session and notifies backend
  const logout = async (): Promise<void> => {
    try {
      // Notify backend about logout (for session cleanup)
      if (state.token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        });
      }
    } catch (error) {
      // Don't fail logout if API call fails
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and reset state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear error function - resets error state
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Context value object - provides state and methods to consumers
  const value: AuthContextType = {
    state,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for consuming auth context - provides type safety and error checking
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 