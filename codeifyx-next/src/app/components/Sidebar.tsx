"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RecentChat {
  id: string;
  title: string;
  languageLogo: string;
}

const Sidebar: React.FC = () => {
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);

  const deleteChat = (id: string) => {
    setRecentChats(recentChats.filter(chat => chat.id !== id));
  };

  return (
    <div className="w-64 bg-gray-800 h-full flex flex-col transition-all duration-300 hover:w-80">
      <div className="p-4">
        <Link href="/">
          <Image src="/images/codeifyxlogosmall.webp" alt="Small Logo" width={40} height={40} className="mx-auto" />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 mt-5">
          <h4 className="text-lg font-bold mb-2">Recent Chats</h4>
          <Link href="/chat" className="bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center mb-4">
            <span className="mr-2">+</span>
            <span>New Chat</span>
          </Link>
          <ul>
            {recentChats.map((chat) => (
              <li key={chat.id} className="mb-2">
                <Link href={`/chat/${chat.id}`} className="flex items-center text-white hover:bg-gray-700 rounded-lg p-2">
                  <Image src={chat.languageLogo} alt="Language Logo" width={24} height={24} className="mr-2" />
                  <span className="flex-1">{chat.title}</span>
                  <button onClick={() => deleteChat(chat.id)} className="text-red-500 hover:text-red-700">
                    <span className="sr-only">Delete</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="p-4">
        <Link href="/settings" className="block text-white mb-2">Settings</Link>
        <Link href="/terms" className="block text-white mb-2">Terms</Link>
        <Link href="/profile" className="flex items-center text-white">
          <Image src="/path/to/user/image.jpg" alt="Profile Image" width={32} height={32} className="rounded-full mr-2" />
          <span>User Name</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;