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
      platformProducts: {}, // Products organized by platform ID
      
      // Set all products
      setProducts: (products) => {
        set({ products });
        
        // Update derived state
        const featuredProducts = products.filter(p => p.isFeatured);
        const categories = [...new Set(products.map(p => p.category))];
        
        // Organize products by platform
        const platformProducts = {};
        products.forEach(product => {
          if (product.platformId) {
            if (!platformProducts[product.platformId]) {
              platformProducts[product.platformId] = [];
            }
            platformProducts[product.platformId].push(product);
          }
        });
        
        set({ 
          featuredProducts,
          categories,
          platformProducts
        });
      },
      
      // Add a single product
      addProduct: (product) => {
        const products = get().products;
        const platformProducts = get().platformProducts;
        
        // Check if product already exists
        const exists = products.some(p => p._id === product._id);
        
        if (exists) {
          // Update existing product
          const updatedProducts = products.map(p => 
            p._id === product._id ? product : p
          );
          set({ products: updatedProducts });
          console.log(`📝 ProductStore: Updated product: ${product.name} (ID: ${product._id})`);
        } else {
          // Add new product
          set({ products: [product, ...products] });
          console.log(`➕ ProductStore: Added new product: ${product.name} (ID: ${product._id})`);
        }
        
        // Update derived state
        const allProducts = exists 
          ? products.map(p => p._id === product._id ? product : p)
          : [product, ...products];
          
        const featuredProducts = allProducts.filter(p => p.isFeatured);
        const categories = [...new Set(allProducts.map(p => p.category))];
        
        // Update platform products mapping
        const updatedPlatformProducts = { ...platformProducts };
        
        // Handle old platform association removal
        if (exists) {
          // Find product's previous platform if it exists
          const oldProduct = products.find(p => p._id === product._id);
          if (oldProduct && oldProduct.platformId && oldProduct.platformId !== product.platformId) {
            // Remove from old platform's product list
            if (updatedPlatformProducts[oldProduct.platformId]) {
              updatedPlatformProducts[oldProduct.platformId] = updatedPlatformProducts[oldProduct.platformId]
                .filter(p => p._id !== product._id);
            }
          }
        }
        
        // Add or update in new platform's product list
        if (product.platformId) {
          if (!updatedPlatformProducts[product.platformId]) {
            updatedPlatformProducts[product.platformId] = [];
          }
          
          // Check if product already exists in platform list
          const platformProductIndex = updatedPlatformProducts[product.platformId]
            .findIndex(p => p._id === product._id);
            
          if (platformProductIndex >= 0) {
            // Update existing product in platform list
            updatedPlatformProducts[product.platformId][platformProductIndex] = product;
          } else {
            // Add new product to platform list
            updatedPlatformProducts[product.platformId].push(product);
          }
          
          console.log(`🔄 ProductStore: Associated product "${product.name}" with platform ID: ${product.platformId}`);
        }
        
        // Log featured product status
        if (product.isFeatured) {
          console.log(`⭐ ProductStore: Product "${product.name}" is marked as featured`);
        }
        
        console.log(`✨ ProductStore: Total featured products: ${featuredProducts.length}`);
        
        set({ 
          featuredProducts,
          categories,
          platformProducts: updatedPlatformProducts
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
      
      // Get products by platform ID
      getProductsByPlatform: (platformId) => {
        if (!platformId) return [];
        
        const platformProducts = get().platformProducts;
        return platformProducts[platformId] || [];
      },
      
      // Filter products by category
      filterByCategory: (category) => {
        const products = get().products;
        console.log(`🔍 ProductStore: Filtering ${products.length} products by category: "${category}"`);
        
        const filtered = category === 'all' 
          ? products 
          : products.filter(p => p.category === category);
        
        console.log(`🔍 ProductStore: Found ${filtered.length} products in category "${category}"`);
        set({ filteredProducts: filtered });
        return filtered;
      },
      
      // Filter products by platform
      filterByPlatform: (platformId) => {
        if (!platformId) {
          set({ filteredProducts: get().products });
          return get().products;
        }
        
        console.log(`🔍 ProductStore: Filtering products by platform ID: "${platformId}"`);
        const filtered = get().products.filter(p => p.platformId === platformId);
        console.log(`🔍 ProductStore: Found ${filtered.length} products for platform "${platformId}"`);
        
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
            ${product.platformId ? `platform ${product.platformId}` : ''}
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
        const platformProducts = get().platformProducts;
        const productToRemove = products.find(p => p._id === id);
        const updatedProducts = products.filter(p => p._id !== id);
        
        // Update platform products mapping if needed
        const updatedPlatformProducts = { ...platformProducts };
        if (productToRemove && productToRemove.platformId && updatedPlatformProducts[productToRemove.platformId]) {
          updatedPlatformProducts[productToRemove.platformId] = updatedPlatformProducts[productToRemove.platformId]
            .filter(p => p._id !== id);
            
          console.log(`🔄 ProductStore: Removed product ${id} from platform ${productToRemove.platformId}`);
        }
        
        set({ 
          products: updatedProducts,
          platformProducts: updatedPlatformProducts 
        });
        
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
        filteredProducts: [],
        platformProducts: {}
      }),
      
      // Update product stock levels after an order is placed
      updateStockAfterOrder: (orderedItems) => {
        if (!orderedItems || !orderedItems.length) return;
        
        console.log('Updating local product stock levels after order');
        
        const products = get().products;
        const updatedProducts = [...products];
        let stockUpdated = false;
        
        // Process each ordered item
        orderedItems.forEach(item => {
          const productId = item.productId || item.id;
          const quantity = parseInt(item.quantity) || 1;
          
          if (!productId) {
            console.warn('No product ID found for item:', item.name);
            return;
          }
          
          // Find product and update stock
          const index = updatedProducts.findIndex(p => p._id === productId);
          
          if (index !== -1) {
            const product = updatedProducts[index];
            const currentStock = product.stock || 0;
            const newStock = Math.max(0, currentStock - quantity); // Prevent negative stock
            
            // Update product stock in local store
            updatedProducts[index] = {
              ...product,
              stock: newStock
            };
            
            console.log(`Local stock updated for ${product.name}: ${currentStock} → ${newStock}`);
            stockUpdated = true;
          }
        });
        
        // Only update state if any products were actually updated
        if (stockUpdated) {
          set({ products: updatedProducts });
          
          // Update derived state
          const featuredProducts = updatedProducts.filter(p => p.isFeatured);
          set({ featuredProducts });
          
          // Re-organize products by platform
          const platformProducts = {};
          updatedProducts.forEach(product => {
            if (product.platformId) {
              if (!platformProducts[product.platformId]) {
                platformProducts[product.platformId] = [];
              }
              platformProducts[product.platformId].push(product);
            }
          });
          
          set({ platformProducts });
        }
      },
      
      // Fetch products from API
      fetchProductsFromAPI: async () => {
        console.log('🔄 ProductStore: Fetching products from API');
        try {
          const response = await fetch(`${apiConfig.baseURL}/products?limit=100`);
          const data = await response.json();
          
          if (data.success) {
            console.log(`✅ ProductStore: Successfully fetched ${data.data.length} products from API`);
            set({ products: data.data });
            
            // Update derived state
            const featuredProducts = data.data.filter(p => p.isFeatured);
            const categories = [...new Set(data.data.map(p => p.category))];
            
            // Organize products by platform
            const platformProducts = {};
            data.data.forEach(product => {
              if (product.platformId) {
                if (!platformProducts[product.platformId]) {
                  platformProducts[product.platformId] = [];
                }
                platformProducts[product.platformId].push(product);
              }
            });
            
            // Count platforms with associated products
            const platformsCount = Object.keys(platformProducts).length;
            console.log(`📊 ProductStore: Found products for ${platformsCount} platforms`);
            
            console.log(`✨ ProductStore: Found ${featuredProducts.length} featured products`);
            if (featuredProducts.length > 0) {
              featuredProducts.forEach(p => {
                console.log(`  - Featured: ${p.name} (ID: ${p._id})`);
                console.log(`    Image: ${p.variants?.[0]?.additionalImages?.[0] || 'No image'}`);
                if (p.platformId) {
                  console.log(`    Platform: ${p.platformId}`);
                }
              });
            }
            
            console.log(`📊 ProductStore: Categories found: ${categories.join(', ')}`);
            
            set({ 
              featuredProducts,
              categories,
              filteredProducts: data.data,
              platformProducts
            });
          } else {
            console.error('❌ ProductStore: API request failed', data);
          }
        } catch (error) {
          console.error('❌ ProductStore: Error fetching products:', error);
        }
      },
      
      // Get products by category without affecting state
      getProductsByCategory: (category) => {
        console.log(`🔍 ProductStore: Getting products by category: "${category}"`);
        const products = get().products;
        
        if (category === 'all') {
          console.log(`🔍 ProductStore: Returning all ${products.length} products`);
          return products;
        }
        
        const categoryProducts = products.filter(p => p.category === category);
        console.log(`🔍 ProductStore: Found ${categoryProducts.length} products in category "${category}"`);
        
        return categoryProducts;
      },
      
      // Get products by both platform and category
      getProductsByPlatformAndCategory: (platformId, category) => {
        if (!platformId && (!category || category === 'all')) {
          return get().products;
        }
        
        const products = get().products;
        return products.filter(product => {
          const matchesPlatform = !platformId || product.platformId === platformId;
          const matchesCategory = !category || category === 'all' || product.category === category;
          return matchesPlatform && matchesCategory;
        });
      },
      
      // Fetch only featured products from API
      fetchFeaturedProducts: async () => {
        console.log('🌟 ProductStore: Fetching featured products from API');
        try {
          const response = await fetch(`${apiConfig.baseURL}/products?featured=true&limit=20`);
          const data = await response.json();
          
          if (data.success) {
            console.log(`✅ ProductStore: Successfully fetched ${data.data.length} featured products from API`);
            
            // Update featured products in store
            set({ featuredProducts: data.data });
            
            // Log featured products
            data.data.forEach(p => {
              console.log(`  - Featured: ${p.name} (ID: ${p._id})`);
              console.log(`    Image: ${p.variants?.[0]?.additionalImages?.[0] || 'No image'}`);
              if (p.platformId) {
                console.log(`    Platform: ${p.platformId}`);
              }
            });
            
            return data.data;
          } else {
            console.error('❌ ProductStore: API request for featured products failed', data);
            return [];
          }
        } catch (error) {
          console.error('❌ ProductStore: Error fetching featured products:', error);
          return [];
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