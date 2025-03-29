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
  Check
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../components/ToastManager';
import ShareModal from '../components/ShareModal';

// Dummy product data generator - in a real app, you would fetch this from an API
const generateProductDetails = (id) => {
  // This simulates fetching a product by ID
  const product = {
    id: id || "1",
    name: "BELLA MIDI DRESS",
    basePrice: "€85.00",
    description: "A stunning midi dress perfect for any occasion. Features a fitted bodice and flared skirt for a flattering silhouette. Made with high-quality fabric that ensures comfort and durability.",
    details: [
      "Fitted bodice with flared skirt",
      "Hidden back zipper",
      "Partially lined",
      "Model is 175cm tall and wearing size S",
      "Length: 112cm / 44.1\"",
      "100% cotton",
      "Machine washable"
    ],
    variants: [
      { 
        color: '#FF0000', 
        colorName: 'Red',
        image: "https://media.boohoo.com/i/boohoo/hzz16822_black_xl?w=900&qlt=default&fmt.jp2.qlt=70&fmt=auto&sm=fit", 
        price: '€85.00',
        additionalImages: [
          "https://media.boohoo.com/i/boohoo/hzz16822_black_xl?w=900&qlt=default&fmt.jp2.qlt=70&fmt=auto&sm=fit",
          "https://media.boohoo.com/i/boohoo/hzz16822_black_xl_1?w=900&qlt=default&fmt.jp2.qlt=70&fmt=auto&sm=fit",
          "https://media.boohoo.com/i/boohoo/hzz16822_black_xl_2?w=900&qlt=default&fmt.jp2.qlt=70&fmt=auto&sm=fit",
          "https://media.boohoo.com/i/boohoo/hzz16822_black_xl_3?w=900&qlt=default&fmt.jp2.qlt=70&fmt=auto&sm=fit"
        ]
      },
      { 
        color: '#000000', 
        colorName: 'Black', 
        image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80", 
        price: '€85.00',
        additionalImages: [
          "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80",
          "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80",
          "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80",
          "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80"
        ]
      },
      { 
        color: '#FFC0CB', 
        colorName: 'Pink', 
        image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&q=80", 
        price: '€85.00',
        additionalImages: [
          "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&q=80",
          "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&q=80",
          "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&q=80",
          "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&q=80"
        ]
      }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.8,
    reviewCount: 124,
    similarProducts: [
      {
        id: "2",
        name: "STELLA EVENING GOWN",
        price: "€120.00",
        image: "https://www.shopamericanthreads.com/cdn/shop/files/margot-black-cream-contrast-strapless-bubble-peplum-top-11.jpg?v=1735360860&width=700"
      },
      {
        id: "3",
        name: "SOPHIA MAXI DRESS",
        price: "€89.00",
        image: "https://i8.amplience.net//i/Quiz/202230450_XM?fmt=webp&layer0=[h=900&w=600]"
      },
      {
        id: "4",
        name: "RUBY MINI DRESS",
        price: "€85.00",
        image: "https://us.ohpolly.com/cdn/shop/files/8059-Black_Lorena_7.jpg?v=1704902551&width=920"
      },
      {
        id: "5",
        name: "SUMMER BREEZE MAXI",
        price: "€95.00",
        image: "https://cdn.shopify.com/s/files/1/0061/8627/0804/files/0-modelinfo-selina-us2_4b74d5cd-381f-4c49-b28f-06f010bb5094_350x350.jpg?v=1740701938"
      }
    ],
    reviews: [
      {
        id: 1,
        author: "Emma S.",
        rating: 5,
        date: "July 15, 2023",
        comment: "I absolutely love this dress! The fabric is high quality and the fit is perfect. I got so many compliments when I wore it to a wedding."
      },
      {
        id: 2,
        author: "Sophia T.",
        rating: 4,
        date: "June 29, 2023",
        comment: "Beautiful dress with great material. Runs slightly large but still looks amazing. The color is exactly as pictured."
      },
      {
        id: 3,
        author: "Olivia M.",
        rating: 5,
        date: "June 10, 2023",
        comment: "Perfect summer dress! The fabric is lightweight but not see-through, and the cut is very flattering."
      }
    ]
  };
  
  return product;
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlistItem, isInWishlist } = useWishlist();
  const { cartNotification, success, error, wishlistNotification, info } = useToast();
  
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
  
  // Current URL for sharing
  const currentUrl = window.location.href;
  
  // Initialize with the product info from navigation state or generate dummy data
  useEffect(() => {
    // Check if we received product info via navigation state
    const productFromNav = location.state?.productInfo;
    
    if (productFromNav) {
      // Convert the productInfo format to match our product format
      const fullProduct = {
        ...generateProductDetails(), // Get the structure and dummy data
        id: productFromNav.id || id,
        name: productFromNav.name,
        basePrice: productFromNav.price,
        variants: productFromNav.allVariants || []
      };
      
      setProduct(fullProduct);
      setSelectedVariantIndex(productFromNav.currentVariantIndex || 0);
    } else {
      // Fallback to dummy data
      setProduct(generateProductDetails(id));
    }
  }, [id, location.state]);
  
  // Update main image when variant changes
  useEffect(() => {
    if (product && product.variants.length > selectedVariantIndex) {
      setMainImage(product.variants[selectedVariantIndex].image);
    }
  }, [product, selectedVariantIndex]);
  
  // Check if product is in wishlist
  useEffect(() => {
    if (product && selectedSize) {
      const wishlisted = isInWishlist(
        product.id, 
        selectedSize, 
        product.variants[selectedVariantIndex].color
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
    // Validate size selection first
    if (!selectedSize) {
      error('Please select a size first');
      return;
    }
    
    // Prevent multiple clicks by setting adding state
    setAddingToCart(true);
    
    try {
      // Prepare product for cart with all required information
      const cartProduct = {
        id: product.id,
        name: product.name,
        variants: product.variants,
        currentVariantIndex: selectedVariantIndex,
        selectedColor: product.variants[selectedVariantIndex].color,
        colorName: product.variants[selectedVariantIndex].colorName,
        size: selectedSize,
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
            image: product.variants[selectedVariantIndex].image,
            position: 'top-right',
            duration: 3000,
            onActionClick: () => {
              try {
                navigate('/cart');
              } catch (err) {
                console.error('Navigation error:', err);
              }
            }
          }
        );
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Show error toast instead of alert
      error('Sorry, there was an error adding this item to your cart. Please try again.');
    } finally {
      // Delay resetting the adding state for visual feedback
      setTimeout(() => {
        setAddingToCart(false);
      }, 600);
    }
  };
  
  // Handle buy now
  const handleBuyNow = () => {
    try {
      if (!selectedSize) {
        alert('Please select a size');
        return;
      }
      
      // Navigate to checkout page with product info
      navigate('/checkout', {
        state: {
          productInfo: {
            id: product.id,
            name: product.name,
            price: product.variants[selectedVariantIndex].price,
            image: product.variants[selectedVariantIndex].image,
            selectedColor: product.variants[selectedVariantIndex].color,
            colorName: product.variants[selectedVariantIndex].colorName,
            size: selectedSize,
            quantity: quantity,
            allVariants: product.variants,
            currentVariantIndex: selectedVariantIndex
          }
        }
      });
    } catch (error) {
      console.error('Error navigating to checkout:', error);
      alert('Sorry, there was an error proceeding to checkout. Please try again.');
    }
  };
  
  // Handle thumbnail click
  const handleThumbnailClick = (image) => {
    setMainImage(image);
  };
  
  // Handle similar product click
  const handleSimilarProductClick = (similarProduct) => {
    navigate(`/product/${similarProduct.id}`, {
      state: {
        productInfo: {
          id: similarProduct.id,
          name: similarProduct.name,
          price: similarProduct.price,
          image: similarProduct.image,
          allVariants: [
            { 
              color: '#000000', 
              image: similarProduct.image, 
              price: similarProduct.price 
            }
          ],
          currentVariantIndex: 0
        }
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
    if (!selectedSize) {
      error('Please select a size first');
      return;
    }
    
    // Set loading state
    setAddingToWishlist(true);
    
    try {
      // Prepare product for wishlist
      const wishlistProduct = {
        id: product.id,
        name: product.name,
        price: product.variants[selectedVariantIndex].price,
        image: product.variants[selectedVariantIndex].image,
        color: product.variants[selectedVariantIndex].color,
        colorName: product.variants[selectedVariantIndex].colorName,
        size: selectedSize
      };
      
      // Toggle wishlist state
      const result = toggleWishlistItem(wishlistProduct);
      
      // Update UI state based on result
      if (result && result.success) {
        if (result.action === 'added') {
          // Show added to wishlist toast
          wishlistNotification(`${product.name} has been added to your wishlist`, {
            title: 'Added to Wishlist',
            image: product.variants[selectedVariantIndex].image,
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
  
  // If product is not loaded yet
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          <span className="mx-2">/</span>
          <a href="/" className="hover:text-gray-900">Home</a>
          <span className="mx-2">/</span>
          <a href="/shop" className="hover:text-gray-900">Shop</a>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">{product.name}</span>
        </div>
        
        {/* Product Detail Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
              <img
                src={mainImage || product.variants[selectedVariantIndex].image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {product.variants[selectedVariantIndex]?.additionalImages?.map((image, index) => (
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
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-2 flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">{product.rating} ({product.reviewCount} reviews)</span>
            </div>
            
            <div className="mt-4">
              <span className="text-2xl font-bold text-gray-900">
                {product.variants[selectedVariantIndex].price}
              </span>
            </div>
            
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
                {product.variants[selectedVariantIndex].colorName}
              </p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Size</h3>
              <div className="grid grid-cols-5 gap-2 mt-2">
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
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-full text-center py-1 border-x border-gray-300"
                />
                <button
                  className="px-3 py-1 text-gray-600 hover:text-gray-900"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
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
                  <p className="text-sm text-gray-500">Free standard shipping on orders over €100</p>
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
        <div className="mt-16 border-t border-gray-200 pt-10">
          <div className="flex border-b border-gray-200">
            <button
              className={`pb-4 px-1 mr-8 text-sm font-medium border-b-2 ${
                activeTab === 'description'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`pb-4 px-1 mr-8 text-sm font-medium border-b-2 ${
                activeTab === 'details'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Details & Care
            </button>
            <button
              className={`pb-4 px-1 mr-8 text-sm font-medium border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviewCount})
            </button>
          </div>
          
          <div className="mt-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p>{product.description}</p>
              </div>
            )}
            
            {activeTab === 'details' && (
              <div className="prose max-w-none">
                <ul className="list-disc pl-5 space-y-2">
                  {product.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
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
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {product.similarProducts.map((similarProduct) => (
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
                  />
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{similarProduct.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{similarProduct.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recently Viewed */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
            
            <div className="p-6">
              <div className="mb-8">
                <h4 className="text-base font-medium text-gray-900 mb-4">How to Measure</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded-full mb-3">
                      <Ruler className="w-12 h-12 text-gray-400" />
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">Bust</h5>
                    <p className="text-sm text-gray-500 text-center">Measure around the fullest part of your bust, keeping the tape parallel to the floor.</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded-full mb-3">
                      <Ruler className="w-12 h-12 text-gray-400" />
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">Waist</h5>
                    <p className="text-sm text-gray-500 text-center">Measure around your natural waistline, keeping the tape comfortably loose.</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded-full mb-3">
                      <Ruler className="w-12 h-12 text-gray-400" />
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">Hips</h5>
                    <p className="text-sm text-gray-500 text-center">Measure around the fullest part of your hips, about 8 inches below your waistline.</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h4 className="text-base font-medium text-gray-900 mb-4">Women's Clothing Sizes</h4>
                <div className="overflow-x-auto">
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
      
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;