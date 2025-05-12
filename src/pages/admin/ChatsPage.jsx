import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSearch, FaEllipsisV, FaPaperclip, FaSmile, 
         FaCheckDouble, FaCheck, FaCircle, FaPhoneAlt, FaVideo } from 'react-icons/fa';
import axios from 'axios';
import Sidebar from '../../components/admin/Sidebar';
import LoadingOverlay from '../../components/LoadingOverlay';
import EmojiPicker from 'emoji-picker-react';

const ChatsPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, unread, priority
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const activeCustomers = useRef(new Map());
  
  // Define dummy chats data
  const dummyChats = [
    {
      _id: '1',
      user: {
        _id: '101',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        online: true,
        lastSeen: new Date()
      },
      lastMessage: 'Do you have this in a different color?',
      unread: true,
      priority: 'high',
      updatedAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    },
    {
      _id: '2',
      user: {
        _id: '102',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
      },
      lastMessage: 'Thanks for your help with my order!',
      unread: false,
      updatedAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      _id: '3',
      user: {
        _id: '103',
        firstName: 'Emma',
        lastName: 'Rodriguez',
        email: 'emma.rodriguez@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/63.jpg'
      },
      lastMessage: 'When will my order be shipped?',
      unread: true,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    }
  ];
  
  // Define dummy messages for demo chats
  const dummyMessages = {
    '1': [
      {
        _id: '1001',
        content: 'Hello, I just ordered the leather jacket in medium, but I was wondering if you have it in red?',
        sender: 'user',
        createdAt: new Date(Date.now() - 1000 * 60 * 20)
      },
      {
        _id: '1002',
        content: 'Hi Sarah! Thank you for your order. Let me check our inventory for the red leather jacket in medium.',
        sender: 'admin',
        createdAt: new Date(Date.now() - 1000 * 60 * 18)
      },
      {
        _id: '1003',
        content: 'I\'ve checked and we do have it in red. Would you like me to change your order?',
        sender: 'admin',
        createdAt: new Date(Date.now() - 1000 * 60 * 17)
      },
      {
        _id: '1004',
        content: 'Yes please! That would be perfect.',
        sender: 'user',
        createdAt: new Date(Date.now() - 1000 * 60 * 15)
      },
      {
        _id: '1005',
        content: 'Do you have this in a different color?',
        sender: 'user',
        createdAt: new Date(Date.now() - 1000 * 60 * 5)
      }
    ],
    '2': [
      {
        _id: '2001',
        content: 'Hi, I received my order #78923 today but there seems to be a missing item.',
        sender: 'user',
        createdAt: new Date(Date.now() - 1000 * 60 * 120)
      },
      {
        _id: '2002',
        content: 'Hello Michael, I\'m sorry to hear that. Can you tell me which item is missing from your order?',
        sender: 'admin',
        createdAt: new Date(Date.now() - 1000 * 60 * 118)
      },
      {
        _id: '2003',
        content: 'The wireless earbuds were not in the package.',
        sender: 'user',
        createdAt: new Date(Date.now() - 1000 * 60 * 115)
      },
      {
        _id: '2004',
        content: 'I apologize for the inconvenience. I\'ve arranged for the earbuds to be shipped immediately with express delivery at no additional cost.',
        sender: 'admin',
        createdAt: new Date(Date.now() - 1000 * 60 * 110)
      },
      {
        _id: '2005',
        content: 'Thanks for your help with my order!',
        sender: 'user',
        createdAt: new Date(Date.now() - 1000 * 60 * 30)
      }
    ],
    '3': [
      {
        _id: '3001',
        content: 'Hello, I placed order #34567 three days ago and was wondering when it will be shipped?',
        sender: 'user',
        createdAt: new Date(Date.now() - 1000 * 60 * 180)
      },
      {
        _id: '3002',
        content: 'Hi Emma, let me check the status of your order for you.',
        sender: 'admin',
        createdAt: new Date(Date.now() - 1000 * 60 * 175)
      },
      {
        _id: '3003',
        content: 'I can see that your order is currently being packed at our warehouse. It should be shipped by tomorrow morning.',
        sender: 'admin',
        createdAt: new Date(Date.now() - 1000 * 60 * 173)
      },
      {
        _id: '3004',
        content: 'When will my order be shipped?',
        sender: 'user',
        createdAt: new Date(Date.now() - 1000 * 60 * 60)
      }
    ]
  };

  const quickReplies = [
    "Thanks for reaching out to us!",
    "Let me check that for you right away.",
    "Your order will be shipped within 24 hours.",
    "Is there anything else I can help you with?",
    "I'll need a bit more information to assist you better.",
  ];

  // Set up WebSocket connection
  useEffect(() => {
    connectWebSocket();
    
    // First load dummy chats
    setTimeout(() => {
      setChats(dummyChats);
      setLoading(false);
      
      // Load any saved chat histories from localStorage for persistence
      loadSavedChats();
    }, 800);
    
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, []);
  
  const connectWebSocket = () => {
    try {
      // Clean up existing socket if needed
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      
      // Use secure WebSockets if on HTTPS
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Use the same WebSocket URL as the customer component for development
      // In production, this would be your actual WebSocket server URL
      const wsUrl = process.env.NODE_ENV === 'development' 
        ? 'wss://echo.websocket.events'
        : `${protocol}//${window.location.host}/ws/admin/chat`;
      
      console.log(`Admin connecting to WebSocket: ${wsUrl}`);
      
      socketRef.current = new WebSocket(wsUrl);
      
      socketRef.current.onopen = () => {
        console.log('Admin WebSocket connected');
        setConnected(true);
        setReconnecting(false);
        
        // Wait a short moment to ensure WebSocket is fully connected
        setTimeout(() => {
          try {
            // Check if WebSocket is open before sending
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
              // Send an initial message to identify this client as admin
              const initMessage = {
                type: 'init',
                userType: 'admin',
                timestamp: new Date().toISOString()
              };
              socketRef.current.send(JSON.stringify(initMessage));
            } else {
              console.log('Admin WebSocket not ready for sending messages');
            }
          } catch (error) {
            console.error('Error sending admin init message:', error);
          }
        }, 500);
      };
      
      socketRef.current.onmessage = (event) => {
        try {
          // First check if the message is valid JSON
          let data;
          try {
            data = JSON.parse(event.data);
          } catch (parseError) {
            console.log('Received non-JSON message:', event.data);
            return; // Skip processing for non-JSON messages
          }
          
          console.log('Admin received WebSocket message:', data);
          
          // Process different message types
          switch(data.type) {
            case 'message':
              // Process messages from customers
              if (data.sender === 'customer') {
                handleCustomerMessage(data);
              }
              break;
            case 'init':
              if (data.userType === 'customer') {
                // Track active customers
                activeCustomers.current.set(data.sessionId, {
                  lastSeen: new Date(),
                  online: true
                });
                
                // Update the chat in the list if it exists
                setChats(prevChats => {
                  const updatedChats = [...prevChats];
                  const chatIndex = updatedChats.findIndex(chat => chat._id === data.sessionId);
                  
                  if (chatIndex >= 0) {
                    updatedChats[chatIndex] = {
                      ...updatedChats[chatIndex],
                      user: {
                        ...updatedChats[chatIndex].user,
                        online: true,
                        lastSeen: new Date()
                      }
                    };
                  } else {
                    // Create a new chat for this customer
                    updatedChats.push({
                      _id: data.sessionId,
                      user: {
                        _id: data.sessionId,
                        firstName: 'Customer',
                        lastName: `#${data.sessionId.slice(-5)}`,
                        email: 'customer@example.com',
                        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
                        online: true,
                        lastSeen: new Date()
                      },
                      lastMessage: 'New customer connected',
                      unread: false,
                      priority: 'normal',
                      updatedAt: new Date()
                    });
                  }
                  
                  return updatedChats;
                });
              }
              break;
            case 'typing':
              // Handle typing indicator from customers
              if (data.userType === 'customer') {
                // If this is the currently selected chat, show typing indicator
                if (selectedChat && selectedChat._id === data.sessionId) {
                  setIsTyping(data.isTyping);
                }
              }
              break;
            default:
              console.log('Unhandled message type:', data.type);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };
      
      socketRef.current.onclose = (event) => {
        console.log('Admin WebSocket disconnected', event.code, event.reason);
        setConnected(false);
        
        // Attempt to reconnect after delay
        if (!event.wasClean) {
          setReconnecting(true);
          reconnectTimerRef.current = setTimeout(() => {
            console.log('Attempting to reconnect Admin WebSocket...');
            connectWebSocket();
          }, 3000);
        }
      };
      
      socketRef.current.onerror = (error) => {
        console.error('Admin WebSocket error:', error);
        setConnected(false);
      };
    } catch (error) {
      console.error("Error connecting to Admin WebSocket:", error);
      setConnected(false);
    }
  };
  
  // Process incoming customer message
  const handleCustomerMessage = (messageData) => {
    const { sessionId, messageId, content, timestamp } = messageData;
    
    console.log(`Processing customer message from ${sessionId}: ${content}`);
    
    // Check if we already have a chat for this customer
    const existingChatIndex = chats.findIndex(
      chat => chat._id === sessionId
    );
    
    if (existingChatIndex >= 0) {
      // Update existing chat
      const updatedChats = [...chats];
      updatedChats[existingChatIndex] = {
        ...updatedChats[existingChatIndex],
        lastMessage: content,
        updatedAt: new Date(timestamp) || new Date(),
        unread: true,
        user: {
          ...updatedChats[existingChatIndex].user,
          online: true,
          lastSeen: new Date()
        }
      };
      
      setChats(updatedChats);
      
      // Update activeCustomers Map
      activeCustomers.current.set(sessionId, {
        lastSeen: new Date(),
        online: true
      });
      
      // If this is the currently selected chat, add message to display
      if (selectedChat && selectedChat._id === sessionId) {
        const newMessage = {
          _id: messageId,
          content: content,
          sender: 'user',
          createdAt: new Date(timestamp),
          status: 'read'
        };
        
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // Update local storage for persistence
        saveMessagesToLocalStorage(sessionId, [
          ...messages,
          {
            id: messageId,
            text: content,
            sender: 'user',
            time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: timestamp
          }
        ]);
      } else {
        // If not viewing this chat, append to stored messages
        const existingMessages = loadMessagesFromLocalStorage(sessionId) || [];
        saveMessagesToLocalStorage(sessionId, [
          ...existingMessages,
          {
            id: messageId,
            text: content,
            sender: 'user',
            time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: timestamp
          }
        ]);
      }
    } else {
      // Create new chat for this customer
      createNewCustomerChat(sessionId, content, timestamp, messageId);
    }
  };
  
  // Create a new customer chat
  const createNewCustomerChat = (sessionId, lastMessage, timestamp, messageId) => {
    const newChat = {
      _id: sessionId,
      user: {
        _id: sessionId,
        firstName: 'Customer',
        lastName: `#${sessionId.slice(-5)}`,
        email: 'customer@example.com',
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
        online: true,
        lastSeen: new Date()
      },
      lastMessage: lastMessage,
      unread: true,
      priority: 'normal',
      updatedAt: new Date(timestamp) || new Date()
    };
    
    setChats(prevChats => [...prevChats, newChat]);
    
    // Save the first message to storage
    saveMessagesToLocalStorage(sessionId, [
      {
        id: messageId,
        text: lastMessage,
        sender: 'user',
        time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };
  
  // Load saved chat histories (for persistence across refreshes)
  const loadSavedChats = () => {
    try {
      // Get all keys from localStorage that match our pattern
      const chatSessions = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sinosply_chat_messages_customer-')) {
          const sessionId = key.replace('sinosply_chat_messages_', '');
          chatSessions.push(sessionId);
        }
      }
      
      // Process each chat session
      chatSessions.forEach(sessionId => {
        const messages = loadMessagesFromLocalStorage(sessionId);
        if (messages && messages.length > 0) {
          // Get the latest message
          const lastMessage = messages[messages.length - 1];
          
          // Create or update chat entry
          const existingChatIndex = chats.findIndex(chat => chat._id === sessionId);
          
          if (existingChatIndex >= 0) {
            // Update existing chat
            const updatedChats = [...chats];
            updatedChats[existingChatIndex] = {
              ...updatedChats[existingChatIndex],
              lastMessage: lastMessage.text,
              updatedAt: new Date(lastMessage.time || Date.now())
            };
            setChats(updatedChats);
          } else {
            // Create new chat
            const newChat = {
              _id: sessionId,
              user: {
                _id: sessionId,
                firstName: 'Customer',
                lastName: `#${sessionId.slice(-5)}`,
                email: 'customer@example.com',
                avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
                online: false,
                lastSeen: new Date()
              },
              lastMessage: lastMessage.text,
              unread: lastMessage.sender === 'user',
              priority: 'normal',
              updatedAt: new Date(lastMessage.time || Date.now())
            };
            setChats(prevChats => [...prevChats, newChat]);
          }
        }
      });
    } catch (error) {
      console.error("Error loading saved chats:", error);
    }
  };
  
  // Local storage helpers for message persistence
  const loadMessagesFromLocalStorage = (sessionId) => {
    try {
      const saved = localStorage.getItem(`sinosply_chat_messages_${sessionId}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error(`Error loading messages for ${sessionId}:`, error);
      return null;
    }
  };
  
  const saveMessagesToLocalStorage = (sessionId, messages) => {
    try {
      localStorage.setItem(`sinosply_chat_messages_${sessionId}`, JSON.stringify(messages));
    } catch (error) {
      console.error(`Error saving messages for ${sessionId}:`, error);
    }
  };

  // Send typing indicator to customer
  const sendTypingIndicator = (isTyping) => {
    if (!selectedChat || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    
    try {
      const typingMessage = {
        type: 'typing',
        sessionId: selectedChat._id,
        isTyping: isTyping,
        userType: 'admin',
        timestamp: new Date().toISOString()
      };
      
      socketRef.current.send(JSON.stringify(typingMessage));
    } catch (error) {
      console.error("Error sending typing indicator:", error);
    }
  };
  
  // Hook up typing indicator
  useEffect(() => {
    if (newMessage && selectedChat && selectedChat._id.startsWith('customer-')) {
      sendTypingIndicator(true);
      
      // Clear typing indicator after a delay
      const typingTimeout = setTimeout(() => {
        sendTypingIndicator(false);
      }, 3000);
      
      return () => clearTimeout(typingTimeout);
    }
  }, [newMessage, selectedChat]);

    // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedChat) {
      // Load real messages for customer chats
      if (selectedChat._id.startsWith('customer-')) {
        const savedMessages = loadMessagesFromLocalStorage(selectedChat._id);
        
        if (savedMessages && savedMessages.length > 0) {
          setMessages(
            savedMessages.map(msg => ({
              _id: msg.id,
              content: msg.text,
              sender: msg.sender === 'user' ? 'user' : 'admin',
              createdAt: new Date(msg.time || new Date()),
              status: 'read'
            }))
          );
          
          // Mark chat as read
          setChats(prevChats => 
            prevChats.map(chat => 
              chat._id === selectedChat._id ? { ...chat, unread: false } : chat
            )
          );
          
          return; // Exit early, we loaded messages from localStorage
        }
      }
      
      // Fetch messages for selected chat - fallback to dummy data for demo
      const chatMessages = dummyMessages[selectedChat._id] || [];
      setMessages(chatMessages);
      
      // Mark as read when chat is selected
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === selectedChat._id ? { ...chat, unread: false } : chat
        )
      );
      
      // Simulate typing indicator after selection for dummy chats
      const randomDelay = Math.floor(Math.random() * 5000) + 1000;
      if (selectedChat._id === '1' || selectedChat._id === '3') {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }, randomDelay);
      }
    }
  }, [selectedChat]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 2) {
      // Search in chat users
      const filtered = dummyChats.filter(chat => {
        const fullName = `${chat.user.firstName} ${chat.user.lastName}`.toLowerCase();
        return fullName.includes(term.toLowerCase()) || 
               chat.user.email.toLowerCase().includes(term.toLowerCase()) ||
               chat.lastMessage.toLowerCase().includes(term.toLowerCase());
      });
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const filterChatsByTab = (chats) => {
    switch(activeTab) {
      case 'unread':
        return chats.filter(chat => chat.unread);
      case 'priority':
        return chats.filter(chat => chat.priority === 'high' || chat.priority === 'urgent');
      default:
        return chats;
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !connected) return;
    
    const messageId = `admin-msg-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    const messageObj = {
      _id: messageId,
      content: newMessage,
      sender: 'admin',
      status: 'sent',
      createdAt: new Date(),
    };
    
    // Add to messages state
    setMessages(prev => [...prev, messageObj]);
    
    // Update last message in chats
    setChats(prevChats => 
      prevChats.map(chat => 
        chat._id === selectedChat._id 
          ? { 
              ...chat, 
              lastMessage: newMessage,
              updatedAt: new Date()
            } 
          : chat
      )
    );
    
    // Send via WebSocket if connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        const adminMessage = {
          type: 'message',
          messageId: messageId,
          sessionId: selectedChat._id,
          content: newMessage,
          sender: 'admin',
          timestamp: timestamp
        };
        
        socketRef.current.send(JSON.stringify(adminMessage));
        
        // Store message in localStorage for persistence
        const existingMessages = loadMessagesFromLocalStorage(selectedChat._id) || [];
        saveMessagesToLocalStorage(selectedChat._id, [
          ...existingMessages,
          {
            id: messageId,
            text: newMessage,
            sender: 'support',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'delivered',
            timestamp: timestamp
          }
        ]);
        
        // Update message status to delivered
        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg._id === messageId ? { ...msg, status: 'delivered' } : msg
            )
          );
        }, 500);
      } catch (error) {
        console.error("Error sending message via WebSocket:", error);
      }
    } else {
      console.warn("WebSocket not connected, message not sent");
    }
    
    // Clear input
    setNewMessage('');
    
    // Clear typing indicator
    sendTypingIndicator(false);
  };

  const handleQuickReply = (reply) => {
    setNewMessage(reply);
    inputRef.current.focus();
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prevMessage => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatChatTimestamp = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // If today, return time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // If this week
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    if (messageDate > oneWeekAgo) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise return date
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderMessageStatus = (message) => {
    if (message.sender !== 'admin') return null;
    
    switch(message.status) {
      case 'sent':
        return <FaCheck className="text-gray-400 ml-1 text-xs" />;
      case 'delivered':
        return <FaCheckDouble className="text-gray-400 ml-1 text-xs" />;
      case 'read':
        return <FaCheckDouble className="text-blue-500 ml-1 text-xs" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      {loading && <LoadingOverlay />}
      
      <div className="flex-1 ml-64">
        <div className="h-screen flex flex-col">
          <header className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800">Customer Support</h1>
            
            {/* WebSocket status indicator */}
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : reconnecting ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {connected ? 'Connected' : reconnecting ? 'Reconnecting...' : 'Offline'}
              </span>
            </div>
          </header>
          
          <div className="flex-1 flex overflow-hidden">
            {/* Left sidebar - Conversations */}
            <div className="w-1/3 border-r bg-white flex flex-col">
              <div className="p-4 border-b">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b">
                <button 
                  onClick={() => setActiveTab('all')} 
                  className={`flex-1 py-3 text-sm font-medium text-center ${
                    activeTab === 'all' 
                      ? 'text-purple-600 border-b-2 border-purple-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All Chats
                </button>
                <button 
                  onClick={() => setActiveTab('unread')} 
                  className={`flex-1 py-3 text-sm font-medium text-center ${
                    activeTab === 'unread' 
                      ? 'text-purple-600 border-b-2 border-purple-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Unread ({chats.filter(c => c.unread).length})
                </button>
                <button 
                  onClick={() => setActiveTab('priority')} 
                  className={`flex-1 py-3 text-sm font-medium text-center ${
                    activeTab === 'priority' 
                      ? 'text-purple-600 border-b-2 border-purple-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Priority
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1">
                {showSearchResults ? (
                  searchResults.length > 0 ? (
                    searchResults.map((chat) => (
                      <div
                        key={chat._id}
                        onClick={() => {
                          setSelectedChat(chat);
                          setShowSearchResults(false);
                          setSearchTerm('');
                        }}
                        className="px-4 py-3 border-b hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                      >
                        <div className="flex items-center">
                          <div className="relative flex-shrink-0">
                            <img
                              src={chat.user.avatar || 'https://via.placeholder.com/40'}
                              alt={`${chat.user.firstName} ${chat.user.lastName}`}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                            {chat.unread && (
                              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                            )}
                            {chat.user.online && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                            )}
                          </div>
                          <div className="ml-3 flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-gray-900 truncate">
                                {chat.user.firstName} {chat.user.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatChatTimestamp(chat.updatedAt)}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <p className="text-sm text-gray-500 truncate flex-1">
                                {chat.lastMessage}
                              </p>
                              {chat.priority === 'urgent' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-1">
                                  Urgent
                                </span>
                              )}
                              {chat.priority === 'high' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 ml-1">
                                  High
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <h3 className="text-xl font-medium text-gray-700 mb-1">No matches found</h3>
                      <p className="text-gray-500">Try a different search term</p>
                    </div>
                  )
                ) : (
                  filterChatsByTab(chats).length > 0 ? (
                    filterChatsByTab(chats).map((chat) => (
                      <div
                        key={chat._id}
                        onClick={() => setSelectedChat(chat)}
                        className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                          selectedChat && selectedChat._id === chat._id
                            ? 'bg-purple-50 border-l-4 border-l-purple-500'
                            : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="relative flex-shrink-0">
                            <img
                              src={chat.user.avatar || 'https://via.placeholder.com/40'}
                              alt={`${chat.user.firstName} ${chat.user.lastName}`}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                            {chat.unread && (
                              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                            )}
                            {chat.user.online && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                            )}
                          </div>
                          <div className="ml-3 flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-gray-900 truncate">
                                {chat.user.firstName} {chat.user.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatChatTimestamp(chat.updatedAt)}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <p className={`text-sm truncate flex-1 ${chat.unread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                {chat.lastMessage}
                              </p>
                              {chat.priority === 'urgent' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-1">
                                  Urgent
                                </span>
                              )}
                              {chat.priority === 'high' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 ml-1">
                                  High
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <h3 className="text-xl font-medium text-gray-700 mb-1">No conversations</h3>
                      <p className="text-gray-500">
                        {activeTab === 'unread' 
                          ? 'All messages have been read' 
                          : activeTab === 'priority' 
                            ? 'No priority conversations' 
                            : 'Customer chats will appear here'}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="w-2/3 flex flex-col bg-gray-50">
              {selectedChat ? (
                <>
                  <div className="px-4 py-3 bg-white border-b shadow-sm flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative">
                        <img
                          src={selectedChat.user.avatar || 'https://via.placeholder.com/40'}
                          alt={`${selectedChat.user.firstName} ${selectedChat.user.lastName}`}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        {selectedChat.user.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {selectedChat.user.firstName} {selectedChat.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          {selectedChat.user.online ? (
                            <>
                              <FaCircle className="text-green-500 text-xs mr-1" />
                              Online
                            </>
                          ) : (
                            <>Last seen {formatChatTimestamp(selectedChat.user.lastSeen || new Date())}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                        <FaPhoneAlt size={16} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                        <FaVideo size={16} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                        <FaEllipsisV size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-3">
                      {messages.length > 0 ? (
                        messages.map((message) => (
                          <div
                            key={message._id}
                            className={`flex ${
                              message.sender === 'admin' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                message.sender === 'admin'
                                  ? 'bg-purple-600 text-white message-admin'
                                  : 'bg-white border border-gray-200 message-user'
                              }`}
                            >
                              <p>{message.content}</p>
                              <div className={`flex items-center text-xs mt-1 ${
                                message.sender === 'admin' ? 'text-purple-200 justify-end' : 'text-gray-400'
                              }`}>
                                {formatDate(message.createdAt)}
                                {renderMessageStatus(message)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <h3 className="text-xl font-medium text-gray-700 mb-1">No messages yet</h3>
                          <p className="text-gray-500">Start the conversation with this customer</p>
                        </div>
                      )}
                      
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 max-w-[70%]">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                  
                  {/* Quick replies */}
                  <div className="bg-white px-4 py-2 border-t flex-wrap gap-2 hidden sm:flex">
                    {quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickReply(reply)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                  
                  <form
                    onSubmit={handleSendMessage}
                    className="p-4 bg-white border-t flex items-center relative"
                  >
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => {}}
                    >
                      <FaPaperclip />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 mx-2 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <div className="relative">
                      <button
                        type="button"
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <FaSmile />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-12 right-0 z-10">
                          <EmojiPicker onEmojiClick={onEmojiClick} />
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className={`p-2 rounded-full ${
                        newMessage.trim() 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      } transition-colors ml-2`}
                      disabled={!newMessage.trim()}
                    >
                      <FaPaperPlane />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <img 
                    src="/images/chat-placeholder.svg" 
                    alt="Select a conversation" 
                    className="w-48 h-48 mb-6 opacity-70"
                  />
                  <h3 className="text-xl font-medium text-gray-700 mb-1">Select a conversation</h3>
                  <p className="text-gray-500 max-w-md">
                    Choose a customer conversation from the list to start messaging. You can provide support, answer questions, and resolve issues.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .message-admin {
          border-bottom-right-radius: 0 !important;
          position: relative;
        }
        
        .message-admin::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: -8px;
          width: 16px;
          height: 16px;
          background: radial-gradient(circle at top right, transparent 16px, rgb(124, 58, 237) 0);
        }
        
        .message-user {
          border-bottom-left-radius: 0 !important;
          position: relative;
        }
        
        .message-user::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: -8px;
          width: 16px;
          height: 16px;
          background: radial-gradient(circle at top left, transparent 16px, #fff 0);
          border-bottom-left-radius: 0;
        }
        
        .animate-bounce {
          animation: bounce 1.5s infinite;
        }
        
        .delay-0 {
          animation-delay: 0s;
        }
        
        .delay-75 {
          animation-delay: 0.2s;
        }
        
        .delay-150 {
          animation-delay: 0.4s;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatsPage; 