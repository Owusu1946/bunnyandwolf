import { useState, useEffect } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/orderStore';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    email: '',
    note: ''
  });
  
  const orderStore = useOrderStore();
  // Extract orderInfo from Zustand store instead of location.state
  const orderInfo = orderStore.orderInfo || {};

  // Extract product info from orderInfo instead of location state
  const productInfo = location.state?.productInfo || (() => {
    // If we have orderInfo with products, use the first product as the display product
    if (orderInfo && orderInfo.products && orderInfo.products.length > 0) {
      const firstProduct = orderInfo.products[0];
      return {
        name: firstProduct.name || 'Your Order',
        price: typeof firstProduct.price === 'number' ? `GH₵${firstProduct.price.toFixed(2)}` : firstProduct.price || 'GH₵0.00',
        image: firstProduct.image || 'https://via.placeholder.com/400x500',
        selectedColor: firstProduct.colorName ? '#000000' : '#000000',
        colorName: firstProduct.colorName || 'Default',
        size: firstProduct.size || '',
        quantity: firstProduct.quantity || 1,
        allVariants: [{
          color: '#000000',
          colorName: firstProduct.colorName || 'Default',
          image: firstProduct.image || 'https://via.placeholder.com/400x500',
          price: typeof firstProduct.price === 'number' ? `GH₵${firstProduct.price.toFixed(2)}` : firstProduct.price || 'GH₵0.00'
        }],
        currentVariantIndex: 0
      };
    }
    // Fallback to default
    return {
      name: 'Your Order',
      price: 'GH₵0.00',
      image: 'https://via.placeholder.com/400x500',
      selectedColor: '#000000',
      allVariants: [{
        color: '#000000',
        colorName: 'Default',
        image: 'https://via.placeholder.com/400x500',
        price: 'GH₵0.00'
      }],
      currentVariantIndex: 0
    };
  })();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState('');

  // Initialize with the clicked image and variant index
  useEffect(() => {
    // Log received data to help with debugging
    console.log("Payment page received state:", location.state);
    
    if (location.state?.productInfo) {
      setSelectedVariantIndex(location.state.productInfo.currentVariantIndex || 0);
      setCurrentImage(location.state.productInfo.image);
      setFormData(prev => ({
        ...prev,
        amount: location.state.productInfo.price?.replace(/[GH₵\s]/g, '') || '0',
        email: location.state.orderInfo?.contactInfo?.email || '',
        note: getOrderNote()
      }));
    }
  }, [location.state]);

  // Helper function to get note from order info
  const getOrderNote = () => {
    if (!orderInfo || !orderInfo.products) return 'Order payment';
    
    if (orderInfo.products.length === 1) {
      const product = orderInfo.products[0];
      return `${product.name} - ${product.size || ''} ${product.colorName || ''}`.trim();
    } else {
      return `Order with ${orderInfo.products.length} items`;
    }
  };

  // Helper function to parse price to a valid number
  const parsePrice = (price) => {
    if (typeof price === 'number') return price;
    if (!price || typeof price !== 'string') return 0;
    
    // Remove currency symbols and other non-numeric characters
    return parseFloat(price.replace(/[^0-9.-]+/g, '')) || 0;
  };

  // Fix: Handle missing or undefined properties safely
  const safelyFormatPrice = (price) => {
    if (price === undefined || price === null) return 'GH₵0.00';
    if (typeof price === 'string' && price.includes('GH₵')) return price;
    return `GH₵${typeof price === 'number' ? price.toFixed(2) : '0.00'}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigateToOrderConfirmation = (paymentMethod, transactionId, amount) => {
    try {
      // Ensure numeric values for prices
      const calculatedAmount = parsePrice(amount || formData.amount || 0);
      const subtotal = parsePrice(orderInfo?.subtotal || calculatedAmount);
      const shipping = parsePrice(orderInfo?.shipping || 0);
      const tax = parsePrice(orderInfo?.tax || 0);
      const discount = parsePrice(orderInfo?.discount || 0);
      const total = subtotal + shipping + tax - discount;
      
      // Process order items to ensure valid prices and quantities
      const processedItems = Array.isArray(orderInfo?.products) 
        ? orderInfo.products.map(item => ({
            id: item.id,
            name: item.name || 'Product',
            price: parsePrice(item.price),
            quantity: parseInt(item.quantity) || 1,
            image: item.image,
            colorName: item.colorName,
            size: item.size
          }))
        : [];

      // Create order details for confirmation page
      const orderDetails = {
        id: transactionId || `txn-${Date.now()}`,
        orderNumber: orderInfo?.orderNumber || `ORD-${Date.now()}`,
        date: new Date().toISOString(),
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        amount: calculatedAmount,
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        discount: discount,
        total: total,
        items: processedItems.length > 0 ? processedItems : [{
          id: 'default-item',
          name: productInfo.name,
          price: parsePrice(productInfo.price),
          quantity: 1,
          image: productInfo.image,
          colorName: productInfo.colorName,
          size: productInfo.size
        }],
        customer: {
          name: orderInfo?.contactInfo?.name || 'Customer',
          email: formData.email || orderInfo?.contactInfo?.email || 'customer@example.com'
        },
        shippingAddress: orderInfo?.shippingAddress || null,
        billingAddress: orderInfo?.billingAddress || orderInfo?.shippingAddress || null,
        shippingMethod: orderInfo?.shippingMethod || 'Standard Shipping'
      };

      // Update the payment status in the store
      orderStore.setPaymentStatus({
        status: 'success',
        transactionId: transactionId,
        paymentMethod: paymentMethod,
        date: new Date()
      });
      
      console.log("Navigating to order confirmation with:", orderDetails);
      
      // Navigate to order confirmation page
      navigate('/order-confirmation', {
        state: { orderDetails }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      setIsProcessing(false);
    }
  };

  // Handle Chipper Cash payment
  const handleChipperCashPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Get the amount and note parameters
      const amount = parsePrice(orderInfo?.total || formData.amount);
      const note = formData.note || getOrderNote();
      
      // Create a transaction record with a unique ID
      const transactionId = `CHIP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Store transaction details in localStorage (in a real app, this would be in your database)
      const transactionData = {
        id: transactionId,
        amount: amount,
        note: note,
        orderNumber: orderInfo?.orderNumber || `ORD-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem(`payment_${transactionId}`, JSON.stringify(transactionData));
      
      // Create a simple checksum to verify amount hasn't been tampered with
      // In production, this would use a proper HMAC with a secret key stored on the server
      const timestamp = Date.now();
      const simpleChecksum = btoa(`${amount}-${timestamp}-${transactionId}`).replace(/=/g, '');
      
      // Include amount with checksum protection - this allows pre-filling while adding some security
      // A proper implementation would validate this server-side with a shared secret
      window.location.href = `https://pay.chippercash.com/user/4f2cacfa-e937-4c96-9b8f-58ddc24c4412?amount=${amount}&note=${encodeURIComponent(note)}&txn_id=${transactionId}&ts=${timestamp}&check=${simpleChecksum}`;
    } catch (error) {
      console.error('Chipper Cash payment error:', error);
      setIsProcessing(false);
    }
  };

  // When the user returns from Chipper Cash, verify the payment
  // In a real app, this would be handled by a webhook from Chipper Cash
  useEffect(() => {
    // Check if there's a transaction ID in the URL - this would be from the return redirect
    const urlParams = new URLSearchParams(window.location.search);
    const txnId = urlParams.get('txn_id');
    
    if (txnId) {
      // Retrieve the original transaction details
      const transactionDataJson = localStorage.getItem(`payment_${txnId}`);
      
      if (transactionDataJson) {
        try {
          const transactionData = JSON.parse(transactionDataJson);
          
          // IMPORTANT: In a real app, you would verify with your backend that 
          // the payment was actually completed via Chipper Cash API
          
          // For demo, we'll assume payment was successful
          navigateToOrderConfirmation('Chipper Cash', txnId, transactionData.amount);
          
          // Clean up
          localStorage.removeItem(`payment_${txnId}`);
        } catch (err) {
          console.error('Error processing return from payment:', err);
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Shopping
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Product Summary Section */}
            <div className="bg-gray-50 p-8 flex flex-col">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                {/* If we have multiple products from orderInfo, show them all */}
                {orderInfo && orderInfo.products && orderInfo.products.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {orderInfo.products.map((product, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-16 h-16 overflow-hidden rounded-lg">
                          <img
                            src={product.image || 'https://via.placeholder.com/400x500'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150?text=Product';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-gray-600">
                            {product.colorName && `Color: ${product.colorName}`} 
                            {product.size && product.colorName && ' | '} 
                            {product.size && `Size: ${product.size}`}
                            {product.quantity > 1 && ` | Qty: ${product.quantity}`}
                          </p>
                        </div>
                        <div className="font-medium">
                          {typeof product.price === 'number' ? `GH₵${product.price.toFixed(2)}` : product.price}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-[3/4] max-w-sm mx-auto mb-6 overflow-hidden rounded-lg">
                    <img
                      src={currentImage || productInfo.image}
                      alt={productInfo.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', currentImage);
                        e.target.src = 'https://via.placeholder.com/400x500';
                      }}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Product</span>
                    <span className="font-medium">
                      {orderInfo && orderInfo.products && orderInfo.products.length > 1 
                        ? `${orderInfo.products.length} items` 
                        : productInfo.name}
                    </span>
                  </div>
                  
                  {!orderInfo.subtotal && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price</span>
                      <span className="font-medium text-lg">
                        {productInfo.allVariants[selectedVariantIndex]?.price || productInfo.price}
                      </span>
                    </div>
                  )}
                  
                  {orderInfo && orderInfo.subtotal !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-lg">{safelyFormatPrice(orderInfo.subtotal)}</span>
                    </div>
                  )}
                  
                  {orderInfo && orderInfo.shipping !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-lg">{safelyFormatPrice(orderInfo.shipping)}</span>
                    </div>
                  )}
                  
                  {orderInfo && orderInfo.tax !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium text-lg">{safelyFormatPrice(orderInfo.tax)}</span>
                    </div>
                  )}
                  
                  {orderInfo && orderInfo.discount !== undefined && orderInfo.discount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Discount</span>
                      <span className="font-medium text-lg">-{safelyFormatPrice(orderInfo.discount)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-xl text-blue-600">
                        {orderInfo && orderInfo.total !== undefined
                          ? safelyFormatPrice(orderInfo.total)
                          : productInfo.allVariants[selectedVariantIndex]?.price || productInfo.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>Secure Checkout</span>
                </div>
              </div>
          </div>

            {/* Payment Section */}
          <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
            
              <div className="mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800">
                    You'll be redirected to Chipper Cash to complete your payment safely and securely.
                  </p>
                </div>
                
                <div className="mb-6">
                  <img 
                    src="https://www.chippercash.com/img/logos/wordmark.svg" 
                    alt="Chipper Cash" 
                    className="h-10 mx-auto mb-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/200x50?text=Chipper+Cash';
                    }}
                  />
                  <p className="text-center text-sm text-gray-600">
                    Fast, secure payments across Africa
                  </p>
            </div>

                <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">GH₵</span>
                    </div>
                    <input
                      type="text"
                      name="amount"
                      value={formData.amount}
                      readOnly
                        className="block w-full pl-12 py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                    
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Note</label>
                      <input
                        type="text"
                      name="note"
                      value={formData.note}
                        onChange={handleChange}
                        className="mt-1 block w-full py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Order payment"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                      This will appear in your Chipper Cash transaction history
                    </p>
                    </div>
                  </div>

                <button
                  type="button"
                  onClick={handleChipperCashPayment}
                  disabled={isProcessing}
                  className="w-full bg-[#0066F5] text-white py-4 px-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium text-lg mt-6"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    `Pay with Chipper Cash ${safelyFormatPrice(orderInfo?.total || formData.amount)}`
                  )}
                </button>
                
                <div className="text-center mt-4">
                  <div className="flex items-center justify-center">
                    <Lock className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500">Your payment is secured with SSL encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
