import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { useSidebar } from '../../context/SidebarContext';
import EmailPreview from '../../components/admin/EmailPreview';
import { useCampaignStore } from '../../store/campaignStore';
import { useCustomersStore } from '../../store/customersStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaEllipsisV, 
  FaPaperPlane, 
  FaRegCalendarAlt, 
  FaChartLine, 
  FaUserFriends, 
  FaTags, 
  FaBullhorn,
  FaEnvelope,
  FaBell,
  FaTag,
  FaPercent,
  FaCalendarCheck,
  FaTrash,
  FaCopy,
  FaEdit,
  FaCheck,
  FaPause,
  FaMobileAlt,
  FaDesktop,
  FaCode,
  FaSpinner
} from 'react-icons/fa';

const CampaignsPage = () => {
  // Use the campaign store
  const {
    campaigns,
    totalCampaigns,
    currentPage,
    totalPages,
    isLoading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    getCampaignStats
  } = useCampaignStore();

  // Use the customers store to get recipients
  const {
    customers,
    isLoading: customersLoading,
    error: customersError,
    fetchCustomers,
    totalCustomers
  } = useCustomersStore();

  // Use the auth store
  const {
    user,
    loadUser
  } = useAuthStore();

  // State for campaigns, filters, and modals
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [campaignFormData, setCampaignFormData] = useState({
    title: '',
    type: 'email',
    subject: '',
    content: '',
    recipientType: 'all',
    scheduledDate: '',
    template: 'default'
  });
  const [showCampaignDetailModal, setShowCampaignDetailModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const { collapsed } = useSidebar();
  const [previewMode, setPreviewMode] = useState('desktop');
  const [campaignStats, setCampaignStats] = useState({
    totalCampaigns: 0,
    sentCampaigns: 0,
    totalRecipients: 0,
    totalOpens: 0, 
    totalClicks: 0,
    avgOpenRate: 0,
    avgClickRate: 0
  });
  const [isSending, setIsSending] = useState(false);
  const [sendingSuccess, setSendingSuccess] = useState(false);

  // Add useEffect to load user data
  useEffect(() => {
    if (!user) {
      loadUser();
    }
  }, [loadUser, user]);

  // Fetch campaigns and customers on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchCampaigns();
      await fetchCustomers(1, 1000); // Fetch a good number of customers for campaigns
      
      try {
        const stats = await getCampaignStats();
        if (stats) {
          setCampaignStats(stats);
        }
      } catch (err) {
        console.error('Error fetching campaign stats:', err);
      }
    };
    
    loadData();
  }, [fetchCampaigns, fetchCustomers, getCampaignStats]);

  // Filter campaigns based on search and filter settings
  useEffect(() => {
    if (!campaigns) return;
    
    let results = [...campaigns];
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(
        campaign => (campaign.title && campaign.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
                   (campaign.subject && campaign.subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      results = results.filter(campaign => campaign.status === statusFilter);
    }
    
    // Filter by type
    if (typeFilter !== 'all') {
      results = results.filter(campaign => campaign.type === typeFilter);
    }
    
    setFilteredCampaigns(results);
  }, [campaigns, searchTerm, statusFilter, typeFilter]);

  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCampaignFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle rich text editor content change
  const handleEditorChange = (content) => {
    setCampaignFormData(prev => ({
      ...prev,
      content
    }));
  };

  // Handle campaign creation
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare campaign data
      const campaignData = {
      ...campaignFormData,
        createdBy: user?.id || user?._id,
      status: 'draft',
      };
      
      // Create campaign via the store
      const newCampaign = await createCampaign(campaignData);
      
      // Show success message
      toast.success('Campaign created successfully!');
      
      // Close modal and reset form
    setShowNewCampaignModal(false);
    resetForm();
      
      // Refresh campaigns list
      fetchCampaigns();
    } catch (err) {
      console.error('Error creating campaign:', err);
      toast.error(err.response?.data?.message || 'Failed to create campaign. Please try again.');
    }
  };

  // Send campaign to recipients
  const handleSendCampaign = async (campaign) => {
    if (!campaign || !campaign._id) {
      toast.error('Invalid campaign');
      return;
    }
    
    // Confirm before sending
    if (!window.confirm(`Are you sure you want to send "${campaign.title}" to all recipients?`)) {
      return;
    }
    
    setIsSending(true);
    setSendingSuccess(false);
    
    try {
      // Send campaign via the store
      const result = await sendCampaign(campaign._id, campaign.recipientType || 'all');
      
      // Update campaign status
      setSelectedCampaign({
        ...campaign,
        status: 'sent',
        sentAt: new Date().toISOString(),
        recipientCount: result.recipientCount || 0
      });
      
      setSendingSuccess(true);
      toast.success(`Campaign sent successfully to ${result.recipientCount} recipients!`);
      
      // Refresh campaigns list
      fetchCampaigns();
    } catch (err) {
      console.error('Error sending campaign:', err);
      toast.error(err.response?.data?.message || 'Failed to send campaign. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setCampaignFormData({
      title: '',
      type: 'email',
      subject: '',
      content: '',
      recipientType: 'all',
      scheduledDate: '',
      template: 'default'
    });
  };

  // View campaign details
  const viewCampaignDetails = (campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetailModal(true);
  };

  // Calculate campaign statistics
  const getOpenRate = (campaign) => {
    if (!campaign || campaign.sent === 0) return 0;
    return ((campaign.opened / campaign.sent) * 100).toFixed(1);
  };

  const getClickRate = (campaign) => {
    if (!campaign || campaign.opened === 0) return 0;
    return ((campaign.clicked / campaign.opened) * 100).toFixed(1);
  };

  // Get recipient count
  const getRecipientCount = (campaign) => {
    if (!campaign) return 0;
    return campaign.recipientCount || 0;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'automated') return 'Automated';
    try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    } catch (error) {
      console.error('Invalid date:', dateString);
      return 'Invalid date';
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get campaign type icon
  const getCampaignTypeIcon = (type) => {
    switch (type) {
      case 'email': return <FaEnvelope className="text-blue-500" />;
      case 'notification': return <FaBell className="text-yellow-500" />;
      case 'promo': return <FaTag className="text-pink-500" />;
      case 'discount': return <FaPercent className="text-green-500" />;
      case 'event': return <FaCalendarCheck className="text-purple-500" />;
      default: return <FaEnvelope className="text-blue-500" />;
    }
  };

  // Templates for different types of campaigns
  const campaignTemplates = [
    { id: 'default', name: 'Default Template', preview: '/templates/default.jpg' },
    { id: 'promotional', name: 'Promotional', preview: '/templates/promo.jpg' },
    { id: 'newsletter', name: 'Newsletter', preview: '/templates/newsletter.jpg' },
    { id: 'announcement', name: 'Announcement', preview: '/templates/announcement.jpg' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className={`flex-1 transition-all duration-300 ${
        collapsed ? 'ml-20' : 'ml-64'
      } p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Marketing Campaigns</h1>
          <button 
            onClick={() => setShowNewCampaignModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Create Campaign
          </button>
        </div>

        {/* Campaign Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3">
                <FaPaperPlane className="text-blue-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Total Campaigns</h3>
                <p className="text-2xl font-semibold">
                  {isLoading ? (
                    <FaSpinner className="animate-spin inline" />
                  ) : (
                    campaignStats.totalCampaigns || 0
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3">
                <FaUserFriends className="text-green-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Total Recipients</h3>
                <p className="text-2xl font-semibold">
                  {isLoading ? (
                    <FaSpinner className="animate-spin inline" />
                  ) : (
                    (campaignStats.totalRecipients || 0).toLocaleString()
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3">
                <FaRegCalendarAlt className="text-yellow-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Scheduled/Sent</h3>
                <p className="text-2xl font-semibold">
                  {isLoading ? (
                    <FaSpinner className="animate-spin inline" />
                  ) : (
                    `${campaigns?.filter(c => c.status === 'scheduled').length || 0}/${campaignStats.sentCampaigns || 0}`
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3">
                <FaChartLine className="text-purple-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Avg. Open Rate</h3>
                <p className="text-2xl font-semibold">
                  {isLoading ? (
                    <FaSpinner className="animate-spin inline" />
                  ) : (
                    `${(campaignStats.avgOpenRate || 0).toFixed(1)}%`
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Display error message if any */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p className="font-medium">Error loading campaigns</p>
            <p>{error}</p>
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div className="flex-1 min-w-[150px]">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sent">Sent</option>
                  <option value="active">Active</option>
                </select>
                <FaFilter className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div className="flex-1 min-w-[150px]">
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="email">Email</option>
                  <option value="notification">Notification</option>
                  <option value="promo">Promotional</option>
                  <option value="discount">Discount</option>
                  <option value="event">Event</option>
                </select>
                <FaFilter className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center">
              <FaSpinner className="animate-spin inline-block text-4xl text-purple-600 mb-4" />
              <p className="text-gray-500">Loading campaigns...</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCampaigns.map(campaign => (
                  <tr 
                      key={campaign._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => viewCampaignDetails(campaign)}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{campaign.title}</div>
                        <div className="text-sm text-gray-500">{campaign.subject}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getCampaignTypeIcon(campaign.type)}
                        <span className="ml-2 capitalize">{campaign.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                      <td className="py-3 px-4 text-sm">{formatDate(campaign.scheduledDate || campaign.sentAt)}</td>
                      <td className="py-3 px-4 text-sm">{getRecipientCount(campaign).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${getOpenRate(campaign)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm">{getOpenRate(campaign)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${getClickRate(campaign)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm">{getClickRate(campaign)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                        {campaign.status !== 'sent' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                              handleSendCampaign(campaign);
                            }}
                            title="Send Campaign"
                            className="text-blue-500 hover:text-blue-700 mr-3"
                          >
                            <FaPaperPlane />
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Duplicate campaign
                            const duplicateData = {
                              title: `Copy of ${campaign.title}`,
                              type: campaign.type,
                              subject: campaign.subject,
                              content: campaign.content,
                              recipientType: campaign.recipientType,
                              template: campaign.template
                            };
                            
                            createCampaign(duplicateData)
                              .then(() => {
                                toast.success('Campaign duplicated successfully!');
                                fetchCampaigns();
                              })
                              .catch(err => {
                                toast.error('Failed to duplicate campaign');
                              });
                          }}
                          title="Duplicate Campaign"
                        className="text-gray-500 hover:text-gray-700 mr-3"
                      >
                        <FaCopy />
                      </button>
                        {campaign.status !== 'sent' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this campaign?')) {
                                deleteCampaign(campaign._id)
                                  .then(() => {
                                    toast.success('Campaign deleted successfully!');
                                    fetchCampaigns();
                                  })
                                  .catch(err => {
                                    toast.error('Failed to delete campaign');
                                  });
                              }
                            }}
                            title="Delete Campaign"
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                      </button>
                        )}
                    </td>
                  </tr>
                ))}
                  {!isLoading && filteredCampaigns.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-6 px-4 text-center text-gray-500">
                      No campaigns found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {/* New Campaign Modal with Preview */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Campaign</h3>
              <button 
                onClick={() => setShowNewCampaignModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <form onSubmit={handleCreateCampaign} className="space-y-6">
                      <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Campaign Title
                        </label>
                        <input
                          type="text"
                      id="title"
                          name="title"
                          value={campaignFormData.title}
                          onChange={handleFormChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 border"
                      placeholder="e.g. Summer Sale Announcement"
                          required
                        />
                      </div>
                      
                      <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                          Campaign Type
                        </label>
                        <select
                      id="type"
                          name="type"
                          value={campaignFormData.type}
                          onChange={handleFormChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 border"
                      required
                        >
                          <option value="email">Email</option>
                          <option value="notification">Notification</option>
                          <option value="promo">Promotional</option>
                          <option value="discount">Discount</option>
                          <option value="event">Event</option>
                        </select>
                    </div>
                    
                    <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Subject
                      </label>
                      <input
                        type="text"
                      id="subject"
                        name="subject"
                        value={campaignFormData.subject}
                        onChange={handleFormChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 border"
                      placeholder="e.g. Don't Miss Our Summer Sale!"
                        required
                      />
                    </div>

                    <div>
                    <label htmlFor="recipientType" className="block text-sm font-medium text-gray-700 mb-1">
                        Recipients
                      </label>
                      <select
                      id="recipientType"
                      name="recipientType"
                      value={campaignFormData.recipientType}
                        onChange={handleFormChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 border"
                    >
                      <option value="all">All Customers ({customersLoading ? '...' : totalCustomers || 0})</option>
                      <option value="active">Active Customers (Last 30 days)</option>
                      <option value="recent">New Customers (Last 14 days)</option>
                      <option value="dormant">Dormant Customers (90+ days inactive)</option>
                      </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {campaignFormData.recipientType === 'all' 
                        ? 'This will send to all active customers.' 
                        : campaignFormData.recipientType === 'active'
                          ? 'This will send to customers who have been active in the last 30 days.'
                          : campaignFormData.recipientType === 'recent'
                            ? 'This will send to customers who signed up in the last 14 days.'
                            : 'This will send to customers who have not been active for 90+ days.'}
                    </p>
                    </div>
                    
                      <div>
                    <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Template
                        </label>
                        <select
                      id="template"
                          name="template"
                          value={campaignFormData.template}
                          onChange={handleFormChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 border"
                    >
                      <option value="default">Default Template</option>
                      <option value="promotional">Promotional</option>
                      <option value="newsletter">Newsletter</option>
                      <option value="announcement">Announcement</option>
                        </select>
                      </div>
                      
                      <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Content
                      </label>
                      <textarea
                      id="content"
                        name="content"
                        value={campaignFormData.content}
                        onChange={handleFormChange}
                        required
                        rows="8"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 border"
                      placeholder="Enter your email content here..."
                      ></textarea>
                    <p className="mt-1 text-xs text-gray-500">
                      You can use HTML to format your email content.
                    </p>
                      </div>

                  <div>
                    <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Schedule (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      id="scheduledDate"
                      name="scheduledDate"
                      value={campaignFormData.scheduledDate}
                      onChange={handleFormChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 border"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty to save as draft. You can send it later.
                    </p>
                    </div>
                    
                  <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowNewCampaignModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Create Campaign
                      </button>
                  </div>
                </form>
              </div>
              
              <div>
                <div className="border rounded-lg p-4 bg-gray-50 h-full">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Email Preview</h4>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setPreviewMode('desktop')}
                        className={`p-1 rounded ${previewMode === 'desktop' ? 'bg-gray-200' : ''}`}
                        title="Desktop preview"
                    >
                        <FaDesktop className="text-gray-600" />
                    </button>
                    <button 
                      onClick={() => setPreviewMode('mobile')}
                        className={`p-1 rounded ${previewMode === 'mobile' ? 'bg-gray-200' : ''}`}
                        title="Mobile preview"
                      >
                        <FaMobileAlt className="text-gray-600" />
                    </button>
                  </div>
                </div>

                  <div className={`border rounded-lg overflow-hidden bg-white ${
                    previewMode === 'mobile' ? 'max-w-xs mx-auto' : 'w-full'
                  }`}>
                    <div className="border-b px-4 py-2 bg-gray-50">
                      <div className="text-sm font-medium">From: Sinosply Store</div>
                      <div className="text-sm">To: [Customer]</div>
                      <div className="text-sm font-medium">
                        Subject: {campaignFormData.subject || 'Email Subject'}
                      </div>
                    </div>
                    <div className="p-4">
                <EmailPreview 
                        content={campaignFormData.content || '<p>Your email content will appear here...</p>'} 
                        template={campaignFormData.template || 'default'}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recipient Summary</h4>
                    <div className="bg-white rounded-lg border p-3">
                      <div className="flex items-center text-sm">
                        <FaUserFriends className="text-gray-400 mr-2" />
                        <span>
                          {customersLoading ? (
                            <span className="flex items-center">
                              <FaSpinner className="animate-spin mr-1" /> Loading customer data...
                            </span>
                          ) : campaignFormData.recipientType === 'all' ? (
                            `All customers (${totalCustomers || 0})`
                          ) : campaignFormData.recipientType === 'active' ? (
                            `Active customers (approximately ${Math.round((totalCustomers || 0) * 0.6)})`
                          ) : campaignFormData.recipientType === 'recent' ? (
                            `New customers (approximately ${Math.round((totalCustomers || 0) * 0.2)})`
                          ) : (
                            `Dormant customers (approximately ${Math.round((totalCustomers || 0) * 0.3)})`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Detail Modal */}
      {showCampaignDetailModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Campaign Details</h3>
              <button 
                onClick={() => setShowCampaignDetailModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">Details</h4>
                  <div className="mt-2 space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Title:</span>
                      <p>{selectedCampaign.title}</p>
              </div>
                    <div>
                      <span className="text-sm text-gray-500">Subject:</span>
                      <p>{selectedCampaign.subject}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Type:</span>
                      <p className="flex items-center">
                        {getCampaignTypeIcon(selectedCampaign.type)}
                  <span className="ml-2 capitalize">{selectedCampaign.type}</span>
                      </p>
                </div>
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCampaign.status)}`}>
                          {selectedCampaign.status.charAt(0).toUpperCase() + selectedCampaign.status.slice(1)}
                        </span>
                      </p>
                </div>
                    <div>
                      <span className="text-sm text-gray-500">Recipients:</span>
                      <p>{getRecipientCount(selectedCampaign).toLocaleString()}</p>
                </div>
                    <div>
                      <span className="text-sm text-gray-500">Schedule:</span>
                      <p>{formatDate(selectedCampaign.scheduledDate || selectedCampaign.sentAt)}</p>
                </div>
              </div>
            </div>

                {selectedCampaign.status === 'sent' && (
                  <div>
                    <h4 className="font-medium text-gray-700">Performance</h4>
                    <div className="mt-2 space-y-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Sent</span>
                          <span className="font-medium">{selectedCampaign.sent || 0}</span>
                </div>
                </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Opened</span>
                          <span className="font-medium">{selectedCampaign.opened || 0}</span>
                </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${getOpenRate(selectedCampaign)}%` }}
                          ></div>
                </div>
                        <div className="text-right text-xs text-gray-500 mt-1">{getOpenRate(selectedCampaign)}%</div>
              </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Clicked</span>
                          <span className="font-medium">{selectedCampaign.clicked || 0}</span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${getClickRate(selectedCampaign)}%` }}
              ></div>
            </div>
                        <div className="text-right text-xs text-gray-500 mt-1">{getClickRate(selectedCampaign)}%</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 space-y-2">
                  {selectedCampaign.status !== 'sent' ? (
                    <button
                      onClick={() => handleSendCampaign(selectedCampaign)}
                      disabled={isSending}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center"
                    >
                      {isSending ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" /> Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="mr-2" /> Send Campaign
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center justify-center py-2 px-4 bg-green-100 text-green-800 rounded">
                      <FaCheck className="mr-2" /> Campaign Sent
                    </div>
                  )}
                  
                  {selectedCampaign.status !== 'sent' && (
                    <button
                      onClick={() => {
                        // Edit functionality - for now just close the modal
                        setShowCampaignDetailModal(false);
                        setCampaignFormData({
                          ...selectedCampaign,
                          id: undefined, // Remove ID to create a new campaign
                          title: selectedCampaign.title
                        });
                        setShowNewCampaignModal(true);
                      }}
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded flex items-center justify-center"
                    >
                      <FaEdit className="mr-2" /> Edit Campaign
                </button>
              )}
              
                  {selectedCampaign.status !== 'sent' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this campaign?')) {
                          deleteCampaign(selectedCampaign._id)
                            .then(() => {
                              toast.success('Campaign deleted successfully!');
                              setShowCampaignDetailModal(false);
                              fetchCampaigns();
                            })
                            .catch(err => {
                              toast.error('Failed to delete campaign');
                            });
                        }
                      }}
                      className="w-full border border-red-300 text-red-700 py-2 px-4 rounded flex items-center justify-center"
                    >
                      <FaTrash className="mr-2" /> Delete Campaign
              </button>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700">Email Preview</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPreviewMode('desktop')}
                        className={`p-1 rounded ${previewMode === 'desktop' ? 'bg-gray-200' : ''}`}
                        title="Desktop preview"
                      >
                        <FaDesktop className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => setPreviewMode('mobile')}
                        className={`p-1 rounded ${previewMode === 'mobile' ? 'bg-gray-200' : ''}`}
                        title="Mobile preview"
                      >
                        <FaMobileAlt className="text-gray-600" />
              </button>
                    </div>
                  </div>
                  
                  <div className={`border rounded-lg overflow-hidden bg-white ${
                    previewMode === 'mobile' ? 'max-w-xs mx-auto' : 'w-full'
                  }`}>
                    <div className="border-b px-4 py-2 bg-gray-50">
                      <div className="text-sm font-medium">From: Sinosply Store</div>
                      <div className="text-sm">To: [Customer]</div>
                      <div className="text-sm font-medium">Subject: {selectedCampaign.subject}</div>
                    </div>
                    <div className="p-4">
                      <EmailPreview 
                        content={selectedCampaign.content} 
                        template={selectedCampaign.template || 'default'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage; 