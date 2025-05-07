import { useState, useEffect } from 'react';
import { FaSearch, FaSort, FaFilter, FaEye, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { useAdminOrderStore } from '../../store/adminOrderStore';
import Sidebar from '../../components/admin/Sidebar';
import LoadingOverlay from '../../components/LoadingOverlay';
import axios from 'axios';
import apiConfig from '../../config/apiConfig';

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [apiTestResult, setApiTestResult] = useState(null);
  const ordersPerPage = 10;

  // Get orders from the store
  const {
    orders,
    filteredOrders,
    isLoading,
    error,
    fetchOrders,
    refreshOrdersIfNeeded,
    filterOrdersByStatus,
    searchOrders,
    getOrderStats
  } = useAdminOrderStore();

  // Test API connectivity directly
  const testApiConnectivity = async () => {
    try {
      console.log('🔍 [AdminOrders] Testing API connectivity');
      const token = localStorage.getItem('token');
      
      // Test the API test endpoint
      const testResponse = await axios.get(`${apiConfig.baseURL}/admin/test`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      
      console.log('✅ [AdminOrders] Test endpoint response:', testResponse.data);
      setApiTestResult({
        success: true,
        endpoint: 'test',
        data: testResponse.data
      });

      // Try the real orders endpoint
      const ordersResponse = await axios.get(`${apiConfig.baseURL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      
      console.log('✅ [AdminOrders] Orders endpoint response:', {
        success: ordersResponse.data.success,
        count: ordersResponse.data.count
      });
      
      setApiTestResult(prev => ({
        ...prev,
        ordersEndpoint: {
          success: true,
          count: ordersResponse.data.count
        }
      }));
      
    } catch (error) {
      console.error('❌ [AdminOrders] API test failed:', error);
      setApiTestResult({
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    }
  };

  // Load orders on initial render
  useEffect(() => {
    console.log('🔄 [AdminOrders] Initial load effect triggered');
    const loadOrders = async () => {
      console.log('🔄 [AdminOrders] Calling refreshOrdersIfNeeded()');
      try {
        const data = await refreshOrdersIfNeeded();
        console.log(`✅ [AdminOrders] refreshOrdersIfNeeded completed, received ${data?.length || 0} orders`);
      } catch (error) {
        console.error('❌ [AdminOrders] Error in refreshOrdersIfNeeded:', error);
      }
    };
    
    loadOrders();
  }, [refreshOrdersIfNeeded]);

  // Handle status filter changes
  useEffect(() => {
    console.log('🔍 [AdminOrders] Status filter changed to:', statusFilter);
    filterOrdersByStatus(statusFilter);
  }, [statusFilter, orders, filterOrdersByStatus]);

  // Handle search
  useEffect(() => {
    console.log('🔍 [AdminOrders] Search term changed:', searchTerm);
    if (searchTerm) {
      const delaySearch = setTimeout(() => {
        console.log('🔍 [AdminOrders] Executing search for:', searchTerm);
        searchOrders(searchTerm);
      }, 300);
      
      return () => clearTimeout(delaySearch);
    } else {
      console.log('🔍 [AdminOrders] Empty search term, applying status filter');
      filterOrdersByStatus(statusFilter);
    }
  }, [searchTerm, searchOrders, statusFilter, filterOrdersByStatus]);

  // Handle sorting
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format price for display
  const formatPrice = (price) => {
    return `GH₵${parseFloat(price).toFixed(2)}`;
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate pagination indices
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === 'createdAt') {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'totalAmount') {
      return sortDirection === 'asc' 
        ? a.totalAmount - b.totalAmount 
        : b.totalAmount - a.totalAmount;
    } else if (sortField === 'status') {
      return sortDirection === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    } else if (sortField === 'customerName') {
      return sortDirection === 'asc'
        ? a.customerName.localeCompare(b.customerName)
        : b.customerName.localeCompare(a.customerName);
    } else {
      return 0;
    }
  });

  // Get current orders for pagination
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  // Get order statistics
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
              <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Recent Orders (7d)</h3>
              <p className="text-2xl font-bold">{stats?.recentOrders || 0}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Recent Revenue (7d)</h3>
              <p className="text-2xl font-bold">{formatPrice(stats?.recentRevenue || 0)}</p>
            </div>
          </div>
          
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div className="relative w-full md:w-64">
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
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center">
                <FaFilter className="mr-2 text-gray-500" />
                <select
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                onClick={() => refreshOrdersIfNeeded(true)}
              >
                Refresh Orders
              </button>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Error loading orders:</h3>
              <p>{error}</p>
              <button 
                className="mt-2 text-sm px-3 py-1 bg-red-200 text-red-800 rounded-md hover:bg-red-300"
                onClick={() => {
                  console.log('🔄 [AdminOrders] Manual refresh triggered after error');
                  refreshOrdersIfNeeded(true);
                }}
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Network status debugging (only in development) */}
          {import.meta.env.DEV && (
            <div className="bg-gray-100 p-4 rounded-lg mb-6 text-sm">
              <h3 className="font-semibold mb-2">Debug Information:</h3>
              <div className="space-y-1">
                <p>API Status: {isLoading ? '🔄 Loading...' : error ? '❌ Error' : '✅ Success'}</p>
                <p>Orders in store: {orders.length}</p>
                <p>Orders filtered: {filteredOrders.length}</p>
                <p>Last fetch: {useAdminOrderStore.getState().lastFetched ? new Date(useAdminOrderStore.getState().lastFetched).toLocaleTimeString() : 'Never'}</p>
                <div className="flex gap-2 mt-2">
                  <button 
                    className="px-3 py-1 bg-blue-200 text-blue-800 rounded-md hover:bg-blue-300"
                    onClick={() => {
                      console.log('📝 [AdminOrders] Logging store state to console');
                      console.log('Store state:', useAdminOrderStore.getState());
                    }}
                  >
                    Log Store State
                  </button>
                  <button 
                    className="px-3 py-1 bg-green-200 text-green-800 rounded-md hover:bg-green-300"
                    onClick={() => {
                      console.log('🔄 [AdminOrders] Force refresh triggered');
                      refreshOrdersIfNeeded(true);
                    }}
                  >
                    Force Refresh
                  </button>
                  <button 
                    className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-md hover:bg-yellow-300"
                    onClick={testApiConnectivity}
                  >
                    Test API
                  </button>
                </div>
                
                {apiTestResult && (
                  <div className={`mt-3 p-2 text-xs rounded ${apiTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <h4 className="font-bold">API Test Results:</h4>
                    <pre className="mt-1 overflow-auto max-h-28">
                      {JSON.stringify(apiTestResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
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
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-sm text-gray-500">{order.customerEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{order.orderNumber}</div>
                          <div className="text-sm text-gray-500">{order.items.length} items</div>
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
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                            ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : ''}
                            ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${order.status === 'Processing' ? 'bg-purple-100 text-purple-800' : ''}
                            ${order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                            ${order.status === 'Refunded' ? 'bg-gray-100 text-gray-800' : ''}
                          `}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Order"
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
                        {isLoading ? 'Loading orders...' : 'No orders found'}
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
                      
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
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
      </div>
    </div>
  );
};

export default AdminOrders; 