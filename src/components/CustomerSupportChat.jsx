import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  CheckCheck, 
  ChevronDown,
  PlusCircle,
  Image as ImageIcon,
  Smile
} from 'lucide-react';
import { useChatStore } from '../store/chatStore';

// Define WebSocket URL based on environment
const getWebSocketUrl = () => {
  // For development use a standard endpoint - in production, this would be your actual WebSocket server
  if (process.env.NODE_ENV === 'development') {
    return 'wss://echo.websocket.events';
  }
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = process.env.REACT_APP_WS_HOST || window.location.host;
  return `${protocol}//${host}/ws/chat`;
};

const CustomerSupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Get chat store methods and state
  const { 
    socket,
    setSocket,
    isConnected,
    setConnectionState,
    initSession,
    addMessage,
    sendMessage,
    markSessionAsRead
  } = useChatStore();
  
  // Get session-specific data
  const sessionId = useChatStore(state => state.activeSessionId);
  const sessions = useChatStore(state => state.sessions);
  const messages = useChatStore(state => 
    state.activeSessionId ? state.sessions[state.activeSessionId]?.messages || [] : []
  );
  const unread = useChatStore(state => {
    return state.activeSessionId ? state.sessions[state.activeSessionId]?.unreadCount || 0 : 0;
  });
  
  // Set up customer session ID
  useEffect(() => {
    // Generate or retrieve session ID
    let sid = localStorage.getItem('sinosply_chat_session');
    if (!sid) {
      sid = 'customer-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sinosply_chat_session', sid);
    }
    
    // Initialize session in store
    initSession(sid);
    useChatStore.setState({ activeSessionId: sid });
    
    // Connect to WebSocket server
    connectWebSocket(sid);
    
    // Clean up WebSocket connection on component unmount
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  const connectWebSocket = (sid) => {
    try {
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        return; // Already connected or connecting
      }
      
      const wsUrl = getWebSocketUrl();
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      
      const newSocket = new WebSocket(wsUrl);
      setSocket(newSocket);
      
      newSocket.onopen = () => {
        console.log('WebSocket connected');
        setConnectionState(true, null);
        
        // Wait a short moment to ensure WebSocket is fully connected
        setTimeout(() => {
          try {
            // Check if WebSocket is open before sending
            if (newSocket && newSocket.readyState === WebSocket.OPEN) {
              // Send an initial message to identify this client
              const initMessage = {
                type: 'init',
                sessionId: sid,
                userType: 'customer',
                timestamp: new Date().toISOString()
              };
              newSocket.send(JSON.stringify(initMessage));
              
              // Send any pending messages from the store
              const pendingMessages = sessions[sid]?.messages || [];
              if (pendingMessages.length > 0) {
                pendingMessages.forEach(msg => {
                  if (msg.sender === 'user' && !msg.sent) {
                    const msgToSend = {
                      type: 'message',
                      messageId: msg.id,
                      sessionId: sid,
                      content: msg.text,
                      sender: 'customer',
                      timestamp: msg.timestamp || new Date().toISOString()
                    };
                    try {
                      newSocket.send(JSON.stringify(msgToSend));
                    } catch (err) {
                      console.error('Error sending pending message:', err);
                    }
                  }
                });
              }
            } else {
              console.log('WebSocket not ready for sending messages');
            }
          } catch (error) {
            console.error('Error sending init message:', error);
          }
        }, 500);
      };
      
      newSocket.onmessage = (event) => {
        try {
          // First check if the message is valid JSON
          let data;
          try {
            data = JSON.parse(event.data);
          } catch (parseError) {
            console.log('Received non-JSON message:', event.data);
            return; // Skip processing for non-JSON messages
          }
          
          console.log('Received WebSocket message:', data);
          
          // Handle different message types
          switch(data.type) {
            case 'message':
          // Process messages from admin
              if (data.sender === 'admin') {
            const newAdminMessage = { 
              id: data.messageId, 
              text: data.content, 
              sender: 'support',
              time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  timestamp: data.timestamp,
              read: isOpen && !minimized
            };
            
                addMessage(sid, newAdminMessage);
              }
              break;
            case 'typing':
              setTyping(data.isTyping);
              break;
            case 'history':
              // Handle message history if server sends it
              if (Array.isArray(data.messages)) {
                // Reset current messages and add history
                const historyMessages = data.messages.map(msg => ({
                  id: msg.messageId,
                  text: msg.content, 
                  sender: msg.sender === 'admin' ? 'support' : 'user',
                  time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  timestamp: msg.timestamp,
                  read: true
                }));
                
                // Update session with history
                useChatStore.setState(state => ({
                  sessions: {
                    ...state.sessions,
                    [sid]: {
                      ...state.sessions[sid],
                      messages: historyMessages,
                    }
                  }
                }));
              }
              break;
            default:
              console.log('Unhandled message type:', data.type);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };
      
      newSocket.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setConnectionState(false);
        
        // Attempt to reconnect after delay if not closed cleanly
        if (!event.wasClean) {
          console.log('Attempting to reconnect in 3 seconds...');
          reconnectTimerRef.current = setTimeout(() => {
            connectWebSocket(sid);
          }, 3000);
        }
      };
      
      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionState(false, 'Connection error');
      };
      
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      setConnectionState(false, error.message);
    }
  };
        
  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && !minimized && sessionId && unread > 0) {
      markSessionAsRead(sessionId);
    }
  }, [isOpen, minimized, sessionId, unread]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && !minimized && messages?.length) {
      scrollToBottom();
    }
  }, [messages, isOpen, minimized]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark messages as read when opening chat
      if (sessionId) {
        markSessionAsRead(sessionId);
      }
    } else if (minimized) {
      setMinimized(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected) {
      return;
    }
    
    // Generate a message ID
    const messageId = `customer-msg-${Date.now()}`;
    
    // Create the message object
    const messageObj = {
      id: messageId, 
      text: newMessage.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      sent: false // Will be updated when confirmed
    };
    
    // Add message to store
    addMessage(sessionId, messageObj);
    
    // Try to send via WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
    const wsMessage = {
      type: 'message',
      messageId: messageId,
      sessionId: sessionId,
        content: newMessage.trim(),
      sender: 'customer',
      timestamp: new Date().toISOString()
    };
    
    try {
        socket.send(JSON.stringify(wsMessage));
        
        // Update sent status
        useChatStore.setState(state => {
          const updatedSessions = { ...state.sessions };
          const updatedMessages = updatedSessions[sessionId].messages.map(msg => 
            msg.id === messageId ? { ...msg, sent: true } : msg
          );
          
          updatedSessions[sessionId] = {
            ...updatedSessions[sessionId],
            messages: updatedMessages
          };
          
          return { sessions: updatedSessions };
        });
        
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
    
    // Clear input field
    setNewMessage('');
    
    // Send typing = false
    sendTypingStatus(false);
  };
  
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (e.target.value.trim()) {
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
    if (socket && socket.readyState === WebSocket.OPEN && sessionId) {
      try {
        const typingMessage = {
          type: 'typing',
          sessionId: sessionId,
          isTyping,
          userType: 'customer',
          timestamp: new Date().toISOString()
        };
        socket.send(JSON.stringify(typingMessage));
      } catch (err) {
        console.error('Error sending typing status:', err);
      }
    }
  };

  const toggleMinimize = (e) => {
    e.stopPropagation();
    setMinimized(!minimized);
    
    if (!minimized && sessionId) {
      markSessionAsRead(sessionId);
    }
  };

  // Chat container variants for animations
  const chatContainerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      } 
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.9,
      transition: { duration: 0.2 } 
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating chat button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className="bg-black text-white p-4 rounded-full shadow-lg flex items-center justify-center relative"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unread}
              </span>
            )}
          </>
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={chatContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-20 right-0 w-[350px] bg-white rounded-xl shadow-2xl overflow-hidden"
            style={{ maxHeight: '600px' }}
          >
            {/* Chat header */}
            <div className="bg-black text-white p-3 flex items-center justify-between cursor-pointer" onClick={toggleMinimize}>
              <div className="flex items-center">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center mr-3">
                  <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" onError={(e) => e.target.src = 'https://via.placeholder.com/30?text=S'} />
                </div>
                <div>
                  <h3 className="font-semibold">Sinosply Support</h3>
                  <div className="flex items-center text-xs">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>{isConnected ? 'Online' : 'Reconnecting...'}</span>
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${minimized ? 'rotate-180' : ''}`} />
            </div>

            {/* Chat body */}
            <AnimatePresence>
              {!minimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="h-80 overflow-y-auto p-4 bg-gray-50" onClick={() => inputRef.current?.focus()}>
                    {/* Display welcome message if no messages */}
                    {messages.length === 0 && (
                      <div className="mb-4 flex justify-start">
                        <div className="bg-gray-200 text-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
                          <div className="text-sm">Hello! Welcome to Sinosply. How can we assist you today?</div>
                          <div className="text-xs mt-1 opacity-70 flex justify-end items-center">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )}
                  
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.sender === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-gray-200 text-gray-800 rounded-tl-none'
                          }`}
                        >
                          <div className="text-sm">{message.text}</div>
                          <div className="text-xs mt-1 opacity-70 flex justify-end items-center">
                            {message.time}
                            {message.sender === 'user' && <CheckCheck className={`w-3 h-3 ml-1 ${message.sent ? 'text-blue-400' : 'text-gray-400'}`} />}
                          </div>
                        </motion.div>
                      </div>
                    ))}

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
                      <button type="button" className="text-gray-500 p-2 hover:text-gray-700">
                        <PlusCircle className="w-5 h-5" />
                      </button>
                      <button type="button" className="text-gray-500 p-2 hover:text-gray-700">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder={isConnected ? "Type a message..." : "Reconnecting to chat..."}
                        className="flex-1 border-none bg-transparent focus:ring-0 focus:outline-none px-2 py-1"
                        value={newMessage}
                        onChange={handleInputChange}
                        disabled={!isConnected}
                      />
                      <button type="button" className="text-gray-500 p-2 hover:text-gray-700">
                        <Smile className="w-5 h-5" />
                      </button>
                      <button
                        type="submit"
                        className={`ml-2 p-2 rounded-full ${
                          newMessage.trim() && isConnected ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'
                        }`}
                        disabled={!newMessage.trim() || !isConnected}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerSupportChat; 