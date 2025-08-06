import { API_CONFIG } from '../config/apiConfig';

// Handle API errors with user-friendly messages
const handleApiError = (error, response) => {
  if (response) {
    // Server responded with error status
    const status = response.status;
    
    switch (status) {
      case 400:
        throw new Error('Invalid request. Please check your files and column names.');
      case 401:
        throw new Error('Authentication required.');
      case 403:
        throw new Error('Access denied.');
      case 413:
        throw new Error('File size too large. Please reduce file size and try again.');
      case 429:
        throw new Error('Too many requests. Please wait and try again.');
      case 500:
        throw new Error('Server error. Please try again later.');
      default:
        throw new Error(`Request failed with status ${status}`);
    }
  } else {
    // Network error or other issues
    throw new Error('Network error. Please check your connection and try again.');
  }
};

// Retry logic for failed requests
const retryRequest = async (requestFn, retries = API_CONFIG.maxRetries) => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0 && error.status >= 500) {
      // Only retry on server errors
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      return retryRequest(requestFn, retries - 1);
    }
    throw error;
  }
};

// API Service methods using fetch
export const apiService = {
  // Process files with column names
  async processFiles(files, columnNames, onProgress = null) {
    const formData = new FormData();
    
    // Add files to FormData
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    
    // Add column names
    formData.append('columnNames', JSON.stringify(columnNames));
    
    // Add metadata
    formData.append('metadata', JSON.stringify({
      timestamp: new Date().toISOString(),
      fileCount: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0)
    }));

    const requestFn = async () => {
      // Simulate progress tracking
      if (onProgress) {
        const progressInterval = setInterval(() => {
          // This would be replaced with actual XMLHttpRequest progress tracking
          // when connecting to real backend
        }, 100);
        
        setTimeout(() => clearInterval(progressInterval), 2000);
      }

      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.PROCESS_FILES}`, {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header, let browser set it for FormData
      });

      if (!response.ok) {
        handleApiError(null, response);
      }

      return await response.json();
    };

    return retryRequest(requestFn);
  },

  // Health check endpoint
  async healthCheck() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/api/health`);
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      return await response.json();
    } catch (error) {
      console.warn('Health check failed:', error.message);
      return { status: 'unknown' };
    }
  }
};

export default apiService; 