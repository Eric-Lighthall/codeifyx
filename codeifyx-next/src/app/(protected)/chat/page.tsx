// app/(protected)/chat/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-500">{error}</div>
          </div>
        ) : (
          <ChatInterface 
            chatDetails={chatDetails}
            onNewChat={handleNewChat}
            updateChatDetails={updateChatDetails}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;