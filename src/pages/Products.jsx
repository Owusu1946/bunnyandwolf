import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import Footer from '../components/Footer';
import CTAFooter from '../components/CTAFooter';
import { FaFilter, FaSearch, FaTimes, FaShoppingBag, FaHeart, FaStar, FaGlobe, FaStore } from 'react-icons/fa';
import { useProductStore } from '../store/productStore';
import { usePlatformsStore } from '../store/platformsStore';
import '../styles/Home.css';
import '../styles/Products.css';

const Products = () => {
  const navigate = useNavigate();
  const { category: urlCategory } = useParams();
  
  // Get products and methods from product store
  const { 
    products, 
    categories, 
    filteredProducts,
    fetchProductsFromAPI, 
    searchProducts, 
    filterByCategory,
    filterByPlatform,
    getProductsByCategory,
    getProductsByPlatformAndCategory
  } = useProductStore();
  
  // Get platforms from platforms store
  const {
    platforms,
    fetchPlatformsFromAPI,
    getPlatformById
  } = usePlatformsStore();
  
  // State for filters
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [displayProducts, setDisplayProducts] = useState([]);

  // Fetch products and platforms when component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // If we don't have products yet, fetch them
        if (products.length === 0) {
          await fetchProductsFromAPI();
        }
        
        // If we don't have platforms yet, fetch them
        if (platforms.length === 0) {
          await fetchPlatformsFromAPI();
        }
        
        // Apply any URL category filter
        if (urlCategory && urlCategory !== 'all') {
          setSelectedCategory(urlCategory);
          filterByCategory(urlCategory);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchProductsFromAPI, fetchPlatformsFromAPI, products.length, platforms.length, urlCategory, filterByCategory]);
  
  // Update product list when filters change
  const applyFilters = useCallback(() => {
    let result = [...products];
    
    // Apply platform and category filters together
    if (selectedPlatform !== 'all' || (selectedCategory !== 'all' && selectedCategory)) {
      result = getProductsByPlatformAndCategory(
        selectedPlatform !== 'all' ? selectedPlatform : null,
        selectedCategory
      );
    }
    
    // Apply search query if not empty
    if (searchQuery.trim()) {
      result = searchProducts(searchQuery);
      
      // If we have filters, we need to apply them to search results
      if (selectedCategory && selectedCategory !== 'all') {
        result = result.filter(product => product.category === selectedCategory);
      }
      
      if (selectedPlatform && selectedPlatform !== 'all') {
        result = result.filter(product => product.platformId === selectedPlatform);
      }
    }
    
    // Apply price range filter
    result = result.filter(product => {
      const price = typeof product.basePrice === 'number' ? product.basePrice : parseFloat(product.basePrice || 0);
      return price >= priceRange.min && price <= priceRange.max;
    });
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => {
          const priceA = typeof a.basePrice === 'number' ? a.basePrice : parseFloat(a.basePrice || 0);
          const priceB = typeof b.basePrice === 'number' ? b.basePrice : parseFloat(b.basePrice || 0);
          return priceA - priceB;
        });
        break;
      case 'price-high':
        result.sort((a, b) => {
          const priceA = typeof a.basePrice === 'number' ? a.basePrice : parseFloat(a.basePrice || 0);
          const priceB = typeof b.basePrice === 'number' ? b.basePrice : parseFloat(b.basePrice || 0);
          return priceB - priceA;
        });
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        break;
    }
    
    setDisplayProducts(result);
  }, [
    products, 
    selectedCategory,
    selectedPlatform, 
    searchQuery, 
    priceRange, 
    sortBy, 
    getProductsByCategory,
    getProductsByPlatformAndCategory, 
    searchProducts
  ]);
  
  // Apply filters when filter states change
  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [loading, applyFilters]);

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle search form submit
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    
    // Update URL to reflect category
    if (newCategory === 'all') {
      navigate('/products');
    } else {
      navigate(`/products/${newCategory}`);
    }
  };
  
  // Handle platform change
  const handlePlatformChange = (e) => {
    setSelectedPlatform(e.target.value);
  };

  // Get platform info for a product
  const getPlatformInfo = (platformId) => {
    if (!platformId) return null;
    return getPlatformById(platformId);
  };

  // Price formatter
  const formatPrice = (price) => {
    if (typeof price === 'undefined' || price === null) return 'Price not available';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(typeof price === 'number' ? price : parseFloat(price));
  };
  
  // Calculate sale price with discount
  const calculateSalePrice = (price, discount) => {
    if (!price) return 0;
    return parseFloat(price) - (parseFloat(price) * (discount / 100));
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedPlatform('all');
    setSearchQuery('');
    setPriceRange({ min: 0, max: 5000 });
    setSortBy('newest');
    navigate('/products');
  };

  // Toggle mobile filter panel
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Handle product click - navigate to product details page
  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`, { 
      state: { 
        productId: product._id,
        variantIndex: 0 
      } 
    });
  };
  
  // Get image for product - with fallbacks for different product structures
  const getProductImage = (product) => {
    // If product has direct image
    if (product.image) {
      return product.image;
    }
    
    // Check for variant images
    if (product.variants && product.variants.length > 0) {
      // First try the variant image
      if (product.variants[0].image) {
        return product.variants[0].image;
      }
      
      // Next try additional images of first variant
      if (product.variants[0].additionalImages && product.variants[0].additionalImages.length > 0) {
        return product.variants[0].additionalImages[0];
      }
    }
    
    // Fallback to placeholder
    return `https://via.placeholder.com/400x500?text=${encodeURIComponent(product.name || 'Product')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeNavbar />
      
      {/* Hero Banner */}
      <section className="relative bg-black pt-20">
        <div className="bg-gradient-to-r from-black to-red-800 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {selectedCategory !== 'all' ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}` : 'Our Products'}
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Browse our extensive collection of high-quality products sourced directly from trusted Chinese manufacturers.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative flex-grow max-w-md">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                <button type="submit" className="hidden">Search</button>
              </form>
              
              {/* Desktop Filters */}
              <div className="hidden md:flex items-center gap-4 flex-wrap">
                {/* Categories */}
                <select
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                  ))}
                </select>
                
                {/* Platforms */}
                <select
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                  value={selectedPlatform}
                  onChange={handlePlatformChange}
                >
                  <option value="all">All Platforms</option>
                  {platforms.map(platform => (
                    <option key={platform._id} value={platform._id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
                
                {/* Sort */}
                <select
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                
                <button
                  onClick={resetFilters}
                  className="px-4 py-3 text-gray-600 hover:text-red-600"
                >
                  Reset
                </button>
              </div>
              
              {/* Mobile Filter Toggle */}
              <button
                className="md:hidden flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg"
                onClick={toggleFilters}
              >
                <FaFilter className="mr-2" /> Filters
              </button>
            </div>
            
            {/* Mobile Filter Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden mt-4 pt-4 border-t border-gray-200"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                      value={selectedPlatform}
                      onChange={handlePlatformChange}
                    >
                      <option value="all">All Platforms</option>
                      {platforms.map(platform => (
                        <option key={platform._id} value={platform._id}>
                          {platform.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Range: GH₵{priceRange.min} - GH₵{priceRange.max}
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-gray-600 hover:text-red-600 flex items-center"
                    >
                      <FaTimes className="mr-2" /> Reset All
                    </button>
                    <button
                      onClick={toggleFilters}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-700">
              Showing <span className="font-semibold">{displayProducts.length}</span> products
            </p>
            {selectedCategory !== 'all' || selectedPlatform !== 'all' || searchQuery || priceRange.min > 0 || priceRange.max < 5000 ? (
              <button
                onClick={resetFilters}
                className="text-red-600 hover:text-red-800 text-sm flex items-center"
              >
                <FaTimes className="mr-1" /> Clear filters
              </button>
            ) : null}
          </div>
          
          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
              {error}
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayProducts.map((product, index) => {
                // Determine product price and discount
                const price = typeof product.basePrice === 'number' ? product.basePrice : parseFloat(product.basePrice || 0);
                const discount = product.discount || 0;
                const hasDiscount = discount > 0;
                const salePrice = hasDiscount ? calculateSalePrice(price, discount) : price;
                
                // Get product image
                const imageUrl = getProductImage(product);
                
                // Get platform info
                const platform = getPlatformInfo(product.platformId);
                
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group product-card"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative product-image-wrapper">
                      <img 
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-64 object-cover transition-transform duration-500 product-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://via.placeholder.com/400x500?text=${encodeURIComponent(product.name || 'Product')}`;
                        }}
                      />
                      {hasDiscount && (
                        <div className="product-card-badge">
                          -{discount}%
                        </div>
                      )}
                      
                      {/* Product actions */}
                      <div className="product-actions">
                        <button 
                          className="bg-white text-black p-2 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add to cart logic would go here
                          }}
                          aria-label="Add to cart"
                        >
                          <FaShoppingBag />
                        </button>
                        <button
                          className="bg-white text-black p-2 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add to wishlist logic would go here
                          }}
                          aria-label="Add to wishlist"
                        >
                          <FaHeart />
                        </button>
                      </div>
                      
                      {/* Category tag */}
                      {product.category && (
                        <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          {product.category}
                        </div>
                      )}
                      
                      {/* Platform tag */}
                      {platform && (
                        <div className="absolute top-9 left-2 bg-blue-600 bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <FaGlobe className="text-[10px]" />
                          {platform.name}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center">
                          <FaStar className="text-yellow-500" />
                          <span className="text-sm text-gray-600 ml-1">{product.rating || '4.5'}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          {hasDiscount ? (
                            <div>
                              <span className="text-gray-400 line-through text-sm">
                                {formatPrice(price)}
                              </span>
                              <span className="text-red-600 font-bold ml-2">
                                {formatPrice(salePrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-900 font-bold">
                              {formatPrice(price)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {platform && (
                            <span className="flex items-center text-xs text-blue-600 font-medium">
                              <FaStore className="mr-1 text-[10px]" />
                            </span>
                          )}
                          <button
                            className="px-3 py-1 bg-gray-100 hover:bg-red-600 hover:text-white text-gray-700 text-sm rounded-full transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {/* Pagination */}
          {/* Implement proper pagination when backend supports it */}
          {!loading && displayProducts.length > 0 && (
            <div className="mt-12 flex justify-center">
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50"
                  disabled
                >
                  Previous
                </button>
                
                <button className="px-4 py-2 border border-red-600 bg-red-600 text-white rounded-lg">
                  1
                </button>
                
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50"
                  disabled
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <CTAFooter />
      
      <Footer />
    </div>
  );
};

export default Products; 