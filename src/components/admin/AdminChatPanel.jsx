import { useState, useEffect, useRef } from 'react';
import { Send, MinusCircle, X, ArrowLeft, CheckCheck } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { motion, AnimatePresence } from 'framer-motion';

// Define WebSocket URL based on environment
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = process.env.REACT_APP_WS_HOST || window.location.host;
  return `${protocol}//${host}/ws/chat`;
};

const AdminChatPanel = ({ onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get chat store methods and state
  const { 
    socket,
    setSocket,
    isConnected,
    setConnectionState,
    addMessage,
    sendMessage,
    markSessionAsRead,
    activeSessionId,
    setActiveSession
  } = useChatStore();
  
  // Get sessions data
  const sessions = useChatStore(state => state.getSortedSessions());
  const messages = useChatStore(state => 
    state.activeSessionId ? state.sessions[state.activeSessionId]?.messages || [] : []
  );
  const totalUnreadCount = useChatStore(state => state.getTotalUnreadCount());
  
  // Connect to WebSocket as admin
  useEffect(() => {
    // Connect to WebSocket server as admin
    connectWebSocket();
    
    // Clean up WebSocket connection on component unmount
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  const connectWebSocket = () => {
    try {
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        return; // Already connected or connecting
      }
      
      const wsUrl = `${getWebSocketUrl()}/admin`;
      const newSocket = new WebSocket(wsUrl);
      setSocket(newSocket);
      
      newSocket.onopen = () => {
        console.log('[ADMIN] WebSocket connected');
        setConnectionState(true, null);
        
        // Send admin init message
        setTimeout(() => {
          try {
            if (newSocket && newSocket.readyState === WebSocket.OPEN) {
              const initMessage = {
                type: 'init',
                userType: 'admin',
                timestamp: new Date().toISOString()
              };
              newSocket.send(JSON.stringify(initMessage));
            }
          } catch (error) {
            console.error('[ADMIN] Error sending init message:', error);
          }
        }, 500);
      };
      
      newSocket.onmessage = (event) => {
        try {
          // Parse message
          let data;
          try {
            data = JSON.parse(event.data);
          } catch (parseError) {
            console.log('[ADMIN] Received non-JSON message:', event.data);
            return;
          }
          
          // Handle different message types
          switch(data.type) {
            case 'message':
              // Handle messages from customers
              if (data.sender === 'customer' && data.sessionId) {
                const customerMessage = { 
                  id: data.messageId, 
                  text: data.content, 
                  sender: 'user',
                  time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  timestamp: data.timestamp
                };
                
                // Add message to store
                addMessage(data.sessionId, customerMessage);
              }
              break;
              
            case 'typing':
              if (data.sessionId === activeSessionId) {
                setTyping(data.isTyping);
              }
              break;
              
            case 'session_list':
              // Server might send list of active sessions
              if (Array.isArray(data.sessions)) {
                data.sessions.forEach(session => {
                  useChatStore.getState().initSession(session.sessionId, session.customerInfo);
                });
              }
              break;
              
            default:
              console.log('[ADMIN] Unhandled message type:', data.type);
          }
        } catch (error) {
          console.error("[ADMIN] Error processing WebSocket message:", error);
        }
      };
      
      newSocket.onclose = (event) => {
        console.log('[ADMIN] WebSocket disconnected', event.code, event.reason);
        setConnectionState(false);
      };
      
      newSocket.onerror = (error) => {
        console.error('[ADMIN] WebSocket error:', error);
        setConnectionState(false, 'Connection error');
      };
      
    } catch (error) {
      console.error("[ADMIN] Error connecting to WebSocket:", error);
      setConnectionState(false, error.message);
    }
  };
  
  // Handle session selection
  const handleSelectSession = (sessionId) => {
    setActiveSession(sessionId);
    markSessionAsRead(sessionId);
  };
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (activeSessionId && messages.length) {
      scrollToBottom();
    }
  }, [messages, activeSessionId]);
  
  // Mark messages as read when active session changes
  useEffect(() => {
    if (activeSessionId) {
      markSessionAsRead(activeSessionId);
    }
  }, [activeSessionId]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected || !activeSessionId) {
      return;
    }
    
    // Send message using the store's method for admin messages
    const success = sendMessage(activeSessionId, newMessage.trim(), 'admin_message');
    
    if (success) {
      // Clear input field after sending
      setNewMessage('');
      // Send typing = false
      sendTypingStatus(false);
    }
  };
  
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (e.target.value.trim() && activeSessionId) {
      sendTypingStatus(true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to send typing = false after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 3000);
    } else {
      // Send typing = false immediately when input is cleared
      sendTypingStatus(false);
    }
  };
  
  const sendTypingStatus = (isTyping) => {
    if (socket && socket.readyState === WebSocket.OPEN && activeSessionId) {
      try {
        const typingMessage = {
          type: 'typing',
          sessionId: activeSessionId,
          isTyping,
          timestamp: new Date().toISOString()
        };
        socket.send(JSON.stringify(typingMessage));
      } catch (err) {
        console.error('[ADMIN] Error sending typing status:', err);
      }
    }
  };
  
  const formatSessionTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, return time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, return month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // If older, return full date
    return date.toLocaleDateString();
  };

  // Calculate unread count for a specific session
  const getSessionUnreadCount = (sessionId) => {
    return useChatStore.getState().sessions[sessionId]?.unreadCount || 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex overflow-hidden">
        {/* Chat sessions sidebar */}
        <div className="w-1/4 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Customer Chats</h3>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
              title="Close Chat Panel"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No active chat sessions</p>
              </div>
            ) : (
              sessions.map(session => {
                const lastMessage = session.messages[session.messages.length - 1];
                const unreadCount = session.unreadCount || 0;
                
                return (
                  <div 
                    key={session.id}
                    className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
                      activeSessionId === session.id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {session.customerInfo?.name || `Customer ${session.id.substring(0, 8)}...`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatSessionTime(session.lastActive)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500 truncate mt-1">
                      {lastMessage?.text || 'No messages yet'}
                    </div>
                    
                    {unreadCount > 0 && (
                      <div className="flex justify-end">
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 mt-1">
                          {unreadCount} new
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          <div className="p-3 bg-gray-100 border-t border-gray-200 text-sm">
            <div className="flex justify-between items-center">
              <span>{sessions.length} Active Sessions</span>
              <span>{totalUnreadCount > 0 ? `${totalUnreadCount} Unread` : 'All Read'}</span>
            </div>
            
            <div className={`mt-1 text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected - Trying to reconnect...'}
            </div>
          </div>
        </div>
        
        {/* Chat window */}
        <div className="w-3/4 flex flex-col">
          {activeSessionId ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <button 
                    className="mr-3 p-1 rounded-full hover:bg-gray-100 md:hidden"
                    onClick={() => setActiveSession(null)}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  
                  <div>
                    <h3 className="font-semibold">
                      {useChatStore.getState().sessions[activeSessionId]?.customerInfo?.name || 
                       `Customer ${activeSessionId.substring(0, 12)}...`}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Session ID: {activeSessionId.substring(0, 12)}...
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div className="text-gray-500">
                      <p className="mb-1">No messages in this conversation yet.</p>
                      <p className="text-sm">Send a message to start the conversation.</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`mb-4 flex ${message.sender === 'support' ? 'justify-end' : 'justify-start'}`}
                    >
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.sender === 'support' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-gray-200 text-gray-800 rounded-tl-none'
                        }`}
                      >
                        <div className="text-sm">{message.text}</div>
                        <div className="text-xs mt-1 opacity-70 flex justify-end items-center">
                          {message.time}
                          {message.sender === 'support' && <CheckCheck className="w-3 h-3 ml-1" />}
                        </div>
                      </motion.div>
                    </div>
                  ))
                )}
                
                {typing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start mb-4"
                  >
                    <div className="bg-gray-200 rounded-2xl rounded-tl-none px-4 py-2">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-gray-500 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.7, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-500 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.7, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-500 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.7, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={chatEndRef} />
              </div>
              
              {/* Chat input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200">
                <div className="flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={isConnected ? "Type a message..." : "Reconnecting to chat..."}
                    className="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={newMessage}
                    onChange={handleInputChange}
                    disabled={!isConnected || !activeSessionId}
                  />
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-r-lg ${
                      newMessage.trim() && isConnected && activeSessionId ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                    disabled={!newMessage.trim() || !isConnected || !activeSessionId}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="mb-4">
                <MessageIcon className="w-16 h-16 text-gray-300" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Select a Chat to Start Messaging
              </h3>
              <p className="text-gray-500 max-w-md">
                Choose a customer conversation from the sidebar to view and respond to messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Message icon for empty state
const MessageIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

export default AdminChatPanel; 