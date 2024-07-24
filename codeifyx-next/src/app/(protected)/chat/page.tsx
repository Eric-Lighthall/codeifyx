// app/(protected)/chat/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
    // Update URL without page refresh
    window.history.pushState({}, '', `/chat?id=${newChatId}`);
    fetchChatDetails(newChatId);
  }, [fetchChatDetails]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-gray-800">
          <h1 className="text-2xl font-bold">
            {chatDetails ? chatDetails.title : 'New Chat'}
          </h1>
          {chatDetails && <p>Language: {chatDetails.language}</p>}
        </div>
        {isLoading ? (
          <div className="text-center mt-10">Loading...</div>
        ) : error ? (
          <div className="text-center mt-10 text-red-500">{error}</div>
        ) : (
          <ChatInterface 
            chatDetails={chatDetails}
            onNewChat={handleNewChat}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;