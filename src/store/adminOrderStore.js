import { create } from 'zustand';
import axios from 'axios';

export const useAdminOrderStore = create((set, get) => ({
  // Store state
  orders: [],
  filteredOrders: [],
  isLoading: false,
  error: null,
  lastFetched: null,
  
  // Get all orders from API
  fetchOrders: async () => {
    try {
      console.log('🔍 [adminOrderStore] Starting fetchOrders...');
      set({ isLoading: true, error: null });
      
      const token = localStorage.getItem('token');
      console.log('🔑 [adminOrderStore] Token available:', !!token);
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Use environment-aware API URL
      const API_URL = import.meta.env.PROD 
        ? 'https://sinosply-backend.onrender.com/api/v1/admin/orders'
        : 'http://localhost:5000/api/v1/admin/orders';
      
      console.log('📡 [adminOrderStore] Sending request to:', API_URL);
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 10000 // Add 10 second timeout
      }).catch(error => {
        console.error('❌ [adminOrderStore] Network error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        throw error;
      });
      
      console.log('✅ [adminOrderStore] Response received:', {
        success: response.data.success,
        count: response.data.count,
        dataLength: response.data.data?.length
      });
      
      if (response.data.success) {
        console.log('💾 [adminOrderStore] Storing', response.data.data?.length, 'orders in store');
        set({ 
          orders: response.data.data, 
          filteredOrders: response.data.data,
          lastFetched: new Date(),
          isLoading: false 
        });
        return response.data.data;
      } else {
        console.error('❌ [adminOrderStore] API reported failure:', response.data.error);
        throw new Error(response.data.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('❌ [adminOrderStore] Error fetching orders:', error);
      set({ 
        error: error.response?.data?.error || error.message, 
        isLoading: false 
      });
      return [];
    }
  },
  
  // Refresh orders if needed (based on time threshold or force refresh)
  refreshOrdersIfNeeded: async (forceRefresh = false) => {
    console.log('🔄 [adminOrderStore] refreshOrdersIfNeeded called with forceRefresh:', forceRefresh);
    
    const { orders, lastFetched } = get();
    console.log('📊 [adminOrderStore] Current cache state:', { 
      ordersCount: orders.length, 
      lastFetched: lastFetched?.toISOString() || 'never'
    });
    
    // If no orders or force refresh, fetch orders
    if (orders.length === 0 || forceRefresh) {
      console.log('🔄 [adminOrderStore] Cache empty or force refresh requested');
      return get().fetchOrders();
    }
    
    // Check if data is stale (older than 5 minutes)
    const now = new Date();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    if (!lastFetched || now - lastFetched > staleThreshold) {
      console.log('🕒 [adminOrderStore] Cache is stale, refreshing data');
      return get().fetchOrders();
    }
    
    console.log('✅ [adminOrderStore] Using cached data');
    return orders;
  },
  
  // Filter orders by status
  filterOrdersByStatus: (status) => {
    const { orders } = get();
    
    if (!status || status === 'all') {
      set({ filteredOrders: orders });
    } else {
      set({ 
        filteredOrders: orders.filter(order => order.status.toLowerCase() === status.toLowerCase())
      });
    }
    
    return get().filteredOrders;
  },
  
  // Search orders by order number, customer name, or email
  searchOrders: (searchTerm) => {
    const { orders } = get();
    
    if (!searchTerm) {
      set({ filteredOrders: orders });
    } else {
      const term = searchTerm.toLowerCase();
      set({
        filteredOrders: orders.filter(order => 
          order.orderNumber.toLowerCase().includes(term) ||
          order.customerName.toLowerCase().includes(term) ||
          order.customerEmail.toLowerCase().includes(term) ||
          (order.trackingNumber && order.trackingNumber.toLowerCase().includes(term))
        )
      });
    }
    
    return get().filteredOrders;
  },
  
  // Get order by ID
  getOrderById: (orderId) => {
    const { orders } = get();
    return orders.find(order => order._id === orderId);
  },
  
  // Get order by order number
  getOrderByNumber: (orderNumber) => {
    const { orders } = get();
    return orders.find(order => order.orderNumber === orderNumber);
  },
  
  // Update order status
  updateOrderStatus: async (orderId, newStatus) => {
    try {
      set({ isLoading: true, error: null });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.patch(
        `http://localhost:5000/api/v1/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Update order in the local cache
        const { orders } = get();
        const updatedOrders = orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        );
        
        set({ 
          orders: updatedOrders,
          filteredOrders: updatedOrders,
          isLoading: false 
        });
        
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      set({ 
        error: error.response?.data?.error || error.message, 
        isLoading: false 
      });
      return false;
    }
  },
  
  // Update order tracking information
  updateOrderTracking: async (orderId, trackingNumber, shippingMethod, estimatedDelivery) => {
    try {
      set({ isLoading: true, error: null });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const updateData = {
        trackingNumber,
        shippingMethod,
        estimatedDelivery: new Date(estimatedDelivery)
      };
      
      const response = await axios.patch(
        `http://localhost:5000/api/v1/admin/orders/${orderId}/tracking`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Update order in the local cache
        const { orders } = get();
        const updatedOrders = orders.map(order => 
          order._id === orderId ? { ...order, ...updateData } : order
        );
        
        set({ 
          orders: updatedOrders,
          filteredOrders: updatedOrders,
          isLoading: false 
        });
        
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to update tracking information');
      }
    } catch (error) {
      console.error('Error updating tracking information:', error);
      set({ 
        error: error.response?.data?.error || error.message, 
        isLoading: false 
      });
      return false;
    }
  },
  
  // Get order statistics
  getOrderStats: () => {
    const { orders } = get();
    
    // Calculate order statistics
    const totalOrders = orders.length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const statusCounts = orders.reduce((counts, order) => {
      const status = order.status.toLowerCase();
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});
    
    // Orders in the last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= sevenDaysAgo;
    });
    
    const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    return {
      totalOrders,
      totalRevenue,
      statusCounts,
      recentOrders: recentOrders.length,
      recentRevenue
    };
  },
  
  // Clear store
  clearStore: () => {
    set({
      orders: [],
      filteredOrders: [],
      isLoading: false,
      error: null,
      lastFetched: null
    });
  }
})); 