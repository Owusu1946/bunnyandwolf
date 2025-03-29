import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'An error occurred during registration';
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Invalid credentials';
  }
};

export const socialAuth = async (provider) => {
  try {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    return new Promise((resolve, reject) => {
      const popup = window.open(
        `http://localhost:5000/api/v1/auth/${provider}`,
        'Social Login',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Handle popup blocked
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        reject(new Error('Popup blocked! Please allow popups for this site.'));
        return;
      }

      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      window.addEventListener('message', function(event) {
        if (event.origin !== 'http://localhost:5000') return;
        
        clearInterval(timer);
        
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
        
        popup.close();
      }, { once: true });
    });
  } catch (error) {
    throw new Error(`${provider} authentication failed: ${error.message}`);
  }
}; 