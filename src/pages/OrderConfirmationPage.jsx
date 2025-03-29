import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Truck, 
  ShoppingBag, 
  Calendar, 
  ChevronRight, 
  Home,
  CreditCard,
  MapPin,
  Download,
  Share2,
  X,
  Printer,
  Mail,
  Copy,
  Package,
  User,
  Clock,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  Phone
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ToastManager';
import OrderDetailsModal from '../components/OrderDetailsModal';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [downloadType, setDownloadType] = useState('pdf'); // 'pdf' or 'image'
  const [copySuccess, setCopySuccess] = useState('');
  const [activeTab, setActiveTab] = useState('items');
  const receiptRef = useRef(null);
  const { clearCart } = useCart();
  const { success } = useToast();
  const hasInitializedRef = useRef(false); // Track whether we've already initialized
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // API URL - Fixed for Vite
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  
  // Generate a random tracking number
  const generateTrackingNumber = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let trackingNumber = '';
    
    // Add 2 letters
    for (let i = 0; i < 2; i++) {
      trackingNumber += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Add 9 numbers
    for (let i = 0; i < 9; i++) {
      trackingNumber += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    // Add 2 more letters
    for (let i = 0; i < 2; i++) {
      trackingNumber += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    return trackingNumber;
  };
  
  // Format date to display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate estimated delivery date (5-7 business days from today)
  const calculateEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 5 + Math.floor(Math.random() * 3)); // 5-7 days
    
    return formatDate(deliveryDate);
  };
  
  // Generate unique receipt ID
  const generateReceiptId = () => {
    return 'RCP-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  };
  
  // Format price for display
  const formatPrice = (price) => {
    // Handle various input formats
    if (price === undefined || price === null) return '$0.00';
    
    // If already formatted with a currency symbol, return as-is
    if (typeof price === 'string' && (price.trim().startsWith('$') || price.trim().startsWith('€'))) {
      return price;
    }
    
    // Try to convert to a number
    const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g, '')) : price;
    
    // Check if conversion resulted in a valid number
    if (isNaN(numericPrice)) return '$0.00';
    
    // Format as currency
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericPrice);
  };
  
  // Save order to backend
  const saveOrderToBackend = async (orderData) => {
    try {
      setIsSavingOrder(true);
      
      // Generate an order number if not provided
      const orderNumber = orderData.orderNumber || orderData.id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Ensure shipping address is complete
      const shippingAddress = {
        name: orderData.shippingAddress?.name || orderData.customer?.name || 'Customer',
        street: orderData.shippingAddress?.street || '123 Example Street',
        city: orderData.shippingAddress?.city || 'Sample City',
        state: orderData.shippingAddress?.state || 'State',
        zip: orderData.shippingAddress?.zip || '12345',
        country: orderData.shippingAddress?.country || 'Country',
        phone: orderData.shippingAddress?.phone || orderData.customer?.phone || '+1 (555) 123-4567'
      };
      
      // Ensure billing address is complete (use shipping if missing)
      const billingAddress = orderData.billingAddress || {
        name: shippingAddress.name,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
        country: shippingAddress.country
      };
      
      // Get user ID from auth context first, then from order data, with proper fallback
      const userId = user?.id || orderData.userId || null;
      
      // Format data for the API
      const apiOrderData = {
        orderNumber, // Include order number in the request
        items: orderData.items.map(item => ({
          productId: item.id || 'unknown',
          name: item.name,
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1,
          image: item.image || '',
          sku: item.sku || '',
          color: item.color || '',
          size: item.size || ''
        })),
        shippingAddress, // Use the complete shipping address
        billingAddress, // Use the complete billing address
        paymentMethod: orderData.paymentMethod || 'Credit Card',
        paymentDetails: orderData.paymentDetails || {
          transactionId: orderData.transactionId || `txn_${Math.random().toString(36).substring(2, 10)}`,
          status: 'completed',
          cardDetails: orderData.cardDetails || {}
        },
        subtotal: parseFloat(orderData.subtotal) || 0,
        tax: parseFloat(orderData.tax) || 0,
        shipping: parseFloat(orderData.shipping) || 0,
        discount: parseFloat(orderData.discount) || 0,
        totalAmount: parseFloat(orderData.totalAmount || orderData.amount) || 0,
        customerEmail: orderData.customer?.email || user?.email || 'guest@example.com',
        customerName: orderData.customer?.name || `${user?.firstName || ''} ${user?.lastName || ''}` || shippingAddress.name,
        shippingMethod: orderData.shippingMethod || 'Standard Shipping',
        // Explicitly set the user ID - this is critical for linking orders to users
        user: userId
      };
      
      console.log('Sending order data to API:', apiOrderData);
      
      // Make sure to include the authorization header
      const headers = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // Send to API
      const response = await axios.post(`${API_URL}/orders`, apiOrderData, { headers });
      
      // Update order details with API response
      if (response.data && response.data.success) {
        const savedOrder = response.data.data;
        // Keep our UI data but add any server-generated fields
        setOrderDetails(prev => ({
          ...prev,
          id: savedOrder.orderNumber || savedOrder._id,
          trackingNumber: savedOrder.trackingNumber,
          receiptId: savedOrder.receiptId,
          // Keep any other server-generated data
          serverData: savedOrder
        }));
        
        console.log('Order saved to database successfully');
        setApiError(null);
      }
    } catch (err) {
      console.error('Failed to save order to database:', err);
      if (err.response && err.response.data) {
        console.error('Server error details:', err.response.data);
      }
      setApiError('Unable to save order details to our system. Your order is still valid.');
      // Continue with local order data
    } finally {
      setIsSavingOrder(false);
    }
  };
  
  useEffect(() => {
    // Prevent multiple initializations (avoid infinite loop)
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    
    // Get order details from location state
    const details = location.state?.orderDetails;
    
    if (details) {
      const orderDate = new Date(details.date || new Date());
      // Generate these values once
      const trackingNumber = generateTrackingNumber();
      const estimatedDelivery = calculateEstimatedDelivery();
      const receiptId = generateReceiptId();
      
      // Process items to ensure each item has valid price and quantity
      const processedItems = Array.isArray(details.items) ? details.items.map(item => ({
        ...item,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1
      })) : [];
      
      // Calculate subtotal properly if not provided
      const calculatedSubtotal = processedItems.length > 0 
        ? processedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        : parseFloat(details.amount || 0);
      
      // Create a comprehensive order details object
      const orderData = {
        ...details,
        trackingNumber,
        orderDate: formatDate(orderDate),
        rawOrderDate: orderDate,
        formattedOrderDate: formatDate(orderDate),
        estimatedDelivery,
        receiptId,
        status: 'Processing',
        items: processedItems.length > 0 ? processedItems : [
          {
            name: 'Sample Product',
            price: 49.99,
            quantity: 1,
            size: 'M',
            color: 'Black'
          }
        ],
        // Include shipping details
        shippingAddress: details.shippingAddress || {
          name: details.customer?.name || 'Customer',
          street: '123 Example Street',
          city: 'Sample City',
          state: 'State',
          zip: '12345',
          country: 'Country',
          phone: details.customer?.phone || '+1 (555) 123-4567'
        },
        // Include billing details
        billingAddress: details.billingAddress || details.shippingAddress || {
          name: details.customer?.name || 'Customer',
          street: '123 Example Street',
          city: 'Sample City',
          state: 'State',
          zip: '12345',
          country: 'Country'
        },
        // Include payment details
        shippingMethod: details.shippingMethod || 'Standard Shipping',
        paymentMethod: details.paymentMethod || 'Credit Card',
        cardDetails: details.cardDetails || {
          brand: 'Visa',
          last4: '4242'
        },
        transactionId: details.transactionId || `txn_${Math.random().toString(36).substring(2, 15)}`,
        // Include pricing details - ensure numeric values
        subtotal: typeof details.subtotal === 'number' ? details.subtotal : calculatedSubtotal,
        shipping: typeof details.shipping === 'number' ? details.shipping : 0,
        tax: typeof details.tax === 'number' ? details.tax : 0,
        discount: typeof details.discount === 'number' ? details.discount : 0,
        // Format the amount properly
        amount: formatPrice(details.amount || calculatedSubtotal),
        totalAmount: parseFloat(details.amount || calculatedSubtotal),
        // Keep user info for order linking
        userId: details.userId || null,
        isNewUser: details.isNewUser || false
      };
      
      setOrderDetails(orderData);
      
      // Save order to database
      saveOrderToBackend(orderData);
      
      // Clear the cart when order confirmation page loads
      clearCart();
      success('Your order has been placed successfully!');
    } else {
      // For demo purposes, create dummy order details with complete information
      const orderDate = new Date();
      // Generate these values once
      const trackingNumber = generateTrackingNumber();
      const estimatedDelivery = calculateEstimatedDelivery();
      const orderId = `REF-${Math.floor(Math.random() * 1000000)}`;
      const receiptId = generateReceiptId();
      
      // Create mock items with properly formatted prices
      const mockItems = [
        {
          name: 'Sample Product 1',
          price: 49.99,
          quantity: 1,
          size: 'M',
          color: 'Black'
        },
        {
          name: 'Sample Product 2',
          price: 35.01,
          quantity: 1,
          size: 'L',
          color: 'Blue'
        }
      ];
      
      // Calculate subtotal
      const mockSubtotal = mockItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const mockShipping = 0;
      const mockTax = 0;
      const mockDiscount = 0;
      const mockTotal = mockSubtotal + mockShipping + mockTax - mockDiscount;
      
      setOrderDetails({
        id: orderId,
        receiptId,
        status: 'Processing',
        product: 'Sample Product',
        amount: formatPrice(mockTotal),
        subtotal: mockSubtotal,
        shipping: mockShipping,
        tax: mockTax,
        discount: mockDiscount,
        trackingNumber,
        orderDate: formatDate(orderDate),
        rawOrderDate: orderDate,
        formattedOrderDate: formatDate(orderDate),
        estimatedDelivery,
        paymentMethod: 'Credit Card',
        cardDetails: {
          brand: 'Visa',
          last4: '4242'
        },
        transactionId: `txn_${Math.random().toString(36).substring(2, 15)}`,
        // Demo customer
        customer: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567'
        },
        // Demo shipping address
        shippingAddress: {
          name: 'John Doe',
          street: '123 Example Street',
          city: 'Sample City',
          state: 'State',
          zip: '12345',
          country: 'Country',
          phone: '+1 (555) 123-4567'
        },
        // Demo billing address (same as shipping)
        billingAddress: {
          name: 'John Doe',
          street: '123 Example Street',
          city: 'Sample City',
          state: 'State',
          zip: '12345',
          country: 'Country'
        },
        // Demo shipping method
        shippingMethod: 'Standard Shipping',
        // Demo items
        items: mockItems
      });
    }
  }, [location.state, clearCart]);
  
  const handleContinueShopping = () => {
    navigate('/');
  };
  
  const handleViewDetails = () => {
    setIsOrderDetailsOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsOrderDetailsOpen(false);
  };
  
  // Format time from date
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format simple date
  const formatSimpleDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleViewReceipt = () => {
    // You could generate and download a PDF receipt here
    alert("Receipt download functionality would be implemented here");
    // For implementation, you could use libraries like jsPDF or react-pdf
  };
  
  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    
    try {
      if (downloadType === 'pdf') {
        // Download as PDF
        const canvas = await html2canvas(receiptRef.current, {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgWidth = 210;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Receipt-${orderDetails.id}.pdf`);
        success('Receipt downloaded successfully!');
      } else {
        // Download as PNG
        const canvas = await html2canvas(receiptRef.current, {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `Receipt-${orderDetails.id}.png`;
        link.click();
        success('Receipt downloaded successfully!');
      }
    } catch (err) {
      console.error('Error downloading receipt:', err);
    }
  };
  
  const printReceipt = () => {
    window.print();
  };
  
  const emailReceipt = () => {
    // This would typically involve a backend service to send an email
    // For demo purposes, we'll just show an alert
    success(`Receipt would be emailed to: ${orderDetails.customer?.email || 'your email'}`);
  };
  
  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderDetails.id);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };
  
  // Show loading state if order details are not yet available
  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Success message */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Thank you for your order!</h1>
            <p className="text-lg text-gray-600 mb-4">Your order has been placed successfully.</p>
            <p className="text-gray-600">
              A confirmation email has been sent to{' '}
              <span className="font-medium">{orderDetails.customerInfo?.email || 'your email address'}</span>.
            </p>
            
            {/* New user message */}
            {orderDetails.isNewUser && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">
                  Your account has been created!
                </h3>
                <p className="text-blue-700 text-sm mb-3">
                  We've created an account for you using your name: {orderDetails.shippingAddress?.firstName} {orderDetails.shippingAddress?.lastName}
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Log in to your account
                </button>
              </div>
            )}
          </div>
          
          {/* Order details */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <button 
                onClick={handleViewDetails}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <dl className="divide-y divide-gray-200">
                {/* Order number */}
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Order number</dt>
                  <dd className="text-sm font-medium text-gray-900">{orderDetails.orderNumber}</dd>
                </div>
                
                {/* Order date */}
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Date placed</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Date(orderDetails.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
                
                {/* Total amount */}
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Total amount</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ${orderDetails.total?.toFixed(2)}
                  </dd>
                </div>
                
                {/* Payment method */}
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Payment method</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {orderDetails.paymentMethod === 'credit-card' ? 'Credit Card' : 
                     orderDetails.paymentMethod === 'paystack' ? 'Paystack' : 
                     orderDetails.paymentMethod}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* What's next section */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What's next?</h2>
            <p className="text-gray-600 mb-6">
              We'll email you an order confirmation and updates about your delivery. You can also track your order by clicking the button below.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate(`/track-order/${orderDetails.orderNumber}`)}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Truck className="w-5 h-5 mr-2" />
                Track Order
              </button>
              
              <button
                onClick={handleContinueShopping}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Continue Shopping
              </button>
            </div>
          </div>
          
          {/* Need help section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Need help?</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about your order, please contact our customer service team.
            </p>
            
            <div className="flex flex-col space-y-4">
              <a 
                href="mailto:support@example.com" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <Mail className="w-5 h-5 mr-2" />
                support@example.com
              </a>
              
              <a 
                href="tel:+1234567890" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <Phone className="w-5 h-5 mr-2" />
                +1 (234) 567-890
              </a>
            </div>
          </div>
        </div>
      </main>
      
      {/* Order details modal */}
      <OrderDetailsModal 
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        orderDetails={orderDetails}
        onViewReceipt={handleViewReceipt}
        onContinueShopping={handleContinueShopping}
      />
      
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage; 