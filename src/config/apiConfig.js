// API configuration for production and development environments
const apiConfig = {
  // Base API URL - use production URL when deployed, localhost for development
  baseURL: import.meta.env.PROD 
    ? 'https://sinosply-backend.onrender.com/api/v1'
    : 'http://localhost:5000/api/v1',
    
  // Request timeout in milliseconds - increased to prevent timeout errors
  timeout: 30000,
  
  // Default headers for all requests
  headers: {
    'Content-Type': 'application/json',
    'Origin': import.meta.env.PROD ? 'https://bunnyandwolf.vercel.app' : 'http://localhost:5173'
  },
  
  // Get auth token from localStorage
  getAuthHeader: () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default apiConfig; 