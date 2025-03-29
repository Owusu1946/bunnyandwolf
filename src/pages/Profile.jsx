import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaKey, FaHistory, FaHeart, FaShoppingBag, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import LoadingOverlay from '../components/LoadingOverlay';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    // Fetch orders and wishlist
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      // Get the token for authorization
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log('Fetching user orders with auth token');
      
      const [ordersRes, wishlistRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/orders/my`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/wishlist`, { headers })
      ]);
      
      console.log('Orders response:', ordersRes.data);
      
      setOrders(ordersRes.data.data || ordersRes.data);
      setWishlist(wishlistRes.data.data || wishlistRes.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      if (err.response) {
        console.error('Server error details:', err.response.data);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.put(
        'http://localhost:5000/api/v1/auth/updatedetails',
        formData
      );
      setUser(data.user);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderProfileTab = () => (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Profile Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FaEdit />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={true}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows="3"
            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        {isEditing && (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 border border-transparent rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </form>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Order History</h2>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <FaShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <Link 
            to="/" 
            className="inline-block bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start flex-wrap">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.orderNumber || order._id.substring(0, 8)}</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(order.totalAmount || 0).toFixed(2)}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {(order.status || 'Processing').charAt(0).toUpperCase() + (order.status || 'Processing').slice(1)}
                  </span>
                </div>
              </div>
              
              {/* Display order items as thumbnails */}
              {order.items && order.items.length > 0 && (
                <div className="mt-3 flex items-center space-x-2 overflow-x-auto py-2">
                  {order.items.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex-shrink-0">
                      <img 
                        src={item.image || 'https://via.placeholder.com/50'} 
                        alt={item.name} 
                        className="h-12 w-12 object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                        }}
                      />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded-md text-xs font-medium text-gray-600">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <Link 
                  to={`/orders/${order._id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Order Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderWishlistTab = () => (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-900">My Wishlist</h2>
      </div>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-8">
          <FaHeart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Your wishlist is empty.</p>
          <Link 
            to="/" 
            className="inline-block bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800 transition-colors"
          >
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map(item => (
            <div
              key={item._id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-gray-900 font-medium mb-1 truncate">{item.name}</h3>
                <p className="text-gray-900 font-semibold">${item.price}</p>
                <div className="mt-3 flex space-x-2">
                  <button className="flex-1 py-2 px-3 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors">
                    View Item
                  </button>
                  <button className="py-2 px-3 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-center">
        <Link 
          to="/wishlist" 
          className="inline-block text-blue-600 hover:text-blue-800 font-medium"
        >
          View Full Wishlist
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Manage your profile, orders, and wishlist</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === 'profile'
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaUser className="flex-shrink-0" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === 'orders'
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaHistory className="flex-shrink-0" />
                  <span>Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === 'wishlist'
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaHeart className="flex-shrink-0" />
                  <span>Wishlist</span>
                </button>
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FaSignOutAlt className="flex-shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'orders' && renderOrdersTab()}
            {activeTab === 'wishlist' && renderWishlistTab()}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;