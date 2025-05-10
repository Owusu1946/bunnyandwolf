import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { useSidebar } from '../../context/SidebarContext';
import EmailPreview from '../../components/admin/EmailPreview';
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
  FaCode
} from 'react-icons/fa';

const CampaignsPage = () => {
  // State for campaigns, filters, and modals
  const [campaigns, setCampaigns] = useState([]);
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
    recipients: 'all',
    scheduledDate: '',
    template: 'default'
  });
  const [showCampaignDetailModal, setShowCampaignDetailModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const { collapsed } = useSidebar();
  const [previewMode, setPreviewMode] = useState('desktop');

  // Mock campaign data for UI demonstration
  const mockCampaigns = [
    {
      id: 1,
      title: 'Summer Collection Launch',
      type: 'email',
      status: 'scheduled',
      sent: 0,
      opened: 0,
      clicked: 0,
      recipients: 2347,
      scheduledDate: '2023-07-15T10:00:00',
      subject: 'Introducing Our Summer Collection!',
      content: '<p>Check out our latest summer products...</p>',
    },
    {
      id: 2,
      title: 'Flash Sale: 24 Hours Only',
      type: 'email',
      status: 'sent',
      sent: 3150,
      opened: 1890,
      clicked: 945,
      recipients: 3150,
      scheduledDate: '2023-06-30T08:00:00',
      subject: '⚡ 24-Hour Flash Sale: 50% Off Everything!',
      content: '<p>Our biggest sale of the season is here...</p>',
    },
    {
      id: 3,
      title: 'New Arrivals Notification',
      type: 'notification',
      status: 'draft',
      sent: 0,
      opened: 0,
      clicked: 0,
      recipients: 0,
      scheduledDate: null,
      subject: 'New Products Just Arrived',
      content: '<p>Be the first to check out our new arrivals...</p>',
    },
    {
      id: 4,
      title: 'Customer Loyalty Rewards',
      type: 'email',
      status: 'sent',
      sent: 1250,
      opened: 980,
      clicked: 540,
      recipients: 1250,
      scheduledDate: '2023-06-20T14:30:00',
      subject: 'Your Loyalty Rewards Are Here!',
      content: '<p>Thank you for being a valued customer...</p>',
    },
    {
      id: 5,
      title: 'Abandoned Cart Reminder',
      type: 'email',
      status: 'active',
      sent: 450,
      opened: 320,
      clicked: 175,
      recipients: 1000,
      scheduledDate: 'automated',
      subject: 'You left something in your cart!',
      content: '<p>We noticed you didn\'t complete your purchase...</p>',
    }
  ];

  // Load mock data on component mount
  useEffect(() => {
    setCampaigns(mockCampaigns);
    setFilteredCampaigns(mockCampaigns);
  }, []);

  // Filter campaigns based on search and filter settings
  useEffect(() => {
    let results = campaigns;
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(
        campaign => campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Handle campaign creation
  const handleCreateCampaign = (e) => {
    e.preventDefault();
    // Would normally send to API here
    const newCampaign = {
      id: campaigns.length + 1,
      ...campaignFormData,
      status: 'draft',
      sent: 0,
      opened: 0,
      clicked: 0,
      recipients: campaignFormData.recipients === 'all' ? 3500 : 1500,
    };
    
    setCampaigns([newCampaign, ...campaigns]);
    setShowNewCampaignModal(false);
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setCampaignFormData({
      title: '',
      type: 'email',
      subject: '',
      content: '',
      recipients: 'all',
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
    if (campaign.sent === 0) return 0;
    return ((campaign.opened / campaign.sent) * 100).toFixed(1);
  };

  const getClickRate = (campaign) => {
    if (campaign.opened === 0) return 0;
    return ((campaign.clicked / campaign.opened) * 100).toFixed(1);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'automated') return 'Automated';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                <p className="text-2xl font-semibold">{campaigns.length}</p>
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
                  {campaigns.reduce((sum, campaign) => sum + campaign.recipients, 0).toLocaleString()}
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
                <h3 className="text-gray-500 text-sm">Scheduled</h3>
                <p className="text-2xl font-semibold">
                  {campaigns.filter(c => c.status === 'scheduled').length}
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
                  {campaigns.filter(c => c.sent > 0).length > 0 
                    ? (campaigns
                        .filter(c => c.sent > 0)
                        .reduce((sum, c) => sum + (c.opened / c.sent), 0) / 
                       campaigns.filter(c => c.sent > 0).length * 100).toFixed(1)
                    : '0'}%
                </p>
              </div>
            </div>
          </div>
        </div>

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
                    key={campaign.id}
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
                    <td className="py-3 px-4 text-sm">{formatDate(campaign.scheduledDate)}</td>
                    <td className="py-3 px-4 text-sm">{campaign.recipients.toLocaleString()}</td>
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
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add duplicate functionality
                        }}
                        className="text-gray-500 hover:text-gray-700 mr-3"
                      >
                        <FaCopy />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add more options functionality
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaEllipsisV />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCampaigns.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-6 px-4 text-center text-gray-500">
                      No campaigns found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
              {/* Campaign Form */}
              <div>
                <form onSubmit={handleCreateCampaign}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Campaign Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={campaignFormData.title}
                          onChange={handleFormChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Campaign Type
                        </label>
                        <select
                          name="type"
                          value={campaignFormData.type}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="email">Email</option>
                          <option value="notification">Notification</option>
                          <option value="promo">Promotional</option>
                          <option value="discount">Discount</option>
                          <option value="event">Event</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={campaignFormData.subject}
                        onChange={handleFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recipients
                      </label>
                      <select
                        name="recipients"
                        value={campaignFormData.recipients}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="all">All Customers</option>
                        <option value="active">Active Customers</option>
                        <option value="recent">Recent Shoppers</option>
                        <option value="dormant">Dormant Customers</option>
                        <option value="segment">Custom Segment</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Template
                        </label>
                        <select
                          name="template"
                          value={campaignFormData.template}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        >
                          {campaignTemplates.map(template => (
                            <option key={template.id} value={template.id}>{template.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Schedule
                        </label>
                        <input
                          type="datetime-local"
                          name="scheduledDate"
                          value={campaignFormData.scheduledDate}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Campaign Content
                      </label>
                      <textarea
                        name="content"
                        value={campaignFormData.content}
                        onChange={handleFormChange}
                        required
                        rows="8"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Write your campaign content here or use the template above..."
                      ></textarea>
                      <div className="mt-2 text-right text-xs text-gray-500">
                        <span>*Use HTML tags for formatting. Example: &lt;p&gt;Your text&lt;/p&gt; for paragraphs.</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowNewCampaignModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Create Campaign
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Email Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-800">Email Preview</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-200'}`}
                      title="Desktop Preview"
                    >
                      <FaDesktop />
                    </button>
                    <button 
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-200'}`}
                      title="Mobile Preview"
                    >
                      <FaMobileAlt />
                    </button>
                    <button 
                      className="p-2 rounded text-gray-500 hover:bg-gray-200"
                      title="View HTML"
                      onClick={() => alert('HTML view would be displayed here')}
                    >
                      <FaCode />
                    </button>
                  </div>
                </div>
                <EmailPreview 
                  template={campaignFormData.template}
                  subject={campaignFormData.subject}
                  content={campaignFormData.content}
                  previewMode={previewMode}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Detail Modal */}
      {showCampaignDetailModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-semibold">{selectedCampaign.title}</h2>
                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCampaign.status)}`}>
                  {selectedCampaign.status.charAt(0).toUpperCase() + selectedCampaign.status.slice(1)}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-y-2">
                <div className="w-full md:w-1/2">
                  <span className="text-gray-500">Type:</span> 
                  <span className="ml-2 capitalize">{selectedCampaign.type}</span>
                </div>
                <div className="w-full md:w-1/2">
                  <span className="text-gray-500">Schedule:</span> 
                  <span className="ml-2">{formatDate(selectedCampaign.scheduledDate)}</span>
                </div>
                <div className="w-full md:w-1/2">
                  <span className="text-gray-500">Subject:</span> 
                  <span className="ml-2">{selectedCampaign.subject}</span>
                </div>
                <div className="w-full md:w-1/2">
                  <span className="text-gray-500">Recipients:</span> 
                  <span className="ml-2">{selectedCampaign.recipients.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Campaign Stats Cards */}
            {selectedCampaign.status === 'sent' || selectedCampaign.status === 'active' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Sent</div>
                  <div className="font-semibold text-xl">{selectedCampaign.sent.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Opened</div>
                  <div className="font-semibold text-xl">{selectedCampaign.opened.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Open Rate</div>
                  <div className="font-semibold text-xl">{getOpenRate(selectedCampaign)}%</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Click Rate</div>
                  <div className="font-semibold text-xl">{getClickRate(selectedCampaign)}%</div>
                </div>
              </div>
            ) : null}

            {/* Preview of Content */}
            <div className="border rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-2">Content Preview</h4>
              <div 
                className="bg-gray-50 p-4 rounded min-h-[200px]"
                dangerouslySetInnerHTML={{ __html: selectedCampaign.content }}
              ></div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end">
              {selectedCampaign.status === 'draft' && (
                <>
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <FaEdit className="mr-2" /> Edit
                  </button>
                  <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <FaCheck className="mr-2" /> Schedule
                  </button>
                </>
              )}
              
              {selectedCampaign.status === 'scheduled' && (
                <>
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <FaEdit className="mr-2" /> Edit
                  </button>
                  <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    <FaPaperPlane className="mr-2" /> Send Now
                  </button>
                </>
              )}
              
              {selectedCampaign.status === 'active' && (
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FaPause className="mr-2" /> Pause
                </button>
              )}
              
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <FaCopy className="mr-2" /> Duplicate
              </button>
              
              <button className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
                <FaTrash className="mr-2" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage; 