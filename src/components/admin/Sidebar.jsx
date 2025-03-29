import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaShoppingCart, 
  FaBoxes, 
  FaUsers, 
  FaComments,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaDownload,
  FaFileAlt,
  FaCalendarAlt,
  FaChartBar,
  FaChevronRight,
  FaChevronLeft
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportType, setReportType] = useState('sales');
  const [reportPeriod, setReportPeriod] = useState('month');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);
  
  const menuItems = [
    { path: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/admin/orders', icon: FaShoppingCart, label: 'Orders' },
    { path: '/admin/products', icon: FaBoxes, label: 'Products' },
    { path: '/admin/customers', icon: FaUsers, label: 'Customers' },
    { path: '/admin/chats', icon: FaComments, label: 'Chats' }
  ];

  const bottomMenuItems = [
    { path: '/admin/profile', icon: FaUser, label: 'Profile' },
    { path: '/admin/settings', icon: FaCog, label: 'Settings' }
  ];

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/admin/login');
    setShowLogoutModal(false);
  };

  const handleGenerateReport = () => {
    setShowReportModal(true);
  };

  const downloadReport = async () => {
    try {
      setGeneratingReport(true);
      
      const response = await axios.get(`http://localhost:5000/api/v1/admin/reports/generate`, {
        params: {
          type: reportType,
          period: reportPeriod,
          format: reportFormat
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on report type and date
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `${reportType}-report-${date}.${reportFormat}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setShowReportModal(false);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again later.');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Add event listener for window resize
  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo/Title */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold text-gray-800">Sinosply</h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 mt-6">
        <div className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-purple-100 text-purple-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <item.icon className={`w-5 h-5 ${
              location.pathname === item.path
                ? 'text-purple-600'
                : 'text-gray-500'
            }`} />
            <span className="ml-3 font-medium">{item.label}</span>
          </Link>
        ))}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-4 py-4 border-t">
        <div className="space-y-2">
          {bottomMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`w-5 h-5 ${
                location.pathname === item.path
                  ? 'text-purple-600'
                  : 'text-gray-500'
              }`} />
              <span className="ml-3 font-medium">{item.label}</span>
            </Link>
          ))}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
          >
            <FaSignOutAlt className="w-5 h-5 text-gray-500" />
            <span className="ml-3 font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="px-4 mb-6">
        <button 
          className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
          onClick={handleGenerateReport}
        >
          <FaFileAlt className="mr-2" />
          Generate Report
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Logout</h3>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600">Are you sure you want to log out of your admin account?</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Generate Report</h3>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-500"
                disabled={generatingReport}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  disabled={generatingReport}
                >
                  <option value="sales">Sales Report</option>
                  <option value="inventory">Inventory Report</option>
                  <option value="customers">Customer Analytics</option>
                  <option value="performance">Store Performance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Period
                </label>
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  disabled={generatingReport}
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  disabled={generatingReport}
                >
                  <option value="pdf">PDF Document</option>
                  <option value="csv">CSV Spreadsheet</option>
                  <option value="xlsx">Excel Spreadsheet</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={generatingReport}
              >
                Cancel
              </button>
              <button
                onClick={downloadReport}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                disabled={generatingReport}
              >
                {generatingReport ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <FaDownload className="mr-2" />
                    Download Report
                  </>
                )}
              </button>
            </div>
          </div>
      </div>
      )}

      {/* Collapse Button */}
      <button
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>
    </div>
  );
};

export default Sidebar; 