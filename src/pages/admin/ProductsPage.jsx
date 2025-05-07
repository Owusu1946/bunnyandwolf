import { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaTimes, FaImage, FaCopy } from 'react-icons/fa';
import axios from 'axios';
import Sidebar from '../../components/admin/Sidebar';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useProductStore } from '../../store/productStore';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // Product store
  const productStore = useProductStore();
  
  // New product state
  const [newProduct, setNewProduct] = useState({
    name: '',
    basePrice: '',
    salePrice: '',
    description: '',
    category: '',
    details: [''],
    variants: [
      { 
        color: '#000000', 
        colorName: 'Black',
        price: '',
        additionalImages: ['']
      }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 0
  });

  useEffect(() => {
    fetchProducts();
  }, [currentPage, categoryFilter]);

  // Initialize products from store or fetch if empty
  useEffect(() => {
    const storedProducts = productStore.getProducts();
    
    if (storedProducts.length > 0) {
      // If we have products in the store, use them for initial display
      setProducts(storedProducts.slice(0, 10)); // Show first page
      setTotalPages(Math.ceil(storedProducts.length / 10));
      setLoading(false);
    } else {
      // Otherwise fetch from API
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/v1/products`, {
        params: {
          page: currentPage,
          limit: 10,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          search: searchTerm || undefined
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const fetchedProducts = response.data.data || [];
      
      // Update the local state for the current page
      setProducts(fetchedProducts);
      setTotalPages(Math.ceil(response.data.total / 10) || 1);
      
      // Add all products to the store
      fetchedProducts.forEach(product => {
        productStore.addProduct(product);
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  // Add new product handlers
  const handleAddProductOpen = () => {
    setShowAddModal(true);
  };
  
  const handleAddProductClose = () => {
    setShowAddModal(false);
  };
  
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleVariantChange = (index, field, value) => {
    setNewProduct(prev => {
      const updatedVariants = [...prev.variants];
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: value
      };
      return {
        ...prev,
        variants: updatedVariants
      };
    });
  };
  
  const addVariant = () => {
    setNewProduct(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          color: '#FFFFFF', 
          colorName: 'White',
          price: prev.basePrice,
          additionalImages: ['']
        }
      ]
    }));
  };
  
  const removeVariant = (index) => {
    if (newProduct.variants.length <= 1) return;
    
    setNewProduct(prev => {
      const updatedVariants = prev.variants.filter((_, i) => i !== index);
      return {
        ...prev,
        variants: updatedVariants
      };
    });
  };
  
  const handleVariantImageChange = (variantIndex, imageIndex, value) => {
    setNewProduct(prev => {
      const updatedVariants = [...prev.variants];
      const updatedImages = [...updatedVariants[variantIndex].additionalImages];
      updatedImages[imageIndex] = value;
      updatedVariants[variantIndex].additionalImages = updatedImages;
      return {
        ...prev,
        variants: updatedVariants
      };
    });
  };
  
  const addVariantImage = (variantIndex) => {
    setNewProduct(prev => {
      const updatedVariants = [...prev.variants];
      updatedVariants[variantIndex].additionalImages.push('');
      return {
        ...prev,
        variants: updatedVariants
      };
    });
  };
  
  const removeVariantImage = (variantIndex, imageIndex) => {
    if (newProduct.variants[variantIndex].additionalImages.length <= 1) return;
    
    setNewProduct(prev => {
      const updatedVariants = [...prev.variants];
      updatedVariants[variantIndex].additionalImages = 
        updatedVariants[variantIndex].additionalImages.filter((_, i) => i !== imageIndex);
      return {
        ...prev,
        variants: updatedVariants
      };
    });
  };
  
  const handleDetailChange = (index, value) => {
    setNewProduct(prev => {
      const updatedDetails = [...prev.details];
      updatedDetails[index] = value;
      return {
        ...prev,
        details: updatedDetails
      };
    });
  };
  
  const addDetail = () => {
    setNewProduct(prev => ({
      ...prev,
      details: [...prev.details, '']
    }));
  };
  
  const removeDetail = (index) => {
    if (newProduct.details.length <= 1) return;
    
    setNewProduct(prev => {
      const updatedDetails = prev.details.filter((_, i) => i !== index);
      return {
        ...prev,
        details: updatedDetails
      };
    });
  };
  
  const handleSizeToggle = (size) => {
    setNewProduct(prev => {
      if (prev.sizes.includes(size)) {
        return {
          ...prev,
          sizes: prev.sizes.filter(s => s !== size)
        };
      } else {
        return {
          ...prev,
          sizes: [...prev.sizes, size]
        };
      }
    });
  };

  const handleAddProduct = async () => {
    try {
      // Start loading state
      setLoading(true);
      
      // Validate required fields
      if (!newProduct.name || !newProduct.basePrice || !newProduct.description || !newProduct.category) {
        alert('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Make sure each variant has at least one image
      const hasInvalidVariants = newProduct.variants.some(
        variant => !variant.color || !variant.colorName || !variant.additionalImages[0]
      );
      
      if (hasInvalidVariants) {
        alert('Each color variant must have a color, name, and at least one image');
        setLoading(false);
        return;
      }
      
      // Format data for API
      const productData = {
        ...newProduct,
        basePrice: parseFloat(newProduct.basePrice),
        salePrice: newProduct.salePrice ? parseFloat(newProduct.salePrice) : 0,
        stock: parseInt(newProduct.stock)
      };
      
      // Send data to API
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('You must be logged in to add products');
        setLoading(false);
        return;
      }
      
      const response = await axios.post(
        'http://localhost:5000/api/v1/products',
        productData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Add the product to the product store
        productStore.addProduct(response.data.data);
        
        // Show success message
        alert('Product added successfully!');
        
        // Close modal
        setShowAddModal(false);
        
        // Reset form
        setNewProduct({
          name: '',
          basePrice: '',
          salePrice: '',
          description: '',
          category: '',
          details: [''],
          variants: [
            { 
              color: '#000000', 
              colorName: 'Black',
              price: '',
              additionalImages: ['']
            }
          ],
          sizes: ['XS', 'S', 'M', 'L', 'XL'],
          stock: 0
        });
        
        // Refresh products list
        fetchProducts();
      } else {
        throw new Error(response.data.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert(error.response?.data?.error || 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete product handler
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        
        const response = await axios.delete(
          `http://localhost:5000/api/v1/products/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data.success) {
          // Remove from local state
          setProducts(products.filter(product => product._id !== id));
          
          // Remove from store
          productStore.removeProduct(id);
          
          alert('Product deleted successfully');
        } else {
          throw new Error(response.data.error || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(error.response?.data?.error || 'Failed to delete product');
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete product handlers with confirmation modal
  const handleDeleteConfirmation = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };
  
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };
  
  const confirmDeleteProduct = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `http://localhost:5000/api/v1/products/${productToDelete._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Remove from local state
        setProducts(products.filter(product => product._id !== productToDelete._id));
        
        // Remove from store
        productStore.removeProduct(productToDelete._id);
        
        // Close the modal
        closeDeleteModal();
      } else {
        throw new Error(response.data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.error || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  // Duplicate product handler
  const handleDuplicateProduct = async (product) => {
    try {
      setLoading(true);
      
      // Create a duplicate product without ID
      const duplicatedProduct = {
        ...product,
        name: `${product.name} (Copy)`,
        // Remove fields that should be unique or generated by the server
        _id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        slug: undefined,
        sku: undefined
      };
      
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/v1/products',
        duplicatedProduct,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Add the product to the product store
        productStore.addProduct(response.data.data);
        
        // Refresh products list
        fetchProducts();
      } else {
        throw new Error(response.data.error || 'Failed to duplicate product');
      }
    } catch (error) {
      console.error('Error duplicating product:', error);
      alert(error.response?.data?.error || 'Failed to duplicate product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal and populate with product data
  const handleEditProductOpen = (product) => {
    // Format the product data to match the form state
    const productForEdit = {
      _id: product._id,
      name: product.name,
      basePrice: product.basePrice,
      salePrice: product.salePrice || '',
      description: product.description,
      category: product.category,
      details: product.details?.length > 0 ? product.details : [''],
      variants: product.variants?.length > 0 ? product.variants.map(variant => ({
        ...variant,
        price: variant.price || ''
      })) : [{ 
        color: '#000000', 
        colorName: 'Black',
        price: '',
        additionalImages: ['']
      }],
      sizes: product.sizes || ['XS', 'S', 'M', 'L', 'XL'],
      stock: product.stock || 0,
      slug: product.slug,
      sku: product.sku
    };
    
    // Set the editing product
    setEditingProduct(productForEdit);
    
    // Copy to the newProduct form state for the modal form
    setNewProduct(productForEdit);
    
    // Open the modal
    setShowEditModal(true);
  };
  
  // Close edit modal
  const handleEditProductClose = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    
    // Reset form 
    setNewProduct({
      name: '',
      basePrice: '',
      salePrice: '',
      description: '',
      category: '',
      details: [''],
      variants: [
        { 
          color: '#000000', 
          colorName: 'Black',
          price: '',
          additionalImages: ['']
        }
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      stock: 0
    });
  };
  
  // Update existing product
  const handleUpdateProduct = async () => {
    try {
      // Start loading state
      setLoading(true);
      
      // Validate required fields
      if (!newProduct.name || !newProduct.basePrice || !newProduct.description || !newProduct.category) {
        alert('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Make sure each variant has at least one image
      const hasInvalidVariants = newProduct.variants.some(
        variant => !variant.color || !variant.colorName || !variant.additionalImages[0]
      );
      
      if (hasInvalidVariants) {
        alert('Each color variant must have a color, name, and at least one image');
        setLoading(false);
        return;
      }
      
      // Format data for API
      const productData = {
        ...newProduct,
        basePrice: parseFloat(newProduct.basePrice),
        salePrice: newProduct.salePrice ? parseFloat(newProduct.salePrice) : 0,
        stock: parseInt(newProduct.stock),
        slug: newProduct.slug, // Preserve original slug
        sku: newProduct.sku // Preserve original SKU
      };
      
      // Send data to API
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('You must be logged in to update products');
        setLoading(false);
        return;
      }
      
      const response = await axios.put(
        `http://localhost:5000/api/v1/products/${editingProduct._id}`,
        productData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Update the product in the store
        productStore.addProduct(response.data.data);
        
        // Update local product list
        setProducts(prevProducts => 
          prevProducts.map(p => p._id === response.data.data._id ? response.data.data : p)
        );
        
        // Show success message
        alert('Product updated successfully!');
        
        // Close modal
        handleEditProductClose();
      } else {
        throw new Error(response.data.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert(error.response?.data?.error || 'Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                placeholder="Search..."
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
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex gap-4">
                <select
                  value={categoryFilter}
                  onChange={handleCategoryChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Categories</option>
                  <option value="dresses">Dresses</option>
                  <option value="tops">Tops</option>
                  <option value="bottoms">Bottoms</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="activewear">Activewear</option>
                  <option value="accessories">Accessories</option>
                  <option value="shoes">Shoes</option>
                </select>
              </div>
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
                onClick={handleAddProductOpen}
              >
                <FaPlus className="mr-2" /> Add Product
              </button>
            </div>
            
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
              
              {products.length > 0 ? (
                <div className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
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
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleEditProductOpen(product)}
                          title="Edit product"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900"
                          onClick={() => handleDuplicateProduct(product)}
                          title="Duplicate product"
                        >
                          <FaCopy />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteConfirmation(product)}
                          title="Delete product"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                  <h3 className="text-xl font-medium text-gray-700 mb-1">No products found</h3>
                  <p className="text-gray-500">Add some products to your inventory</p>
                </div>
              )}
            </div>
            
            {products.length > 0 && (
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
          </div>
        </div>
        
        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
                <button 
                  onClick={handleAddProductClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6">
                <form>
                  {/* Basic Info Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={newProduct.name}
                          onChange={handleNewProductChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={newProduct.category}
                          onChange={handleNewProductChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="dresses">Dresses</option>
                          <option value="tops">Tops</option>
                          <option value="bottoms">Bottoms</option>
                          <option value="outerwear">Outerwear</option>
                          <option value="activewear">Activewear</option>
                          <option value="accessories">Accessories</option>
                          <option value="shoes">Shoes</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">
                          Regular Price <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">€</span>
                          </div>
                          <input
                            type="number"
                            id="basePrice"
                            name="basePrice"
                            value={newProduct.basePrice}
                            onChange={handleNewProductChange}
                            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-1">
                          Sale Price (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">€</span>
                          </div>
                          <input
                            type="number"
                            id="salePrice"
                            name="salePrice"
                            value={newProduct.salePrice}
                            onChange={handleNewProductChange}
                            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            step="0.01"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="stock"
                          name="stock"
                          value={newProduct.stock}
                          onChange={handleNewProductChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Description Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Description</h3>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Product Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={newProduct.description}
                        onChange={handleNewProductChange}
                        rows="4"
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        required
                      ></textarea>
                    </div>
                  </div>
                  
                  {/* Product Details Section */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                      <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
                      <button
                        type="button"
                        onClick={addDetail}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                      >
                        + Add Detail
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {newProduct.details.map((detail, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={detail}
                            onChange={(e) => handleDetailChange(index, e.target.value)}
                            className="block flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            placeholder="e.g., 100% cotton, Machine washable, Model wears size S"
                          />
                          <button
                            type="button"
                            onClick={() => removeDetail(index)}
                            className="px-2 py-2 bg-red-50 text-red-500 rounded-md hover:bg-red-100"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Sizes Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Available Sizes</h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeToggle(size)}
                          className={`px-4 py-2 rounded-md ${
                            newProduct.sizes.includes(size)
                              ? 'bg-purple-100 text-purple-700 border-purple-300 border'
                              : 'bg-gray-100 text-gray-700 border-gray-300 border'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Color Variants Section */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                      <h3 className="text-lg font-medium text-gray-900">Color Variants</h3>
                      <button
                        type="button"
                        onClick={addVariant}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                      >
                        + Add Color Variant
                      </button>
                    </div>
                    
                    <div className="space-y-8">
                      {newProduct.variants.map((variant, variantIndex) => (
                        <div key={variantIndex} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Variant {variantIndex + 1}</h4>
                            {newProduct.variants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeVariant(variantIndex)}
                                className="px-2 py-1 bg-red-50 text-red-500 rounded-md hover:bg-red-100 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Color <span className="text-red-500">*</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={variant.color}
                                  onChange={(e) => handleVariantChange(variantIndex, 'color', e.target.value)}
                                  className="h-10 w-10 rounded-md border border-gray-300 p-0"
                                />
                                <input
                                  type="text"
                                  value={variant.colorName}
                                  onChange={(e) => handleVariantChange(variantIndex, 'colorName', e.target.value)}
                                  placeholder="Color name (e.g. Black, Red)"
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Variant Price (Optional)
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-gray-500">€</span>
                                </div>
                                <input
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => handleVariantChange(variantIndex, 'price', e.target.value)}
                                  placeholder="Leave empty to use base price"
                                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                  step="0.01"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Variant Images <span className="text-red-500">*</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => addVariantImage(variantIndex)}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
                              >
                                + Add Image
                              </button>
                            </div>
                            
                            <div className="space-y-3">
                              {variant.additionalImages.map((image, imageIndex) => (
                                <div key={imageIndex} className="flex gap-2">
                                  <div className="flex-1 flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-md bg-white">
                                    {image ? (
                                      <img 
                                        src={image}
                                        alt={`Variant ${variantIndex + 1} image ${imageIndex + 1}`}
                                        className="h-10 w-10 object-cover rounded"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = 'https://via.placeholder.com/40?text=Error';
                                        }}
                                      />
                                    ) : (
                                      <div className="h-10 w-10 bg-gray-100 flex items-center justify-center rounded">
                                        <FaImage className="text-gray-400" />
                                      </div>
                                    )}
                                    <input
                                      type="text"
                                      value={image}
                                      onChange={(e) => handleVariantImageChange(variantIndex, imageIndex, e.target.value)}
                                      placeholder="Enter image URL"
                                      className="flex-1 border-0 focus:ring-0 p-0"
                                    />
                                  </div>
                                  {variant.additionalImages.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeVariantImage(variantIndex, imageIndex)}
                                      className="px-2 py-2 bg-red-50 text-red-500 rounded-md hover:bg-red-100"
                                    >
                                      <FaTimes />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <p className="text-xs text-gray-500">
                                The first image will be used as the main product image for this color variant
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleAddProductClose}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Product Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
                <button 
                  onClick={handleEditProductClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6">
                <form>
                  {/* Basic Info Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="edit-name"
                          name="name"
                          value={newProduct.name}
                          onChange={handleNewProductChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="edit-category"
                          name="category"
                          value={newProduct.category}
                          onChange={handleNewProductChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="dresses">Dresses</option>
                          <option value="tops">Tops</option>
                          <option value="bottoms">Bottoms</option>
                          <option value="outerwear">Outerwear</option>
                          <option value="activewear">Activewear</option>
                          <option value="accessories">Accessories</option>
                          <option value="shoes">Shoes</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="edit-basePrice" className="block text-sm font-medium text-gray-700 mb-1">
                          Regular Price <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">€</span>
                          </div>
                          <input
                            type="number"
                            id="edit-basePrice"
                            name="basePrice"
                            value={newProduct.basePrice}
                            onChange={handleNewProductChange}
                            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="edit-salePrice" className="block text-sm font-medium text-gray-700 mb-1">
                          Sale Price (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">€</span>
                          </div>
                          <input
                            type="number"
                            id="edit-salePrice"
                            name="salePrice"
                            value={newProduct.salePrice}
                            onChange={handleNewProductChange}
                            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            step="0.01"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="edit-stock" className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="edit-stock"
                          name="stock"
                          value={newProduct.stock}
                          onChange={handleNewProductChange}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Description Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Description</h3>
                    
                    <div>
                      <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                        Product Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="edit-description"
                        name="description"
                        value={newProduct.description}
                        onChange={handleNewProductChange}
                        rows="4"
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        required
                      ></textarea>
                    </div>
                  </div>
                  
                  {/* Product Details Section */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                      <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
                      <button
                        type="button"
                        onClick={addDetail}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                      >
                        + Add Detail
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {newProduct.details.map((detail, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={detail}
                            onChange={(e) => handleDetailChange(index, e.target.value)}
                            className="block flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            placeholder="e.g., 100% cotton, Machine washable, Model wears size S"
                          />
                          <button
                            type="button"
                            onClick={() => removeDetail(index)}
                            className="px-2 py-2 bg-red-50 text-red-500 rounded-md hover:bg-red-100"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Sizes Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Available Sizes</h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeToggle(size)}
                          className={`px-4 py-2 rounded-md ${
                            newProduct.sizes.includes(size)
                              ? 'bg-purple-100 text-purple-700 border-purple-300 border'
                              : 'bg-gray-100 text-gray-700 border-gray-300 border'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Color Variants Section */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                      <h3 className="text-lg font-medium text-gray-900">Color Variants</h3>
                      <button
                        type="button"
                        onClick={addVariant}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                      >
                        + Add Color Variant
                      </button>
                    </div>
                    
                    <div className="space-y-8">
                      {newProduct.variants.map((variant, variantIndex) => (
                        <div key={variantIndex} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Variant {variantIndex + 1}</h4>
                            {newProduct.variants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeVariant(variantIndex)}
                                className="px-2 py-1 bg-red-50 text-red-500 rounded-md hover:bg-red-100 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Color <span className="text-red-500">*</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={variant.color}
                                  onChange={(e) => handleVariantChange(variantIndex, 'color', e.target.value)}
                                  className="h-10 w-10 rounded-md border border-gray-300 p-0"
                                />
                                <input
                                  type="text"
                                  value={variant.colorName}
                                  onChange={(e) => handleVariantChange(variantIndex, 'colorName', e.target.value)}
                                  placeholder="Color name (e.g. Black, Red)"
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Variant Price (Optional)
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-gray-500">€</span>
                                </div>
                                <input
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => handleVariantChange(variantIndex, 'price', e.target.value)}
                                  placeholder="Leave empty to use base price"
                                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                  step="0.01"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Variant Images <span className="text-red-500">*</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => addVariantImage(variantIndex)}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
                              >
                                + Add Image
                              </button>
                            </div>
                            
                            <div className="space-y-3">
                              {variant.additionalImages.map((image, imageIndex) => (
                                <div key={imageIndex} className="flex gap-2">
                                  <div className="flex-1 flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-md bg-white">
                                    {image ? (
                                      <img 
                                        src={image}
                                        alt={`Variant ${variantIndex + 1} image ${imageIndex + 1}`}
                                        className="h-10 w-10 object-cover rounded"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = 'https://via.placeholder.com/40?text=Error';
                                        }}
                                      />
                                    ) : (
                                      <div className="h-10 w-10 bg-gray-100 flex items-center justify-center rounded">
                                        <FaImage className="text-gray-400" />
                                      </div>
                                    )}
                                    <input
                                      type="text"
                                      value={image}
                                      onChange={(e) => handleVariantImageChange(variantIndex, imageIndex, e.target.value)}
                                      placeholder="Enter image URL"
                                      className="flex-1 border-0 focus:ring-0 p-0"
                                    />
                                  </div>
                                  {variant.additionalImages.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeVariantImage(variantIndex, imageIndex)}
                                      className="px-2 py-2 bg-red-50 text-red-500 rounded-md hover:bg-red-100"
                                    >
                                      <FaTimes />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <p className="text-xs text-gray-500">
                                The first image will be used as the main product image for this color variant
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleEditProductClose}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateProduct}
                      className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Update Product
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
                <h3 className="text-lg font-medium text-gray-900 text-center">Delete Product</h3>
                <p className="text-gray-500 text-center mt-2">
                  Are you sure you want to delete <span className="font-medium">{productToDelete?.name}</span>? This action cannot be undone.
                </p>
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
                  onClick={confirmDeleteProduct}
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

export default ProductsPage; 