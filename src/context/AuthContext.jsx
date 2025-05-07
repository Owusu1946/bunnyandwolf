import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import apiConfig from '../config/apiConfig';

const AuthContext = createContext();

const API_URL = apiConfig.baseURL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user state from localStorage
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Validate token on initial load
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Add token to axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token with backend
        const response = await axios.get(`${API_URL}/auth/verify`);
        if (response.data.valid) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } else {
          // If token is invalid, logout
          logout();
        }
      } catch (error) {
        console.error('Token validation error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  // Add axios interceptor for handling 401 responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const logout = () => {
    // Remove token from axios headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    
    // Reset user state
    setUser(null);
  };

  // Provide the context value
  const value = {
    user,
    setUser,
    logout,
    loading
  };

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

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