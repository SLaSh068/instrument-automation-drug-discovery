import { UPLOAD_CONFIG } from '../config/apiConfig';

export const fileService = {
  // Validate file size
  validateFileSize(file) {
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      throw new Error(`File "${file.name}" is too large. Maximum size is ${this.formatFileSize(UPLOAD_CONFIG.maxFileSize)}.`);
    }
    return true;
  },

  // Validate file type
  validateFileType(file, selectedFileType = null) {
    if (selectedFileType && UPLOAD_CONFIG.fileTypeConfig[selectedFileType]) {
      const config = UPLOAD_CONFIG.fileTypeConfig[selectedFileType];
      const fileExtension = this.getFileExtension(file.name).toLowerCase();
      
      // Check if file type or extension matches the selected file type
      const isValidType = config.types.includes(file.type);
      const isValidExtension = config.extensions.includes(fileExtension);
      
      if (!isValidType && !isValidExtension) {
        throw new Error(`File "${file.name}" is not a valid ${config.description}. Expected: ${config.extensions.map(ext => '.' + ext).join(', ')}.`);
      }
    } else {
      // Fallback to original validation
      if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
        throw new Error(`File type "${file.type}" is not supported. Allowed types: ${UPLOAD_CONFIG.allowedTypes.join(', ')}.`);
      }
    }
    return true;
  },

  // Validate multiple files
  validateFiles(files, selectedFileType = null) {
    const fileArray = Array.from(files);
    
    // Check file count
    if (fileArray.length > UPLOAD_CONFIG.maxFiles) {
      throw new Error(`Too many files. Maximum allowed: ${UPLOAD_CONFIG.maxFiles}.`);
    }

    // Validate each file
    fileArray.forEach(file => {
      this.validateFileSize(file);
      this.validateFileType(file, selectedFileType);
    });

    return true;
  },

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file extension
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  // Check if file is CSV
  isCSVFile(file) {
    return file.type === 'text/csv' || this.getFileExtension(file.name).toLowerCase() === 'csv';
  },

  // Check if file is Excel
  isExcelFile(file) {
    const excelTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const excelExtensions = ['xls', 'xlsx'];
    return excelTypes.includes(file.type) || 
           excelExtensions.includes(this.getFileExtension(file.name).toLowerCase());
  },

  // Generate unique file ID for tracking
  generateFileId(file) {
    return `${file.name}_${file.size}_${file.lastModified || Date.now()}`;
  }
};

export default fileService; 