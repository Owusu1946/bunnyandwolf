import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import apiConfig from '../config/apiConfig.js';

// Add detailed logging to the order update notification system
const orderUpdateListeners = new Set();

// Function to notify all listeners about order updates
const notifyOrderUpdate = (updatedOrder) => {
  console.log(`[OrderStore] Notifying ${orderUpdateListeners.size} listeners about order update:`, updatedOrder.orderNumber, updatedOrder.status);
  
  if (orderUpdateListeners.size === 0) {
    console.warn('[OrderStore] No listeners registered for order updates');
  }
  
  orderUpdateListeners.forEach(listener => {
    try {
      console.log('[OrderStore] Calling listener with updated order');
      listener(updatedOrder);
    } catch (err) {
      console.error('[OrderStore] Error in order update listener:', err);
    }
  });
};

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orderInfo: null,
      paymentStatus: null,
      trackingInfo: null,
      orders: [], // Store user orders
      selectedOrder: null, // Track the currently selected order for view/edit
      
      // New methods for update notification
      subscribeToOrderUpdates: (callback) => {
        if (typeof callback !== 'function') {
          console.error('[OrderStore] Attempted to subscribe with invalid callback:', callback);
          return () => {}; // Return no-op unsubscribe
        }
        
        console.log('[OrderStore] Adding new order update listener');
        orderUpdateListeners.add(callback);
        console.log(`[OrderStore] Current listener count: ${orderUpdateListeners.size}`);
        
        // Return unsubscribe function
        return () => {
          console.log('[OrderStore] Removing order update listener');
          orderUpdateListeners.delete(callback);
          console.log(`[OrderStore] Remaining listener count: ${orderUpdateListeners.size}`);
        };
      },
      
      // Fetch all orders from the API
      fetchOrders: async () => {
        try {
          // Get token from localStorage
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No token found, cannot fetch orders');
            return { success: false, error: 'Authentication required' };
          }
          
          console.log('Fetching all orders from API...');
          
          // First, get the total count to determine how many pages we need
          const countResponse = await axios.get(`${apiConfig.baseURL}/orders`, {
            params: { page: 1, limit: 1 }, // Just fetch one record to get the total count
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (!countResponse.data.success) {
            throw new Error('Failed to get order count');
          }
          
          const totalOrders = countResponse.data.total || 0;
          const limit = 20; // Match backend limit
          const totalPages = Math.ceil(totalOrders / limit);
          
          console.log(`Found ${totalOrders} total orders, fetching all pages (${totalPages} pages)...`);
          
          // Track all orders
          let allOrders = [];
          
          // Fetch all pages
          for (let page = 1; page <= totalPages; page++) {
            const response = await axios.get(`${apiConfig.baseURL}/orders`, {
              params: { page, limit },
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (response.data.success && response.data.data) {
              allOrders = [...allOrders, ...response.data.data];
              console.log(`Fetched page ${page}/${totalPages} with ${response.data.data.length} orders`);
            }
          }
          
          console.log(`Successfully fetched all ${allOrders.length} orders`);
          
          // Update store with all fetched orders
          set({ orders: allOrders });
          
          return { success: true, data: allOrders };
        } catch (error) {
          console.error('Error fetching orders:', error);
          return { success: false, error: error.message };
        }
      },
      
      setOrderInfo: (orderInfo) => {
        // Create a tracking number if not provided
        const orderWithTracking = {
          ...orderInfo,
          trackingNumber: orderInfo.trackingNumber || `TRK${Math.floor(Math.random() * 10000000000)}`,
          // Ensure order data has the required formats for display
          items: Array.isArray(orderInfo.products) 
            ? orderInfo.products.map(p => ({
                id: p.id || `PROD-${Math.random().toString(36).substr(2, 9)}`,
                name: p.name,
                price: p.price,
                quantity: p.quantity,
                image: p.image,
                variant: p.variant || { color: p.colorName, size: p.size }
              }))
            : []
        };
        
        set({ orderInfo: orderWithTracking });
      },
      
      clearOrderInfo: () => set({ orderInfo: null }),
      
      setPaymentStatus: (paymentStatus) => set({ paymentStatus }),
      
      clearPaymentStatus: () => set({ paymentStatus: null }),
      
      setTrackingInfo: (trackingInfo) => set({ trackingInfo }),
      
      clearTrackingInfo: () => set({ trackingInfo: null }),
      
      // Formats the shipping address in the expected format for tracking
      getFormattedShippingAddress: () => {
        const { orderInfo } = get();
        if (!orderInfo || !orderInfo.shippingAddress) return null;
        
        const { shippingAddress, contactInfo } = orderInfo;
        
        return {
          name: `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || 'Customer',
          street: shippingAddress.address1 || '',
          addressLine2: shippingAddress.address2 || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          zip: shippingAddress.zip || shippingAddress.zipCode || '',
          country: shippingAddress.country || '',
          phone: contactInfo?.phone || ''
        };
      },

      // New functions for orders
      setOrders: (orders) => set({ orders }),
      
      addOrder: (order) => {
        const orders = get().orders;
        // Check if order already exists
        const exists = orders.some(o => o._id === order._id || o.orderNumber === order.orderNumber);
        
        // Ensure the order has correct user ID fields
        const orderWithUser = { ...order };
        
        // If either userId or user is set, ensure both are set consistently
        if (orderWithUser.userId && !orderWithUser.user) {
          orderWithUser.user = orderWithUser.userId;
        } else if (orderWithUser.user && !orderWithUser.userId) {
          orderWithUser.userId = orderWithUser.user;
        }
        
        console.log('OrderStore - Adding order:', { 
          order: orderWithUser, 
          exists, 
          currentOrdersCount: orders.length 
        });
        
        if (!exists) {
          set({ orders: [orderWithUser, ...orders] });
          console.log('OrderStore - Order added, new count:', get().orders.length);
        } else {
          console.log('OrderStore - Order already exists, not adding');
        }
      },
      
      getOrders: () => {
        const orders = get().orders;
        console.log('OrderStore - Getting all orders:', { 
          count: orders.length,
          orders
        });
        return orders;
      },
      
      // Get orders for a specific user
      getUserOrders: (userId, userEmail) => {
        if (!userId && !userEmail) return [];
        
        const orders = get().orders;
        return orders.filter(order => {
          return (
            (userId && order.userId === userId) ||
            (userId && order.user === userId) ||
            (userEmail && order.customerEmail === userEmail)
          );
        });
      },

      // Ensure all orders have consistent user ID fields
      fixOrderUserIds: () => {
        const orders = get().orders;
        console.log('OrderStore - Fixing order user IDs for consistency');
        
        let hasChanges = false;
        const fixedOrders = orders.map(order => {
          const updatedOrder = { ...order };
          let updated = false;
          
          // If userId exists but user doesn't, copy userId to user
          if (updatedOrder.userId && !updatedOrder.user) {
            console.log(`OrderStore - Setting user field for order ${updatedOrder.orderNumber || updatedOrder._id}`);
            updatedOrder.user = updatedOrder.userId;
            updated = true;
          }
          // If user exists but userId doesn't, copy user to userId
          else if (updatedOrder.user && !updatedOrder.userId) {
            console.log(`OrderStore - Setting userId field for order ${updatedOrder.orderNumber || updatedOrder._id}`);
            updatedOrder.userId = updatedOrder.user;
            updated = true;
          }
          
          hasChanges = hasChanges || updated;
          return updatedOrder;
        });
        
        // Only update state if changes were made
        if (hasChanges) {
          set({ orders: fixedOrders });
          console.log('OrderStore - Fixed order IDs, count:', fixedOrders.length);
        } else {
          console.log('OrderStore - No fixes needed for order IDs');
        }
        
        return fixedOrders;
      },
      
      clearOrders: () => {
        console.log('OrderStore - Clearing all orders');
        set({ orders: [] });
      },

      // Initialize with sample order data
      initializeWithSampleOrder: (userId = null, userEmail = null) => {
        console.log('OrderStore - Initializing with sample order for user:', { userId, userEmail });
        const sampleOrder = {
          _id: "sample-" + Date.now(),
          orderNumber: "ORD-" + Math.floor(10000 + Math.random() * 90000),
          userId: userId || "6785e68c70b5db143ffb765a",
          user: userId || "6785e68c70b5db143ffb765a",
          items: [
            {
              productId: "17",
              name: "RUBY MINI DRESS",
              price: 85,
              quantity: 1,
              image: "https://us.princesspolly.com/cdn/shop/files/1-modelinfo-natalya-us2_b42cca63-08ff-4834-8df0-6d0388fbd998.jpg?v=1737510316",
              sku: "",
              color: "",
              size: "",
              _id: "sample-item-" + Date.now()
            }
          ],
          shippingAddress: {
            name: "Customer",
            street: "123 Example Street",
            city: "TAMALE",
            state: "bbb",
            zip: "00233",
            country: "Ghana",
            phone: "233559182794"
          },
          billingAddress: {
            city: "TAMALE",
            state: "bbb",
            zip: "00233",
            country: "Ghana"
          },
          paymentMethod: "Mobile Money",
          paymentDetails: {
            transactionId: "REF-" + Date.now(),
            status: "completed",
            cardDetails: {
              brand: "Visa",
              last4: "4242"
            }
          },
          // Add sample payment receipt
          paymentReceipt: {
            type: 'link',
            imageData: '',
            link: 'https://pay.chippercash.com/api/pdfs/receipt?ref=SAMPLE-RECEIPT',
            uploadedAt: new Date().toISOString()
          },
          subtotal: 85,
          tax: 12.75,
          shipping: 15.99,
          discount: 8.5,
          totalAmount: 85,
          status: "Processing",
          trackingNumber: "RG" + Math.floor(100000 + Math.random() * 900000) + "DS",
          shippingMethod: "express",
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          receiptId: "RCP-" + Math.floor(100000 + Math.random() * 900000),
          customerEmail: userEmail || "customer@example.com",
          customerName: "Customer",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        console.log('OrderStore - Created sample order:', sampleOrder);
        set({ orders: [sampleOrder] });
        console.log('OrderStore - Store updated with sample order');
      },

      // New functions for selected order
      selectOrder: (orderId) => {
        const orders = get().orders;
        const order = orders.find(o => o._id === orderId);
        set({ selectedOrder: order || null });
      },
      
      clearSelectedOrder: () => set({ selectedOrder: null }),
      
      getSelectedOrder: () => get().selectedOrder,

      // Add update order function with support for nested objects
      updateOrder: (orderId, updatedData) => {
        const orders = get().orders;
        
        // Helper function to handle deep merging of nested objects
        const deepMerge = (target, source) => {
          const output = {...target};
          
          if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach(key => {
              if (isObject(source[key])) {
                if (!(key in target)) {
                  output[key] = source[key];
                } else {
                  output[key] = deepMerge(target[key], source[key]);
                }
              } else {
                output[key] = source[key];
              }
            });
          }
          
          return output;
        };
        
        // Check if value is an object
        function isObject(item) {
          return (item && typeof item === 'object' && !Array.isArray(item));
        }
        
        const updatedOrders = orders.map(order => {
          if (order._id === orderId) {
            // Create a deep merged version of the order
            const updatedOrder = deepMerge(order, updatedData);
            // Always update the timestamp
            updatedOrder.updatedAt = new Date().toISOString();
            
            // Trigger notifications about this update
            notifyOrderUpdate(updatedOrder);
            
            return updatedOrder;
          }
          return order;
        });
        
        // Check if we need to update selectedOrder too
        const selectedOrder = get().selectedOrder;
        const updatedSelectedOrder = selectedOrder && selectedOrder._id === orderId 
          ? deepMerge(selectedOrder, {...updatedData, updatedAt: new Date().toISOString()}) 
          : selectedOrder;
        
        // Update the state
        set({ 
          orders: updatedOrders,
          selectedOrder: updatedSelectedOrder
        });
        
        return updatedOrders.find(order => order._id === orderId);
      },

      // Convenience function to just update status
      updateOrderStatus: (orderId, newStatus) => {
        console.log(`[OrderStore] Updating order status for order ${orderId} to ${newStatus}`);
        
        // Update order in store
        const updatedOrder = get().updateOrder(orderId, { status: newStatus });
        if (!updatedOrder) {
          console.error(`[OrderStore] Failed to update order ${orderId} status to ${newStatus}`);
          return null;
        }
        
        console.log(`[OrderStore] Order ${orderId} status updated to ${newStatus} in store`);
        
        // Log notification count - for debugging
        console.log(`[OrderStore] Notifying subscribers about order status change`);
        
        // Try to update on server if possible - don't wait for response
        const syncToServer = async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              console.warn('[OrderStore] No auth token found, cannot sync to server');
              return false;
            }
            
            console.log(`[OrderStore] Syncing order status to server: ${orderId} -> ${newStatus}`);
            
            await axios.put(
              `${apiConfig.baseURL}/orders/${orderId}/status`,
              { status: newStatus },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log(`[OrderStore] Order status synced to server successfully: ${orderId} -> ${newStatus}`);
            return true;
          } catch (error) {
            console.error('[OrderStore] Failed to sync order status to server:', error);
            return false;
          }
        };
        
        // Fire and forget - don't block UI
        syncToServer();
        
        return updatedOrder;
      },
    }),
    {
      name: 'sinosply-order-storage',
      partialize: (state) => ({ 
        orderInfo: state.orderInfo,
        trackingInfo: state.trackingInfo,
        orders: state.orders,
        selectedOrder: state.selectedOrder // Also persist selectedOrder
      })
    }
  )
); 