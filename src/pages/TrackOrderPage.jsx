import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Truck, 
  Package, 
  MapPin, 
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Share2,
  Phone,
  Printer
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useOrderStore } from '../store/orderStore';

const TrackOrderPage = () => {
  const { trackingNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const orderStore = useOrderStore();
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [packageHistory, setPackageHistory] = useState([]);
  
  // Backend API URL - Fixed for Vite
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  
  // Mock delivery statuses and their corresponding stages
  const deliveryStages = [
    { key: 'order_placed', label: 'Order Placed', icon: <CheckCircle size={22} /> },
    { key: 'processing', label: 'Processing', icon: <Package size={22} /> },
    { key: 'shipped', label: 'Shipped', icon: <Truck size={22} /> },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: <MapPin size={22} /> },
    { key: 'delivered', label: 'Delivered', icon: <CheckCircle size={22} /> }
  ];
  
  useEffect(() => {
    // Use orderInfo from location.state or Zustand store
    const infoFromState = location.state?.orderInfo || orderStore.orderInfo;
    console.log("Initial data:", { 
      fromState: !!location.state?.orderInfo, 
      fromStore: !!orderStore.orderInfo,
      trackingNumber
    });

    // If we have state data, use it immediately
    if (infoFromState) {
      console.log("Using order info from state:", infoFromState);
      setOrderInfo(infoFromState);
      mapStatusToDeliveryStage(infoFromState.status || 'processing');
    } else {
      console.log("No state data available, will fetch from API");
    }
    
    // Always fetch the latest data from the API regardless
    fetchOrderByTracking(trackingNumber);
  }, [trackingNumber, location.state, orderStore.orderInfo]);
  
  // Map backend status to our frontend delivery stages
  const mapStatusToDeliveryStage = (status) => {
    let mappedStage;
    
    switch(status?.toLowerCase()) {
      case 'pending':
        mappedStage = 'order_placed';
        break;
      case 'processing':
        mappedStage = 'processing';
        break;
      case 'shipped':
        mappedStage = 'shipped';
        break;
      case 'delivered':
        mappedStage = 'delivered';
        break;
      default:
        mappedStage = 'processing';
    }
    
    console.log("Mapping status to stage:", { status, mappedStage });
    setCurrentStatus(mappedStage);
    
    // Generate mock package history based on the status
    const statusIndex = deliveryStages.findIndex(stage => stage.key === mappedStage);
    generatePackageHistory(statusIndex);
  };
  
  // Fetch order data from the API using tracking number
  const fetchOrderByTracking = async (tracking) => {
    if (!tracking) {
      console.error("No tracking number provided");
      setError('No tracking number provided. Please try again with a valid tracking number.');
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // For demo purposes: First attempt to get data from the store
      // This ensures we use real checkout data when available
      const storeOrder = orderStore.orderInfo;
      
      // If we have valid order data from store and matching tracking/order number
      if (storeOrder && 
          (storeOrder.orderNumber === tracking || 
           storeOrder.trackingNumber === tracking)) {
        
        console.log("Using order data from store:", storeOrder);
        
        // Get formatted shipping address using the store helper
        const formattedShippingAddress = orderStore.getFormattedShippingAddress() || {
          name: 'Customer',
          street: '',
          addressLine2: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          phone: ''
        };
        
        // Format the order from store
        const orderData = {
          ...storeOrder,
          trackingNumber: storeOrder.trackingNumber,
          // Use formatted shipping address from store
          shippingAddress: formattedShippingAddress,
          // Ensure we have items for display
          items: storeOrder.items || []
        };
        
        setOrderInfo(orderData);
        mapStatusToDeliveryStage(orderData.status || 'processing');
        setLoading(false);
        return;
      }
      
      // If no valid data in store or API, try using tracked info from location state
      const infoFromState = location.state?.orderInfo;
      if (infoFromState) {
        console.log("Using order data from navigation state:", infoFromState);
        setOrderInfo(infoFromState);
        mapStatusToDeliveryStage(infoFromState.status || 'processing');
        setLoading(false);
        return;
      }
      
      // If no valid data in store or state, try API or use mock data
      console.log("No matching order in store, using mock data");
      
      // For a real app, uncomment this:
      // const response = await axios.get(`${API_URL}/orders/track/${tracking}`);
      // const orderData = response.data.data;
      
      // Mock response for development
      const orderData = createMockOrderData(tracking);
      
      // If successful, update state with API data
      if (orderData) {
        console.log("Setting order info with mock data:", orderData);
        setOrderInfo(prev => ({
          ...prev,
          ...orderData,
          // Format dates for display if they aren't already
          orderDate: orderData.formattedOrderDate || new Date(orderData.createdAt || new Date()).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          estimatedDelivery: orderData.estimatedDelivery
            ? new Date(orderData.estimatedDelivery).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Not available'
        }));
        
        mapStatusToDeliveryStage(orderData.status || 'processing');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching order:', err);
      // If API fails but we have state data, keep using that
      if (!orderInfo) {
        setError('Unable to fetch tracking information. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to create mock order data for development
  const createMockOrderData = (trackingNumber) => {
    // Calculate dates
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - 2); // 2 days ago
    
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3); // 3 days from now
    
    // Generate mock tracking data
    return {
      id: `ORDER-${Math.floor(Math.random() * 1000000)}`,
      orderNumber: trackingNumber,
      trackingNumber: `TRK${Math.floor(Math.random() * 10000000000)}`,
      status: 'processing',
      createdAt: orderDate.toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
      shippingMethod: 'Standard Shipping',
      items: [
        {
          name: 'Fashion Dress',
          price: 99.99,
          quantity: 1,
          image: 'https://via.placeholder.com/150',
          size: 'M',
          color: 'Black',
        },
      ],
      shippingAddress: {
        name: 'Jane Doe',
        street: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        country: 'USA',
        phone: '+12345678900'
      }
    };
  };
  
  // Generate mock package history based on current status
  const generatePackageHistory = (currentStageIndex) => {
    const history = [];
    const now = new Date();
    
    // Add history entries for each stage up to the current one
    for (let i = 0; i <= currentStageIndex; i++) {
      const stage = deliveryStages[i];
      const eventDate = new Date(now);
      eventDate.setDate(now.getDate() - (currentStageIndex - i));
      
      // Add random hours to make times different
      eventDate.setHours(9 + Math.floor(Math.random() * 8));
      eventDate.setMinutes(Math.floor(Math.random() * 60));
      
      let location, description;
      
      switch (stage.key) {
        case 'order_placed':
          location = 'Online';
          description = 'Your order has been received and is being prepared.';
          break;
        case 'processing':
          location = 'Warehouse, CA';
          description = 'Your order is being prepared for shipment.';
          break;
        case 'shipped':
          location = 'Distribution Center, NV';
          description = 'Your package has been shipped and is on its way.';
          break;
        case 'out_for_delivery':
          location = 'Local Carrier Facility';
          description = 'Your package is out for delivery today.';
          break;
        case 'delivered':
          location = 'Delivery Address';
          description = 'Your package has been delivered.';
          break;
        default:
          location = 'Unknown';
          description = 'Status update';
      }
      
      history.push({
        status: stage.key,
        label: stage.label,
        timestamp: eventDate,
        location,
        description
      });
    }
    
    // Sort history with newest events first
    history.sort((a, b) => b.timestamp - a.timestamp);
    setPackageHistory(history);
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Determine if a stage is completed, active, or upcoming
  const getStageStatus = (stageKey) => {
    const stageIndex = deliveryStages.findIndex(stage => stage.key === stageKey);
    const currentIndex = deliveryStages.findIndex(stage => stage.key === currentStatus);
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'upcoming';
  };
  
  // Handle back button click
  const handleBack = () => {
    navigate(-1);
  };
  
  // Handle print tracking info
  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error || !orderInfo) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 min-h-[60vh] flex flex-col items-center justify-center">
          <AlertCircle size={40} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Tracking Information Not Found</h1>
          <p className="text-gray-600 mb-6">{error || `We couldn't find any information for tracking number ${trackingNumber}.`}</p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 mb-16">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Order Details
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Track Your Order</h1>
              <p className="text-gray-600">Order #{orderInfo.orderNumber || orderInfo.id}</p>
            </div>
            
            <div className="flex mt-4 sm:mt-0 space-x-2">
              <button 
                onClick={handlePrint}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                title="Print tracking information"
              >
                <Printer size={18} />
              </button>
              <button 
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                title="Share tracking information"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Order Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="px-6 py-5 border-b">
            <div className="flex flex-col sm:flex-row text-sm gap-4 sm:gap-8">
              <div>
                <p className="text-gray-500">Tracking Number</p>
                <p className="font-medium">{orderInfo.trackingNumber}</p>
              </div>
              <div>
                <p className="text-gray-500">Carrier</p>
                <p className="font-medium">{orderInfo.shippingMethod || 'Standard Shipping'}</p>
              </div>
              <div>
                <p className="text-gray-500">Order Date</p>
                <p className="font-medium">{orderInfo.orderDate}</p>
              </div>
              <div>
                <p className="text-gray-500">Estimated Delivery</p>
                <p className="font-medium">{orderInfo.estimatedDelivery}</p>
              </div>
            </div>
          </div>
          
          {/* Progress Tracker */}
          <div className="px-6 py-5">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Status</h2>
            
            <div className="relative">
              {/* Progress Bar */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
                <div 
                  className="h-full bg-blue-600"
                  style={{ 
                    width: `${(deliveryStages.findIndex(stage => stage.key === currentStatus) / (deliveryStages.length - 1)) * 100}%` 
                  }}
                ></div>
              </div>
              
              {/* Status Points */}
              <div className="relative flex justify-between">
                {deliveryStages.map((stage, index) => {
                  const status = getStageStatus(stage.key);
                  return (
                    <div key={stage.key} className="flex flex-col items-center z-10">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
                          ${status === 'completed' ? 'bg-blue-600 text-white' : 
                            status === 'active' ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' : 
                            'bg-gray-100 text-gray-400'}`}
                      >
                        {stage.icon}
                      </div>
                      <div className="text-center">
                        <p className={`text-xs font-medium 
                          ${status !== 'upcoming' ? 'text-gray-900' : 'text-gray-500'}`}
                        >
                          {stage.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Package History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-5 border-b">
            <h2 className="text-lg font-medium text-gray-900">Tracking History</h2>
          </div>
          
          <div className="divide-y">
            {packageHistory.map((event, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-start">
                  <div className="w-10 flex-shrink-0 flex justify-center pt-1">
                    {event.status === currentStatus ? (
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Clock size={14} />
                      </div>
                    ) : (
                      <div className="w-2 h-2 mt-2 rounded-full bg-gray-400"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900">{event.label}</h3>
                      <p className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</p>
                    </div>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Location: {event.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Shipping Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-5 border-b">
            <h2 className="text-lg font-medium text-gray-900">Shipping Information</h2>
          </div>
          
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Address */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-1.5">
                <MapPin size={16} className="text-gray-500" />
                Delivery Address
              </h3>
              <div className="text-sm text-gray-600">
                {orderInfo?.shippingAddress ? (
                  <>
                    <p className="font-medium">{orderInfo.shippingAddress.name}</p>
                    <p>{orderInfo.shippingAddress.street}</p>
                    {orderInfo.shippingAddress.addressLine2 && (
                      <p>{orderInfo.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {orderInfo.shippingAddress.city}
                      {orderInfo.shippingAddress.state && `, ${orderInfo.shippingAddress.state}`} 
                      {orderInfo.shippingAddress.zip && ` ${orderInfo.shippingAddress.zip}`}
                    </p>
                    <p>{orderInfo.shippingAddress.country}</p>
                    {orderInfo.shippingAddress.phone && (
                      <p className="mt-2 text-gray-500">
                        <Phone size={14} className="inline mr-1" />
                        {orderInfo.shippingAddress.phone}
                      </p>
                    )}
                  </>
                ) : (
                  <p>Address information not available</p>
                )}
              </div>
            </div>
            
            {/* Items */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-1.5">
                <Package size={16} className="text-gray-500" />
                Package Items
              </h3>
              {orderInfo?.items && orderInfo.items.length > 0 ? (
                <ul className="text-sm text-gray-600 space-y-2">
                  {orderInfo.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="text-gray-500">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No items available</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b">
            <h2 className="text-lg font-medium text-gray-900">Need Help?</h2>
          </div>
          
          <div className="px-6 py-5">
            <p className="text-sm text-gray-600 mb-4">If you have any questions about your shipment, please contact our customer service.</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="tel:+1234567890" 
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Phone size={16} />
                Call Support
              </a>
              
              <button 
                onClick={() => navigate('/contact')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors"
              >
                Contact Us
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TrackOrderPage; 