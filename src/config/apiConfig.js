// API Configuration
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
  endpoints: {
    PROCESS_FILES: process.env.REACT_APP_PROCESS_ENDPOINT || '/api/process'
  },
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  maxRetries: parseInt(process.env.REACT_APP_MAX_RETRIES) || 2,
  retryDelay: parseInt(process.env.REACT_APP_RETRY_DELAY) || 1000
};

// Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 10485760, // 10MB default
  allowedTypes: process.env.REACT_APP_ALLOWED_TYPES?.split(',') || [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json'
  ],
  maxFiles: parseInt(process.env.REACT_APP_MAX_FILES) || 10,
  
  // File type configurations
  fileTypeConfig: {
    csv: {
      types: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      extensions: ['csv', 'xls', 'xlsx'],
      description: 'CSV and Excel files'
    },
    txt: {
      types: ['text/plain'],
      extensions: ['txt'],
      description: 'Text files'
    },
    pdf: {
      types: ['application/pdf'],
      extensions: ['pdf'],
      description: 'PDF documents'
    },
    image: {
      types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
      extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
      description: 'Image files'
    }
  }
};

// Table Configuration
export const TABLE_CONFIG = {
  maxRows: parseInt(process.env.REACT_APP_TABLE_MAX_ROWS) || 1000,
  enablePagination: process.env.REACT_APP_ENABLE_PAGINATION !== 'false',
  pageSize: parseInt(process.env.REACT_APP_PAGE_SIZE) || 50,
  enableSorting: process.env.REACT_APP_ENABLE_SORTING !== 'false',
  enableFiltering: process.env.REACT_APP_ENABLE_FILTERING !== 'false'
}; 