'use client'

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { API_URL, WS_MAIN_URL } from '@/components/config/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiArrowLeft, FiSend } from 'react-icons/fi';

type ChatMessage = {
  id: number;
  message: string;
  sender: string;
  created_at: string;
};

const ChatRoom = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const token = localStorage.getItem('access');
    const email = localStorage.getItem('user_email');
    setUserEmail(email || '');

    try {
      const res = await fetch(`${API_URL}/chat/rooms/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const setupWebSocket = async () => {
    const token = localStorage.getItem('access');
    ws.current = new WebSocket(`${WS_MAIN_URL}chat/${id}/?token=${token}`);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);

      setMessages((prevMessages) => {
        if (prevMessages.find((msg) => msg.id === data.message_id)) {
          return prevMessages;
        }

        const tempIndex = prevMessages.findIndex(
          (msg) =>
            msg.id < 0 &&
            msg.message === data.message &&
            msg.sender.toLowerCase() === data.sender.toLowerCase()
        );

        if (tempIndex !== -1) {
          const updatedMessages = [...prevMessages];
          updatedMessages[tempIndex] = {
            id: data.message_id,
            message: data.message,
            sender: data.sender,
            created_at: data.created_at,
          };
          return updatedMessages;
        }

        return [
          ...prevMessages,
          {
            id: data.message_id,
            message: data.message,
            sender: data.sender,
            created_at: data.created_at,
          },
        ];
      });
    };

    ws.current.onerror = (e) => {
      console.log('WebSocket error:', e);
      toast.error('Chat connection error');
    };

    ws.current.onclose = (e) => {
      console.log('WebSocket closed:', e);
      toast.info('Chat disconnected. Reconnecting...');
      setTimeout(setupWebSocket, 3000); // Reconnect after 3 seconds
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('access');
    const tempId = -Date.now();
    const tempMessage: ChatMessage = {
      id: tempId,
      message: newMessage,
      sender: userEmail,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');

    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ message: newMessage }));
      } else {
        const res = await fetch(`${API_URL}/chat/rooms/${id}/send/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: newMessage }),
        });
        const data = await res.json();

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  id: data.id,
                  message: data.message,
                  sender: data.sender,
                  created_at: data.created_at,
                }
              : msg
          )
        );

        await fetch(`${API_URL}/chat/rooms/${id}/mark-read/`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }
  };

  useEffect(() => {
    fetchMessages();
    setupWebSocket();
    return () => {
      ws.current?.close();
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-teal-800 border-b border-gray-200">
        <button
          onClick={() => router.push('/messages')}
          className="text-white hover:text-gray-200"
        >
          <FiArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-white">Customer Care</h2>
        <div className="w-6" /> {/* Spacer for alignment */}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.map((item) => {
          const isUser = item.sender.toLowerCase() === userEmail.toLowerCase();
          return (
            <div
              key={item.id}
              className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[75%]">
                <div className="text-xs text-gray-500 mb-1">
                  {new Date(item.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    isUser
                      ? 'bg-teal-700 text-white rounded-tr-none'
                      : 'bg-gray-200 text-black rounded-tl-none'
                  }`}
                >
                  {item.message}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Send */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
        <div className="flex items-end">
          <textarea
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 max-h-32"
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
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className={`ml-2 p-3 rounded-full ${
              newMessage.trim() ? 'bg-teal-700 hover:bg-teal-800' : 'bg-gray-400'
            } text-white transition-colors`}
          >
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatRoom;