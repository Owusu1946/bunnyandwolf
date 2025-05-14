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

  // Enhanced setUser function to also store userId separately
  const handleSetUser = (userData) => {
    if (userData) {
      // Store full user object in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Also store userId separately for easier access
      if (userData._id) {
        localStorage.setItem('userId', userData._id);
        console.log('✅ [AuthContext] User ID stored separately:', userData._id);
      }
      
      // Update React state
      setUser(userData);
    } else {
      // If userData is null, clear user data
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      setUser(null);
    }
  };

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
          console.log('✅ [AuthContext] Token verified successfully');
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            
            // Also ensure userId is stored separately
            if (userData._id) {
              localStorage.setItem('userId', userData._id);
            }
          }
        } else {
          // If token is invalid, logout
          console.warn('⚠️ [AuthContext] Token is invalid, logging out');
          logout();
        }
      } catch (error) {
        console.error('❌ [AuthContext] Token validation error:', error);
        // Only logout on 401 Unauthorized
        if (error.response?.status === 401) {
          logout();
        }
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
    console.log('🔄 [AuthContext] User logging out');
    
    // Remove token from axios headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('rememberMe');
    
    // Reset user state
    setUser(null);
    
    console.log('✅ [AuthContext] User logged out successfully');
  };

  // Provide the context value
  const value = {
    user,
    setUser: handleSetUser,
    logout,
    loading,
    isAuthenticated: !!user
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