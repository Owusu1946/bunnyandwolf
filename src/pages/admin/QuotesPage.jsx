import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaCalendarAlt, 
  FaDownload, 
  FaExclamationTriangle,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaFileAlt,
  FaCheckCircle,
  FaSyncAlt,
  FaPencilAlt,
  FaEye,
  FaTrashAlt,
  FaChevronLeft,
  FaChevronRight,
  FaFile,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint
} from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import useQuoteStore from '../../store/quoteStore';
import Sidebar from '../../components/admin/Sidebar';
import Spinner from '../../components/ui/Spinner';
import ConfirmModal from '../../components/ui/ConfirmModal';
import apiConfig from '../../config/apiConfig';


const QuotesPage = () => {
  console.log("QuotesPage - Component rendering start");
  
  const { 
    quotes, 
    pagination, 
    filters, 
    isLoading, 
    error, 
    fetchQuotes, 
    updateFilters, 
    resetFilters, 
    updateQuoteStatus,
    deleteQuote
  } = useQuoteStore();

  console.log("QuotesPage - Store values:", { 
    quotesLength: quotes?.length, 
    pagination, 
    isLoading, 
    error 
  });

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [quoteToUpdate, setQuoteToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [detailQuote, setDetailQuote] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // State for file preview modal
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Format date function
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return 'Invalid date';
    }
  };
  
  // Status color mapping
  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      quoted: 'bg-purple-100 text-purple-800',
      negotiating: 'bg-indigo-100 text-indigo-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };
  
  // Get human-readable status
  const getStatusLabel = (status) => {
    const statusLabels = {
      pending: 'Pending',
      reviewing: 'Reviewing',
      quoted: 'Quoted',
      negotiating: 'Negotiating',
      accepted: 'Accepted',
      rejected: 'Rejected',
      completed: 'Completed'
    };
    
    return statusLabels[status] || 'Unknown';
  };
  
  // Fetch quotes on initial load and when filters/pagination change
  useEffect(() => {
    console.log("QuotesPage: Fetching quotes, currentPage:", pagination.currentPage);
    fetchQuotes(pagination.currentPage, pagination.pageSize)
      .then(response => {
        console.log("QuotesPage: Successfully fetched quotes", response);
      })
      .catch(err => {
        console.error("Error in QuotesPage fetchQuotes:", err);
      });
  }, [pagination.currentPage, filters]);
  
  // Handle page change
  const handlePageChange = (newPage) => {
    console.log("QuotesPage: Page change to", newPage);
    fetchQuotes(newPage, pagination.pageSize);
  };
  
  // Apply filters
  const applyFilters = () => {
    console.log("QuotesPage: Applying filters", filters);
    fetchQuotes(1); // Reset to first page when filters change
    setShowFilterModal(false);
  };
  
  // Open delete confirmation modal
  const openDeleteModal = (quote) => {
    console.log("QuotesPage: Opening delete modal for quote", quote._id);
    setQuoteToDelete(quote);
    setShowDeleteModal(true);
  };
  
  // Confirm delete quote
  const confirmDeleteQuote = async () => {
    if (!quoteToDelete) return;
    
    try {
      console.log("QuotesPage: Deleting quote", quoteToDelete._id);
      await deleteQuote(quoteToDelete._id);
      setShowDeleteModal(false);
      setQuoteToDelete(null);
    } catch (error) {
      console.error('Error deleting quote:', error);
    }
  };
  
  // Open status update modal
  const openStatusModal = (quote) => {
    console.log("QuotesPage: Opening status modal for quote", quote._id);
    setQuoteToUpdate(quote);
    setNewStatus(quote.status);
    setStatusNote('');
    setShowStatusModal(true);
  };
  
  // Update quote status
  const confirmStatusUpdate = async () => {
    if (!quoteToUpdate || !newStatus) return;
    
    try {
      console.log("QuotesPage: Updating quote status", quoteToUpdate._id, newStatus);
      await updateQuoteStatus(quoteToUpdate._id, newStatus, statusNote);
      setShowStatusModal(false);
      setQuoteToUpdate(null);
      setNewStatus('');
      setStatusNote('');
    } catch (error) {
      console.error('Error updating quote status:', error);
    }
  };
  
  // View quote details
  const viewQuoteDetails = (quote) => {
    console.log("QuotesPage: Viewing quote details", quote._id);
    setDetailQuote(quote);
    setShowDetailModal(true);
  };
  
  // Truncate text
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Get file icon based on mimetype
  const getFileIcon = (mimetype) => {
    if (mimetype.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (mimetype.includes('image')) return <FaFileImage className="text-blue-500" />;
    if (mimetype.includes('word')) return <FaFileWord className="text-blue-700" />;
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return <FaFileExcel className="text-green-600" />;
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return <FaFilePowerpoint className="text-orange-500" />;
    return <FaFile className="text-gray-500" />;
  };

  // Function to check if a file exists
  const checkFileExists = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error checking file exists:', error);
      return false;
    }
  };

  // Function to open file preview
  const openFilePreview = async (file) => {
    console.log("Opening file preview:", file);
    
    // Try both possible URL formats
    const normalUrl = getFileUrl(file.path);
    const alternateUrl = `${apiConfig.baseURL}/uploads/quotes/${encodeURIComponent(file.filename)}`;
    
    console.log('Checking file existence at:', normalUrl);
    let fileExists = await checkFileExists(normalUrl);
    
    if (!fileExists) {
      console.log('File not found at primary path, trying alternate path:', alternateUrl);
      fileExists = await checkFileExists(alternateUrl);
      
      if (fileExists) {
        // Update the file path to use the working URL format
        file = { ...file, path: `quotes/${file.filename}` };
        console.log('Using alternate path for preview');
      } else {
        console.error('File not found at either location');
        alert(`Cannot find the file "${file.originalname}". It may have been moved or deleted.`);
        return;
      }
    }
    
    setPreviewFile(file);
    setShowPreviewModal(true);
  };

  // Function to get download URL for a file
  const getFileUrl = (filePath) => {
    if (!filePath) return '';
    
    // Check if path contains "quotes/" directory
    const hasQuotesDir = filePath.includes('quotes/') || filePath.includes('quotes\\');
    
    // Extract just the filename portion without any path
    const matches = filePath.match(/quote-[^/\\]+$/);
    const filename = matches ? matches[0] : filePath.split(/[/\\]/).pop();
    
    console.log('Original path:', filePath);
    console.log('Extracted filename:', filename);
    
    // Encode the filename to handle spaces and special characters
    const encodedFilename = encodeURIComponent(filename);
    
    // Return the proper URL to access the file
    // If the original path includes the quotes directory, maintain it in the URL
    if (hasQuotesDir) {
      return `${apiConfig.baseURL}/uploads/quotes/${encodedFilename}`;
    } else {
      return `${apiConfig.baseURL}/uploads/${encodedFilename}`;
    }
  };

  // Function to handle download errors
  const handleFileError = (e, file) => {
    console.error(`Error loading file: ${file.originalname}`, e);
    e.target.onerror = null; // Prevent infinite error loop
    
    // Try fallback to direct path
    if (e.target.tagName === 'IMG') {
      console.log('Attempting fallback path for image...');
      const fallbackPath = `${apiConfig.baseURL}/uploads/quotes/${encodeURIComponent(file.filename)}`;
      e.target.src = fallbackPath;
      
      // Add second error handler in case fallback also fails
      e.target.onerror = () => {
        console.error('Fallback path also failed');
        alert(`Failed to load file: ${file.originalname}. The file may not exist or access is restricted.`);
      };
    } else if (e.target.tagName === 'IFRAME') {
      console.log('Attempting fallback path for PDF...');
      
      // For PDFs we can't just change the src, we need to recreate the iframe
      const iframeContainer = e.target.parentElement;
      if (iframeContainer) {
        const fallbackPath = `${apiConfig.baseURL}/uploads/quotes/${encodeURIComponent(file.filename)}#view=FitH`;
        
        // Replace the iframe with a new one using the fallback path
        e.target.remove();
        const newIframe = document.createElement('iframe');
        newIframe.src = fallbackPath;
        newIframe.className = 'w-full h-full';
        newIframe.title = file.originalname;
        
        // Add error handler to the new iframe
        newIframe.onerror = () => {
          console.error('PDF fallback path also failed');
          alert(`Failed to load PDF: ${file.originalname}. The file may not exist or access is restricted.`);
        };
        
        // Add load handler to hide the loading indicator
        newIframe.onload = () => {
          console.log("PDF loaded successfully from fallback path");
          const loadingEl = document.getElementById(`loading-${file.filename}`);
          if (loadingEl) loadingEl.style.display = 'none';
        };
        
        iframeContainer.appendChild(newIframe);
      }
    } else {
      alert(`Failed to load file: ${file.originalname}. The file may not exist or access is restricted.`);
    }
  };

  // Function to close file preview
  const closeFilePreview = () => {
    setPreviewFile(null);
    setShowPreviewModal(false);
  };

  // Function to check if file is previewable
  const isPreviewable = (mimetype) => {
    return mimetype.includes('image') || 
           mimetype.includes('pdf') || 
           mimetype.includes('text');
  };

  console.log("QuotesPage - About to render JSX, loading state:", isLoading);
  
  // Create the component content first
  const pageContent = (
    <div className="bg-white rounded-lg shadow-md p-6 m-0">
      {console.log("QuotesPage - Rendering main content div")}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Quote Requests
        </h1>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search quotes..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-64"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            {filters.search && (
              <button
                onClick={() => updateFilters({ search: '' })}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Filter Button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaFilter className="mr-2 text-gray-500" />
            <span>Filters</span>
            {(filters.status || filters.dateRange.startDate || filters.dateRange.endDate) && (
              <span className="ml-2 w-2 h-2 rounded-full bg-purple-500"></span>
            )}
          </button>
          
          {/* Reset Filters Button */}
          {(filters.status || filters.search || filters.dateRange.startDate || filters.dateRange.endDate) && (
            <button
              onClick={() => {
                resetFilters();
                fetchQuotes(1);
              }}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <FaTimes className="mr-2" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <FaExclamationTriangle className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Quotes table */}
      <div className="overflow-x-auto">
        {console.log("QuotesPage - Rendering table section, isLoading:", isLoading, "quotes length:", quotes?.length)}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            {console.log("QuotesPage - Rendering spinner")}
            <Spinner size="lg" color="purple" />
          </div>
        ) : !quotes || quotes.length === 0 ? (
          <div className="text-center py-16">
            {console.log("QuotesPage - Rendering empty state")}
            <FaFileAlt className="text-gray-300 text-5xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No quote requests found</h3>
            <p className="text-gray-500">
              {(filters.status || filters.search || filters.dateRange.startDate || filters.dateRange.endDate)
                ? 'Try adjusting your search filters'
                : 'Quote requests will appear here once submitted'}
            </p>
          </div>
        ) : (
          <div>
            {console.log("QuotesPage - Rendering quotes list with", quotes.length, "items")}
            <div className="bg-gray-50 p-4 rounded mb-4">
              <p className="text-gray-700">Found {quotes.length} quote requests</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quotes.map(quote => (
                <div key={quote._id} className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <span className="text-purple-700 font-medium">{quote.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{quote.name}</h3>
                      <p className="text-sm text-gray-500">{quote.email}</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800`}>
                      {quote.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Product:</span> {quote.productType}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Quantity:</span> {quote.quantity}
                  </p>
                  
                  {/* Display uploaded files */}
                  {quote.files && quote.files.length > 0 && (
                    <div className="mt-2 border-t pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</p>
                      <div className="space-y-2">
                        {quote.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center overflow-hidden">
                              {getFileIcon(file.mimetype)}
                              <p className="text-xs text-gray-600 ml-2 truncate max-w-[100px]">
                                {file.originalname}
                              </p>
                              <span className="ml-1 text-xs text-gray-400">
                                ({(file.size / 1024).toFixed(0)} KB)
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              {isPreviewable(file.mimetype) && (
                                <button 
                                  onClick={() => openFilePreview(file)}
                                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                  title="Preview"
                                >
                                  <FaEye size={14} />
                                </button>
                              )}
                              <a 
                                href={getFileUrl(file.path)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                                title="Download"
                                download={file.originalname}
                                onClick={(e) => {
                                  // Check if the file exists before trying to download
                                  checkFileExists(getFileUrl(file.path)).then(exists => {
                                    if (!exists) {
                                      e.preventDefault();
                                      // Try the alternate URL
                                      const alternateUrl = `${apiConfig.baseURL}/uploads/quotes/${encodeURIComponent(file.filename)}`;
                                      checkFileExists(alternateUrl).then(alternateExists => {
                                        if (alternateExists) {
                                          // Open the correct URL
                                          window.open(alternateUrl, '_blank');
                                        } else {
                                          alert(`Cannot find the file "${file.originalname}". It may have been moved or deleted.`);
                                        }
                                      });
                                    }
                                  });
                                }}
                              >
                                <FaDownload size={14} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  // Return with Sidebar
  return (
    <>
      <Sidebar />
      
      <div className="md:ml-20 lg:ml-64 transition-all duration-300">
        <div className="pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {pageContent}
        </div>
      </div>
      
      {/* File Preview Modal */}
      {showPreviewModal && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900 truncate max-w-[400px]">
                {previewFile.originalname}
              </h3>
              <div className="flex items-center space-x-3">
                <a 
                  href={getFileUrl(previewFile.path)} 
                  download={previewFile.originalname}
                  className="text-purple-600 hover:text-purple-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaDownload className="w-5 h-5" />
                </a>
                <button 
                  onClick={closeFilePreview}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center">
              {previewFile.mimetype.includes('image') ? (
                <div className="relative">
                  <img 
                    src={getFileUrl(previewFile.path)} 
                    alt={previewFile.originalname}
                    className="max-w-full max-h-[70vh] object-contain"
                    onError={(e) => handleFileError(e, previewFile)}
                    onLoad={(e) => {
                      // Hide the loading indicator when image loads
                      const loadingEl = document.getElementById(`loading-${previewFile.filename}`);
                      if (loadingEl) loadingEl.style.display = 'none';
                    }}
                  />
                  {/* Loading indicator/fallback message */}
                  <div id={`loading-${previewFile.filename}`} className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-70">
                    <div className="text-center">
                      <Spinner size="lg" color="purple" />
                      <p className="mt-2 text-sm text-gray-700">Loading preview...</p>
                    </div>
                  </div>
                </div>
              ) : previewFile.mimetype.includes('pdf') ? (
                <div className="w-full h-[70vh] relative">
                  <iframe
                    src={`${getFileUrl(previewFile.path)}#toolbar=1&view=FitH`}
                    title={previewFile.originalname}
                    className="w-full h-full"
                    onError={(e) => handleFileError(e, previewFile)}
                    onLoad={(e) => {
                      console.log("PDF loaded successfully");
                      // Hide the loading indicator when PDF loads
                      const loadingEl = document.getElementById(`loading-${previewFile.filename}`);
                      if (loadingEl) loadingEl.style.display = 'none';
                    }}
                  />
                  {/* Loading indicator for PDF */}
                  <div id={`loading-${previewFile.filename}`} className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-70">
                    <div className="text-center">
                      <Spinner size="lg" color="purple" />
                      <p className="mt-2 text-sm text-gray-700">Loading PDF preview...</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-white rounded shadow-inner">
                  <FaFileAlt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-700">This file type cannot be previewed.</p>
                  <a 
                    href={getFileUrl(previewFile.path)} 
                    download={previewFile.originalname}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaDownload className="mr-2" /> Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuotesPage; 