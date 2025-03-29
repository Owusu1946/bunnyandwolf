import { useState, useEffect } from 'react';
import { Camera, CreditCard, Wallet, ShoppingBag, ArrowLeft, ChevronsUpDown, ChevronDown, Check, DollarSign, Lock, RefreshCw } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });
  const [formData, setFormData] = useState({
    amount: '',
    email: '',
    phone: '',
    mobileNetwork: '',
  });
  const [paymentStatus, setPaymentStatus] = useState({
    status: '', // success, error, pending
    message: '',
  });

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showMobileMoneyForm, setShowMobileMoneyForm] = useState(false);
  
  const productInfo = location.state?.productInfo || {
    name: 'Your Order',
    price: '€0.00',
    image: 'https://via.placeholder.com/400x500',
    selectedColor: '#000000',
    allVariants: [{
      color: '#000000',
      colorName: 'Default',
      image: 'https://via.placeholder.com/400x500',
      price: '€0.00'
    }],
    currentVariantIndex: 0
  };

  // Extract orderInfo from location state for later use
  const orderInfo = location.state?.orderInfo || {};

  // Networks for mobile money
  const mobileNetworks = [
    { id: 'mtn', name: 'MTN Mobile Money', country: 'Ghana' },
    { id: 'vodafone', name: 'Vodafone Cash', country: 'Ghana' },
    { id: 'airtel', name: 'AirtelTigo Money', country: 'Ghana' },
    { id: 'moov', name: 'Moov Money', country: 'Ghana' },
  ];

  // Initialize with the clicked image and variant index
  useEffect(() => {
    // Log received data to help with debugging
    console.log("Payment page received state:", location.state);
    
    if (location.state?.productInfo) {
      setSelectedVariantIndex(location.state.productInfo.currentVariantIndex || 0);
      setCurrentImage(location.state.productInfo.image);
      setFormData(prev => ({
        ...prev,
        amount: location.state.productInfo.price?.replace('€', '') || '0',
        email: location.state.orderInfo?.contactInfo?.email || ''
      }));
    }
  }, [location.state]);

  const handleVariantSelect = (index) => {
    setSelectedVariantIndex(index);
    const variant = productInfo.allVariants[index];
    setCurrentImage(variant.image);
    setFormData(prev => ({
      ...prev,
      amount: variant.price.replace('€', '')
    }));
  };

  const paymentMethods = [
    {
      id: 'credit-card',
      name: 'Credit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Pay with Visa, Mastercard, or other cards',
      supportedCountries: ['Global'],
    },
    {
      id: 'paystack',
      name: 'Mobile Money (Paystack)',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Pay with MTN, Vodafone, AirtelTigo via Paystack',
      supportedCountries: ['Ghana', 'Nigeria'],
    },
    {
      id: 'bank-transfer',
      name: 'Bank Transfer',
      icon: <DollarSign className="w-6 h-6" />,
      description: 'Pay directly from your bank account',
      supportedCountries: ['Ghana', 'Nigeria', 'South Africa', 'Kenya'],
    },
  ];

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    // Reset payment status
    setPaymentStatus({
      status: '',
      message: '',
    });
    
    // Show/hide appropriate forms
    setShowCardForm(methodId === 'credit-card');
    setShowMobileMoneyForm(methodId === 'paystack');
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces after every 4 digits
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19); // Limit to 16 digits + 3 spaces
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }
    
    // Format expiry date as MM/YY
    if (name === 'expiryDate') {
      let formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 4)}`;
      }
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }
    
    // Limit CVV to 3 or 4 digits
    if (name === 'cvv') {
      const formattedValue = value.replace(/\D/g, '').slice(0, 4);
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }
    
    setCardDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));
  };

  const mockPaystackInitialize = (email, amount, currency = 'GHS') => {
    return new Promise((resolve, reject) => {
      // Simulating Paystack integration
      setTimeout(() => {
        // 90% success rate in this mock
        if (Math.random() > 0.1) {
          resolve({
            reference: `REF-${Date.now()}`,
            status: 'success',
            message: 'Payment complete!',
            transaction: {
              id: Math.floor(Math.random() * 1000000),
              amount: amount * 100, // Paystack uses kobo/pesewas
            }
          });
        } else {
          reject({
            status: 'failed',
            message: 'Payment failed. Please try again.'
          });
        }
      }, 2000); // Simulate network delay
    });
  };

  // Helper function to parse price to a valid number
  const parsePrice = (price) => {
    if (typeof price === 'number') return price;
    if (!price || typeof price !== 'string') return 0;
    
    // Remove currency symbols and other non-numeric characters
    return parseFloat(price.replace(/[^0-9.-]+/g, '')) || 0;
  };

  const processCreditCardPayment = async () => {
    // Validate card details
    if (!cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiryDate || !cardDetails.cvv) {
      setPaymentStatus({
        status: 'error',
        message: 'Please fill in all card details',
      });
      return false;
    }
    
    // Basic validation
    if (cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
      setPaymentStatus({
        status: 'error',
        message: 'Invalid card number',
      });
      return false;
    }
    
    try {
      // In a real app, you would call your payment processor here
      const response = await mockPaystackInitialize(formData.email, formData.amount);
      
      setPaymentStatus({
        status: 'success',
        message: 'Payment successful! Your order is being processed.'
      });
      
      // Get last 4 digits of the card number
      const last4 = cardDetails.cardNumber.replace(/\s/g, '').slice(-4);
      
      // Ensure numeric values for prices
      const amount = parsePrice(formData.amount);
      const subtotal = parsePrice(orderInfo.subtotal || amount);
      const shipping = parsePrice(orderInfo.shipping || 0);
      const tax = parsePrice(orderInfo.tax || 0);
      const discount = parsePrice(orderInfo.discount || 0);
      
      // Process order items to ensure valid prices and quantities
      const processedItems = Array.isArray(orderInfo.products) 
        ? orderInfo.products.map(item => ({
            ...item,
            price: parsePrice(item.price),
            quantity: parseInt(item.quantity) || 1
          }))
        : [];
      
      // Simulate redirect after successful payment
      setTimeout(() => {
        navigate('/order-confirmation', { 
          state: { 
            orderDetails: {
              id: response.reference,
              product: productInfo.name,
              amount: amount,
              date: new Date().toISOString(),
              paymentMethod: 'Credit Card',
              // Add items array from orderInfo to ensure order details work correctly
              items: processedItems,
              // Include subtotal, shipping, tax etc. as numeric values
              subtotal: subtotal,
              shipping: shipping,
              tax: tax,
              discount: discount,
              // Add customer info
              customer: {
                name: orderInfo.contactInfo?.name || cardDetails.cardHolder,
                email: formData.email,
                phone: formData.phone || orderInfo.contactInfo?.phone
              },
              // Add card details
              cardDetails: {
                brand: cardDetails.cardNumber.startsWith('4') ? 'Visa' : 
                       cardDetails.cardNumber.startsWith('5') ? 'MasterCard' : 'Card',
                last4: last4
              },
              // Add shipping address from orderInfo if available
              shippingAddress: orderInfo.addressInfo ? {
                name: orderInfo.addressInfo.fullName,
                street: orderInfo.addressInfo.street,
                city: orderInfo.addressInfo.city,
                state: orderInfo.addressInfo.state,
                zip: orderInfo.addressInfo.zip,
                country: orderInfo.addressInfo.country,
                phone: orderInfo.contactInfo?.phone
              } : undefined
            }
          }
        });
      }, 2000);
      
      return true;
    } catch (error) {
      setPaymentStatus({
        status: 'error',
        message: error.message || 'Payment failed. Please try again.'
      });
      return false;
    }
  };

  const processMobileMoneyPayment = async () => {
    // Validate mobile money details
    if (!formData.phone || !formData.mobileNetwork) {
      setPaymentStatus({
        status: 'error',
        message: 'Please provide your phone number and select your mobile network',
      });
      return false;
    }
    
    try {
      // In a real app, you would call your payment processor API here
      const response = await mockPaystackInitialize(formData.email, formData.amount);
      
      // Show pending status first as mobile money often requires user confirmation
      setPaymentStatus({
        status: 'pending',
        message: 'Please check your phone for a prompt to complete the payment.'
      });
      
      // Ensure numeric values for prices
      const amount = parsePrice(formData.amount);
      const subtotal = parsePrice(orderInfo.subtotal || amount);
      const shipping = parsePrice(orderInfo.shipping || 0);
      const tax = parsePrice(orderInfo.tax || 0);
      const discount = parsePrice(orderInfo.discount || 0);
      
      // Process order items to ensure valid prices and quantities
      const processedItems = Array.isArray(orderInfo.products) 
        ? orderInfo.products.map(item => ({
            ...item,
            price: parsePrice(item.price),
            quantity: parseInt(item.quantity) || 1
          }))
        : [];
      
      // Simulate mobile money confirmation
      setTimeout(() => {
        setPaymentStatus({
          status: 'success',
          message: 'Payment successful! Your order is being processed.'
        });
        
        // Navigate to confirmation page
        setTimeout(() => {
          navigate('/order-confirmation', { 
            state: { 
              orderDetails: {
                id: response.reference,
                product: productInfo.name,
                amount: amount,
                date: new Date().toISOString(),
                paymentMethod: 'Mobile Money',
                // Add items array from orderInfo to ensure order details work correctly
                items: processedItems,
                // Include subtotal, shipping, tax etc. as numeric values
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                discount: discount,
                // Add customer info
                customer: {
                  name: orderInfo.contactInfo?.name,
                  email: formData.email,
                  phone: formData.phone || orderInfo.contactInfo?.phone
                },
                // Add shipping address from orderInfo if available
                shippingAddress: orderInfo.addressInfo ? {
                  name: orderInfo.addressInfo.fullName,
                  street: orderInfo.addressInfo.street,
                  city: orderInfo.addressInfo.city,
                  state: orderInfo.addressInfo.state,
                  zip: orderInfo.addressInfo.zip,
                  country: orderInfo.addressInfo.country,
                  phone: formData.phone
                } : undefined
              }
            }
          });
        }, 2000);
      }, 3000);
      
      return true;
    } catch (error) {
      setPaymentStatus({
        status: 'error',
        message: error.message || 'Mobile money payment failed. Please try again.'
      });
      return false;
    }
  };

  const processBankTransferPayment = async () => {
    try {
      // Generate bank transfer details
      const reference = `REF-${Date.now()}`;
      
      setPaymentStatus({
        status: 'pending',
        message: 'Please complete your bank transfer with the details provided.'
      });
      
      // Ensure numeric values for prices
      const amount = parsePrice(formData.amount);
      const subtotal = parsePrice(orderInfo.subtotal || amount);
      const shipping = parsePrice(orderInfo.shipping || 0);
      const tax = parsePrice(orderInfo.tax || 0);
      const discount = parsePrice(orderInfo.discount || 0);
      
      // Process order items to ensure valid prices and quantities
      const processedItems = Array.isArray(orderInfo.products) 
        ? orderInfo.products.map(item => ({
            ...item,
            price: parsePrice(item.price),
            quantity: parseInt(item.quantity) || 1
          }))
        : [];
      
      // In a real app, you would show bank account details here
      // For simplification, we'll just simulate a successful transfer
      
      // Simulate waiting for bank transfer
      setTimeout(() => {
        setPaymentStatus({
          status: 'success',
          message: 'Bank transfer confirmed! Your order is being processed.'
        });
        
        // Navigate to confirmation page
        setTimeout(() => {
          navigate('/order-confirmation', { 
            state: { 
              orderDetails: {
                id: reference,
                product: productInfo.name,
                amount: amount,
                date: new Date().toISOString(),
                paymentMethod: 'Bank Transfer',
                // Add items array from orderInfo to ensure order details work correctly
                items: processedItems,
                // Include subtotal, shipping, tax etc. as numeric values
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                discount: discount,
                // Add customer info
                customer: {
                  name: orderInfo.contactInfo?.name,
                  email: formData.email,
                  phone: orderInfo.contactInfo?.phone
                },
                // Add shipping address from orderInfo if available
                shippingAddress: orderInfo.addressInfo ? {
                  name: orderInfo.addressInfo.fullName,
                  street: orderInfo.addressInfo.street,
                  city: orderInfo.addressInfo.city,
                  state: orderInfo.addressInfo.state,
                  zip: orderInfo.addressInfo.zip,
                  country: orderInfo.addressInfo.country,
                  phone: orderInfo.contactInfo?.phone
                } : undefined
              }
            }
          });
        }, 2000);
      }, 3000);
      
      return true;
    } catch (error) {
      setPaymentStatus({
        status: 'error',
        message: error.message || 'Bank transfer setup failed. Please try again.'
      });
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      let success = false;
      
      switch (selectedMethod) {
        case 'credit-card':
          success = await processCreditCardPayment();
          break;
        case 'paystack':
          success = await processMobileMoneyPayment();
          break;
        case 'bank-transfer':
          success = await processBankTransferPayment();
          break;
        default:
          setPaymentStatus({
            status: 'error',
            message: 'Please select a payment method.'
          });
      }
      
      if (!success) {
        setIsProcessing(false);
      }
      
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus({
        status: 'error',
        message: 'An unexpected error occurred. Please try again.'
      });
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      let response;
      let receiptNumber = `INV-${Date.now()}`;
      
      // Based on selected payment method, call appropriate processor
      if (selectedMethod === 'credit-card') {
        response = await mockCreditCardPayment(cardDetails);
      } else if (selectedMethod === 'paystack') {
        response = await mockPaystackInitialize(formData.email, parseFloat(formData.amount), 'GHS');
      } else {
        throw new Error('Please select a payment method');
      }
      
      if (response.status === 'success') {
        // Set success status and prepare navigation
        setPaymentStatus({
          status: 'success',
          message: 'Payment successful!'
        });
        
        setTimeout(() => {
          // Construct order details for confirmation page
          const orderDetails = {
            paymentMethod: selectedMethod === 'credit-card' ? 'Credit Card' : 'Mobile Money',
            cardDetails: selectedMethod === 'credit-card' ? {
              brand: getCardBrand(cardDetails.cardNumber),
              last4: cardDetails.cardNumber.slice(-4)
            } : null,
            transactionId: response.reference || response.transaction?.id || `txn_${Date.now()}`,
            amount: total,
            date: new Date(),
            receiptId: receiptNumber,
            // Include items from cart or single product
            items: orderInfo.products,
            // Include shipping & customer information
            shippingAddress: orderInfo.shippingAddress,
            billingAddress: orderInfo.billingAddress,
            shippingMethod: orderInfo.shippingMethodName,
            subtotal: orderInfo.subtotal,
            shipping: orderInfo.shipping,
            tax: orderInfo.tax,
            discount: orderInfo.discount,
            customer: orderInfo.customer,
            // Include user information if available
            userId: orderInfo.userId,
            isNewUser: orderInfo.isNewUser
          };
          
          // Navigate to confirmation page
          navigate('/order-confirmation', {
            state: { orderDetails }
          });
        }, 1500);
      } else {
        // Handle payment failure
        setPaymentStatus({
          status: 'error',
          message: response.message || 'Payment failed. Please try again.'
        });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus({
        status: 'error',
        message: error.message || 'An error occurred during payment processing. Please try again.'
      });
      setIsProcessing(false);
    }
  };

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
                <div className="aspect-[3/4] max-w-sm mx-auto mb-6 overflow-hidden rounded-lg">
                  <img
                    src={currentImage}
                    alt={productInfo.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', currentImage);
                      e.target.src = 'https://via.placeholder.com/400x500';
                    }}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Product</span>
                    <span className="font-medium">{productInfo.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price</span>
                    <span className="font-medium text-lg">
                      {productInfo.allVariants[selectedVariantIndex]?.price || productInfo.price}
                    </span>
                  </div>
                  {productInfo.allVariants && productInfo.allVariants.length > 0 && (
                    <div>
                      <span className="text-gray-600 block mb-2">Color</span>
                      <div className="flex gap-2">
                        {productInfo.allVariants.map((variant, index) => (
                          <button
                            key={index}
                            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                              selectedVariantIndex === index 
                                ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            style={{ backgroundColor: variant.color }}
                            onClick={() => handleVariantSelect(index)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-xl text-blue-600">
                        {productInfo.allVariants[selectedVariantIndex]?.price || productInfo.price}
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
            
            {/* Payment Method Selection */}
            <div className="space-y-4 mb-8">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedMethod === method.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'border-2 border-gray-200 hover:border-blue-200'
                  }`}
                  onClick={() => handleMethodSelect(method.id)}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      selectedMethod === method.id ? 'bg-blue-500 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {method.icon}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                  {selectedMethod === method.id && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              ))}
            </div>

            {/* Common Fields for All Payment Methods */}
            {selectedMethod && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <input
                      type="text"
                      name="amount"
                      value={formData.amount}
                      readOnly
                      className="block w-full pl-7 py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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

                {/* Credit Card Form */}
                {showCardForm && (
                  <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Card Details</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={cardDetails.cardNumber}
                        onChange={handleCardInputChange}
                        className="mt-1 block w-full py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Card Holder Name</label>
                      <input
                        type="text"
                        name="cardHolder"
                        value={cardDetails.cardHolder}
                        onChange={handleCardInputChange}
                        className="mt-1 block w-full py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={cardDetails.expiryDate}
                          onChange={handleCardInputChange}
                          className="mt-1 block w-full py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="MM/YY"
                          maxLength="5"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={cardDetails.cvv}
                          onChange={handleCardInputChange}
                          className="mt-1 block w-full py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="123"
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="save-card"
                        type="checkbox"
                        checked={saveCard}
                        onChange={() => setSaveCard(!saveCard)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="save-card" className="ml-2 block text-sm text-gray-700">
                        Save this card for future purchases
                      </label>
                    </div>
                  </div>
                )}

                {/* Mobile Money (Paystack) Form */}
                {showMobileMoneyForm && (
                  <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Mobile Money Details</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mobile Network</label>
                      <select
                        name="mobileNetwork"
                        value={formData.mobileNetwork}
                        onChange={handleChange}
                        className="mt-1 block w-full py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Mobile Network</option>
                        {mobileNetworks.map(network => (
                          <option key={network.id} value={network.id}>
                            {network.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                      <PhoneInput
                        country={'gh'}
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        inputProps={{
                          name: 'phone',
                          required: true,
                        }}
                        containerClass="!w-full"
                        inputClass="!w-full !py-3 !px-4 !text-base"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Make sure this is the number registered with your mobile money account
                      </p>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Option */}
                {selectedMethod === 'bank-transfer' && (
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-700 mb-2">
                      After clicking "Pay", you will receive bank account details to complete your transfer.
                    </p>
                    <p className="text-xs text-gray-500">
                      Your order will be processed once payment is confirmed.
                    </p>
                  </div>
                )}

                {/* Payment Status Messages */}
                {paymentStatus.status && (
                  <div className={`p-4 rounded-lg ${
                    paymentStatus.status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                    paymentStatus.status === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                    'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  }`}>
                    <div className="flex items-center">
                      {paymentStatus.status === 'success' ? (
                        <Check className="w-5 h-5 mr-2" />
                      ) : paymentStatus.status === 'error' ? (
                        <X className="w-5 h-5 mr-2" />
                      ) : (
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      )}
                      <p>{paymentStatus.message}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || !selectedMethod}
                  className="w-full bg-blue-600 text-white py-4 px-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium text-lg"
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
                      Processing Payment...
                    </div>
                  ) : (
                    `Pay ${productInfo.allVariants[selectedVariantIndex]?.price || productInfo.price}`
                  )}
                </button>
                
                <div className="text-center mt-4">
                  <div className="flex items-center justify-center">
                    <Lock className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500">Your payment is secured with SSL encryption</span>
                  </div>
                </div>
              </form>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
