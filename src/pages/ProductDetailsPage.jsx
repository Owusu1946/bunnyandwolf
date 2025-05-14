import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  ArrowLeft, 
  Share2, 
  ChevronDown, 
  Truck, 
  RefreshCw, 
  MessageCircle,
  Ruler,
  X,
  Info,
  Check,
  Bell,
  AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../components/ToastManager';
import ShareModal from '../components/ShareModal';
import { useProductStore } from '../store/productStore';

// Import to use product store
const ProductDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlistItem, isInWishlist } = useWishlist();
  const { cartNotification, success, error, wishlistNotification, info } = useToast();
  
  // Get products from product store
  const { products, fetchProductsFromAPI } = useProductStore();
  
  // States
  const [product, setProduct] = useState(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);
  
  // Current URL for sharing
  const currentUrl = window.location.href;
  
  // Fetch products if they're not already loaded
  useEffect(() => {
    if (products.length === 0) {
      fetchProductsFromAPI();
    }
  }, [products.length, fetchProductsFromAPI]);
  
  // Initialize with the product from store using ID
  useEffect(() => {
    if (products.length > 0 && id) {
      // Find the product in the store by ID
      const storeProduct = products.find(p => p._id === id || p._id === location.state?.productId);
    
      if (storeProduct) {
        // If we found the product, use it
        setProduct(storeProduct);
        
        // Set the variant index from location state or default to 0
        // Use optional chaining to safely access location state properties
        const variantIndex = location.state?.variantIndex ?? 0;
        setSelectedVariantIndex(variantIndex);
        
        // If product has sizes, select the first one by default
        if (storeProduct.sizes && storeProduct.sizes.length > 0) {
          setSelectedSize(storeProduct.sizes[0]);
        }
    } else {
        // If product not found, show error and navigate back
        error('Product not found');
        navigate(-1);
    }
    }
  }, [id, products, location.state, navigate, error]);
  
  // Update main image when variant changes
  useEffect(() => {
    if (product && product.variants && product.variants.length > selectedVariantIndex) {
      const variant = product.variants[selectedVariantIndex];
      setMainImage(variant.additionalImages?.[0] || variant.image);
    }
  }, [product, selectedVariantIndex]);
  
  // Check if product is in wishlist
  useEffect(() => {
    if (product && selectedSize && product.variants) {
      const wishlisted = isInWishlist(
        product._id, 
        selectedSize, 
        product.variants[selectedVariantIndex]?.color
      );
      setIsWishlisted(wishlisted);
    }
  }, [product, selectedSize, selectedVariantIndex, isInWishlist]);
  
  // Handle variant selection
  const handleVariantSelect = (index) => {
    setSelectedVariantIndex(index);
  };
  
  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };
  
  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    setQuantity(Math.max(1, newQuantity));
  };
  
  // Handle add to cart
  const handleAddToCart = async () => {
    // Validate size selection first if sizes are available
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      error('Please select a size first');
      return;
    }
    
    // Prevent multiple clicks by setting adding state
    setAddingToCart(true);
    
    try {
      // Get variant information if available
      const variantInfo = product.variants && product.variants.length > 0
        ? {
            price: product.variants[selectedVariantIndex]?.price || product.basePrice,
            image: product.variants[selectedVariantIndex]?.image || mainImage || product.image,
            color: product.variants[selectedVariantIndex]?.color || null,
            colorName: product.variants[selectedVariantIndex]?.colorName || null
          }
        : {
            price: product.basePrice,
            image: product.image || mainImage,
            color: null,
            colorName: null
          };
      
      // Prepare product for cart with all required information
      const cartProduct = {
        id: product._id,
        name: product.name,
        price: variantInfo.price,
        image: variantInfo.image || "https://via.placeholder.com/400x500?text=" + encodeURIComponent(product.name),
        selectedColor: variantInfo.color,
        colorName: variantInfo.colorName,
        size: selectedSize || 'One Size',
        quantity: quantity
      };
      
      // Add to cart using context
      const success = addToCart(cartProduct);
      
      if (success) {
        // Always show the toast notification
        cartNotification(
          `${product.name} has been added to your cart.`,
          {
            title: 'Added to Cart',
            image: cartProduct.image
          }
        );
      }
    } catch (err) {
      error('Failed to add item to cart');
      console.error('Cart error:', err);
    } finally {
        setAddingToCart(false);
    }
  };
  
  // Handle buy now button
  const handleBuyNow = () => {
    // Validate size selection first if sizes are available
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      error('Please select a size first');
        return;
      }
      
    // Get variant information if available
    const variantInfo = product.variants && product.variants.length > 0
      ? {
          price: product.variants[selectedVariantIndex]?.price || product.basePrice,
          image: product.variants[selectedVariantIndex]?.image || mainImage || product.image,
          color: product.variants[selectedVariantIndex]?.color || null,
          colorName: product.variants[selectedVariantIndex]?.colorName || null
        }
      : {
          price: product.basePrice,
          image: product.image || mainImage,
          color: null,
          colorName: null
        };
    
    // Format price correctly
    const formattedPrice = typeof variantInfo.price === 'number' 
      ? `GH₵${variantInfo.price.toFixed(2)}`
      : variantInfo.price;
    
    // Prepare product information for checkout
    const checkoutProductInfo = {
      id: product._id,
            name: product.name,
      price: formattedPrice,
      image: variantInfo.image || `https://via.placeholder.com/400x500?text=${encodeURIComponent(product.name)}`,
      selectedColor: variantInfo.color,
      colorName: variantInfo.colorName || 'Default',
      size: selectedSize || 'One Size',
            quantity: quantity,
      variants: product.variants || [],
            currentVariantIndex: selectedVariantIndex
    };
    
    // Navigate directly to checkout with product info
    navigate('/checkout', {
      state: {
        productInfo: checkoutProductInfo,
        fromCart: false
      }
    });
  };
  
  const handleThumbnailClick = (image) => {
    setMainImage(image);
  };
  
  const handleSimilarProductClick = (similarProduct) => {
    // Navigate to the similar product's page
    // We'll pass minimal information and let the product details page 
    // load the complete product information from the store
    navigate(`/product/${similarProduct.id}`, {
      state: {
        productId: similarProduct.id,
        variantIndex: 0
      }
    });
  };
  
  // Handle size guide toggle
  const toggleSizeGuide = () => {
    setShowSizeGuide(!showSizeGuide);
  };
  
  // Handle wishlist toggle
  const handleToggleWishlist = () => {
    // Validate size selection first
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      error('Please select a size first');
      return;
    }
    
    // Set loading state
    setAddingToWishlist(true);
    
    try {
      // Get variant information if available
      const variantInfo = product.variants && product.variants.length > 0
        ? {
            color: product.variants[selectedVariantIndex]?.color || null,
            colorName: product.variants[selectedVariantIndex]?.colorName || null,
            variantImage: product.variants[selectedVariantIndex]?.image || null
          }
        : { color: null, colorName: null, variantImage: null };
      
      // Prepare product for wishlist
      const wishlistProduct = {
        id: product._id,
        name: product.name,
        price: product.variants && product.variants[selectedVariantIndex]?.price 
          ? product.variants[selectedVariantIndex].price 
          : product.basePrice,
        image: variantInfo.variantImage || product.image || mainImage,
        color: variantInfo.color,
        colorName: variantInfo.colorName,
        size: selectedSize || 'One Size'
      };
      
      // Toggle wishlist state
      const result = toggleWishlistItem(wishlistProduct);
      
      // Update UI state based on result
      if (result && result.success) {
        if (result.action === 'added') {
          // Show added to wishlist toast
          wishlistNotification(`${product.name} has been added to your wishlist`, {
            title: 'Added to Wishlist',
            image: wishlistProduct.image,
            duration: 3000,
            onActionClick: () => {
              try {
                navigate('/profile');
              } catch (err) {
                console.error('Navigation error:', err);
              }
            }
          });
          setIsWishlisted(true);
        } else {
          // Show removed from wishlist toast
          info(`${product.name} has been removed from your wishlist`, {
            duration: 2000
          });
          setIsWishlisted(false);
        }
      } else {
        // Show generic error if toggle operation failed
        error('Something went wrong updating your wishlist');
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
      // Show error toast
      error('There was an error updating your wishlist');
    } finally {
      // Reset wishlist loading state with a delay for visual feedback
      setTimeout(() => setAddingToWishlist(false), 300);
    }
  };
  
  // Handle share modal toggle
  const handleShareClick = () => {
    if (!product) return;
    setShowShareModal(true);
  };
  
  // Handle notify when back in stock
  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    setNotifySubmitting(true);
    
    try {
      // Here we would make an API call to save the notification request
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotifySuccess(true);
      setTimeout(() => {
        setShowNotifyModal(false);
        setNotifySuccess(false);
        setNotifyEmail('');
      }, 2000);
      
      success('You will be notified when this product is back in stock');
    } catch (err) {
      error('Failed to submit notification request');
    } finally {
      setNotifySubmitting(false);
    }
  };
  
  // If product is not loaded yet, show a loading state
  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Extract necessary data
  const currentVariant = product.variants && product.variants.length > 0 
    ? product.variants[selectedVariantIndex] 
    : null;
  
  // Get similar products
  const similarProducts = products
    .filter(p => p._id !== product._id && p.category === product.category)
    .slice(0, 4)
    .map(p => {
      // Find the first available image using various fallbacks
      let productImage;
      
      if (p.image) {
        // Direct product image if available
        productImage = p.image;
      } else if (p.variants && p.variants.length > 0) {
        // First variant's image or additionalImages
        if (p.variants[0].image) {
          productImage = p.variants[0].image;
        } else if (p.variants[0].additionalImages && p.variants[0].additionalImages.length > 0) {
          productImage = p.variants[0].additionalImages[0];
        }
      }
      
      // If no image found, use placeholder
      if (!productImage) {
        productImage = `https://via.placeholder.com/400x500?text=${encodeURIComponent(p.name)}`;
      }
      
      return {
        id: p._id,
        name: p.name,
        price: typeof p.basePrice === 'number' ? `GH₵${p.basePrice.toFixed(2)}` : p.basePrice,
        image: productImage
      };
    });
  
  // Get stock information from the product
  const stockQuantity = product?.stock || 0;
  const isInStock = stockQuantity > 0;
  
  // Stock status display text and color
  const getStockStatus = () => {
    if (stockQuantity > 10) {
      return { 
        text: "In Stock", 
        color: "text-green-600", 
        bgColor: "bg-green-100" 
      };
    } else if (stockQuantity > 0) {
      return { 
        text: `Only ${stockQuantity} left in stock - order soon`, 
        color: "text-amber-600", 
        bgColor: "bg-amber-100" 
      };
    } else {
      return { 
        text: "Out of Stock", 
        color: "text-red-600", 
        bgColor: "bg-red-100" 
      };
    }
  };

  const stockStatus = getStockStatus();
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-4 sm:mb-8 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 mr-1 flex-shrink-0" />
            Back
          </button>
          <span className="mx-2">/</span>
          <a href="/" className="hover:text-gray-900 whitespace-nowrap">Home</a>
          <span className="mx-2">/</span>
          <a href="/shop" className="hover:text-gray-900 whitespace-nowrap">Shop</a>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </div>
        
        {/* Product Detail Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
              <img
                src={mainImage || (product.variants && product.variants[selectedVariantIndex]?.image) || product.image || "https://via.placeholder.com/400x500?text=" + encodeURIComponent(product.name)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {product.variants && product.variants.length > 0 && product.variants[selectedVariantIndex]?.additionalImages?.map((image, index) => (
                <button
                  key={index}
                  className={`aspect-square overflow-hidden rounded-md ${
                    mainImage === image ? 'ring-2 ring-black' : 'ring-1 ring-gray-200'
                  }`}
                  onClick={() => handleThumbnailClick(image)}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Right Column - Product Info */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-2 flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 0) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">{product.rating || 0} ({product.reviewCount || 0} reviews)</span>
            </div>
            
            <div className="mt-4">
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                {/* Display price with fallbacks for products without variants */}
                {product.variants && product.variants.length > 0 && product.variants[selectedVariantIndex]?.price ? 
                  (typeof product.variants[selectedVariantIndex].price === 'number' ? 
                    `GH₵${product.variants[selectedVariantIndex].price.toFixed(2)}` : 
                    product.variants[selectedVariantIndex].price) : 
                  (typeof product.basePrice === 'number' ? 
                    `GH₵${product.basePrice.toFixed(2)}` : 
                    `GH₵${product.basePrice}`)}
              </span>
              {product.salePrice > 0 && (
                <span className="ml-2 text-base sm:text-lg text-gray-500 line-through">
                  {typeof product.basePrice === 'number' ? 
                    `GH₵${product.basePrice.toFixed(2)}` : 
                    `GH₵${product.basePrice}`}
                </span>
              )}
            </div>
            
            {/* Stock Availability Indicator */}
            <div className={`mt-3 inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
              <span className="flex items-center">
                {isInStock ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-1" />
                )}
                {stockStatus.text}
              </span>
            </div>
            
            {/* Only show color selection if variants exist */}
            {product.variants && product.variants.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Color</h3>
              <div className="flex items-center space-x-3 mt-2">
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      selectedVariantIndex === index 
                        ? 'border-black ring-2 ring-black ring-offset-2' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: variant.color }}
                    onClick={() => handleVariantSelect(index)}
                    aria-label={variant.colorName}
                    title={variant.colorName}
                  />
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                  {product.variants[selectedVariantIndex]?.colorName || ''}
              </p>
            </div>
            )}
            
            {/* Only show size selection if sizes exist */}
            {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Size</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`py-2 px-3 border rounded-md text-sm font-medium ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'border-gray-300 text-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => handleSizeSelect(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Ruler className="w-4 h-4 mr-1" />
                <button className="underline" onClick={() => setShowSizeGuide(true)}>Size Guide</button>
              </div>
            </div>
            )}
            
            {/* Only show quantity selection if in stock */}
            {isInStock && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
              <div className="flex items-center mt-2 border border-gray-300 rounded-md w-32">
                <button
                  className="px-3 py-1 text-gray-600 hover:text-gray-900"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                    max={stockQuantity}
                  value={quantity}
                    onChange={(e) => handleQuantityChange(Math.min(parseInt(e.target.value) || 1, stockQuantity))}
                  className="w-full text-center py-1 border-x border-gray-300"
                />
                <button
                  className="px-3 py-1 text-gray-600 hover:text-gray-900"
                    onClick={() => handleQuantityChange(Math.min(quantity + 1, stockQuantity))}
                    disabled={quantity >= stockQuantity}
                >
                  +
                </button>
              </div>
            </div>
            )}
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {isInStock ? (
                <>
              <button
                type="button"
                disabled={addingToCart}
                className={`flex-1 ${
                  addingToCart 
                    ? 'bg-gray-700 border border-gray-700' 
                    : 'bg-black border border-black hover:bg-gray-900'
                } text-white py-3 px-6 rounded-md font-medium transition-colors duration-200 flex items-center justify-center`}
                onClick={handleAddToCart}
              >
                {addingToCart ? (
                  <>
                    <Check className="w-5 h-5 mr-2 animate-pulse" />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                type="button"
                className="flex-1 bg-white border border-black text-black py-3 px-6 rounded-md hover:bg-gray-100 font-medium transition-colors"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
                </>
              ) : (
                <button
                  type="button"
                  className="flex-1 bg-gray-100 border border-gray-300 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-200 font-medium transition-colors flex items-center justify-center"
                  onClick={() => setShowNotifyModal(true)}
                >
                  <Bell className="w-5 h-5 mr-2" />
                  Notify When Back in Stock
                </button>
              )}
              <button
                type="button"
                disabled={addingToWishlist}
                onClick={handleToggleWishlist}
                className={`p-3 border rounded-md transition-all ${
                  isWishlisted 
                    ? 'bg-red-50 border-red-300 text-red-500' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''} ${addingToWishlist ? 'animate-pulse' : ''}`} />
              </button>
              <button
                type="button"
                className="p-3 border border-gray-300 rounded-md hover:border-gray-400"
                aria-label="Share product"
                title="Share product"
                onClick={handleShareClick}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            
            {/* Delivery Info */}
            <div className="mt-8 space-y-4 border-t border-gray-200 pt-6">
              <div className="flex items-start">
                <Truck className="w-5 h-5 mt-0.5 text-gray-600" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Free shipping</h4>
                  <p className="text-sm text-gray-500">Free standard shipping on orders over GH₵100</p>
                </div>
              </div>
              <div className="flex items-start">
                <RefreshCw className="w-5 h-5 mt-0.5 text-gray-600" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">30-day returns</h4>
                  <p className="text-sm text-gray-500">Free returns within 30 days of delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Section */}
        <div className="mt-10 sm:mt-16 border-t border-gray-200 pt-6 sm:pt-10">
          <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar">
            <button
              className={`pb-4 px-1 mr-4 sm:mr-8 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'description'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`pb-4 px-1 mr-4 sm:mr-8 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'details'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Details & Care
            </button>
            <button
              className={`pb-4 px-1 mr-4 sm:mr-8 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviewCount || 0})
            </button>
          </div>
          
          <div className="mt-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p>{product.description || 'No description available for this product.'}</p>
              </div>
            )}
            
            {activeTab === 'details' && (
              <div className="prose max-w-none">
                {product.details && product.details.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {product.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
                ) : (
                  <p>No additional details available for this product.</p>
                )}
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div>
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-3 text-sm text-gray-500">Based on {product.reviewCount} reviews</span>
                  </div>
                </div>
                
                <div className="space-y-8">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-8">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-900">{review.author}</span>
                        <span className="ml-2 text-sm text-gray-500">• {review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <button
                    type="button"
                    className="flex items-center justify-center text-sm font-medium text-gray-900 hover:text-gray-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Write a Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Similar Products Section */}
        <div className="mt-10 sm:mt-16">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {similarProducts && similarProducts.length > 0 ? (
              similarProducts.map((similarProduct) => (
              <div 
                key={similarProduct.id} 
                className="cursor-pointer"
                onClick={() => handleSimilarProductClick(similarProduct)}
              >
                <div className="aspect-[3/4] rounded-md overflow-hidden bg-gray-100">
                  <img
                    src={similarProduct.image}
                    alt={similarProduct.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://via.placeholder.com/400x500?text=${encodeURIComponent(similarProduct.name)}`;
                      }}
                  />
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{similarProduct.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{similarProduct.price}</p>
                </div>
              </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No similar products found.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Recently Viewed */}
        <div className="mt-10 sm:mt-16">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Placeholder for recently viewed items */}
            <div className="aspect-[3/4] rounded-md bg-gray-100 flex items-center justify-center">
              <p className="text-gray-400 text-sm">No items viewed yet</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">Size Guide</h3>
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                aria-label="Close size guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="mb-6 sm:mb-8">
                <h4 className="text-base font-medium text-gray-900 mb-4">How to Measure</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 flex items-center justify-center rounded-full mb-3">
                      <Ruler className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">Bust</h5>
                    <p className="text-sm text-gray-500 text-center">Measure around the fullest part of your bust, keeping the tape parallel to the floor.</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 flex items-center justify-center rounded-full mb-3">
                      <Ruler className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">Waist</h5>
                    <p className="text-sm text-gray-500 text-center">Measure around your natural waistline, keeping the tape comfortably loose.</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 flex items-center justify-center rounded-full mb-3">
                      <Ruler className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">Hips</h5>
                    <p className="text-sm text-gray-500 text-center">Measure around the fullest part of your hips, about 8 inches below your waistline.</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6 sm:mb-8">
                <h4 className="text-base font-medium text-gray-900 mb-4">Women's Clothing Sizes</h4>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full px-4 sm:px-0">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">US</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UK</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EU</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bust (in)</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waist (in)</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hips (in)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">XS</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0-2</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4-6</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">32-34</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">31.5-32.5</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">24.5-25.5</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">34.5-35.5</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">S</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4-6</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8-10</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">36-38</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">33.5-34.5</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">26.5-27.5</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">36.5-37.5</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">M</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8-10</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12-14</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">40-42</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">35.5-36.5</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">28.5-29.5</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">38.5-39.5</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">L</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12-14</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">16-18</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">44-46</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">37.5-39.5</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">30.5-32.5</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">40.5-42.5</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">XL</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">16-18</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">20-22</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">48-50</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">40.5-42.5</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">33.5-35.5</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">43.5-45.5</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Product Specific Sizing Notes</h4>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        {product.name} is designed with a regular fit. If you are between sizes, we recommend sizing up for a more comfortable fit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">International Conversions</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">
                    Our clothes are designed using US sizing as a standard. Below are general conversion guidelines:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>US sizes typically run 1-2 sizes smaller than UK sizes</li>
                    <li>EU sizes are typically 30 plus the US size (e.g., US 8 ≈ EU 38)</li>
                    <li>For AU/NZ sizing, follow the UK size chart</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          product={product}
          currentUrl={currentUrl}
        />
      )}
      
      {/* Notify When Back in Stock Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Get In-Stock Alert</h3>
              <button 
                onClick={() => {
                  setShowNotifyModal(false);
                  setNotifyEmail('');
                  setNotifySuccess(false);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              Subscribe to get notified when "{product.name}" is back in stock.
            </div>
            
            {notifySuccess ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-md flex items-center">
                <Check className="w-5 h-5 mr-2" />
                <span>You've been added to the notification list!</span>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="example@gmail.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={notifySubmitting}
                  className={`w-full ${
                    notifySubmitting ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'
                  } text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center`}
                >
                  {notifySubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Bell className="w-5 h-5 mr-2" />
                      Notify Me
                    </>
                  )}
                </button>
              </form>
            )}
            <p className="text-xs text-gray-500 mt-4">
              You will only receive one email when this product becomes available.
              We don't share your email with anyone else.
            </p>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;