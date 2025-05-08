import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orderInfo: null,
      paymentStatus: null,
      trackingInfo: null,
      orders: [], // Store user orders
      selectedOrder: null, // Track the currently selected order for view/edit
      
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
        if (!exists) {
          set({ orders: [order, ...orders] });
        }
      },
      
      getOrders: () => get().orders,
      
      clearOrders: () => set({ orders: [] }),

      // Initialize with sample order data
      initializeWithSampleOrder: () => {
        const sampleOrder = {
          _id: "681af6563e9cdf9c37a86fea",
          orderNumber: "ORD-1746597441691",
          user: "6785e68c70b5db143ffb765a",
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
              _id: "681af6563e9cdf9c37a86feb"
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
            transactionId: "REF-1746597459703",
            status: "completed",
            cardDetails: {
              brand: "Visa",
              last4: "4242"
            }
          },
          subtotal: 85,
          tax: 12.75,
          shipping: 15.99,
          discount: 8.5,
          totalAmount: 85,
          status: "Processing",
          trackingNumber: "RG787623152DS",
          shippingMethod: "express",
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          receiptId: "RCP-849776",
          customerEmail: "owusukenneth77@gmail.com",
          customerName: "Customer",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set({ orders: [sampleOrder] });
      },

      // New functions for selected order
      selectOrder: (orderId) => {
        const orders = get().orders;
        const order = orders.find(o => o._id === orderId);
        set({ selectedOrder: order || null });
      },
      
      clearSelectedOrder: () => set({ selectedOrder: null }),
      
      getSelectedOrder: () => get().selectedOrder,

      // Add update order function
      updateOrder: (orderId, updatedData) => {
        const orders = get().orders;
        const updatedOrders = orders.map(order => 
          order._id === orderId ? { ...order, ...updatedData, updatedAt: new Date().toISOString() } : order
        );
        
        set({ 
          orders: updatedOrders,
          // If the selected order is being updated, update that too
          selectedOrder: get().selectedOrder?._id === orderId 
            ? { ...get().selectedOrder, ...updatedData, updatedAt: new Date().toISOString() } 
            : get().selectedOrder
        });
        
        return updatedOrders.find(order => order._id === orderId);
      },

      // Convenience function to just update status
      updateOrderStatus: (orderId, newStatus) => {
        return get().updateOrder(orderId, { status: newStatus });
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