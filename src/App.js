import React, { useState } from 'react';
import './App.css';
import { fileService } from './services/fileService';
import TableViewer from './components/TableViewer';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [columnName, setColumnName] = useState('');
  const [columnNames, setColumnNames] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [currentTheme, setCurrentTheme] = useState('forest-green'); // default theme
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tableData, setTableData] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState('csv');

  const handleFileUpload = async (files) => {
    if (files.length === 0) return;
    
    try {
      // Validate files using fileService with selected file type
      fileService.validateFiles(files, selectedFileType);
      
      setIsUploading(true);
      
      // Simulate processing time for larger files or multiple files
      const fileList = Array.from(files);
      const processingTime = Math.min(1000 + (fileList.length * 200), 3000); // 1s base + 200ms per file, max 3s
      
      setTimeout(() => {
        setUploadedFiles(prev => [...prev, ...fileList]);
        setIsUploading(false);
      }, processingTime);
      
    } catch (error) {
      setIsUploading(false);
      showToast(error.message);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleFileInputChange = (e) => {
    handleFileUpload(e.target.files);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

  const formatFileSize = (bytes) => {
    return fileService.formatFileSize(bytes);
  };

  const handleAddColumn = () => {
    const trimmedName = columnName.trim();
    if (!trimmedName) return;
    
    if (columnNames.includes(trimmedName)) {
      showToast(`Column "${trimmedName}" already exists!`);
      return;
    }
    
    setColumnNames(prev => [...prev, trimmedName]);
    setColumnName('');
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  const generateMockData = (columnNames, fileCount = 1) => {
    // Mock data generators
    const mockGenerators = {
      'name': () => {
        const names = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emma Davis', 'James Wilson', 
                      'Lisa Anderson', 'David Miller', 'Jennifer Garcia', 'Robert Martinez', 'Mary Rodriguez',
                      'Christopher Lee', 'Patricia Taylor', 'Matthew Thomas', 'Linda Jackson', 'Daniel White'];
        return names[Math.floor(Math.random() * names.length)];
      },
      'date': () => {
        const start = new Date(2023, 0, 1);
        const end = new Date();
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomDate.toISOString().split('T')[0];
      },
      'batch id': () => {
        const prefixes = ['BTH', 'LOT', 'BAT', 'GRP'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const number = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
        return `${prefix}-${number}`;
      },
      'batch_id': () => {
        const prefixes = ['BTH', 'LOT', 'BAT', 'GRP'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const number = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
        return `${prefix}-${number}`;
      },
      'id': () => Math.floor(Math.random() * 10000) + 1,
      'email': () => {
        const domains = ['example.com', 'test.org', 'sample.net', 'demo.co'];
        const names = ['user', 'test', 'demo', 'sample'];
        const name = names[Math.floor(Math.random() * names.length)];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        const num = Math.floor(Math.random() * 999) + 1;
        return `${name}${num}@${domain}`;
      },
      'age': () => Math.floor(Math.random() * 60) + 18,
      'score': () => (Math.random() * 100).toFixed(2),
      'value': () => (Math.random() * 1000).toFixed(2),
      'amount': () => (Math.random() * 5000).toFixed(2),
      'default': (colName) => `Sample ${colName} ${Math.floor(Math.random() * 100) + 1}`
    };

    // Generate rows (15-25 rows per file)
    const rowsPerFile = Math.floor(Math.random() * 11) + 15; // 15-25 rows
    const totalRows = rowsPerFile * fileCount;
    const mockData = [];

    for (let i = 0; i < totalRows; i++) {
      const row = {};
      
      columnNames.forEach(columnName => {
        const lowerCol = columnName.toLowerCase().trim();
        const generator = mockGenerators[lowerCol] || mockGenerators['default'];
        row[columnName] = typeof generator === 'function' ? generator(columnName) : generator;
      });
      
      mockData.push(row);
    }

    return mockData;
  };

  const handleSubmit = async () => {
    // Validation
    if (uploadedFiles.length === 0 && columnNames.length === 0) {
      showToast('Please upload at least one file and add at least one column name!');
      return;
    }
    
    if (uploadedFiles.length === 0) {
      showToast('Please upload at least one file before submitting!');
      return;
    }
    
    if (columnNames.length === 0) {
      showToast('Please add at least one column name before submitting!');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Create and log the actual payload that would be sent to the API
      const formData = new FormData();
      
      // Add files to FormData
      uploadedFiles.forEach((file, index) => {
        formData.append(`files`, file);
      });
      
      // Add column names
      formData.append('columnNames', JSON.stringify(columnNames));
      
      // Add metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        fileCount: uploadedFiles.length,
        totalSize: uploadedFiles.reduce((sum, file) => sum + file.size, 0),
        filenames: uploadedFiles.map(file => file.name),
        filesizes: uploadedFiles.map(file => file.size)
      };
      formData.append('metadata', JSON.stringify(metadata));

      // Log the payload details
      console.group('🚀 API Payload Details');
      console.log('📁 Files:', uploadedFiles.map(f => ({
        name: f.name,
        size: fileService.formatFileSize(f.size),
        type: f.type,
        lastModified: new Date(f.lastModified).toISOString()
      })));
      console.log('📊 Column Names:', columnNames);
      console.log('📋 Metadata:', metadata);
      console.log('🔗 Endpoint:', `/api/process`);
      console.log('📤 FormData Entries:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${fileService.formatFileSize(value.size)})`);
        } else {
          console.log(`  ${key}:`, value);
        }
      }
      console.groupEnd();

      // Simulate API call with progress
      const simulateProgress = () => {
        return new Promise((resolve) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 20 + 5; // 5-25% increments
            if (progress >= 100) {
              progress = 100;
              setUploadProgress(progress);
              clearInterval(interval);
              resolve();
            } else {
              setUploadProgress(Math.floor(progress));
            }
          }, 200); // Update every 200ms
        });
      };

      await simulateProgress();

      // Generate mock response data
      const mockTableData = generateMockData(columnNames, uploadedFiles.length);
      
      console.group('📥 Mock API Response');
      console.log('✅ Status: 200 OK');
      console.log('📊 Table Data:', mockTableData);
      console.log(`📈 Generated ${mockTableData.length} rows for ${columnNames.length} columns`);
      console.groupEnd();

      // Handle successful response
      setTableData(mockTableData);
      setShowTable(true);
      showToast(`Files processed successfully! Generated ${mockTableData.length} rows of data.`);

    } catch (error) {
      console.error('❌ Processing Error:', error);
      showToast(error.message || 'Failed to process files. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveColumn = (columnToRemove) => {
    setColumnNames(prev => prev.filter(col => col !== columnToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddColumn();
    }
  };



  const themes = {
    'royal-purple': 'Royal Purple',
    'forest-green': 'Forest Green',
    'dark-mode': 'Dark Professional'
  };

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    setShowThemeOptions(false);
  };

    return (
    <div className={`App theme-${currentTheme}`}>
      {toast.show && (
        <div className="toast-notification">
          <div className="toast-content">
            <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      )}
      
              <header className="app-header">
          <div className="header-content">
            <div className="header-main">
              <h1 className="app-title">Instrument Automation and Drug Discovery Lab</h1>
              <p className="app-subtitle">Agentic AI-powered RnD Lab Platform</p>
            </div>
            <div className="theme-selector">
              <button 
                className="theme-toggle-btn"
                onClick={() => setShowThemeOptions(!showThemeOptions)}
                title="Change Theme"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"></circle>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                </svg>
              </button>
              
              {showThemeOptions && (
                <div className="theme-options">
                  <div 
                    className={`theme-option ${currentTheme === 'royal-purple' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('royal-purple')}
                    title="Royal Purple"
                  >
                    <div className="theme-preview royal-purple-preview"></div>
                  </div>
                  <div 
                    className={`theme-option ${currentTheme === 'forest-green' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('forest-green')}
                    title="Forest Green"
                  >
                    <div className="theme-preview forest-green-preview"></div>
                  </div>
                  <div 
                    className={`theme-option ${currentTheme === 'dark-mode' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('dark-mode')}
                    title="Dark Professional"
                  >
                    <div className="theme-preview dark-mode-preview"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
      
      <div className="main-content">
        <div className="left-section">
        {/* <h2 className="section-title">File Upload</h2> */}
        
        {/* File Type Selector */}
        <div className="file-type-selector">
          <label htmlFor="file-type" className="file-type-label">Select File Type:</label>
          <select 
            id="file-type"
            value={selectedFileType} 
            onChange={(e) => setSelectedFileType(e.target.value)}
            className="file-type-dropdown"
          >
            <option value="csv">.csv (Comma Separated Values)</option>
            <option value="txt">.txt (Text Files)</option>
            <option value="pdf">.pdf (PDF Documents)</option>
            <option value="image">Image Files (.jpg, .png, .gif)</option>
          </select>
        </div>
        
        <div 
          className={`upload-area ${isDragOver ? 'drag-over' : ''} ${uploadedFiles.length > 0 ? 'has-files' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="upload-loading">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <h3>Processing files...</h3>
              <p>Please wait while we upload your files</p>
            </div>
          ) : (
            <div className="upload-content">
              <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <h3>Drop files here</h3>
              <br />
              <input
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="file-input"
                id="file-upload"
                disabled={isUploading}
              />
              <label htmlFor="file-upload" className={`upload-button ${isUploading ? 'disabled' : ''}`}>
                Choose Files
              </label>
            </div>
          )}
        </div>

        {uploadedFiles.length > 0 && (
          <div className="file-list">
            <div className="file-list-header">
              <h3 className="file-list-title">Uploaded Files ({uploadedFiles.length})</h3>
              <button 
                onClick={clearAllFiles}
                className="clear-all-btn"
                title="Delete all files"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
            <div className="file-items">
              <div className="file-items-container">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                    <button 
                      onClick={() => removeFile(index)}
                      className="remove-file-btn"
                      title="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="right-section">
        <div className="column-input-section">
          <label htmlFor="column-input" className="column-label">
            Enter a Column Name
          </label>
          <div className="input-row">
            <input
              type="text"
              id="column-input"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Column name..."
              className="column-input"
            />
            <button 
              onClick={handleAddColumn}
              className="add-column-btn"
              disabled={!columnName.trim()}
            >
              Add
            </button>
          </div>
        </div>

                 {columnNames.length > 0 && (
           <div className="column-tags-section">
             <h3 className="tags-title">Column Names ({columnNames.length})</h3>
             <div className="column-tags">
               {columnNames.map((column, index) => (
                 <div key={index} className="column-tag">
                   <span className="tag-text">{column}</span>
                   <button
                     onClick={() => handleRemoveColumn(column)}
                     className="remove-tag-btn"
                     title="Remove column"
                   >
                     ×
                   </button>
                 </div>
               ))}
             </div>
           </div>
         )}

         {columnNames.length > 0 && (
           <div className="submit-section">
             <button 
               className={`submit-btn ${isSubmitting ? 'submitting' : ''}`} 
               onClick={handleSubmit}
               disabled={isSubmitting}
             >
               {isSubmitting ? (
                 <>
                   <span className="submit-spinner"></span>
                   {uploadProgress > 0 ? `${uploadProgress}%` : 'Processing...'}
                 </>
               ) : (
                 'Submit'
               )}
             </button>
           </div>
         )}
       </div>
     </div>
     
                {showTable && tableData && (
       <TableViewer 
         data={tableData} 
         onClose={() => setShowTable(false)}
         theme={currentTheme}
       />
     )}
    </div>
  );
}

export default App; 