import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiConfig from '../config/apiConfig';

export const usePlatformsStore = create(
  persist(
    (set, get) => ({
      platforms: [], // All platforms
      activePlatforms: [], // Platforms that are marked as active
      featuredPlatforms: [], // Could be used later for featuring certain platforms
      loading: false,
      error: null,
      
      // Set loading state
      setLoading: (loading) => set({ loading }),
      
      // Set error state
      setError: (error) => set({ error }),
      
      // Set all platforms
      setPlatforms: (platforms) => {
        set({ platforms });
        
        // Update derived state
        const activePlatforms = platforms.filter(p => p.isActive);
        const featuredPlatforms = platforms.filter(p => p.featured); // If you add featured flag
        
        set({ 
          activePlatforms,
          featuredPlatforms
        });
      },
      
      // Add a single platform
      addPlatform: (platform) => {
        const platforms = get().platforms;
        
        // Check if platform already exists
        const exists = platforms.some(p => p._id === platform._id);
        
        if (exists) {
          // Update existing platform
          const updatedPlatforms = platforms.map(p => 
            p._id === platform._id ? platform : p
          );
          set({ platforms: updatedPlatforms });
        } else {
          // Add new platform
          set({ platforms: [platform, ...platforms] });
        }
        
        // Update derived state
        const allPlatforms = exists 
          ? platforms.map(p => p._id === platform._id ? platform : p)
          : [platform, ...platforms];
          
        const activePlatforms = allPlatforms.filter(p => p.isActive);
        const featuredPlatforms = allPlatforms.filter(p => p.featured); // If you add featured flag
        
        set({ 
          activePlatforms,
          featuredPlatforms
        });
      },
      
      // Get all platforms
      getPlatforms: () => get().platforms,
      
      // Get active platforms
      getActivePlatforms: () => get().activePlatforms,
      
      // Get featured platforms
      getFeaturedPlatforms: () => get().featuredPlatforms,
      
      // Get platform by ID
      getPlatformById: (id) => {
        const platforms = get().platforms;
        return platforms.find(p => p._id === id);
      },
      
      // Get platform by domain
      getPlatformByDomain: (domain) => {
        const platforms = get().platforms;
        return platforms.find(p => p.domain === domain);
      },
      
      // Search platforms
      searchPlatforms: (query) => {
        if (!query || query.trim() === '') {
          return get().platforms;
        }
        
        const platforms = get().platforms;
        const searchTerms = query.toLowerCase().split(' ');
        
        return platforms.filter(platform => {
          const searchableText = `
            ${platform.name} 
            ${platform.description || ''}
            ${platform.domain || ''}
          `.toLowerCase();
          
          return searchTerms.every(term => searchableText.includes(term));
        });
      },
      
      // Remove a platform
      removePlatform: (id) => {
        const platforms = get().platforms;
        const updatedPlatforms = platforms.filter(p => p._id !== id);
        
        set({ platforms: updatedPlatforms });
        
        // Update derived state
        const activePlatforms = updatedPlatforms.filter(p => p.isActive);
        const featuredPlatforms = updatedPlatforms.filter(p => p.featured); // If you add featured flag
        
        set({ 
          activePlatforms,
          featuredPlatforms
        });
      },
      
      // Clear all platforms
      clearPlatforms: () => set({ 
        platforms: [],
        activePlatforms: [],
        featuredPlatforms: [],
        loading: false,
        error: null
      }),
      
      // Fetch platforms from API
      fetchPlatformsFromAPI: async () => {
        try {
          set({ loading: true, error: null });
          
          const token = localStorage.getItem('token');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          
          const response = await fetch(`${apiConfig.baseURL}/platforms`, {
            headers
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch platforms');
          }
          
          const data = await response.json();
          
          if (data.status === 'success') {
            set({ 
              platforms: data.data,
              loading: false
            });
            
            // Update derived state
            const activePlatforms = data.data.filter(p => p.isActive);
            const featuredPlatforms = data.data.filter(p => p.featured); // If you add featured flag
            
            set({ 
              activePlatforms,
              featuredPlatforms
            });
          } else {
            throw new Error(data.message || 'Failed to fetch platforms');
          }
        } catch (error) {
          console.error('Error fetching platforms:', error);
          set({ 
            error: error.message,
            loading: false
          });
        }
      },
      
      // Create a new platform
      createPlatform: async (platformData) => {
        try {
          set({ loading: true, error: null });
          
          const token = localStorage.getItem('token');
          
          if (!token) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${apiConfig.baseURL}/platforms`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(platformData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create platform');
          }
          
          const data = await response.json();
          
          if (data.status === 'success') {
            // Add the new platform to the store
            const platform = data.data;
            get().addPlatform(platform);
            
            set({ loading: false });
            return platform;
          } else {
            throw new Error(data.message || 'Failed to create platform');
          }
        } catch (error) {
          console.error('Error creating platform:', error);
          set({ 
            error: error.message,
            loading: false
          });
          throw error;
        }
      },
      
      // Update an existing platform
      updatePlatform: async (id, platformData) => {
        try {
          set({ loading: true, error: null });
          
          const token = localStorage.getItem('token');
          
          if (!token) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${apiConfig.baseURL}/platforms/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(platformData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update platform');
          }
          
          const data = await response.json();
          
          if (data.status === 'success') {
            // Update the platform in the store
            const platform = data.data;
            get().addPlatform(platform);
            
            set({ loading: false });
            return platform;
          } else {
            throw new Error(data.message || 'Failed to update platform');
          }
        } catch (error) {
          console.error('Error updating platform:', error);
          set({ 
            error: error.message,
            loading: false
          });
          throw error;
        }
      },
      
      // Delete a platform
      deletePlatform: async (id) => {
        try {
          set({ loading: true, error: null });
          
          const token = localStorage.getItem('token');
          
          if (!token) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${apiConfig.baseURL}/platforms/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            // For 204 No Content, this won't execute
            if (response.status !== 204) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to delete platform');
            }
          }
          
          // Remove the platform from the store
          get().removePlatform(id);
          set({ loading: false });
          return true;
        } catch (error) {
          console.error('Error deleting platform:', error);
          set({ 
            error: error.message,
            loading: false
          });
          throw error;
        }
      },
      
      // Update platform stats
      updatePlatformStats: async (id, statsData) => {
        try {
          set({ loading: true, error: null });
          
          const token = localStorage.getItem('token');
          
          if (!token) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${apiConfig.baseURL}/platforms/${id}/stats`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(statsData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update platform stats');
          }
          
          const data = await response.json();
          
          if (data.status === 'success') {
            // Update the platform in the store
            const platform = data.data;
            get().addPlatform(platform);
            
            set({ loading: false });
            return platform;
          } else {
            throw new Error(data.message || 'Failed to update platform stats');
          }
        } catch (error) {
          console.error('Error updating platform stats:', error);
          set({ 
            error: error.message,
            loading: false
          });
          throw error;
        }
      }
    }),
    {
      name: 'sinosply-platforms-storage',
      partialize: (state) => ({ 
        platforms: state.platforms
      })
    }
  )
); 