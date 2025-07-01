'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { API_URL } from '@/components/config/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type ChatRoom = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: {
    message: string;
    created_at: string;
    sender: string;
  };
  unread_count: number;
};

const ChatRoomList = () => {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    const token = localStorage.getItem('access');
    try {
      const res = await fetch(`${API_URL}/chat/rooms/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast.error('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    const token = localStorage.getItem('access');
    try {
      const res = await fetch(`${API_URL}/chat/rooms/create/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      router.push(`/messages/${data.id}`);
    } catch (error) {
      console.error('Error creating chat room:', error);
      toast.error('Failed to create new chat');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 px-4 mt-4">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <span className="text-lg mb-4 text-gray-700">No active chats</span>
            <button
              onClick={createNewChat}
              className="bg-teal-800 px-6 py-3 rounded-full min-w-[200px] hover:bg-teal-900 transition-colors"
            >
              <span className="text-white font-extrabold text-base">
                Start New Chat
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 pb-20">
            {rooms.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(`/messages/${item.id}`)}
                className="bg-white p-4 w-full rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-bold text-lg">{item.title}</div>
                    {item.last_message && (
                      <div className="mt-1">
                        <div className="text-gray-600 line-clamp-1">
                          {item.last_message.sender}: {item.last_message.message}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(item.last_message.created_at).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                  {item.unread_count > 0 && (
                    <div className="bg-red-500 rounded-full w-6 h-6 flex items-center justify-center">
                      <span className="text-white text-xs">{item.unread_count}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChatRoomList;