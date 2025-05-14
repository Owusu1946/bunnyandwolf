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