import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBell, FaCheckCircle, FaBox, FaShippingFast, FaTimesCircle, FaTimes, FaSync } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore } from '../store/notificationStore';

const NotificationDropdown = ({ onClearAll, onClearNotification }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [key, setKey] = useState(0); // Force rerender key
  
  // Get notifications directly from the store
  const storeInstance = useNotificationStore();
  const { notifications, clearAll, removeNotification, debugInitialize } = storeInstance;
  const unreadCount = notifications.filter(n => !n.read).length;

  // Debug mounting and initialize
  useEffect(() => {
    console.log('[NotificationDropdown] MOUNTED');
    
    // Debug initialization
    try {
      const status = debugInitialize();
      console.log('[NotificationDropdown] Debug initialization status:', status);
    } catch (err) {
      console.error('[NotificationDropdown] Error in debug initialization:', err);
    }
    
    console.log('[NotificationDropdown] Store state:', storeInstance);
    console.log('[NotificationDropdown] Initial notifications:', notifications);
    
    return () => {
      console.log('[NotificationDropdown] UNMOUNTED');
    };
  }, []);

  // Force refresh function
  const forceRefresh = () => {
    console.log('[NotificationDropdown] Forcing refresh...');
    setKey(prev => prev + 1);
    // Also try to get latest notifications
    try {
      const status = debugInitialize();
      console.log('[NotificationDropdown] Refresh status:', status);
    } catch (err) {
      console.error('[NotificationDropdown] Error refreshing:', err);
    }
  };

  // Log notifications for debugging
  useEffect(() => {
    console.log('[NotificationDropdown] Notifications updated, count:', notifications.length);
    console.log('[NotificationDropdown] Unread count:', unreadCount);
    
    if (notifications.length > 0) {
      console.log('[NotificationDropdown] First notification:', notifications[0]);
      console.log('[NotificationDropdown] All notifications:', notifications);
    }
  }, [notifications, unreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get appropriate icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_delivered':
        return <FaCheckCircle className="text-green-500 text-lg" />;
      case 'order_processing':
        return <FaBox className="text-blue-500 text-lg" />;
      case 'order_shipped':
        return <FaShippingFast className="text-purple-500 text-lg" />;
      case 'order_cancelled':
        return <FaTimesCircle className="text-red-500 text-lg" />;
      default:
        return <FaBell className="text-gray-500 text-lg" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      console.error('[NotificationDropdown] Error formatting date:', e);
      return 'recently';
    }
  };

  const handleToggleDropdown = () => {
    console.log('[NotificationDropdown] Toggling dropdown, was:', isOpen);
    console.log('[NotificationDropdown] Current notifications count:', notifications.length);
    setIsOpen(!isOpen);
  };

  const handleClearAll = () => {
    console.log('[NotificationDropdown] Clearing all notifications');
    clearAll();
    if (onClearAll) onClearAll();
    setIsOpen(false);
  };

  const handleClearNotification = (id) => {
    console.log('[NotificationDropdown] Clearing notification:', id);
    removeNotification(id);
    if (onClearNotification) onClearNotification(id);
  };

  const handleNotificationClick = (notification) => {
    console.log('[NotificationDropdown] Notification clicked:', notification.id);
    setIsOpen(false);
  };
  
  console.log('[NotificationDropdown] Rendering with notification count:', notifications.length);

  return (
    <div className="relative z-50" ref={dropdownRef} key={key}>
      <div className="flex items-center">
        {/* Notification Bell */}
        <button
          onClick={handleToggleDropdown}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
          aria-label="Notifications"
        >
          {/* Temporary bright color to make sure the bell is visible */}
          <FaBell className="text-red-500 text-xl" />
          
          {/* Debug notification count */}
          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </div>
        </button>
        
        {/* Refresh button */}
        <button
          onClick={forceRefresh}
          className="ml-1 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none"
          title="Refresh notifications"
        >
          <FaSync className="text-gray-700 text-sm" />
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
            style={{ maxHeight: '500px' }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium text-gray-700">Notifications ({notifications.length})</h3>
              {notifications.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 px-4 text-center text-gray-500">
                  <div className="inline-block p-3 rounded-full bg-gray-100 mb-3">
                    <FaBell className="text-gray-400 text-xl" />
                  </div>
                  <p>No notifications yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <li 
                      key={notification.id} 
                      className={`relative hover:bg-gray-50 transition-colors ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                    >
                      <Link 
                        to={notification.link || '#'} 
                        className="block px-4 py-3"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-800' : 'text-black'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </Link>
                      
                      {/* Close button */}
                      <button 
                        onClick={() => handleClearNotification(notification.id)}
                        className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        aria-label="Remove notification"
                      >
                        <FaTimes size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown; 