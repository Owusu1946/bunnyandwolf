import { useState, useEffect } from 'react';
import { FaPlay, FaStop, FaRedo, FaBell, FaTimes, FaCheck } from 'react-icons/fa';
import SocketService from '../../services/SocketService';
import { useOrderStore } from '../../store/orderStore';
import { useNotificationStore } from '../../store/notificationStore';
import apiConfig from '../../config/apiConfig';

/**
 * Component to test real-time order notifications
 * This helps debug socket connection issues and verify event handling
 */
const OrderNotificationTest = () => {
  // State
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [socketId, setSocketId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [testType, setTestType] = useState('socket'); // 'socket' or 'api'
  const [testInProgress, setTestInProgress] = useState(false);
  const [mockOrder, setMockOrder] = useState({
    orderNumber: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    totalAmount: 150.00,
    status: 'Pending',
    items: [{ name: 'Test Product', price: 150.00, quantity: 1 }]
  });
  
  // Access order store
  const { addOrder, updateOrderStatus } = useOrderStore();
  
  // Access notification store
  const { addOrderStatusNotification } = useNotificationStore();

  // Add a log entry with timestamp
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{
      id: Date.now(),
      timestamp,
      message,
      type
    }, ...prev].slice(0, 30)); // Keep only the latest 30 logs
  };
  
  // Clear logs
  const clearLogs = () => setLogs([]);

  // Initialize socket connection
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      addLog('No userId found in localStorage. Socket connection requires authentication.', 'error');
      return;
    }
    
    // Debug existing socket connection
    const existingSocket = SocketService.getSocket();
    if (existingSocket) {
      addLog('Found existing socket connection', 'info');
      if (existingSocket.connected) {
        setSocketStatus('connected');
        setSocketId(existingSocket.id);
        addLog(`Connected with ID: ${existingSocket.id}`, 'success');
      } else {
        addLog('Existing socket is disconnected', 'warning');
      }
    }
    
    // Setup socket event handlers for this component
    const setupSocketListeners = (socket) => {
      if (!socket) return;
      
      // Listen for specific events relevant to this component
      socket.on('connect', () => {
        setSocketStatus('connected');
        setSocketId(socket.id);
        addLog(`Socket connected with ID: ${socket.id}`, 'success');
      });
      
      socket.on('disconnect', () => {
        setSocketStatus('disconnected');
        setSocketId(null);
        addLog('Socket disconnected', 'error');
      });
      
      socket.on('connect_error', (error) => {
        setSocketStatus('error');
        addLog(`Connection error: ${error.message}`, 'error');
      });
      
      socket.on('admin-registered', ({ success }) => {
        addLog(`Admin registration ${success ? 'successful' : 'failed'}`, success ? 'success' : 'error');
      });
      
      // Listen for order events
      socket.on('new-order', ({ order }) => {
        addLog(`New order received: ${order.orderNumber || order._id}`, 'success');
        console.log('🔔 [OrderNotificationTest] New order received via socket:', order);
      });
      
      socket.on('order-updated', ({ order }) => {
        addLog(`Order update received: ${order.orderNumber || order._id}`, 'info');
        console.log('🔄 [OrderNotificationTest] Order update received via socket:', order);
      });
    };
    
    // Setup socket connection and listeners
    addLog('Initializing socket connection...', 'info');
    const socket = SocketService.initializeSocket(userId);
    if (socket) {
      setupSocketListeners(socket);
      
      // Register as admin
      socket.emit('register-admin', userId);
      addLog('Sent register-admin event', 'info');
      
      // Test emit to verify bidirectional communication
      setTimeout(() => {
        socket.emit('test-connection', { message: 'Hello from OrderNotificationTest' });
        addLog('Sent test message to server', 'info');
      }, 2000);
    } else {
      addLog('Failed to initialize socket', 'error');
    }
    
    // Setup event listeners for order updates that come from HTTP
    const handleOrderStatusUpdated = (event) => {
      if (event.detail && event.detail.order) {
        const { order } = event.detail;
        addLog(`Received order-status-updated event: ${order.orderNumber}`, 'info');
        console.log('🔔 [OrderNotificationTest] Received order-status-updated event:', order);
      }
    };
    
    window.addEventListener('order-status-updated', handleOrderStatusUpdated);
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('order-status-updated', handleOrderStatusUpdated);
    };
  }, []);
  
  // Run a socket test
  const runSocketTest = () => {
    setTestInProgress(true);
    addLog('Starting socket notification test...', 'info');
    
    const socket = SocketService.getSocket();
    if (!socket || !socket.connected) {
      addLog('Socket not connected, cannot run test', 'error');
      setTestInProgress(false);
      return;
    }
    
    // Create test order with unique ID
    const testOrder = {
      ...mockOrder,
      _id: `test-${Date.now()}`,
      orderNumber: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    
    addLog(`Emitting test order: ${testOrder.orderNumber}`, 'info');
    console.log('📤 [OrderNotificationTest] Sending test order:', testOrder);
    
    // Emit the order event
    socket.emit('new-order', { order: testOrder });
    
    // Also try adding to store directly
    try {
      addOrder(testOrder);
      addLog('Added test order to store directly', 'success');
    } catch (error) {
      addLog(`Failed to add to store: ${error.message}`, 'error');
      console.error('[OrderNotificationTest] Store error:', error);
    }
    
    // Try to trigger a notification
    try {
      addOrderStatusNotification(testOrder);
      addLog('Triggered notification for test order', 'success');
    } catch (error) {
      addLog(`Failed to trigger notification: ${error.message}`, 'error');
    }
    
    // Simulate order status update after 5 seconds
    setTimeout(() => {
      const updatedOrder = {
        ...testOrder,
        status: 'Processing',
        updatedAt: new Date().toISOString()
      };
      
      addLog(`Emitting order update: ${updatedOrder.orderNumber} → ${updatedOrder.status}`, 'info');
      socket.emit('order-updated', { order: updatedOrder });
      
      // Update in store
      try {
        updateOrderStatus(updatedOrder._id, 'Processing');
        addLog('Updated order status in store', 'success');
      } catch (error) {
        addLog(`Failed to update store: ${error.message}`, 'error');
      }
      
      setTestInProgress(false);
    }, 5000);
  };
  
  // Run HTTP notification test
  const runHttpTest = () => {
    setTestInProgress(true);
    addLog('Starting HTTP notification test...', 'info');
    
    // Create custom event to simulate order update
    const testOrder = {
      ...mockOrder,
      _id: `http-test-${Date.now()}`,
      orderNumber: `HTTP-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    
    // Dispatch custom event
    try {
      const event = new CustomEvent('order-status-updated', {
        detail: { order: testOrder }
      });
      
      addLog(`Dispatching custom event: ${testOrder.orderNumber}`, 'info');
      window.dispatchEvent(event);
      
      // Also try adding to store directly
      addOrder(testOrder);
      addLog('Added test order to store', 'success');
      
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    }
    
    // End test after delay
    setTimeout(() => {
      setTestInProgress(false);
    }, 3000);
  };
  
  // Reconnect socket
  const reconnectSocket = () => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      addLog('No userId found in localStorage', 'error');
      return;
    }
    
    // Disconnect existing socket if any
    SocketService.disconnectSocket();
    addLog('Disconnected existing socket connection', 'info');
    
    // Create new connection
    setTimeout(() => {
      addLog('Initializing new socket connection...', 'info');
      const socket = SocketService.initializeSocket(userId);
      
      if (socket) {
        addLog('Socket initialization requested', 'info');
      } else {
        addLog('Failed to initialize socket', 'error');
      }
    }, 1000);
  };
  
  // Get status class for badge
  const getStatusClass = () => {
    switch(socketStatus) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <FaBell className="mr-2 text-purple-500" />
          Order Notification Tester
        </h2>
        
        <div className="flex items-center">
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass()}`}>
            Socket: {socketStatus}
            {socketId && ` (${socketId.substring(0, 6)}...)`}
          </span>
          
          <button
            onClick={reconnectSocket}
            className="ml-2 p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
            title="Reconnect Socket"
          >
            <FaRedo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Test Options</h3>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex space-x-4 mb-3">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-purple-600"
                  name="test-type"
                  checked={testType === 'socket'}
                  onChange={() => setTestType('socket')}
                />
                <span className="ml-2 text-sm">Socket.io Test</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-purple-600"
                  name="test-type"
                  checked={testType === 'api'}
                  onChange={() => setTestType('api')}
                />
                <span className="ml-2 text-sm">Custom Event Test</span>
              </label>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={testType === 'socket' ? runSocketTest : runHttpTest}
                disabled={testInProgress}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center
                  ${testInProgress 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'}`}
              >
                {testInProgress ? (
                  <>
                    <FaStop className="mr-1.5" />
                    Testing...
                  </>
                ) : (
                  <>
                    <FaPlay className="mr-1.5" />
                    Run {testType === 'socket' ? 'Socket' : 'HTTP'} Test
                  </>
                )}
              </button>
              
              <button
                onClick={clearLogs}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 flex items-center"
              >
                <FaTimes className="mr-1.5" />
                Clear Logs
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">API Connection Info</h3>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-xs font-mono mb-2">
              <span className="text-gray-500">API URL:</span> {apiConfig.baseURL}
            </div>
            <div className="text-xs font-mono">
              <span className="text-gray-500">Socket URL:</span> {apiConfig.baseURL || 'Same as API'}
            </div>
            <div className="mt-2 text-xs">
              <p className="mb-1 text-gray-500">Event names to listen for:</p>
              <span className="bg-gray-200 px-1.5 py-0.5 rounded mr-1 inline-block">new-order</span>
              <span className="bg-gray-200 px-1.5 py-0.5 rounded mr-1 inline-block">order-updated</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Log Display */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
          <span>Event Logs</span>
          <span className="text-xs text-gray-500">{logs.length} entries</span>
        </h3>
        
        <div className="bg-gray-800 rounded-md p-2 h-56 overflow-y-auto font-mono text-xs">
          {logs.length > 0 ? (
            <div className="space-y-1">
              {logs.map((log) => (
                <div key={log.id} className={`px-2 py-1 rounded ${
                  log.type === 'error' ? 'bg-red-900 text-red-200' : 
                  log.type === 'success' ? 'bg-green-900 text-green-200' : 
                  log.type === 'warning' ? 'bg-yellow-900 text-yellow-200' : 
                  'bg-gray-700 text-gray-200'
                }`}>
                  <span className="opacity-75">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No logs yet. Run a test to see results.
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p className="flex items-center">
          <FaCheck className="text-green-500 mr-1" /> 
          Check browser console for detailed logs. Look for messages starting with 🔔 [OrderNotificationTest]
        </p>
      </div>
    </div>
  );
};

export default OrderNotificationTest;