import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiConfig from '../config/apiConfig';

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: [], // All products
      featuredProducts: [], // Products marked as featured
      categories: [], // Available product categories
      filteredProducts: [], // Products filtered by category or search
      
      // Set all products
      setProducts: (products) => {
        set({ products });
        
        // Update derived state
        const featuredProducts = products.filter(p => p.isFeatured);
        const categories = [...new Set(products.map(p => p.category))];
        
        set({ 
          featuredProducts,
          categories
        });
      },
      
      // Add a single product
      addProduct: (product) => {
        const products = get().products;
        
        // Check if product already exists
        const exists = products.some(p => p._id === product._id);
        
        if (exists) {
          // Update existing product
          const updatedProducts = products.map(p => 
            p._id === product._id ? product : p
          );
          set({ products: updatedProducts });
        } else {
          // Add new product
          set({ products: [product, ...products] });
        }
        
        // Update derived state
        const allProducts = exists 
          ? products.map(p => p._id === product._id ? product : p)
          : [product, ...products];
          
        const featuredProducts = allProducts.filter(p => p.isFeatured);
        const categories = [...new Set(allProducts.map(p => p.category))];
        
        set({ 
          featuredProducts,
          categories
        });
      },
      
      // Get all products
      getProducts: () => get().products,
      
      // Get featured products
      getFeaturedProducts: () => get().featuredProducts,
      
      // Get product by ID
      getProductById: (id) => {
        const products = get().products;
        return products.find(p => p._id === id);
      },
      
      // Get product by slug
      getProductBySlug: (slug) => {
        const products = get().products;
        return products.find(p => p.slug === slug);
      },
      
      // Filter products by category
      filterByCategory: (category) => {
        const products = get().products;
        const filtered = category === 'all' 
          ? products 
          : products.filter(p => p.category === category);
        set({ filteredProducts: filtered });
        return filtered;
      },
      
      // Search products
      searchProducts: (query) => {
        if (!query || query.trim() === '') {
          set({ filteredProducts: get().products });
          return get().products;
        }
        
        const products = get().products;
        const searchTerms = query.toLowerCase().split(' ');
        
        const filtered = products.filter(product => {
          const searchableText = `
            ${product.name} 
            ${product.description} 
            ${product.category} 
            ${product.details?.join(' ') || ''}
            ${product.variants?.map(v => v.colorName).join(' ') || ''}
            price ${product.basePrice} 
            ${product.salePrice ? 'sale ' + product.salePrice : ''}
            stock ${product.stock}
            quantity ${product.stock}
            ${product.stock === 0 ? 'out of stock' : 'in stock'}
          `.toLowerCase();
          
          return searchTerms.every(term => searchableText.includes(term));
        });
        
        set({ filteredProducts: filtered });
        return filtered;
      },
      
      // Get categories
      getCategories: () => get().categories,
      
      // Remove a product
      removeProduct: (id) => {
        const products = get().products;
        const updatedProducts = products.filter(p => p._id !== id);
        
        set({ products: updatedProducts });
        
        // Update derived state
        const featuredProducts = updatedProducts.filter(p => p.isFeatured);
        const categories = [...new Set(updatedProducts.map(p => p.category))];
        
        set({ 
          featuredProducts,
          categories
        });
      },
      
      // Clear all products
      clearProducts: () => set({ 
        products: [],
        featuredProducts: [],
        categories: [],
        filteredProducts: []
      }),
      
      // Fetch products from API
      fetchProductsFromAPI: async () => {
        try {
          const response = await fetch(`${apiConfig.baseURL}/products`);
          const data = await response.json();
          
          if (data.success) {
            set({ products: data.data });
            
            // Update derived state
            const featuredProducts = data.data.filter(p => p.isFeatured);
            const categories = [...new Set(data.data.map(p => p.category))];
            
            set({ 
              featuredProducts,
              categories,
              filteredProducts: data.data
            });
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      }
    }),
    {
      name: 'sinosply-product-storage',
      partialize: (state) => ({ 
        products: state.products,
        categories: state.categories
      })
    }
  )
); 