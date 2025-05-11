import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFilter, FaStar, FaHeart, FaRegHeart, FaChevronDown } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCollectionsStore } from '../store/collectionsStore';
import { useProductStore } from '../store/productStore';
import CustomerSupportChat from '../components/CustomerSupportChat';

const FeaturedCollectionPage = () => {
  const { collectionId } = useParams();
  const { getCollectionById, collections } = useCollectionsStore();
  const { products } = useProductStore();
  
  // Collection and product states
  const [collection, setCollection] = useState(null);
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState('featured');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  
  // Load collection and products
  useEffect(() => {
    setLoading(true);
    
    // Find collection by ID from store
    const fetchedCollection = getCollectionById(collectionId) || 
      collections.find(c => c._id === collectionId || c.slug === collectionId);
    
    if (fetchedCollection) {
      setCollection(fetchedCollection);
      
      // Get products associated with this collection
      const associatedProducts = products.filter(product => 
        fetchedCollection.products?.includes(product._id)
      );
      
      // Set available price range based on products
      if (associatedProducts.length > 0) {
        const minPrice = Math.min(...associatedProducts.map(p => p.basePrice || p.price || 0));
        const maxPrice = Math.max(...associatedProducts.map(p => p.basePrice || p.price || 0));
        setPriceRange([minPrice, maxPrice]);
      }
      
      setCollectionProducts(associatedProducts);
    }
    
    setLoading(false);
  }, [collectionId, collections, products, getCollectionById]);
  
  // Extract unique categories and sizes from products
  const availableCategories = [...new Set(collectionProducts.map(p => p.category).filter(Boolean))];
  
  const availableSizes = [...new Set(
    collectionProducts.flatMap(p => 
      p.variants?.flatMap(v => v.sizes?.map(s => s.size) || []) || []
    ).filter(Boolean)
  )];
  
  // Filter products based on selected options
  const filteredProducts = collectionProducts.filter(product => {
    const price = product.basePrice || product.price || 0;
    const inPriceRange = price >= priceRange[0] && price <= priceRange[1];
    
    const matchesCategory = selectedCategories.length === 0 || 
      (product.category && selectedCategories.includes(product.category));
    
    const matchesSize = selectedSizes.length === 0 || 
      product.variants?.some(v => 
        v.sizes?.some(s => selectedSizes.includes(s.size))
      );
    
    return inPriceRange && matchesCategory && matchesSize;
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-asc':
        return (a.basePrice || a.price || 0) - (b.basePrice || b.price || 0);
      case 'price-desc':
        return (b.basePrice || b.price || 0) - (a.basePrice || a.price || 0);
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default: // 'featured'
        return 0; // Maintain original order
    }
  });
  
  // Handle price range change
  const handlePriceRangeChange = (event, index) => {
    const newRange = [...priceRange];
    newRange[index] = Number(event.target.value);
    setPriceRange(newRange);
  };
  
  // Toggle category selection
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Toggle size selection
  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };
  
  // Toggle wishlist
  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setPriceRange([0, 1000]); 
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSortOption('featured');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Collection Banner */}
      <div className="relative w-full h-[40vh] bg-gray-900">
        {collection?.image ? (
          <img 
            src={collection.image}
            alt={collection?.name}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse rounded-lg bg-gray-700 w-full h-full"></div>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{collection?.name || 'Collection'}</h1>
          <p className="text-white text-lg max-w-2xl text-center px-4">
            {collection?.description || 'Explore our collection of curated products'}
          </p>
        </div>
      </div>
      
      {/* Collection Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link to="/" className="text-gray-500 hover:text-black">Home</Link></li>
            <li><span className="text-gray-500">/</span></li>
            <li><Link to="/collections" className="text-gray-500 hover:text-black">Collections</Link></li>
            <li><span className="text-gray-500">/</span></li>
            <li className="font-medium">{collection?.name || 'Collection'}</li>
          </ol>
        </nav>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.div 
            className={`${showFilters ? 'w-full md:w-1/4' : 'w-full md:w-auto'} bg-white`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden p-2 rounded-full bg-gray-100 text-gray-700"
                >
                  <FaFilter className="w-4 h-4" />
                </button>
              </div>
              
              {showFilters && (
                <div className="space-y-8 pb-6 border-b">
                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center justify-between">
                      <span>Price Range</span>
                      <FaChevronDown className="w-3 h-3 text-gray-500" />
                    </h3>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>GH₵{priceRange[0]}</span>
                        <span>GH₵{priceRange[1]}</span>
                      </div>
                      <div className="relative mt-2">
                        <div className="h-1 bg-gray-200 rounded-full">
                          <div 
                            className="absolute h-1 bg-black rounded-full"
                            style={{
                              left: `${(priceRange[0] / 1000) * 100}%`,
                              width: `${((priceRange[1] - priceRange[0]) / 1000) * 100}%`
                            }}
                          ></div>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1000}
                          value={priceRange[0]}
                          onChange={(e) => handlePriceRangeChange(e, 0)}
                          className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer"
                        />
                        <input
                          type="range"
                          min={0}
                          max={1000}
                          value={priceRange[1]}
                          onChange={(e) => handlePriceRangeChange(e, 1)}
                          className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Categories */}
                  {availableCategories.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3 flex items-center justify-between">
                        <span>Categories</span>
                        <FaChevronDown className="w-3 h-3 text-gray-500" />
                      </h3>
                      <div className="space-y-2">
                        {availableCategories.map((category) => (
                          <div key={category} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onChange={() => toggleCategory(category)}
                              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                            />
                            <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Sizes */}
                  {availableSizes.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3 flex items-center justify-between">
                        <span>Sizes</span>
                        <FaChevronDown className="w-3 h-3 text-gray-500" />
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {availableSizes.map((size) => (
                          <button
                            key={size}
                            className={`px-3 py-2 text-xs border rounded-md ${
                              selectedSizes.includes(size)
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                            }`}
                            onClick={() => toggleSize(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Reset Button */}
                  <button
                    onClick={resetFilters}
                    className="w-full py-2 text-sm text-gray-600 hover:text-black border-t border-gray-200 pt-4"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort Controls */}
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <div className="text-sm text-gray-600">
                <span>{sortedProducts.length} products</span>
              </div>
              <div className="flex items-center">
                <label className="text-sm mr-2">Sort by:</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 h-80 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded mt-4 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mt-2 w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group"
                  >
                    <div className="relative overflow-hidden">
                      <Link to={`/product/${product._id}`}>
                        <img
                          src={product.image || (product.variants?.[0]?.images?.[0])}
                          alt={product.name}
                          className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/300x400?text=Product+Image";
                          }}
                        />
                      </Link>
                      <button
                        onClick={() => toggleWishlist(product._id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
                      >
                        {wishlist.includes(product._id) ? (
                          <FaHeart className="w-4 h-4 text-red-500" />
                        ) : (
                          <FaRegHeart className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-4">
                      <Link to={`/product/${product._id}`} className="block">
                        <h3 className="text-md font-medium text-gray-900 group-hover:underline">{product.name}</h3>
                      </Link>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <FaStar
                                key={i}
                                className={`w-3 h-3 ${
                                  i < (product.rating || 0)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">{product.numReviews || 0} reviews</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-md font-bold text-gray-900">
                          GH₵{(product.basePrice || product.price || 0).toFixed(2)}
                        </p>
                        {product.stock <= 0 && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <h3 className="text-xl font-medium text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or check out other collections.</p>
                <button 
                  onClick={resetFilters}
                  className="bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors rounded-md"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">JOIN OUR NEWSLETTER</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button className="px-6 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors">
              SUBSCRIBE
            </button>
          </form>
        </div>
      </section>
      
      <Footer />
      <CustomerSupportChat />
    </div>
  );
};

export default FeaturedCollectionPage; 