import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExternalLinkAlt, FaEdit, FaTrash, FaPlus, FaExclamationCircle, FaSync, FaBars } from 'react-icons/fa';
import Sidebar from '../../components/admin/Sidebar';
import LoadingOverlay from '../../components/LoadingOverlay';
import { usePlatformsStore } from '../../store/platformsStore';
import { useProductStore } from '../../store/productStore';
import axios from 'axios';
import apiConfig from '../../config/apiConfig';

const PlatformDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [platformProducts, setPlatformProducts] = useState([]);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Get platform data from store
  const { 
    platforms, 
    loading: platformsLoading, 
    fetchPlatformsFromAPI,
    deletePlatform
  } = usePlatformsStore();
  
  // Get products
  const { products, fetchProductsFromAPI } = useProductStore();
  
  // Find the current platform
  const platform = platforms.find(p => p._id === id);
  
  // Load platform and products data
  useEffect(() => {
    loadData();
  }, [id, platforms.length, products.length, fetchPlatformsFromAPI, fetchProductsFromAPI]);
  
  // Detect mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Function to load all data
  const loadData = async () => {
    setLoading(true);
    try {
      // If platforms are not loaded, fetch them
      if (platforms.length === 0) {
        await fetchPlatformsFromAPI();
      }
      
      // If products are not loaded, fetch them
      if (products.length === 0) {
        await fetchProductsFromAPI();
      }
      
      // Filter products by platform ID
      const filteredProducts = products.filter(product => product.platformId === id);
      setPlatformProducts(filteredProducts);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error loading platform data:", err);
      setError("Failed to load platform data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh platform data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchPlatformsFromAPI();
      const filteredProducts = products.filter(product => product.platformId === id);
      setPlatformProducts(filteredProducts);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error refreshing platform data:", err);
      setError("Failed to refresh data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Handle edit platform
  const handleEditPlatform = () => {
    navigate('/admin/platforms', { state: { editPlatformId: id } });
  };
  
  // Handle delete platform
  const handleDeletePlatform = async () => {
    setLoading(true);
    try {
      await deletePlatform(id);
      navigate('/admin/platforms');
    } catch (err) {
      setError("Failed to delete platform. Please try again.");
      setLoading(false);
    }
  };
  
  // If loading, show loading overlay
  if (loading || platformsLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} transition-all duration-300 ease-in-out`}>
          <LoadingOverlay />
        </div>
      </div>
    );
  }
  
  // If platform not found, show error
  if (!platform) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} transition-all duration-300 ease-in-out p-4 md:p-8`}>
          <Link to="/admin/platforms" className="flex items-center text-purple-600 mb-6">
            <FaArrowLeft className="mr-2" /> Back to Platforms
          </Link>
          <div className="bg-white p-4 md:p-8 rounded-lg shadow-sm flex flex-col items-center justify-center">
            <FaExclamationCircle className="text-red-500 text-5xl mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 text-center">Platform Not Found</h2>
            <p className="text-gray-600 mb-6 text-center">The platform you're looking for doesn't exist or has been removed.</p>
            <Link to="/admin/platforms" className="bg-purple-600 text-white px-4 py-2 rounded-lg">
              Return to Platforms
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} transition-all duration-300 ease-in-out`}>
        <div className={`${isMobile ? 'p-4' : 'p-8'}`}>
          <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex justify-between items-center'} mb-6`}>
            <Link to="/admin/platforms" className="flex items-center text-purple-600">
              <FaArrowLeft className="mr-2" /> Back to Platforms
            </Link>
            <div className={`flex ${isMobile ? 'flex-col space-y-2 w-full' : 'space-x-3'}`}>
              <button
                onClick={handleRefresh}
                className={`${isMobile ? 'w-full justify-center' : ''} bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center ${refreshing ? 'animate-pulse' : ''}`}
                disabled={refreshing}
              >
                <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> 
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <button
                onClick={handleEditPlatform}
                className={`${isMobile ? 'w-full justify-center' : ''} bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center`}
              >
                <FaEdit className="mr-2" /> Edit Platform
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className={`${isMobile ? 'w-full justify-center' : ''} bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center`}
              >
                <FaTrash className="mr-2" /> Delete Platform
              </button>
            </div>
          </div>
          
          {/* Last updated info */}
          {lastUpdated && (
            <div className="mb-4 text-right text-sm text-gray-500">
              Last updated: {formatDate(lastUpdated)} at {formatTime(lastUpdated)}
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-100">
              <p className="font-medium">{error}</p>
            </div>
          )}
          
          {/* Platform Header with Banner */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="h-40 sm:h-56 bg-gray-200 relative">
              {platform.bannerUrl ? (
                <img 
                  src={platform.bannerUrl} 
                  alt={`${platform.name} banner`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/1200x400?text=No+Banner';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-400 to-blue-500">
                  <h1 className="text-2xl sm:text-4xl font-bold text-white">{platform.name}</h1>
                </div>
              )}
              
              {/* Logo overlapping the banner */}
              <div className={`absolute ${isMobile ? '-bottom-12 left-4 w-24 h-24' : '-bottom-16 left-8 w-32 h-32'} rounded-xl overflow-hidden border-4 border-white bg-white shadow-md`}>
                {platform.logoUrl ? (
                  <img 
                    src={platform.logoUrl} 
                    alt={`${platform.name} logo`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/120?text=Logo';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-800 text-2xl font-bold">
                    {platform.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            
            <div className={`${isMobile ? 'pt-16 px-4 pb-6' : 'pt-20 px-8 pb-8'}`}>
              <div className={`${isMobile ? 'flex flex-col' : 'flex justify-between items-start'}`}>
                <div>
                  <div className="flex items-center flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{platform.name}</h1>
                    {platform.isActive ? (
                      <span className="ml-3 mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="ml-3 mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-gray-600">{platform.description}</p>
                </div>
                <a 
                  href={`https://${platform.domain}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center text-purple-600 hover:underline ${isMobile ? 'mt-4' : ''}`}
                >
                  Visit Platform <FaExternalLinkAlt className="ml-1" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Platform Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Platform Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Domain:</span>
                  <p className="font-medium">{platform.domain}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Theme:</span>
                  <p className="font-medium">{platform.theme || 'Default'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Created On:</span>
                  <p className="font-medium">{formatDate(platform.createdAt)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Last Updated:</span>
                  <p className="font-medium">{formatDate(platform.updatedAt)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Sales Overview</h2>
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-3xl font-bold text-purple-600">{formatCurrency(platform.revenue || 0)}</div>
                <p className="text-gray-500 mt-2">Total Revenue</p>
                <div className="text-xs text-center text-gray-500 mt-1 mb-3">(Calculated from product orders)</div>
                <div className="text-2xl font-semibold mt-2">{platform.salesCount || 0}</div>
                <p className="text-gray-500 mt-1">Items Sold</p>
              </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Product Categories</h2>
              {platform.productCategories && platform.productCategories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {platform.productCategories.map(category => (
                    <span 
                      key={category} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No categories assigned</p>
              )}
            </div>
          </div>
          
          {/* Platform Products */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-between items-center'} p-4 md:p-6 border-b`}>
              <h2 className="text-lg font-semibold text-gray-800">Platform Products</h2>
              <Link
                to="/admin/products"
                state={{ addForPlatform: id }}
                className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center ${isMobile ? 'w-full justify-center' : ''}`}
              >
                <FaPlus className="mr-2" /> Add Product
              </Link>
            </div>
            
            {platformProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
                {platformProducts.map(product => (
                  <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-200 relative">
                      <img 
                        src={product.variants?.[0]?.additionalImages?.[0] || product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                      {product.stock <= 5 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          Low Stock: {product.stock}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <div>
                          <span className="text-lg font-semibold text-gray-900">
                            {formatCurrency(product.basePrice)}
                          </span>
                          {product.salePrice && (
                            <span className="ml-2 text-sm line-through text-gray-500">
                              {formatCurrency(product.salePrice)}
                            </span>
                          )}
                        </div>
                        <Link 
                          to={`/admin/products?edit=${product._id}`}
                          className="text-purple-600 hover:text-purple-800 p-2"
                        >
                          <FaEdit />
                        </Link>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="mr-2">Category:</span>
                        <span className="font-medium">{product.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 md:py-12 flex flex-col items-center justify-center">
                <div className="h-20 w-20 md:h-24 md:w-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <FaExclamationCircle className="h-8 w-8 md:h-10 md:w-10 text-purple-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1 text-center">No Products Found</h3>
                <p className="text-gray-500 mb-6 text-center px-4">This platform has no associated products yet.</p>
                <Link
                  to="/admin/products"
                  state={{ addForPlatform: id }}
                  className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center ${isMobile ? 'w-full justify-center' : ''}`}
                >
                  <FaPlus className="mr-2" /> Add First Product
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-4 md:p-6">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FaTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center">Delete Platform</h3>
              <p className="text-gray-500 text-center mt-2">
                Are you sure you want to delete <span className="font-medium">{platform.name}</span>? This action cannot be undone and will remove all associated data.
              </p>
              
              {platformProducts.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg">
                  <p className="font-medium">Warning: This platform has {platformProducts.length} products associated with it.</p>
                  <p className="text-sm mt-1">Deleting this platform may affect these products.</p>
                </div>
              )}
            </div>
            
            <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex justify-end gap-3'} mt-6`}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className={`${isMobile ? 'w-full order-2' : ''} px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePlatform}
                className={`${isMobile ? 'w-full order-1' : ''} px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformDetailsPage; 