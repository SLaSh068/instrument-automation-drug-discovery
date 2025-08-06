import React, { useState, useMemo } from 'react';
import { TABLE_CONFIG } from '../config/apiConfig';
import './TableViewer.css';

const TableViewer = ({ data, onClose, theme = 'forest-green' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [columnFilters, setColumnFilters] = useState({});

  // Extract columns from data
  const columns = useMemo(() => {
    if (!data || !data.length) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Filter data based on column filters
  const filteredData = useMemo(() => {
    if (!TABLE_CONFIG.enableFiltering) return data;

    let result = data;

    // Apply column-specific filters
    Object.keys(columnFilters).forEach(column => {
      const filterValue = columnFilters[column];
      if (filterValue && filterValue.trim()) {
        result = result.filter(row =>
          String(row[column]).toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });

    return result;
  }, [data, columnFilters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !TABLE_CONFIG.enableSorting) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!TABLE_CONFIG.enablePagination) return sortedData;
    
    const startIndex = (currentPage - 1) * TABLE_CONFIG.pageSize;
    return sortedData.slice(startIndex, startIndex + TABLE_CONFIG.pageSize);
  }, [sortedData, currentPage]);

  // Calculate pagination info
  const totalPages = Math.ceil(sortedData.length / TABLE_CONFIG.pageSize);
  const showPagination = TABLE_CONFIG.enablePagination && totalPages > 1;

  // Handle sort
  const handleSort = (column) => {
    if (!TABLE_CONFIG.enableSorting) return;
    
    setSortConfig(prev => ({
      key: column,
      direction: prev.key === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle column filter change
  const handleColumnFilterChange = (column, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Clear individual column filter
  const clearColumnFilter = (column) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
    setCurrentPage(1);
  };

  if (!data || !data.length) {
    return (
      <div className={`table-viewer theme-${theme}`}>
        <div className="table-header">
          <h3>Processing Results</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="no-data">No data to display</div>
      </div>
    );
  }

  return (
    <div className={`table-viewer theme-${theme}`}>
      <div className="table-header">
        <h3>Processing Results ({sortedData.length} rows)</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>



      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(column => (
                <th
                  key={column}
                  onClick={() => handleSort(column)}
                  className={`sortable ${sortConfig.key === column ? sortConfig.direction : ''}`}
                >
                  {column}
                  {TABLE_CONFIG.enableSorting && (
                    <span className="sort-indicator">
                      {sortConfig.key === column ? (
                        sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
                      ) : ' ↕'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
            {TABLE_CONFIG.enableFiltering && (
              <tr className="filter-row">
                {columns.map(column => (
                  <th key={`filter-${column}`} className="filter-cell">
                    <div className="filter-input-container">
                      <input
                        type="text"
                        placeholder={`Filter ${column}...`}
                        value={columnFilters[column] || ''}
                        onChange={(e) => handleColumnFilterChange(column, e.target.value)}
                        className="column-filter-input"
                        onClick={(e) => e.stopPropagation()} // Prevent sorting when clicking on filter
                      />
                      {columnFilters[column] && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearColumnFilter(column);
                          }}
                          className="clear-column-filter-btn"
                          title={`Clear ${column} filter`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={index}>
                {columns.map(column => (
                  <td key={column}>
                    {row[column] !== null && row[column] !== undefined 
                      ? String(row[column]) 
                      : '-'
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-btn"
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TableViewer; 