import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'LOAD_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Set auth token header
  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          setAuthToken(state.token);
          
          // Check if token is expired
          const decoded = jwtDecode(state.token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired
            dispatch({ type: 'LOGOUT' });
            setAuthToken(null);
            return;
          }

          const res = await api.get('/api/auth/me');
          dispatch({ type: 'LOAD_USER', payload: res.data.data });
        } catch (error) {
          console.error('Load user error:', error);
          dispatch({ type: 'LOGOUT' });
          setAuthToken(null);
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, [state.token]);

  // Login user
  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const res = await api.post('/api/auth/login', { email, password });
      
      setAuthToken(res.data.data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.data });
      
      toast.success('Login successful!');
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAIL' });
      setAuthToken(null);
      
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      
      return { success: false, message };
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const res = await api.post('/api/auth/register', userData);
      
      setAuthToken(res.data.data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.data });
      
      toast.success('Registration successful!');
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAIL' });
      setAuthToken(null);
      
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      
      return { success: false, message };
    }
  };

  // Google OAuth login
  const googleLogin = () => {
    // For now, redirect to backend Google OAuth
    window.location.href = '/api/auth/google';
  };

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    setAuthToken(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const res = await api.put('/api/users/profile', userData);
      dispatch({ type: 'UPDATE_USER', payload: res.data.data });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Change user role
  const changeRole = async (role) => {
    try {
      const res = await api.put('/api/users/role', { role });
      dispatch({ type: 'UPDATE_USER', payload: res.data.data });
      toast.success('Role updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Role change failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    changeRole,
  };

  return (
    <AuthContext.Provider value={value}>
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