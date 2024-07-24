// app/(protected)/chat/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatInterface from '../../components/ChatInterface';
import Sidebar from '../../components/Sidebar';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatDetails {
  id: string;
  title: string;
  language: string;
  messages: Message[];
}

const ChatPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [chatInterfaceHeight, setChatInterfaceHeight] = useState<number | null>(null);

  const fetchChatDetails = useCallback(async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/chats/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat details');
      }
      const data: ChatDetails = await response.json();
      setChatDetails(data);
    } catch (error) {
      console.error('Error fetching chat details:', error);
      setError('Failed to load chat details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = searchParams?.get('id');
    if (id) {
      fetchChatDetails(id);
    } else {
      setChatDetails(null);
    }
  }, [searchParams, fetchChatDetails]);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const windowHeight = window.innerHeight;
        const headerHeight = headerRef.current.offsetHeight;
        setChatInterfaceHeight(windowHeight - headerHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleNewChat = useCallback((newChatId: string) => {
    router.push(`/chat?id=${newChatId}`);
    fetchChatDetails(newChatId);
  }, [router, fetchChatDetails]);

  const updateChatDetails = useCallback((updater: (prevDetails: ChatDetails | null) => Partial<ChatDetails>) => {
    setChatDetails(prevDetails => {
      const updates = updater(prevDetails);
      return prevDetails ? { ...prevDetails, ...updates } : null;
    });
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar onNewChat={handleNewChat} />
      <div className="flex-1 flex flex-col">
        <div ref={headerRef} className="p-4 bg-gray-800">
          <h1 className="text-2xl font-bold">
            {chatDetails ? chatDetails.title : 'New Chat'}
          </h1>
          {chatDetails && <p>Language: {chatDetails.language}</p>}
        </div>
        {chatInterfaceHeight && (
          <div style={{ height: `${chatInterfaceHeight}px` }} className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="text-center mt-10">Loading...</div>
            ) : error ? (
              <div className="text-center mt-10 text-red-500">{error}</div>
            ) : (
              <ChatInterface 
                chatDetails={chatDetails}
                onNewChat={handleNewChat}
                updateChatDetails={updateChatDetails}
                height={chatInterfaceHeight}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;