import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import apiConfig from '../config/apiConfig';

// Time constants for cache expiration (in milliseconds)
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let fetchDebounceTimer = null;
let fetchInProgress = false;

const logApiOperation = (operation, message, data = null, isError = false) => {
  const timestamp = new Date().toISOString();
  const logMethod = isError ? console.error : console.log;
  const prefix = `[CAMPAIGNS API] ${operation} - ${timestamp}`;
  
  logMethod(`${prefix}: ${message}`);
  if (data) {
    if (isError) {
      console.error(`${prefix} Details:`, data);
    } else {
      console.log(`${prefix} Details:`, data);
    }
  }
};

export const useCampaignStore = create(
  persist(
    (set, get) => ({
      campaigns: [],
      totalCampaigns: 0,
      currentPage: 1,
      totalPages: 1,
      isLoading: false,
      error: null,
      selectedCampaign: null,
      lastFetchTime: null,
      
      // Fetch campaigns from the API
      fetchCampaigns: async (page = 1, limit = 10, search = '', forceRefresh = false) => {
        if (fetchInProgress) {
          logApiOperation('FETCH', `Request skipped - fetch already in progress`);
          return get().campaigns;
        }
        
        if (fetchDebounceTimer) {
          clearTimeout(fetchDebounceTimer);
        }
        
        return new Promise((resolve) => {
          fetchDebounceTimer = setTimeout(async () => {
            try {
              fetchInProgress = true;
              
              const now = Date.now();
              const lastFetch = get().lastFetchTime;
              const cachedCampaigns = get().campaigns;
              
              logApiOperation('FETCH', `Requested page ${page}, limit ${limit}, search "${search}", forceRefresh: ${forceRefresh}`);
              
              if (!forceRefresh && lastFetch && cachedCampaigns.length > 0 && now - lastFetch < CACHE_DURATION) {
                logApiOperation('CACHE', `Using cached campaign data from ${new Date(lastFetch).toLocaleString()}`);
                
                const filteredCache = filterCampaigns(cachedCampaigns, search);
                const totalResults = filteredCache.length;
                const paginatedResults = paginateResults(filteredCache, page, limit);
                
                set({
                  currentPage: page,
                  totalPages: Math.ceil(totalResults / limit),
                  isLoading: false,
                });
                
                resolve(paginatedResults);
                return;
              }
              
              set({ isLoading: true, error: null });
              
              logApiOperation('API', `Making API request to ${apiConfig.baseURL}/campaigns`);
              const requestStartTime = Date.now();
              
              const response = await axios.get(`${apiConfig.baseURL}/campaigns`, {
                params: {
                  page,
                  limit,
                  search: search || undefined
                },
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              const requestDuration = Date.now() - requestStartTime;
              logApiOperation('API', `Request succeeded in ${requestDuration}ms, received ${response.data.data.length} campaigns`);
              
              set({ 
                campaigns: response.data.data,
                totalCampaigns: response.data.total,
                totalPages: response.data.pages || Math.ceil(response.data.total / limit),
                currentPage: page,
                isLoading: false,
                lastFetchTime: Date.now(),
              });
              
              resolve(response.data.data);
            } catch (err) {
              logApiOperation('ERROR', `API request failed: ${err.message}`, err, true);
              
              const cachedCampaigns = get().campaigns;
              if (cachedCampaigns.length > 0) {
                logApiOperation('RECOVERY', `Using cached data as fallback due to API failure`);
                
                const filteredCache = filterCampaigns(cachedCampaigns, search);
                const totalResults = filteredCache.length;
                const paginatedResults = paginateResults(filteredCache, page, limit);
                
                set({
                  isLoading: false,
                  error: `Using cached data from ${new Date(get().lastFetchTime).toLocaleString()}. Error: ${err.message}`,
                  currentPage: page,
                  totalPages: Math.ceil(totalResults / limit),
                });
                
                resolve(paginatedResults);
              } else {
                set({ 
                  error: err.response?.data?.message || 'Failed to fetch campaigns',
                  isLoading: false 
                });
                
                resolve([]);
              }
            } finally {
              fetchInProgress = false;
            }
          }, 300);
        });
      },
      
      // Force reload from API and clear cache
      forceRefresh: async (page = 1, limit = 10, search = '') => {
        logApiOperation('REFRESH', `Force refreshing campaign data`);
        return get().fetchCampaigns(page, limit, search, true);
      },
      
      // Get cached data
      getCampaigns: () => get().campaigns,
      
      // Get a campaign by ID
      getCampaignById: (id) => {
        logApiOperation('GET_BY_ID', `Looking up campaign with ID: ${id}`);
        
        const cachedCampaign = get().campaigns.find(campaign => campaign._id === id);
        
        if (cachedCampaign) {
          logApiOperation('GET_BY_ID', `Found campaign ${id} in cache`);
          return cachedCampaign;
        }
        
        logApiOperation('GET_BY_ID', `Campaign ${id} not found in cache, fetching from API`);
        return get().fetchCampaignById(id);
      },
      
      // Fetch a single campaign from API
      fetchCampaignById: async (id) => {
        logApiOperation('FETCH_ONE', `Fetching campaign ${id} from API`);
        
        try {
          const requestStartTime = Date.now();
          
          const response = await axios.get(`${apiConfig.baseURL}/campaigns/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const requestDuration = Date.now() - requestStartTime;
          logApiOperation('FETCH_ONE', `Fetched campaign ${id} in ${requestDuration}ms`);
          
          const existingCampaigns = get().campaigns;
          const isInCache = existingCampaigns.some(c => c._id === id);
          
          if (!isInCache) {
            logApiOperation('CACHE', `Adding campaign ${id} to cache`);
            set({
              campaigns: [...existingCampaigns, response.data.data]
            });
          }
          
          return response.data.data;
        } catch (err) {
          logApiOperation('ERROR', `Failed to fetch campaign ${id}: ${err.message}`, err, true);
          throw err;
        }
      },
      
      // Create a new campaign
      createCampaign: async (campaignData) => {
        logApiOperation('CREATE', `Creating new campaign`, campaignData);
        
        try {
          set({ isLoading: true, error: null });
          
          const response = await axios.post(`${apiConfig.baseURL}/campaigns`, campaignData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const newCampaign = response.data.data;
          
          set({ 
            campaigns: [newCampaign, ...get().campaigns],
            totalCampaigns: get().totalCampaigns + 1,
            isLoading: false 
          });
          
          logApiOperation('CREATE', `Campaign created successfully: ${newCampaign._id}`);
          return newCampaign;
        } catch (err) {
          logApiOperation('ERROR', `Failed to create campaign: ${err.message}`, err, true);
          set({ 
            error: err.response?.data?.message || 'Failed to create campaign',
            isLoading: false 
          });
          throw err;
        }
      },
      
      // Update a campaign
      updateCampaign: async (id, campaignData) => {
        logApiOperation('UPDATE', `Updating campaign ${id}`, campaignData);
        
        try {
          set({ isLoading: true, error: null });
          
          const response = await axios.put(`${apiConfig.baseURL}/campaigns/${id}`, campaignData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const updatedCampaign = response.data.data;
          const updatedCampaigns = get().campaigns.map(campaign => 
            campaign._id === id ? updatedCampaign : campaign
          );
          
          set({ 
            campaigns: updatedCampaigns,
            isLoading: false,
            selectedCampaign: get().selectedCampaign?._id === id 
              ? updatedCampaign
              : get().selectedCampaign
          });
          
          logApiOperation('UPDATE', `Campaign ${id} updated successfully`);
          return updatedCampaign;
        } catch (err) {
          logApiOperation('ERROR', `Failed to update campaign ${id}: ${err.message}`, err, true);
          set({ 
            error: err.response?.data?.message || 'Failed to update campaign',
            isLoading: false 
          });
          throw err;
        }
      },
      
      // Delete a campaign
      deleteCampaign: async (id) => {
        logApiOperation('DELETE', `Attempting to delete campaign ${id}`);
        
        try {
          set({ isLoading: true, error: null });
          
          await axios.delete(`${apiConfig.baseURL}/campaigns/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const updatedCampaigns = get().campaigns.filter(campaign => campaign._id !== id);
          set({ 
            campaigns: updatedCampaigns,
            totalCampaigns: get().totalCampaigns - 1,
            isLoading: false,
            selectedCampaign: get().selectedCampaign?._id === id ? null : get().selectedCampaign
          });
          
          logApiOperation('DELETE', `Campaign ${id} successfully deleted`);
          return true;
        } catch (err) {
          logApiOperation('ERROR', `Failed to delete campaign ${id}: ${err.message}`, err, true);
          set({ 
            error: err.response?.data?.message || 'Failed to delete campaign',
            isLoading: false 
          });
          throw err;
        }
      },
      
      // Send a campaign to recipients
      sendCampaign: async (id, recipientType = 'all') => {
        logApiOperation('SEND', `Sending campaign ${id} to ${recipientType} recipients`);
        
        try {
          set({ isLoading: true, error: null });
          
          const response = await axios.post(`${apiConfig.baseURL}/campaigns/${id}/send`, 
            { recipientType },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          
          // Update campaign status in cache
          const updatedCampaigns = get().campaigns.map(campaign => 
            campaign._id === id 
              ? { ...campaign, status: 'sent', sentAt: new Date().toISOString() } 
              : campaign
          );
          
          set({ 
            campaigns: updatedCampaigns,
            isLoading: false,
            selectedCampaign: get().selectedCampaign?._id === id 
              ? { ...get().selectedCampaign, status: 'sent', sentAt: new Date().toISOString() }
              : get().selectedCampaign
          });
          
          logApiOperation('SEND', `Campaign ${id} sent successfully to ${response.data.recipientCount} recipients`);
          return response.data;
        } catch (err) {
          logApiOperation('ERROR', `Failed to send campaign ${id}: ${err.message}`, err, true);
          set({ 
            error: err.response?.data?.message || 'Failed to send campaign',
            isLoading: false 
          });
          throw err;
        }
      },
      
      // Select a campaign for viewing or editing
      selectCampaign: (id) => {
        const campaign = get().getCampaignById(id);
        set({ selectedCampaign: campaign || null });
        return campaign;
      },
      
      // Clear selected campaign
      clearSelectedCampaign: () => set({ selectedCampaign: null }),
      
      // Reset store state
      resetStore: () => {
        logApiOperation('RESET', 'Resetting campaign store state');
        
        set({
          campaigns: [],
          totalCampaigns: 0,
          currentPage: 1,
          totalPages: 1,
          isLoading: false,
          error: null,
          selectedCampaign: null,
          lastFetchTime: null
        });
      }
    }),
    {
      name: 'sinosply-campaigns-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        campaigns: state.campaigns,
        totalCampaigns: state.totalCampaigns, 
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        selectedCampaign: state.selectedCampaign,
        lastFetchTime: state.lastFetchTime
      })
    }
  )
);

// Helper function to filter campaigns by search term
function filterCampaigns(campaigns, searchTerm) {
  if (!searchTerm) return campaigns;
  
  const term = searchTerm.toLowerCase();
  return campaigns.filter(campaign => 
    (campaign.title && campaign.title.toLowerCase().includes(term)) ||
    (campaign.subject && campaign.subject.toLowerCase().includes(term)) ||
    (campaign.type && campaign.type.toLowerCase().includes(term))
  );
}

// Helper function to paginate results
function paginateResults(results, page, limit) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return results.slice(startIndex, endIndex);
} 