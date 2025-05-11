import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Truck, 
  ShoppingBag, 
  CreditCard, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  Info,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { register } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { useOrderStore } from '../store/orderStore';
import axios from 'axios';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orderStore = useOrderStore();
  
  // Check if coming from cart or product page
  const isFromCart = location.state?.fromCart || false;
  const cartItems = location.state?.cartItems || [];
  
  console.log("Initial checkout state:", { 
    isFromCart, 
    cartItemsLength: cartItems?.length || 0,
    locationState: location.state,
    productInfo: location.state?.productInfo
  });
  
  // Get product info from location state or use cart items
  const productInfo = !isFromCart ? (location.state?.productInfo || {
    id: 'sample-id',
    name: 'Sample Product',
    price: 'GH₵0.00',
    image: 'https://via.placeholder.com/400x500',
    selectedColor: '#000000',
    colorName: 'Black',
    size: 'M',
    quantity: 1,
    variants: [],
    currentVariantIndex: 0
  }) : null;
  
  // Form states
  const [step, setStep] = useState(1); // 1: Contact, 2: Shipping, 3: Delivery, 4: Review
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: ''
  });
  
  // Account creation states for guest users
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  
  const [addressInfo, setAddressInfo] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Ghana'
  });
  
  const [shippingMethod, setShippingMethod] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [taxRate, setTaxRate] = useState(0.15); // 15% tax rate
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [formError, setFormError] = useState('');
  
  // Available shipping methods
  const shippingMethods = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: '3-5 business days',
      price: 1,
      carrier: 'DHL',
      estimatedDelivery: '3-5 business days'
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '1-2 business days',
      price: 1,
      carrier: 'FedEx',
      estimatedDelivery: '1-2 business days'
    },
    {
      id: 'sameday',
      name: 'Same Day Delivery',
      description: 'Delivered today (order before 2pm)',
      price: 1,
      carrier: 'Local Courier',
      estimatedDelivery: 'Today'
    },
  ];
  
  // Available countries
  const countries = [
    { code: 'GH', name: 'Ghana' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'KE', name: 'Kenya' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'US', name: 'United States' }
  ];
  
  // Calculate pricing
  useEffect(() => {
    let calculatedSubtotal = 0;
    
    if (isFromCart) {
      // Calculate from cart items
      calculatedSubtotal = location.state?.cartTotal || 0;
      
      // If cartTotal is not provided but we have cartItems, calculate from items
      if (calculatedSubtotal === 0 && cartItems.length > 0) {
        calculatedSubtotal = cartItems.reduce((total, item) => {
          // Handle both € and GH₵ currency symbols
          const price = parseFloat(item.price?.toString().replace(/[€GH₵\s]/g, '').replace(/,/g, '.') || 0);
          return total + (price * item.quantity);
        }, 0);
      }
    } else {
      // Calculate from single product
      // Handle both € and GH₵ currency symbols
      const price = parseFloat(productInfo.price?.toString().replace(/[€GH₵\s]/g, '').replace(/,/g, '.') || 0);
      const quantity = productInfo.quantity || 1;
      calculatedSubtotal = price * quantity;
    }
    
    setSubtotal(calculatedSubtotal);
    
    // Calculate tax
    const calculatedTax = calculatedSubtotal * taxRate;
    
    // Make sure discount is a number
    const discountValue = typeof discount === 'number' ? discount : 0;
    
    // Calculate total
    const calculatedTotal = calculatedSubtotal + shippingCost + calculatedTax - discountValue;
    setTotal(calculatedTotal);
  }, [productInfo, shippingCost, discount, taxRate, isFromCart, location.state, cartItems]);
  
  // Handle shipping method selection
  const handleShippingMethodSelect = (methodId) => {
    setShippingMethod(methodId);
    
    // Find the selected shipping method
    const method = shippingMethods.find(m => m.id === methodId);
    
    if (method) {
      setShippingCost(method.price);
      setEstimatedDelivery(method.estimatedDelivery);
    }
  };
  
  // Handle contact form change
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle phone input change
  const handlePhoneChange = (value) => {
    setContactInfo(prev => ({
      ...prev,
      phone: value
    }));
  };
  
  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
    
    // Clear any previous error messages
    setPasswordError('');
    setRegistrationError('');
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Function to handle guest registration
  const handleGuestRegistration = async () => {
    try {
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return false;
      }

      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return false;
      }

      setRegistrationLoading(true);
      
      // Create user account with shipping address information
      const userData = {
        firstName: addressInfo.firstName,
        lastName: addressInfo.lastName,
        email: contactInfo.email,
        phoneNumber: contactInfo.phone,
        password,
      };

      await register(userData);
      setRegistrationSuccess(true);
      setRegistrationLoading(false);
      setIsNewUser(true);
      
      return true;
    } catch (error) {
      console.error('Error during registration:', error);
      setRegistrationError(
        error.response?.data?.message || 
        'Registration failed. Please try again.'
      );
      setRegistrationLoading(false);
      return false;
    }
  };
  
  // Handle address form change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle coupon code application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    try {
      setIsCouponLoading(true);
      setCouponError('');
      setCouponSuccess('');
      
      // Get coupons from localStorage or use default sample coupons if none exist
      const storedCouponsJson = localStorage.getItem('sinosply_coupons');
      const availableCoupons = storedCouponsJson ? 
        JSON.parse(storedCouponsJson) : 
        [
          {
            code: 'WELCOME10',
            discountType: 'percentage',
            discountValue: 10,
            minPurchaseAmount: 0,
            maxDiscountAmount: null,
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            isActive: true
          },
          {
            code: 'FREESHIP',
            discountType: 'fixed',
            discountValue: 15,
            minPurchaseAmount: 75,
            maxDiscountAmount: 15,
            startDate: '2025-05-09',
            endDate: '2025-05-15',
            isActive: true
          },
          {
            code: 'DISCOUNT10',
            discountType: 'percentage', 
            discountValue: 10,
            minPurchaseAmount: 0,
            isActive: true
          }
        ];
      
      // Find the coupon in our available coupons
      const enteredCode = couponCode.trim().toUpperCase();
      const coupon = availableCoupons.find(c => c.code.toUpperCase() === enteredCode);
      
      if (!coupon) {
        setCouponError('Invalid coupon code');
        return;
      }
      
      if (!coupon.isActive) {
        setCouponError('This coupon is no longer active');
        return;
      }
      
      // Check if current date is within coupon validity
      const now = new Date();
      if (coupon.startDate && new Date(coupon.startDate) > now) {
        setCouponError('This coupon is not active yet');
        return;
      }
      
      if (coupon.endDate && new Date(coupon.endDate) < now) {
        setCouponError('This coupon has expired');
        return;
      }
      
      // Check minimum purchase amount
      if (coupon.minPurchaseAmount > subtotal) {
        setCouponError(`This coupon requires a minimum purchase of GH₵${coupon.minPurchaseAmount.toFixed(2)}`);
        return;
      }
      
      // Calculate discount based on coupon type
      let calculatedDiscount = 0;
      
      if (coupon.discountType === 'percentage') {
        calculatedDiscount = (subtotal * (parseFloat(coupon.discountValue) / 100));
        
        // Check if there's a maximum discount cap
        if (coupon.maxDiscountAmount && calculatedDiscount > parseFloat(coupon.maxDiscountAmount)) {
          calculatedDiscount = parseFloat(coupon.maxDiscountAmount);
        }
        
      } else if (coupon.discountType === 'fixed') {
        calculatedDiscount = parseFloat(coupon.discountValue);
      }
      
      // Ensure discount is a number
      calculatedDiscount = isNaN(calculatedDiscount) ? 0 : Number(calculatedDiscount);
      
      // Update state with discount
      setDiscount(calculatedDiscount);
      setDiscountType(coupon.discountType);
      setAppliedCoupon(coupon);
      setCouponSuccess(`Coupon applied! ${coupon.discountType === 'percentage' ? 
        `${coupon.discountValue}% off` : 
        `GH₵${Number(coupon.discountValue).toFixed(2)} off`}`);
      
      if (coupon.code === 'FREESHIP') {
        setShippingCost(0);
        setCouponSuccess('Free shipping coupon applied successfully!');
      }
      
    } catch (err) {
      console.error('Error validating coupon:', err);
      setCouponError('Error validating coupon. Please try again.');
    } finally {
      setIsCouponLoading(false);
    }
  };
  
  // Function to handle moving to the next step
  const handleNextStep = async () => {
    // Validate current step before proceeding
    switch (step) {
      case 1: // Contact Information
        if (!contactInfo.email || !contactInfo.phone) {
          setFormError('Please fill in all required fields');
          return;
        }
        
        // Clear any previous errors
        setFormError('');
        setStep(2);
        break;
        
      case 2: // Shipping Address
        if (!addressInfo.firstName || !addressInfo.lastName || !addressInfo.address1 || 
            !addressInfo.city || !addressInfo.state || !addressInfo.zipCode || !addressInfo.country) {
          setFormError('Please fill in all required shipping address fields');
          return;
        }
        
        // If user opted to create an account and is not logged in, register them now
        if (createAccount && !user && !registrationSuccess) {
          const registrationSuccessful = await handleGuestRegistration();
          if (!registrationSuccessful) {
            // Registration failed, don't proceed to next step
            return;
          }
        }
        
        setFormError('');
        setStep(3);
        break;
        
      case 3: // Shipping Method
        if (!shippingMethod) {
          setFormError('Please select a shipping method');
          return;
        }
        
        setFormError('');
        setStep(4);
        break;
        
      case 4: // Review & Payment
        // Handle submission and navigate to payment
        navigateToPayment();
        break;
        
      default:
        break;
    }
  };
  
  // Go back to previous step
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      // Go back to cart or product page
      if (isFromCart) {
        navigate('/cart');
      } else {
        navigate(-1);
      }
    }
  };
  
  // Function to navigate to the payment page
  const navigateToPayment = () => {
    try {
      setFormError('');
      
      console.log("Cart items debug:", {
        isFromCart,
        cartItems,
        cartItemsLength: cartItems ? cartItems.length : 0,
        cartItemsType: typeof cartItems,
        productInfo
      });
      
      // Check if we have valid items to proceed with
      if (isFromCart && (!cartItems || cartItems.length === 0)) {
        setFormError('Cart is empty. Please add items to your cart.');
        return;
      }
      
      if (!isFromCart && !productInfo) {
        setFormError('Product information is missing. Please go back and try again.');
        return;
      }
      
      // Create orderProducts array based on cart or single product
      const orderProducts = isFromCart 
        ? cartItems.map(item => ({
            id: item.id || item._id,
            name: item.name,
            price: parseFloat(typeof item.price === 'string' ? item.price.replace(/[€GH₵\s]/g, '') : item.price),
            quantity: item.quantity,
            image: item.image,
            colorName: item.colorName,
            size: item.size
          }))
        : [{
            id: productInfo.id || productInfo._id,
            name: productInfo.name,
            price: parseFloat(typeof productInfo.price === 'string' ? productInfo.price.replace(/[€GH₵\s]/g, '').replace(/,/g, '.') : productInfo.price),
            quantity: productInfo.quantity || 1,
            image: productInfo.image,
            colorName: productInfo.colorName || 'Default',
            size: productInfo.size || 'One Size'
          }];

      // Calculate subtotal
      const subtotalCalc = isFromCart
        ? cartItems.reduce((total, item) => {
            // Handle both € and GH₵ currency symbols
            const price = parseFloat(typeof item.price === 'string' ? item.price.replace(/[€GH₵\s]/g, '') : item.price);
            return total + (price * item.quantity);
          }, 0)
        : parseFloat(typeof productInfo.price === 'string' ? productInfo.price.replace(/[€GH₵\s]/g, '') : productInfo.price) * (productInfo.quantity || 1);

      // Calculate shipping cost based on method
      const shippingCost = shippingMethod === 'standard' ? 5.99 : shippingMethod === 'express' ? 15.99 : 24.99;
      
      // Calculate tax (15% for example)
      const tax = subtotalCalc * taxRate;
      
      // Apply discount if any
      const discountAmount = discount || 0; // Placeholder for discount logic
      
      // Calculate total
      const totalCalc = subtotalCalc + shippingCost + tax - discountAmount;

      console.log('Order details:', {
        products: orderProducts,
        subtotal: subtotalCalc,
        shippingCost,
        tax,
        discount: discountAmount,
        total: totalCalc
      });

      // Construct order info
      const orderInfo = {
        products: orderProducts.map(product => ({
          id: product.id || `PROD-${Math.random().toString(36).substr(2, 9)}`,
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          image: product.image,
          variant: {
            color: product.colorName || product.selectedColor,
            size: product.size
          }
        })),
        contactInfo: {
          email: contactInfo.email,
          phone: contactInfo.phone
        },
        shippingAddress: {
          firstName: addressInfo.firstName,
          lastName: addressInfo.lastName,
          address1: addressInfo.address1,
          address2: addressInfo.address2,
          city: addressInfo.city,
          state: addressInfo.state,
          zip: addressInfo.zipCode,
          country: addressInfo.country
        },
        billingAddress: {
          firstName: addressInfo.firstName,
          lastName: addressInfo.lastName,
          address1: addressInfo.address1,
          address2: addressInfo.address2,
          city: addressInfo.city,
          state: addressInfo.state,
          zip: addressInfo.zipCode,
          country: addressInfo.country
        },
        shippingMethod: shippingMethod,
        shippingMethodName: shippingMethods.find(m => m.id === shippingMethod)?.name || '',
        subtotal: subtotalCalc,
        shipping: shippingCost,
        tax: tax,
        discount: discountAmount,
        total: totalCalc,
        customerInfo: {
          firstName: addressInfo.firstName,
          lastName: addressInfo.lastName,
          email: contactInfo.email,
          phone: contactInfo.phone
        },
        userId: user ? user.id : null,
        isNewUser: isNewUser,
        date: new Date().toISOString(),
        orderNumber: `ORD-${Date.now()}`
      };
      
      // Create a draft order for orderStore
      const draftOrder = {
        _id: `draft-${Date.now()}`,
        orderNumber: orderInfo.orderNumber,
        status: 'Draft',
        trackingNumber: `TRK${Math.floor(Math.random() * 10000000000)}`,
        items: orderProducts,
        totalAmount: totalCalc,
        subtotal: subtotalCalc,
        shipping: shippingCost,
        tax: tax,
        discount: discountAmount,
        shippingAddress: {
          name: `${addressInfo.firstName} ${addressInfo.lastName}`,
          street: addressInfo.address1,
          addressLine2: addressInfo.address2,
          city: addressInfo.city,
          state: addressInfo.state,
          zip: addressInfo.zipCode,
          country: addressInfo.country,
          phone: contactInfo.phone
        },
        billingAddress: {
          name: `${addressInfo.firstName} ${addressInfo.lastName}`,
          street: addressInfo.address1,
          city: addressInfo.city,
          state: addressInfo.state,
          zip: addressInfo.zipCode,
          country: addressInfo.country
        },
        customerName: `${addressInfo.firstName} ${addressInfo.lastName}`,
        customerEmail: contactInfo.email,
        shippingMethod: shippingMethod,
        createdAt: new Date().toISOString()
      };
      
      // Save to Zustand store
      orderStore.setOrderInfo(orderInfo);
      
      // Add draft order to store orders array - will be updated with final details after payment
      // but ensures it shows in Profile even if user abandons checkout
      orderStore.addOrder(draftOrder);
      
      // Navigate to payment page (no need to pass orderInfo in state)
      navigate('/payment', { 
        state: { 
          isFromCart,
          clearCartOnSuccess: isFromCart
        } 
      });
    } catch (error) {
      console.error('Error navigating to payment:', error);
      setFormError(`Error preparing payment: ${error.message || 'Please try again.'}`);
    }
  };
  
  // Render the contact information step
  const renderContactStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={contactInfo.email}
            onChange={handleContactChange}
            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={contactInfo.phone}
            onChange={handleContactChange}
            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="+1 (234) 567-8900"
            required
          />
        </div>
        
        {!user && (
          <div className="pt-4">
            <div className="flex items-center mb-4">
              <input
                id="create-account"
                name="create-account"
                type="checkbox"
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="create-account" className="ml-2 block text-sm text-gray-700">
                Create an account for faster checkout next time
              </label>
            </div>
            
            {createAccount && (
              <div className="space-y-4 mt-4 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900">Create Your Account</h3>
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Your account will be created with your contact information and shipping details.
                  </p>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={password}
                      onChange={handlePasswordChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handlePasswordChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                  
                  {passwordError && (
                    <p className="text-sm text-red-600">
                      {passwordError}
                    </p>
                  )}
                  
                  {registrationError && (
                    <p className="text-sm text-red-600">
                      {registrationError}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render the address form step
  const renderAddressStep = () => {
    return (
      <div className="space-y-6">
        {/* Message about account creation if user opted for it */}
        {!user && createAccount && !registrationSuccess && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md text-blue-700 text-sm">
            <p>Your account will be created using your shipping address details after completing this step.</p>
          </div>
        )}
        
        {registrationSuccess && (
          <div className="mb-4 p-3 bg-green-50 rounded-md text-green-700 text-sm">
            <p>Account successfully created! You'll be able to log in after completing your purchase.</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={addressInfo.firstName}
              onChange={handleAddressChange}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="John"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={addressInfo.lastName}
              onChange={handleAddressChange}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Doe"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="address1" className="block text-sm font-medium text-gray-700">Address Line 1 <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="address1"
              name="address1"
              value={addressInfo.address1}
              onChange={handleAddressChange}
              className="mt-1 block w-full py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Street address, apartment, suite, etc."
              required
            />
          </div>
          
          <div>
            <label htmlFor="address2" className="block text-sm font-medium text-gray-700">Address Line 2</label>
            <input
              type="text"
              id="address2"
              name="address2"
              value={addressInfo.address2}
              onChange={handleAddressChange}
              className="mt-1 block w-full py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Apartment, suite, unit, building, floor, etc. (optional)"
            />
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="city"
              name="city"
              value={addressInfo.city}
              onChange={handleAddressChange}
              className="mt-1 block w-full py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State/Province/Region</label>
            <input
              type="text"
              id="state"
              name="state"
              value={addressInfo.state}
              onChange={handleAddressChange}
              className="mt-1 block w-full py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Postal/ZIP Code <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={addressInfo.zipCode}
              onChange={handleAddressChange}
              className="mt-1 block w-full py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country <span className="text-red-500">*</span></label>
            <select
              id="country"
              name="country"
              value={addressInfo.country}
              onChange={handleAddressChange}
              className="mt-1 block w-full py-3 px-4 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {countries.map(country => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex items-center">
          <input
            id="save-address"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="save-address" className="ml-2 block text-sm text-gray-700">
            Save this address for future orders
          </label>
        </div>
      </div>
    );
  };

  // Render the appropriate step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderContactStep();
      case 2:
        return renderAddressStep();
      case 3:
        // Shipping method
        // ... existing code ...  
      case 4:
        // Review
        // ... existing code ...
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <button 
            onClick={handlePrevStep}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          <span className="mx-2">/</span>
          <a href="/" className="hover:text-gray-900">Home</a>
          {isFromCart ? (
            <>
              <span className="mx-2">/</span>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate('/cart'); }}
                className="hover:text-gray-900"
              >
                Cart
              </a>
            </>
          ) : (
            <>
              <span className="mx-2">/</span>
              <a href="/shop" className="hover:text-gray-900">Shop</a>
              <span className="mx-2">/</span>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate(-1); }}
                className="hover:text-gray-900"
              >
                {productInfo.name}
              </a>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">Checkout</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Steps */}
          <div className="lg:col-span-2 space-y-8">
            {/* Checkout Progress */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    <User className="w-4 h-4" />
                  </div>
                  <span className={`ml-2 font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-600'}`}>Contact</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className={`ml-2 font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-600'}`}>Shipping</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className={`ml-2 font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-600'}`}>Delivery</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className={`ml-2 font-medium ${step >= 4 ? 'text-blue-600' : 'text-gray-600'}`}>Payment</span>
                </div>
              </div>
            </div>
            
            {/* Step 1: Contact Information */}
            {step === 1 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 rounded-md text-red-700 text-sm">
                    {formError}
                  </div>
                )}
                {renderContactStep()}
              </div>
            )}
            
            {/* Step 2: Shipping Address */}
            {step === 2 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 rounded-md text-red-700 text-sm">
                    {formError}
                  </div>
                )}
                {renderAddressStep()}
              </div>
            )}
            
            {/* Step 3: Delivery Options */}
            {step === 3 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Method</h2>
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 rounded-md text-red-700 text-sm">
                    {formError}
                  </div>
                )}
                <p className="text-sm text-gray-600 mb-4">Select your preferred shipping method</p>
                
                <div className="space-y-4">
                  {shippingMethods.map(method => (
                    <div
                      key={method.id}
                      className={`p-4 border rounded-lg cursor-pointer flex items-center ${
                        shippingMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}
                      onClick={() => handleShippingMethodSelect(method.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            shippingMethod === method.id ? 'border-blue-500' : 'border-gray-300'
                          }`}>
                            {shippingMethod === method.id && (
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                          <div className="ml-3">
                            <span className="font-medium">{method.name}</span>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{method.description}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium">GH₵{method.price.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">{method.carrier}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="ml-3">
                      <h4 className="font-medium text-blue-800">Delivery Information</h4>
                      <p className="text-sm text-blue-600 mt-1">
                        Shipping times are estimated based on your location in {addressInfo.city || 'your city'}, {addressInfo.country}.
                        {shippingMethod && (
                          <> Your order will be delivered by {shippingMethods.find(m => m.id === shippingMethod)?.carrier} in {estimatedDelivery}.</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 4: Review Order */}
            {step === 4 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Order</h2>
                
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 rounded-md text-red-700 text-sm">
                    {formError}
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Contact Info Review */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">Contact Information</h3>
                      <button 
                        type="button" 
                        className="text-blue-600 text-sm hover:text-blue-800"
                        onClick={() => setStep(1)}
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-gray-600">{contactInfo.email}</p>
                    <p className="text-gray-600">{contactInfo.phone}</p>
                  </div>
                  
                  {/* Address Review */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">Shipping Address</h3>
                      <button 
                        type="button" 
                        className="text-blue-600 text-sm hover:text-blue-800"
                        onClick={() => setStep(2)}
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-gray-600">{addressInfo.firstName} {addressInfo.lastName}</p>
                    <p className="text-gray-600">{addressInfo.address1}</p>
                    {addressInfo.address2 && <p className="text-gray-600">{addressInfo.address2}</p>}
                    <p className="text-gray-600">
                      {addressInfo.city}{addressInfo.state ? `, ${addressInfo.state}` : ''} {addressInfo.zipCode}
                    </p>
                    <p className="text-gray-600">{addressInfo.country}</p>
                  </div>
                  
                  {/* Delivery Method Review */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">Delivery Method</h3>
                      <button 
                        type="button" 
                        className="text-blue-600 text-sm hover:text-blue-800"
                        onClick={() => setStep(3)}
                      >
                        Edit
                      </button>
                    </div>
                    {shippingMethod && (
                      <div className="flex justify-between">
                        <div>
                          <p className="text-gray-900 font-medium">
                            {shippingMethods.find(m => m.id === shippingMethod)?.name}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {shippingMethods.find(m => m.id === shippingMethod)?.carrier} - {estimatedDelivery}
                          </p>
                        </div>
                        <p className="font-medium">GH₵{shippingCost.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Review */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Order Items</h3>
                    
                    {isFromCart ? (
                      // Display all cart items
                      <div className="divide-y divide-gray-200">
                        {cartItems.length === 0 ? (
                          <p className="text-gray-500 py-2">No items in cart</p>
                        ) : (
                          cartItems.map((item, index) => (
                            <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex items-center py-3">
                              <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover object-center"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                  }}
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex justify-between">
                                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                                  <p className="font-medium text-gray-900">{item.price}</p>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  Color: {item.colorName} | Size: {item.size} | Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      // Display single product
                      <div className="flex items-center py-3 border-b border-gray-200">
                        <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md">
                          <img
                            src={productInfo.image}
                            alt={productInfo.name}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-gray-900">{productInfo.name}</h4>
                            <p className="font-medium text-gray-900">{productInfo.price}</p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Color: {productInfo.colorName || 'Default'} | Size: {productInfo.size || 'One Size'} | Qty: {productInfo.quantity || 1}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={handlePrevStep}
                className="bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 font-medium flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {step === 1 ? 'Back to Shopping' : 'Previous Step'}
              </button>
              
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium flex items-center"
              >
                {step === 4 ? 'Proceed to Payment' : 'Continue'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Display cart items in summary when coming from cart */}
              {isFromCart && cartItems.length > 0 && (
                <div className="mb-4 max-h-80 overflow-auto border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Items ({cartItems.length})</h3>
                  {cartItems.map((item, idx) => (
                    <div key={`${item.id}-${item.size}-${item.color}-${idx}`} className="flex items-center mb-3">
                      <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-md">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.colorName} | {item.size} | Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{item.price}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Display single product in summary when coming from Buy Now */}
              {!isFromCart && productInfo && (
                <div className="mb-4 border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Item</h3>
                  <div className="flex items-center mb-3">
                    <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-md">
                      <img
                        src={productInfo.image}
                        alt={productInfo.name}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{productInfo.name}</p>
                      <p className="text-xs text-gray-500">
                        {productInfo.colorName || 'Default'} | {productInfo.size || 'One Size'} | Qty: {productInfo.quantity || 1}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{productInfo.price}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">GH₵{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">GH₵{shippingCost.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Tax (15%)</span>
                  <span className="font-medium">GH₵{(subtotal * taxRate).toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200 text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-GH₵{parseFloat(discount).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>Total</span>
                  <span>GH₵{parseFloat(total).toFixed(2)}</span>
                </div>
                
                {/* Coupon Code */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-2">Apply Coupon Code</label>
                  <div className="flex">
                    <input
                      type="text"
                      id="couponCode"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError('');
                        setCouponSuccess('');
                      }}
                      disabled={appliedCoupon || isCouponLoading}
                      className="flex-1 py-2 px-3 border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter code"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || appliedCoupon || isCouponLoading}
                      className={`py-2 px-4 rounded-r-lg font-medium flex items-center justify-center min-w-[80px] ${
                        !couponCode.trim() || appliedCoupon ? 
                        'bg-gray-200 text-gray-500 cursor-not-allowed' : 
                        'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isCouponLoading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : appliedCoupon ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                  
                  {couponError && (
                    <p className="mt-2 text-xs text-red-600">{couponError}</p>
                  )}
                  
                  {couponSuccess && (
                    <div className="mt-2 text-xs text-green-600 flex items-center">
                      <Check className="w-3 h-3 mr-1" />
                      {couponSuccess}
                    </div>
                  )}
                  
                  {appliedCoupon ? (
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">Coupon applied</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setDiscount(0);
                          setCouponCode('');
                          setAppliedCoupon(null);
                          setCouponSuccess('');
                          if (appliedCoupon.code === 'FREESHIP') {
                            // Reset shipping cost based on selected method
                            const method = shippingMethods.find(m => m.id === shippingMethod);
                            if (method) {
                              setShippingCost(method.price);
                            }
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">
                      Enter a coupon code to get discounts (try "SUMMER25", "WELCOME10", or "FREESHIP")
                    </p>
                  )}
                </div>
                
                {/* Estimated Delivery */}
                {estimatedDelivery && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <Truck className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="font-medium">Estimated Delivery</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{estimatedDelivery}</p>
                  </div>
                )}
                
                {/* Secure Checkout Notice */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage; 