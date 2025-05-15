/**
 * API Configuration
 * 
 * This file contains configuration for API endpoints.
 * It handles different environments (development, production)
 * and provides a consistent baseURL for API requests.
 */

const getBaseURL = () => {
  // Check if we have a VITE_API_URL in environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fall back to default URLs based on environment
  if (import.meta.env.PROD) {
    // For production
    return 'https://bunnyandwolf.vercel.app/api/v1';
  } else {
    // For development
    return 'http://localhost:5000/api/v1';
  }
};

const apiConfig = {
  baseURL: getBaseURL(),
  
  // Default request timeout
  timeout: 30000, // 30 seconds
  
  // Rate limiting settings (requests per minute)
  rateLimit: 60,
  
  // Endpoints
  endpoints: {
    auth: '/auth',
    products: '/products',
    orders: '/orders',
    users: '/users',
    cart: '/cart',
    wishlist: '/wishlist',
    contact: '/contact',
    quote: '/quote',
    search: '/search',
    aiSearch: '/search/ai'
  },
  
  // Default headers for all requests
  headers: {
    'Content-Type': 'application/json'
  },
  
  // Get auth token from localStorage
  getAuthHeader: () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  
  // Upload configuration
  upload: {
    // Maximum file size for uploads in bytes (5MB)
    maxFileSize: 5 * 1024 * 1024,
    // Maximum image dimensions for auto-resizing
    maxImageWidth: 1200,
    maxImageHeight: 1200,
    // Image compression quality (0-1)
    imageQuality: 0.8,
    // Accepted file types
    acceptedImageFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    // Function to check if file is too large
    isFileTooLarge: (file) => file.size > apiConfig.upload.maxFileSize,
    // Function to format file size for display
    formatFileSize: (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
      else return (bytes / 1048576).toFixed(2) + ' MB';
    }
  }
};

export default apiConfig; 