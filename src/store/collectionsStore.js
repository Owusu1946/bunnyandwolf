import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiConfig from '../config/apiConfig';

export const useCollectionsStore = create(
  persist(
    (set, get) => ({
      collections: [], // All collections
      featuredCollections: [], // Collections marked as featured
      
      // Set all collections
      setCollections: (collections) => {
        set({ collections });
        
        // Update derived state
        const featuredCollections = collections.filter(c => c.featured);
        
        set({ 
          featuredCollections
        });
      },
      
      // Add a single collection
      addCollection: (collection) => {
        const collections = get().collections;
        
        // Check if collection already exists
        const exists = collections.some(c => c._id === collection._id);
        
        if (exists) {
          // Update existing collection
          const updatedCollections = collections.map(c => 
            c._id === collection._id ? collection : c
          );
          set({ collections: updatedCollections });
        } else {
          // Add new collection
          set({ collections: [collection, ...collections] });
        }
        
        // Update derived state
        const allCollections = exists 
          ? collections.map(c => c._id === collection._id ? collection : c)
          : [collection, ...collections];
          
        const featuredCollections = allCollections.filter(c => c.featured);
        
        set({ 
          featuredCollections
        });
      },
      
      // Get all collections
      getCollections: () => get().collections,
      
      // Get featured collections
      getFeaturedCollections: () => get().featuredCollections,
      
      // Get collection by ID
      getCollectionById: (id) => {
        const collections = get().collections;
        return collections.find(c => c._id === id);
      },
      
      // Get collection by slug
      getCollectionBySlug: (slug) => {
        const collections = get().collections;
        return collections.find(c => c.slug === slug);
      },
      
      // Search collections
      searchCollections: (query) => {
        if (!query || query.trim() === '') {
          return get().collections;
        }
        
        const collections = get().collections;
        const searchTerms = query.toLowerCase().split(' ');
        
        return collections.filter(collection => {
          const searchableText = `
            ${collection.name} 
            ${collection.description || ''}
          `.toLowerCase();
          
          return searchTerms.every(term => searchableText.includes(term));
        });
      },
      
      // Remove a collection
      removeCollection: (id) => {
        const collections = get().collections;
        const updatedCollections = collections.filter(c => c._id !== id);
        
        set({ collections: updatedCollections });
        
        // Update derived state
        const featuredCollections = updatedCollections.filter(c => c.featured);
        
        set({ 
          featuredCollections
        });
      },
      
      // Clear all collections
      clearCollections: () => set({ 
        collections: [],
        featuredCollections: []
      }),
      
      // Fetch collections from API
      fetchCollectionsFromAPI: async () => {
        try {
          const response = await fetch(`${apiConfig.baseURL}/collections`);
          const data = await response.json();
          
          if (data.success) {
            // Ensure image URLs are properly formatted
            const processedCollections = data.data.map(collection => ({
              ...collection,
              // Ensure image property exists and is a valid URL or use a placeholder
              image: collection.image || `https://via.placeholder.com/400x200?text=${encodeURIComponent(collection.name || 'Collection')}`
            }));
            
            set({ collections: processedCollections });
            
            // Update derived state
            const featuredCollections = processedCollections.filter(c => c.featured);
            
            set({ 
              featuredCollections
            });
            
            console.log('✅ [collectionsStore] Fetched and processed collections:', processedCollections.length);
            return processedCollections;
          }
        } catch (error) {
          console.error('❌ [collectionsStore] Error fetching collections:', error);
        }
      }
    }),
    {
      name: 'sinosply-collections-storage',
      partialize: (state) => ({ 
        collections: state.collections
      })
    }
  )
); 