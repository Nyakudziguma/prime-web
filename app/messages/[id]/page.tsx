'use client'

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { API_URL, WS_MAIN_URL } from '@/components/config/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiArrowLeft, FiSend, FiRotateCw } from 'react-icons/fi';

type ChatMessage = {
  id: number | string; // string for temp IDs
  message: string;
  sender: string;
  created_at: string;
  is_admin?: boolean;
  read?: boolean;
  status?: 'sending' | 'delivered' | 'failed';
};

const ChatRoom = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Fetch initial messages
  const fetchMessages = async () => {
    const token = localStorage.getItem('access');
    const email = localStorage.getItem('user_email');
    setUserEmail(email || '');

    try {
      const res = await fetch(`${API_URL}/chat/rooms/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data.map((msg: any) => ({
        ...msg,
        status: 'delivered' // All initial messages are considered delivered
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  // WebSocket setup with enhanced error handling
  const setupWebSocket = () => {
    const token = localStorage.getItem('access');
    const wsUrl = `${WS_MAIN_URL.replace('https://', 'wss://').replace('http://', 'ws://')}ws/chat/${id}/?token=${token}`;
    
    ws.current = new WebSocket(wsUrl);
    setConnectionStatus('connecting');

    // Ping every 25 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
      
      // Authenticate with CSRF token if needed
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        ws.current?.send(JSON.stringify({
          type: 'authenticate',
          token: csrfToken
        }));
      }
    };

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log('WebSocket message:', data);

        switch(data.type) {
          case 'new_message':
          case 'chat_message':
            handleIncomingMessage(data);
            break;
            
          case 'message_ack':
            handleMessageAcknowledgment(data);
            break;
            
          case 'all_messages':
            setMessages(data.messages.map((msg: any) => ({
              ...msg,
              status: 'delivered'
            })));
            break;
            
          case 'error':
            handleWebSocketError(data.message);
            break;
            
          default:
            console.warn('Unhandled message type:', data.type);
        }
      } catch (error) {
        console.error('Message parse error:', error);
      }
    };

    ws.current.onerror = (e) => {
      console.error('WebSocket error:', e);
      setConnectionStatus('disconnected');
      handleWebSocketError('Connection error');
    };

    ws.current.onclose = (e) => {
      console.log('WebSocket closed:', e.code, e.reason);
      clearInterval(pingInterval);
      setConnectionStatus('disconnected');
      
      if (e.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * (reconnectAttempts.current + 1), 5000);
        reconnectAttempts.current += 1;
        toast.info(`Reconnecting in ${delay/1000} seconds...`);
        setTimeout(setupWebSocket, delay);
      } else if (reconnectAttempts.current >= maxReconnectAttempts) {
        toast.error('Failed to reconnect. Please refresh the page.');
      }
    };

    return () => clearInterval(pingInterval);
  };

  // Handle incoming messages
  const handleIncomingMessage = (data: any) => {
    setMessages(prev => {
      // Prevent duplicates
      if (prev.some(msg => msg.id === data.message_id)) return prev;
      
      return [...prev, {
        id: data.message_id,
        message: data.message,
        sender: data.sender,
        created_at: data.created_at,
        is_admin: data.is_admin,
        read: data.read,
        status: 'delivered'
      }];
    });
  };

  // Handle message acknowledgments
  const handleMessageAcknowledgment = (data: any) => {
    setMessages(prev => prev.map(msg => 
      msg.id === data.temp_id ? {
        ...msg,
        id: data.message_id,
        status: 'delivered'
      } : msg
    ));
  };

  // Handle WebSocket errors
  const handleWebSocketError = (message: string) => {
    toast.error(message);
    setMessages(prev => prev.map(msg => 
      msg.status === 'sending' ? { ...msg, status: 'failed' } : msg
    ));
  };

  // Send message with proper error handling
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const messageData = {
      type: 'send_message',
      message: newMessage,
      temp_id: tempId
    };

    // Optimistic update
    setMessages(prev => [...prev, {
      id: tempId,
      message: newMessage,
      sender: userEmail,
      created_at: new Date().toISOString(),
      status: 'sending'
    }]);
    setNewMessage('');

    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(messageData));
      } else {
        throw new Error('WebSocket not connected');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' } : msg
      ));
      toast.error('Failed to send message. Trying to reconnect...');
      setupWebSocket(); // Attempt reconnect
    }
  };

  // Get CSRF token from cookies
  const getCSRFToken = () => {
    if (typeof document === 'undefined') return '';
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || '';
  };

  // Mark messages as read
  const markMessagesAsRead = async (roomId: string) => {
    try {
      const response = await fetch(`${API_URL}/chat/${roomId}/mark-read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
          'X-CSRFToken': getCSRFToken()
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    setupWebSocket();
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <DashboardLayout>
      {/* Header with connection status */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-teal-800 border-b border-gray-200">
        <button
          onClick={() => router.push('/messages')}
          className="text-white hover:text-gray-200"
        >
          <FiArrowLeft size={24} />
        </button>
        <div className="flex items-center">
          <h2 className="text-lg font-bold text-white mr-3">Customer Care</h2>
          <div className={`h-3 w-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.map((item) => {
          const isUser = item.sender.toLowerCase() === userEmail.toLowerCase();
          return (
            <div
              key={item.id}
              className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] rounded-lg p-3 ${
                isUser ? 'bg-teal-700 text-white rounded-tr-none' :
                item.is_admin ? 'bg-blue-100 text-black rounded-tl-none border border-blue-200' :
                'bg-gray-200 text-black rounded-tl-none'
              } ${
                item.status === 'sending' ? 'opacity-80' :
                item.status === 'failed' ? 'bg-red-100 border border-red-300' : ''
              }`}>
                <div className="flex justify-between items-baseline mb-1">
                  <strong>{isUser ? 'You' : item.sender}</strong>
                  <small className="text-xs ml-2 opacity-80">
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {item.is_admin && ' • Admin'}
                  </small>
                </div>
                <div className="message-content">{item.message}</div>
                {item.status === 'sending' && (
                  <div className="text-xs text-right mt-1">
                    <FiRotateCw className="animate-spin inline" /> Sending...
                  </div>
                )}
                {item.status === 'failed' && (
                  <div className="text-xs text-red-600 text-right mt-1">
                    Failed to send
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
        <div className="flex items-end">
          <textarea
            className="flex-1 bg-gray-100 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 max-h-32"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
            disabled={connectionStatus !== 'connected'}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || connectionStatus !== 'connected'}
            className={`ml-2 p-3 rounded-full ${
              newMessage.trim() && connectionStatus === 'connected'
                ? 'bg-teal-700 hover:bg-teal-800'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white transition-colors`}
          >
            <FiSend size={20} />
          </button>
        </div>
        {connectionStatus !== 'connected' && (
          <div className="text-sm text-red-600 mt-2">
            {connectionStatus === 'connecting' 
              ? 'Connecting...' 
              : 'Disconnected. Trying to reconnect...'}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChatRoom;