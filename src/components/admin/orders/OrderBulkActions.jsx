import { useState } from 'react';
import { FaCheckSquare, FaDownload, FaPrint, FaTags, FaEnvelope, FaExclamationTriangle, FaBoxOpen, FaShippingFast, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const OrderBulkActions = ({ selectedCount, onBulkAction }) => {
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  
  const handleBulkStatusChange = (status) => {
    onBulkAction('updateStatus', status);
    setShowStatusOptions(false);
  };
  
  return (
    <div className="bg-gray-100 py-3 px-4 sm:px-6 rounded-lg border border-gray-200 flex flex-wrap gap-2 items-center mt-4 mb-4">
      <span className="text-sm text-gray-600 font-medium mr-2 whitespace-nowrap">
        <FaCheckSquare className="inline-block mr-1 text-purple-600" />
        {selectedCount} orders selected
      </span>
      
      <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        <button 
          onClick={() => onBulkAction('print')}
          className="btn-bulk-action bg-gray-200 hover:bg-gray-300"
        >
          <FaPrint className="text-gray-700" />
          <span>Print</span>
        </button>
        
        <button 
          onClick={() => onBulkAction('export')}
          className="btn-bulk-action bg-gray-200 hover:bg-gray-300"
        >
          <FaDownload className="text-gray-700" />
          <span>Export</span>
        </button>
        
        <button 
          onClick={() => onBulkAction('email')}
          className="btn-bulk-action bg-gray-200 hover:bg-gray-300"
        >
          <FaEnvelope className="text-gray-700" />
          <span>Email</span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowStatusOptions(!showStatusOptions)}
            className="btn-bulk-action bg-gray-200 hover:bg-gray-300"
          >
            <FaTags className="text-gray-700" />
            <span>Update Status</span>
          </button>
          
          {showStatusOptions && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
              <button 
                onClick={() => handleBulkStatusChange('Processing')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <FaBoxOpen className="mr-2 text-blue-500" />
                Mark as Processing
              </button>
              <button 
                onClick={() => handleBulkStatusChange('Shipped')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <FaShippingFast className="mr-2 text-indigo-500" />
                Mark as Shipped
              </button>
              <button 
                onClick={() => handleBulkStatusChange('Delivered')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <FaCheckCircle className="mr-2 text-green-500" />
                Mark as Delivered
              </button>
              <button 
                onClick={() => handleBulkStatusChange('Cancelled')}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <FaTimesCircle className="mr-2 text-red-500" />
                Cancel Orders
              </button>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => onBulkAction('delete')}
          className="btn-bulk-action bg-red-100 hover:bg-red-200 text-red-700"
        >
          <FaExclamationTriangle className="text-red-600" />
          <span>Delete</span>
        </button>
      </div>
      
      <style jsx="true">{`
        .btn-bulk-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }
      `}</style>
    </div>
  );
};

export default OrderBulkActions; 