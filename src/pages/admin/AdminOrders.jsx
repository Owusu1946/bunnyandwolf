import { useState, useEffect } from 'react';
import { FaSearch, FaSort, FaFilter, FaEye, FaPencilAlt, FaInfoCircle, FaTimes, FaBox, FaUser, FaMapMarkerAlt, FaCreditCard, FaTruck, FaSave, FaCheck, FaSync } from 'react-icons/fa';
import { useOrderStore } from '../../store/orderStore';
import Sidebar from '../../components/admin/Sidebar';
import LoadingOverlay from '../../components/LoadingOverlay';

// Skeleton loader for order rows
const OrderRowSkeleton = () => {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end space-x-2">
          <div className="h-5 bg-gray-200 rounded-full w-5"></div>
          <div className="h-5 bg-gray-200 rounded-full w-5"></div>
        </div>
      </td>
    </tr>
  );
};

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedOrder, setEditedOrder] = useState(null);
  const [statusChangeOrder, setStatusChangeOrder] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Status options for the dropdown
  const ORDER_STATUSES = [
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Refunded'
  ];

  // Get orders from the store
  const {
    orders,
    getOrders,
    initializeWithSampleOrder,
    clearOrders,
    addOrder,
    selectOrder,
    clearSelectedOrder,
    selectedOrder,
    updateOrder,
    updateOrderStatus,
    fetchOrders
  } = useOrderStore();

  // First load - fetch all orders from the API
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        console.log('Loading all orders...');
        const result = await fetchOrders();
        
        // If API fetch fails or no orders were returned, try to use sample data
        if (!result.success || !result.data || result.data.length === 0) {
          console.log('No orders found in API, initializing with sample data');
          initializeWithSampleOrder();
        } else {
          console.log(`Loaded ${result.data.length} orders`);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        setError('Failed to load orders. Using sample data instead.');
        initializeWithSampleOrder();
      } finally {
        setIsLoading(false);
        
        // Apply initial filtering
        filterAndSortOrders();
      }
    };
    
    loadOrders();
  }, []);

  // Handle filter changes
  useEffect(() => {
    filterAndSortOrders();
  }, [orders, statusFilter, searchTerm, sortField, sortDirection]);

  // Filter and sort orders based on current criteria
  const filterAndSortOrders = () => {
    setIsLoading(true);
    
    try {
      // Start with all orders
      let result = [...orders];
      
      // Apply status filter
      if (statusFilter && statusFilter !== 'all') {
        result = result.filter(order => 
          order.status && order.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }
      
      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(order => 
          (order.orderNumber && order.orderNumber.toLowerCase().includes(term)) ||
          (order.customerName && order.customerName.toLowerCase().includes(term)) ||
          (order.customerEmail && order.customerEmail.toLowerCase().includes(term)) ||
          (order.trackingNumber && order.trackingNumber.toLowerCase().includes(term))
        );
    }
      
      // Apply sorting
      result.sort((a, b) => {
        if (sortField === 'createdAt') {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (sortField === 'totalAmount') {
          const amountA = parseFloat(a.totalAmount || 0);
          const amountB = parseFloat(b.totalAmount || 0);
          return sortDirection === 'asc' ? amountA - amountB : amountB - amountA;
        } else if (sortField === 'status') {
          return sortDirection === 'asc'
            ? (a.status || '').localeCompare(b.status || '')
            : (b.status || '').localeCompare(a.status || '');
        } else if (sortField === 'customerName') {
          return sortDirection === 'asc'
            ? (a.customerName || '').localeCompare(b.customerName || '')
            : (b.customerName || '').localeCompare(a.customerName || '');
        }
        return 0;
      });
      
      setFilteredOrders(result);
    } catch (err) {
      setError('Error filtering orders: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Format price for display
  const formatPrice = (price) => {
    try {
    return `GH₵${parseFloat(price).toFixed(2)}`;
    } catch (e) {
      return 'GH₵0.00';
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle refresh (just reapply filters on local data)
  const handleRefresh = () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    
    // Set a timeout to simulate network request for better UX
    setTimeout(() => {
      try {
        filterAndSortOrders();
        setSuccessMessage('Order list refreshed successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError(`Error refreshing orders: ${err.message}`);
      } finally {
        setIsRefreshing(false);
      }
    }, 1000);
  };

  // Handle view order details
  const handleViewOrderDetails = (orderId) => {
    selectOrder(orderId);
    setIsEditMode(false);
    setShowOrderModal(true);
  };

  // Handle edit order
  const handleEditOrder = (orderId) => {
    selectOrder(orderId);
    const order = orders.find(o => o._id === orderId);
    setEditedOrder({...order});
    setIsEditMode(true);
    setShowOrderModal(true);
  };

  // Handle changes to the edited order
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedOrder(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditedOrder(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Save edited order
  const handleSaveOrder = () => {
    setIsLoading(true);
    try {
      const updated = updateOrder(editedOrder._id, editedOrder);
      if (updated) {
        setSuccessMessage('Order updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setIsEditMode(false);
    }
    } catch (err) {
      setError(`Error updating order: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle status dropdown
  const toggleStatusDropdown = (orderId) => {
    setShowStatusDropdown(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Handle status change
  const handleStatusChange = (orderId, newStatus) => {
    setIsLoading(true);
    try {
      updateOrderStatus(orderId, newStatus);
      setSuccessMessage(`Order status updated to ${newStatus}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      // Close dropdown
      setShowStatusDropdown(prev => ({
        ...prev,
        [orderId]: false
      }));
    } catch (err) {
      setError(`Error updating status: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal and clear selected order
  const closeOrderModal = () => {
    setShowOrderModal(false);
    clearSelectedOrder();
    setIsEditMode(false);
    setEditedOrder(null);
  };

  // Get pagination indices
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Calculate order statistics
  const getOrderStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

    // Orders in the last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || 0);
      return orderDate >= sevenDaysAgo;
    });
    
    const recentRevenue = recentOrders.reduce((sum, order) => 
      sum + parseFloat(order.totalAmount || 0), 0);
    
    return {
      totalOrders,
      totalRevenue,
      recentOrders: recentOrders.length,
      recentRevenue
    };
  };
  
  const stats = getOrderStats();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {isLoading && <LoadingOverlay />}
        
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">Orders Management</h1>
            <p className="text-gray-600">View and manage all customer orders</p>
          </div>
          
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Recent Orders (7d)</h3>
              <p className="text-2xl font-bold">{stats.recentOrders}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Recent Revenue (7d)</h3>
              <p className="text-2xl font-bold">{formatPrice(stats.recentRevenue)}</p>
            </div>
          </div>
          
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div className="relative w-full md:w-64">
              <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <FaSearch />
              </div>
                <button type="submit" className="hidden">Search</button>
              </form>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center">
                <FaFilter className="mr-2 text-gray-500" />
                <select
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <span className="mr-2 text-gray-500">Show:</span>
                <select
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
              
              <button
                className={`px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center ${isRefreshing ? 'opacity-75 cursor-not-allowed' : ''}`}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <FaSync className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Orders'}
              </button>
            </div>
          </div>
          
          {/* Success message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center">
              <FaCheck className="mr-2" />
              <span>{successMessage}</span>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Error:</h3>
              <p>{error}</p>
              <button 
                className="mt-2 text-sm px-3 py-1 bg-red-200 text-red-800 rounded-md hover:bg-red-300"
                onClick={handleRefresh}
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('customerName')}
                    >
                      <div className="flex items-center">
                        Customer
                        {sortField === 'customerName' && (
                          <FaSort className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Info
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortField === 'createdAt' && (
                          <FaSort className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('totalAmount')}
                    >
                      <div className="flex items-center">
                        Amount
                        {sortField === 'totalAmount' && (
                          <FaSort className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {sortField === 'status' && (
                          <FaSort className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isRefreshing ? (
                    // Show skeleton loaders while refreshing
                    Array.from({ length: itemsPerPage }).map((_, index) => (
                      <OrderRowSkeleton key={index} />
                    ))
                  ) : currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.customerName || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{order.customerEmail || 'No email'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{order.orderNumber}</div>
                          <div className="text-sm text-gray-500">
                            {Array.isArray(order.items) ? order.items.length : 0} items
                          </div>
                          {order.trackingNumber && (
                            <div className="text-xs text-gray-500">
                              Tracking: {order.trackingNumber}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative">
                            <span 
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer
                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                            ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : ''}
                            ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${order.status === 'Processing' ? 'bg-purple-100 text-purple-800' : ''}
                            ${order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                            ${order.status === 'Refunded' ? 'bg-gray-100 text-gray-800' : ''}
                              `}
                              onClick={() => toggleStatusDropdown(order._id)}
                            >
                              {order.status || 'Unknown'}
                          </span>
                            
                            {/* Status dropdown */}
                            {showStatusDropdown[order._id] && (
                              <div className="absolute left-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <ul className="py-1">
                                  {ORDER_STATUSES.map(status => (
                                    <li 
                                      key={status}
                                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100
                                        ${order.status === status ? 'bg-gray-50 font-medium' : ''}
                                      `}
                                      onClick={() => handleStatusChange(order._id, status)}
                                    >
                                      {status}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Details"
                              onClick={() => handleViewOrderDetails(order._id)}
                            >
                              <FaEye />
                            </button>
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Order"
                              onClick={() => handleEditOrder(order._id)}
                            >
                              <FaPencilAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                        {isLoading ? 'Loading orders...' : 
                         'No orders found matching your criteria'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastOrder, filteredOrders.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredOrders.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Display a window of 5 pages, centered on the current page if possible
                        let pageNum;
                        if (totalPages <= 5) {
                          // If 5 or fewer total pages, show all
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          // If near the start, show first 5 pages
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          // If near the end, show last 5 pages
                          pageNum = totalPages - 4 + i;
                        } else {
                          // Show window of 5 pages centered on current page
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                              ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                            {pageNum}
                        </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Order Details/Edit Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl mx-auto max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditMode ? 'Edit Order: ' : 'Order: '}
                  #{isEditMode ? editedOrder.orderNumber : selectedOrder.orderNumber}
                </h3>
                <div className="flex items-center space-x-2">
                  {isEditMode && (
                    <button 
                      className="text-green-600 hover:text-green-700 px-3 py-1 bg-green-100 rounded-md flex items-center"
                      onClick={handleSaveOrder}
                    >
                      <FaSave className="mr-1" /> Save
                    </button>
                  )}
                  <button 
                    className="text-gray-400 hover:text-gray-500"
                    onClick={closeOrderModal}
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6">
                {/* Order Status Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                  <div>
                    <div className="text-sm text-gray-500">
                      Created on: {formatDate(isEditMode ? editedOrder.createdAt : selectedOrder.createdAt)}
                    </div>
                    
                    {isEditMode ? (
                      <div className="mt-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          className="border border-gray-300 rounded-md px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
                          name="status"
                          value={editedOrder.status || ''}
                          onChange={handleEditChange}
                        >
                          {ORDER_STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="mt-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                          ${selectedOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : ''}
                          ${selectedOrder.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${selectedOrder.status === 'Processing' ? 'bg-purple-100 text-purple-800' : ''}
                          ${selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                          ${selectedOrder.status === 'Refunded' ? 'bg-gray-100 text-gray-800' : ''}
                        `}>
                          {selectedOrder.status || 'Unknown'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    {isEditMode ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                        <input
                          type="number"
                          className="border border-gray-300 rounded-md px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
                          name="totalAmount"
                          value={editedOrder.totalAmount || 0}
                          onChange={handleEditChange}
                          step="0.01"
                        />
                      </div>
                    ) : (
                      <div className="text-xl font-bold text-gray-900">
                        {formatPrice(selectedOrder.totalAmount)}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Order Info Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <FaUser className="text-gray-500 mr-2" />
                      <h4 className="text-md font-medium">Customer Information</h4>
                    </div>
                    
                    {isEditMode ? (
                      <div className="pl-6 space-y-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                            name="customerName"
                            value={editedOrder.customerName || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                            name="customerEmail"
                            value={editedOrder.customerEmail || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pl-6">
                        <p className="text-sm font-medium">{selectedOrder.customerName || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{selectedOrder.customerEmail || 'No email'}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Shipping Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <FaMapMarkerAlt className="text-gray-500 mr-2" />
                      <h4 className="text-md font-medium">Shipping Information</h4>
                    </div>
                    
                    {isEditMode ? (
                      <div className="pl-6 space-y-2">
                        {editedOrder.shippingAddress && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                              <input
                                type="text"
                                className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                                name="shippingAddress.street"
                                value={editedOrder.shippingAddress.street || ''}
                                onChange={handleEditChange}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                                  name="shippingAddress.city"
                                  value={editedOrder.shippingAddress.city || ''}
                                  onChange={handleEditChange}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                                  name="shippingAddress.state"
                                  value={editedOrder.shippingAddress.state || ''}
                                  onChange={handleEditChange}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zip</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                                  name="shippingAddress.zip"
                                  value={editedOrder.shippingAddress.zip || ''}
                                  onChange={handleEditChange}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                                  name="shippingAddress.country"
                                  value={editedOrder.shippingAddress.country || ''}
                                  onChange={handleEditChange}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="pl-6">
                        {selectedOrder.shippingAddress ? (
                          <>
                            <p className="text-sm">{selectedOrder.shippingAddress.name}</p>
                            <p className="text-sm text-gray-500">{selectedOrder.shippingAddress.street}</p>
                            <p className="text-sm text-gray-500">
                              {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}
                            </p>
                            <p className="text-sm text-gray-500">{selectedOrder.shippingAddress.country}</p>
                            {selectedOrder.shippingAddress.phone && (
                              <p className="text-sm text-gray-500">Phone: {selectedOrder.shippingAddress.phone}</p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">No shipping address provided</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Payment Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <FaCreditCard className="text-gray-500 mr-2" />
                      <h4 className="text-md font-medium">Payment Information</h4>
                    </div>
                    
                    {isEditMode ? (
                      <div className="pl-6 space-y-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                          <input
                            type="text"
                            className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                            name="paymentMethod"
                            value={editedOrder.paymentMethod || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        {editedOrder.paymentDetails && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                              <select
                                className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                                name="paymentDetails.status"
                                value={editedOrder.paymentDetails.status || ''}
                                onChange={handleEditChange}
                              >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                              <input
                                type="text"
                                className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                                name="paymentDetails.transactionId"
                                value={editedOrder.paymentDetails.transactionId || ''}
                                onChange={handleEditChange}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="pl-6">
                        <p className="text-sm font-medium">Method: {selectedOrder.paymentMethod || 'Unknown'}</p>
                        {selectedOrder.paymentDetails && (
                          <>
                            <p className="text-sm text-gray-500">
                              Status: {selectedOrder.paymentDetails.status || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Transaction ID: {selectedOrder.paymentDetails.transactionId || 'N/A'}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Tracking Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <FaTruck className="text-gray-500 mr-2" />
                      <h4 className="text-md font-medium">Tracking Information</h4>
                    </div>
                    
                    {isEditMode ? (
                      <div className="pl-6 space-y-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                          <input
                            type="text"
                            className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                            name="trackingNumber"
                            value={editedOrder.trackingNumber || ''}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Method</label>
                          <select
                            className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                            name="shippingMethod"
                            value={editedOrder.shippingMethod || 'standard'}
                            onChange={handleEditChange}
                          >
                            <option value="standard">Standard</option>
                            <option value="express">Express</option>
                            <option value="nextday">Next Day</option>
                            <option value="international">International</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Est. Delivery Date</label>
                          <input
                            type="date"
                            className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                            name="estimatedDelivery"
                            value={editedOrder.estimatedDelivery ? new Date(editedOrder.estimatedDelivery).toISOString().split('T')[0] : ''}
                            onChange={handleEditChange}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pl-6">
                        <p className="text-sm font-medium">
                          {selectedOrder.trackingNumber 
                            ? `Tracking #: ${selectedOrder.trackingNumber}` 
                            : 'No tracking number'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Shipping Method: {selectedOrder.shippingMethod || 'Standard'}
                        </p>
                        {selectedOrder.estimatedDelivery && (
                          <p className="text-sm text-gray-500">
                            Est. Delivery: {formatDate(selectedOrder.estimatedDelivery)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="mt-8">
                  <div className="flex items-center mb-4">
                    <FaBox className="text-gray-500 mr-2" />
                    <h4 className="text-lg font-medium">Order Items</h4>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                          selectedOrder.items.map((item, index) => (
                            <tr key={item._id || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {item.image && (
                                    <div className="flex-shrink-0 h-10 w-10 mr-4">
                                      <img 
                                        className="h-10 w-10 rounded-md object-cover" 
                                        src={item.image} 
                                        alt={item.name} 
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.name}
                                    </div>
                                    {(item.color || item.size) && (
                                      <div className="text-xs text-gray-500">
                                        {item.color && `Color: ${item.color}`}
                                        {item.color && item.size && ` | `}
                                        {item.size && `Size: ${item.size}`}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {formatPrice(item.price)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                              No items found in this order
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Order Summary */}
                <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium mb-4">Order Summary</h4>
                  
                  {isEditMode ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                          <input
                            type="number"
                            className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                            name="subtotal"
                            value={editedOrder.subtotal || 0}
                            onChange={handleEditChange}
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
                          <input
                            type="number"
                            className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                            name="tax"
                            value={editedOrder.tax || 0}
                            onChange={handleEditChange}
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Shipping</label>
                          <input
                            type="number"
                            className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                            name="shipping"
                            value={editedOrder.shipping || 0}
                            onChange={handleEditChange}
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                          <input
                            type="number"
                            className="border border-gray-300 rounded-md px-3 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                            name="discount"
                            value={editedOrder.discount || 0}
                            onChange={handleEditChange}
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Subtotal:</span>
                        <span className="text-sm">{formatPrice(selectedOrder.subtotal || 0)}</span>
                      </div>
                      {selectedOrder.tax > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Tax:</span>
                          <span className="text-sm">{formatPrice(selectedOrder.tax)}</span>
                        </div>
                      )}
                      {selectedOrder.shipping > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Shipping:</span>
                          <span className="text-sm">{formatPrice(selectedOrder.shipping)}</span>
                        </div>
                      )}
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Discount:</span>
                          <span className="text-sm text-red-500">-{formatPrice(selectedOrder.discount)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                        <span>Total:</span>
                        <span>{formatPrice(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="border-t px-6 py-4 flex justify-end">
                {isEditMode ? (
                  <>
                    <button
                      className="mr-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none"
                      onClick={closeOrderModal}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none flex items-center"
                      onClick={handleSaveOrder}
                    >
                      <FaSave className="mr-1" /> Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="mr-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none flex items-center"
                      onClick={() => setIsEditMode(true)}
                    >
                      <FaPencilAlt className="mr-1" /> Edit
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none"
                      onClick={closeOrderModal}
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders; 