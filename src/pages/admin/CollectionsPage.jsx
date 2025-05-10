import { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaTimes, FaImage, FaShoppingBag, FaEye, FaArrowLeft, FaChevronDown, FaChevronRight, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import Sidebar from '../../components/admin/Sidebar';
import LoadingOverlay from '../../components/LoadingOverlay';
import apiConfig from '../../config/apiConfig';
import { useCollectionsStore } from '../../store/collectionsStore';
import { useProductStore } from '../../store/productStore';

const CollectionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [viewingCollectionProducts, setViewingCollectionProducts] = useState(false);
  const [currentCollection, setCurrentCollection] = useState(null);
  const [collectionProducts, setCollectionProducts] = useState([]);
  
  // Get collections from store
  const {
    collections,
    fetchCollectionsFromAPI,
    addCollection: storeAddCollection,
    removeCollection: storeRemoveCollection
  } = useCollectionsStore();
  
  // Get products from store
  const { products: allProducts, fetchProductsFromAPI } = useProductStore();
  
  // New collection state
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    image: '',
    featured: false,
    products: []
  });

  // State for managing category expansion in dropdown
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  useEffect(() => {
    fetchCollections();
  }, [currentPage, searchTerm]);

  // Initialize collections from store or fetch if needed
  useEffect(() => {
    if (collections.length === 0) {
      fetchCollectionsFromAPI().then(() => {
        setLoading(false);
      });
    } else {
      // Collections already in store, just update pagination
      setTotalPages(Math.ceil(collections.length / 10));
      setLoading(false);
    }
    
    // Also fetch products for product selection
    fetchProductsFromAPI();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      
      // Real API call
      const response = await axios.get(`${apiConfig.baseURL}/collections`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update total pages
      if (response.data.success) {
        setTotalPages(Math.ceil(response.data.total / 10) || 1);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setLoading(false);
    }
  };

  // Fetch products for a specific collection
  const fetchCollectionProducts = async (collectionId) => {
    try {
      setLoading(true);
      
      // Get the collection with populated products
      const response = await axios.get(`${apiConfig.baseURL}/collections/${collectionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        const collection = response.data.data;
        setCurrentCollection(collection);
        
        // Get product details for each product ID
        let products = [];
        if (collection.products && collection.products.length > 0) {
          // If products are already populated objects
          if (typeof collection.products[0] === 'object') {
            products = collection.products;
          } else {
            // If products are just IDs, look them up from the store
            products = collection.products.map(productId => 
              allProducts.find(p => p._id === productId)
            ).filter(Boolean); // Remove undefined products
          }
        }
        
        setCollectionProducts(products);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching collection products:', error);
      setLoading(false);
    }
  };

  const handleViewCollectionProducts = (collection) => {
    setViewingCollectionProducts(true);
    fetchCollectionProducts(collection._id);
  };

  const handleBackToCollections = () => {
    setViewingCollectionProducts(false);
    setCurrentCollection(null);
    setCollectionProducts([]);
  };

  const handleRemoveProductFromCollection = async (productId) => {
    try {
      setLoading(true);
      
      const response = await axios.delete(
        `${apiConfig.baseURL}/collections/${currentCollection._id}/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Update collection in store
        fetchCollectionsFromAPI();
        
        // Update local state
        setCollectionProducts(prevProducts => 
          prevProducts.filter(product => product._id !== productId)
        );
        
        alert('Product removed from collection successfully');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error removing product from collection:', error);
      alert('Failed to remove product from collection');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);  // Reset to first page on new search
    fetchCollections();
  };
  
  // Add new collection handlers
  const handleAddCollectionOpen = () => {
    setShowAddModal(true);
  };
  
  const handleAddCollectionClose = () => {
    setShowAddModal(false);
    setNewCollection({
      name: '',
      description: '',
      image: '',
      featured: false,
      products: []
    });
  };
  
  const handleNewCollectionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCollection(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Check if a product is selected
  const isProductSelected = (productId) => {
    return newCollection.products.includes(productId);
  };

  // Toggle product selection
  const toggleProductSelection = (productId) => {
    setNewCollection(prev => {
      if (prev.products.includes(productId)) {
        return {
          ...prev,
          products: prev.products.filter(id => id !== productId)
        };
      } else {
        return {
          ...prev,
          products: [...prev.products, productId]
        };
      }
    });
  };

  // Filter products based on search term
  const getFilteredProducts = () => {
    if (!productSearchTerm.trim()) return allProducts;
    
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(productSearchTerm.toLowerCase())
    );
  };

  // Group products by category
  const getProductsByCategory = () => {
    const filtered = getFilteredProducts();
    const groupedProducts = {};
    
    filtered.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!groupedProducts[category]) {
        groupedProducts[category] = [];
      }
      groupedProducts[category].push(product);
    });
    
    return groupedProducts;
  };

  const handleAddCollection = async () => {
    try {
      // Start loading state
      setLoading(true);
      
      // Validate required fields
      if (!newCollection.name) {
        alert('Please enter a collection name');
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('You must be logged in to add collections');
        setLoading(false);
        return;
      }
      
      const response = await axios.post(
        `${apiConfig.baseURL}/collections`,
        newCollection,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Add to store
        storeAddCollection(response.data.data);
        
        // Show success message
        alert('Collection added successfully!');
        
        // Close modal and reset form
        handleAddCollectionClose();
        
        // Refresh collections
        fetchCollections();
      } else {
        throw new Error(response.data.error || 'Failed to add collection');
      }
    } catch (error) {
      console.error('Error adding collection:', error);
      alert(error.response?.data?.error || 'Failed to add collection. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Edit collection handlers
  const handleEditCollectionOpen = (collection) => {
    setEditingCollection(collection);
    setNewCollection({
      name: collection.name,
      description: collection.description,
      image: collection.image,
      featured: collection.featured,
      products: collection.products || []
    });
    setShowEditModal(true);
  };
  
  const handleEditCollectionClose = () => {
    setShowEditModal(false);
    setEditingCollection(null);
    setNewCollection({
      name: '',
      description: '',
      image: '',
      featured: false,
      products: []
    });
  };
  
  const handleUpdateCollection = async () => {
    try {
      // Start loading state
      setLoading(true);
      
      // Validate required fields
      if (!newCollection.name) {
        alert('Please enter a collection name');
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('You must be logged in to update collections');
        setLoading(false);
        return;
      }
      
      const response = await axios.put(
        `${apiConfig.baseURL}/collections/${editingCollection._id}`,
        newCollection,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Update in store
        storeAddCollection(response.data.data);
        
        // Show success message
        alert('Collection updated successfully!');
        
        // Close modal
        handleEditCollectionClose();
        
        // Refresh collections
        fetchCollections();
      } else {
        throw new Error(response.data.error || 'Failed to update collection');
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      alert(error.response?.data?.error || 'Failed to update collection. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete collection handlers
  const handleDeleteConfirmation = (collection) => {
    setCollectionToDelete(collection);
    setShowDeleteModal(true);
  };
  
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCollectionToDelete(null);
  };
  
  const confirmDeleteCollection = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('You must be logged in to delete collections');
        setLoading(false);
        closeDeleteModal();
        return;
      }
      
      const response = await axios.delete(
        `${apiConfig.baseURL}/collections/${collectionToDelete._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Remove from store
        storeRemoveCollection(collectionToDelete._id);
        
        // Close modal
        closeDeleteModal();
        
        // Refresh collections
        fetchCollections();
        
        // Show success message
        alert('Collection deleted successfully!');
      } else {
        throw new Error(response.data.error || 'Failed to delete collection');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert(error.response?.data?.error || 'Failed to delete collection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate collections for the current page
  const paginatedCollections = collections.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {loading && <LoadingOverlay />}
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search collections..."
                className="pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <FaSearch />
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white">
                O
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {viewingCollectionProducts ? (
              // View for collection products
              <>
                <div className="flex justify-between items-center p-4 border-b">
                  <div className="flex items-center">
                    <button 
                      onClick={handleBackToCollections}
                      className="mr-3 text-gray-500 hover:text-gray-700"
                    >
                      <FaArrowLeft className="text-lg" />
                    </button>
                    <h2 className="text-lg font-medium text-gray-800">
                      {currentCollection?.name} - Products ({collectionProducts.length})
                    </h2>
                  </div>
                </div>

                {collectionProducts.length > 0 ? (
                  <div className="min-w-full divide-y divide-gray-200">
                    <div className="bg-gray-50 grid grid-cols-6 gap-4 px-6 py-3">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider col-span-2">
                        Product
                      </div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                        Actions
                      </div>
                    </div>
                    <div className="bg-white divide-y divide-gray-200">
                      {collectionProducts.map((product) => (
                        <div key={product._id} className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-50">
                          <div className="col-span-2">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img 
                                  className="h-10 w-10 rounded-lg object-cover" 
                                  src={product.variants?.[0]?.additionalImages?.[0] || product.image} 
                                  alt={product.name}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.sku || 'No SKU'}</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 self-center">
                            {product.category}
                          </div>
                          <div className="text-sm text-gray-500 self-center">
                            GH₵ {product.basePrice?.toFixed(2) || "0.00"}
                          </div>
                          <div className="text-sm self-center">
                            <span className={`px-2 py-1 rounded-full text-xs
                              ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            `}>
                              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </span>
                          </div>
                          <div className="flex justify-center space-x-3 self-center">
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleRemoveProductFromCollection(product._id)}
                              title="Remove from collection"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FaShoppingBag className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-700 mb-1">No products in this collection</h3>
                    <p className="text-gray-500">Add products to this collection from the Products page</p>
                  </div>
                )}
              </>
            ) : (
              // Collections view
              <>
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-lg font-medium text-gray-800">Product Collections</h2>
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
                    onClick={handleAddCollectionOpen}
                  >
                    <FaPlus className="mr-2" /> Add Collection
                  </button>
                </div>
                
                {paginatedCollections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                    {paginatedCollections.map((collection) => (
                      <div key={collection._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative h-40 bg-gray-100">
                          <img 
                            src={collection.image} 
                            alt={collection.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://via.placeholder.com/400x200?text=${encodeURIComponent(collection.name)}`;
                            }}
                          />
                          {collection.featured && (
                            <div className="absolute top-2 right-2 bg-yellow-400 text-xs text-yellow-900 px-2 py-1 rounded-full">
                              Featured
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-purple-600 text-xs text-white px-2 py-1 rounded-full">
                            {collection.productCount || collection.products?.length || 0} Products
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900">{collection.name}</h3>
                          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{collection.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <button
                              className="px-2 py-1 text-sm text-purple-600 border border-purple-200 rounded hover:bg-purple-50 flex items-center"
                              onClick={() => handleViewCollectionProducts(collection)}
                            >
                              <FaEye className="w-3 h-3 mr-1" /> View Products
                            </button>
                            <div className="flex space-x-2">
                              <button
                                className="p-1 text-blue-600 hover:text-blue-800"
                                onClick={() => handleEditCollectionOpen(collection)}
                                title="Edit collection"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="p-1 text-red-600 hover:text-red-800"
                                onClick={() => handleDeleteConfirmation(collection)}
                                title="Delete collection"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FaImage className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-700 mb-1">No collections found</h3>
                    <p className="text-gray-500">Create your first collection to organize your products</p>
                    <button
                      className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
                      onClick={handleAddCollectionOpen}
                    >
                      <FaPlus className="mr-2" /> Add Collection
                    </button>
                  </div>
                )}
                
                {collections.length > 0 && totalPages > 1 && (
                  <div className="px-6 py-4 flex items-center justify-between border-t">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 border rounded ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 border rounded ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Add Collection Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Add New Collection</h2>
                <button 
                  onClick={handleAddCollectionClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6">
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Collection Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newCollection.name}
                      onChange={handleNewCollectionChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={newCollection.description}
                      onChange={handleNewCollectionChange}
                      rows="3"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                      Collection Image URL
                    </label>
                    <input
                      type="text"
                      id="image"
                      name="image"
                      value={newCollection.image}
                      onChange={handleNewCollectionChange}
                      placeholder="https://example.com/image.jpg"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    />
                    {newCollection.image && (
                      <div className="mt-2">
                        <img 
                          src={newCollection.image} 
                          alt="Preview" 
                          className="h-32 w-full object-cover rounded-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Selection Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Products for this Collection
                    </label>
                    
                    <div className="mb-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="block w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                          <FaSearch />
                        </div>
                      </div>
                      
                      {newCollection.products.length > 0 && (
                        <div className="mt-2 text-sm text-purple-600">
                          {newCollection.products.length} product{newCollection.products.length !== 1 ? 's' : ''} selected
                        </div>
                      )}
                    </div>
                    
                    <div className="border border-gray-200 rounded-md max-h-96 overflow-y-auto">
                      {Object.entries(getProductsByCategory()).map(([category, products]) => (
                        <div key={category} className="border-b border-gray-200 last:border-b-0">
                          <div 
                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleCategory(category)}
                          >
                            <div className="font-medium">{category} ({products.length})</div>
                            <div>
                              {expandedCategories.includes(category) ? <FaChevronDown /> : <FaChevronRight />}
                            </div>
                          </div>
                          
                          {expandedCategories.includes(category) && (
                            <div className="pl-4 pb-2">
                              {products.map(product => (
                                <div 
                                  key={product._id} 
                                  className={`flex items-center p-2 cursor-pointer hover:bg-gray-50 border-l-2 ${isProductSelected(product._id) ? 'border-purple-500' : 'border-transparent'}`}
                                  onClick={() => toggleProductSelection(product._id)}
                                >
                                  <div className="w-8 h-8 mr-3 flex-shrink-0">
                                    <img 
                                      src={product.image || product.variants?.[0]?.additionalImages?.[0]} 
                                      alt={product.name}
                                      className="w-8 h-8 object-cover rounded-sm"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/80?text=Product';
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                    <p className="text-xs text-gray-500">GH₵{product.basePrice?.toFixed(2) || "0.00"}</p>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isProductSelected(product._id) ? 'bg-purple-500 text-white' : 'border border-gray-300'}`}>
                                    {isProductSelected(product._id) && <FaCheck className="w-3 h-3" />}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {Object.keys(getProductsByCategory()).length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          No products found matching your search.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="featured"
                        name="featured"
                        type="checkbox"
                        checked={newCollection.featured}
                        onChange={handleNewCollectionChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="featured" className="font-medium text-gray-700">Featured Collection</label>
                      <p className="text-gray-500">Featured collections will be highlighted on the homepage</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleAddCollectionClose}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-3 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCollection}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Save Collection
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Collection Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Edit Collection</h2>
                <button 
                  onClick={handleEditCollectionClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6">
                <form className="space-y-6">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Collection Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={newCollection.name}
                      onChange={handleNewCollectionChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="edit-description"
                      name="description"
                      value={newCollection.description}
                      onChange={handleNewCollectionChange}
                      rows="3"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700 mb-1">
                      Collection Image URL
                    </label>
                    <input
                      type="text"
                      id="edit-image"
                      name="image"
                      value={newCollection.image}
                      onChange={handleNewCollectionChange}
                      placeholder="https://example.com/image.jpg"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    />
                    {newCollection.image && (
                      <div className="mt-2">
                        <img 
                          src={newCollection.image} 
                          alt="Preview" 
                          className="h-32 w-full object-cover rounded-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Selection Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Products for this Collection
                    </label>
                    
                    <div className="mb-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="block w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                          <FaSearch />
                        </div>
                      </div>
                      
                      {newCollection.products.length > 0 && (
                        <div className="mt-2 text-sm text-purple-600">
                          {newCollection.products.length} product{newCollection.products.length !== 1 ? 's' : ''} selected
                        </div>
                      )}
                    </div>
                    
                    <div className="border border-gray-200 rounded-md max-h-96 overflow-y-auto">
                      {Object.entries(getProductsByCategory()).map(([category, products]) => (
                        <div key={category} className="border-b border-gray-200 last:border-b-0">
                          <div 
                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleCategory(category)}
                          >
                            <div className="font-medium">{category} ({products.length})</div>
                            <div>
                              {expandedCategories.includes(category) ? <FaChevronDown /> : <FaChevronRight />}
                            </div>
                          </div>
                          
                          {expandedCategories.includes(category) && (
                            <div className="pl-4 pb-2">
                              {products.map(product => (
                                <div 
                                  key={product._id} 
                                  className={`flex items-center p-2 cursor-pointer hover:bg-gray-50 border-l-2 ${isProductSelected(product._id) ? 'border-purple-500' : 'border-transparent'}`}
                                  onClick={() => toggleProductSelection(product._id)}
                                >
                                  <div className="w-8 h-8 mr-3 flex-shrink-0">
                                    <img 
                                      src={product.image || product.variants?.[0]?.additionalImages?.[0]} 
                                      alt={product.name}
                                      className="w-8 h-8 object-cover rounded-sm"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/80?text=Product';
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                    <p className="text-xs text-gray-500">GH₵{product.basePrice?.toFixed(2) || "0.00"}</p>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isProductSelected(product._id) ? 'bg-purple-500 text-white' : 'border border-gray-300'}`}>
                                    {isProductSelected(product._id) && <FaCheck className="w-3 h-3" />}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {Object.keys(getProductsByCategory()).length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          No products found matching your search.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="edit-featured"
                        name="featured"
                        type="checkbox"
                        checked={newCollection.featured}
                        onChange={handleNewCollectionChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="edit-featured" className="font-medium text-gray-700">Featured Collection</label>
                      <p className="text-gray-500">Featured collections will be highlighted on the homepage</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleEditCollectionClose}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-3 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateCollection}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Update Collection
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <FaTrash className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center">Delete Collection</h3>
                <p className="text-gray-500 text-center mt-2">
                  Are you sure you want to delete <span className="font-medium">{collectionToDelete?.name}</span>? This action cannot be undone.
                </p>
                {collectionToDelete?.productCount > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-700 text-sm">
                      This collection contains {collectionToDelete.productCount} products. Deleting this collection will not delete the products.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteCollection}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;