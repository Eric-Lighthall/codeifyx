import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Settings, FileText, User } from 'lucide-react';

interface RecentChat {
  _id: string;
  title: string;
  language: string;
  updatedAt: string;
}

interface SidebarProps {
  onNewChat: (newChatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewChat }) => {
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRecentChats();
  }, []);

  const fetchRecentChats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/chats');
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      const data = await response.json();
      setRecentChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to load recent chats');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (id: string) => {
    try {
      const response = await fetch(`/api/chats/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setRecentChats(recentChats.filter(chat => chat._id !== id));
        router.push('/chat'); // Navigate to new chat page after deletion
      } else {
        throw new Error('Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleNewChat = () => {
    onNewChat(''); // Pass empty string to indicate a new chat
  };

  return (
    <div className="w-64 bg-[#1E2029] h-full flex flex-col text-white">
      <div className="p-4">
        <Link href="/">
          <Image src="/images/codeifyxlogosmall.webp" alt="Small Logo" width={40} height={40} className="mx-auto" />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 mt-5">
          <h4 className="text-lg font-bold mb-2 text-[#7AA2F7]">Recent Chats</h4>
          <button 
            onClick={handleNewChat} 
            className="bg-[#292E42] text-white px-4 py-2 flex items-center mb-4 w-full hover:bg-[#343B58] transition-colors duration-200"
          >
            <Plus size={18} className="mr-2" />
            <span>New Chat</span>
          </button>
          {isLoading ? (
            <p className="text-[#A9B1D6]">Loading chats...</p>
          ) : error ? (
            <p className="text-[#F7768E]">{error}</p>
          ) : (
            <ul className="space-y-1">
              {recentChats.map((chat) => (
                <li key={chat._id}>
                  <Link href={`/chat?id=${chat._id}`} className="flex items-center text-white hover:bg-[#292E42] p-2 group transition-colors duration-200">
                    <span className="flex-1 truncate">{chat.title}</span>
                    <span className="text-xs text-[#A9B1D6] mr-2">{chat.language}</span>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        deleteChat(chat._id);
                      }} 
                      className="text-[#A9B1D6] hover:text-[#F7768E] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <Trash2 size={18} />
                    </button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="p-4 border-t border-[#2F3340] space-y-2">
        <Link href="/settings" className="flex items-center text-white hover:text-[#7AA2F7] transition-colors duration-200">
          <Settings size={18} className="mr-2" />
          <span>Settings</span>
        </Link>
        <Link href="/terms" className="flex items-center text-white hover:text-[#7AA2F7] transition-colors duration-200">
          <FileText size={18} className="mr-2" />
          <span>Terms</span>
        </Link>
        <Link href="/settings" className="flex items-center text-white hover:text-[#7AA2F7] transition-colors duration-200">
          <User size={18} className="mr-2" />
          <span>My Account</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;