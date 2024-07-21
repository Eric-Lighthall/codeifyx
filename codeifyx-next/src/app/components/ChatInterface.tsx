// components/ChatInterface.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const userMessage: Message = { role: 'user', content: input };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: input,
            chatId: chatId,
            language: 'JavaScript', // You might want to make this dynamic
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const reader = response.body?.getReader();
        let assistantMessage = '';

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(5));
              if (data.token) {
                assistantMessage += data.token;
                setMessages(prevMessages => {
                  const updatedMessages = [...prevMessages];
                  const lastMessage = updatedMessages[updatedMessages.length - 1];
                  if (lastMessage.role === 'assistant') {
                    lastMessage.content = assistantMessage;
                  } else {
                    updatedMessages.push({ role: 'assistant', content: assistantMessage });
                  }
                  return updatedMessages;
                });
              } else if (data.chatId) {
                setChatId(data.chatId);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'assistant', content: 'Sorry, an error occurred. Please try again.' },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Image src="/images/codeifyxlogosmall.webp" alt="CodeifyX Logo" width={50} height={50} className="mb-3" />
            <h3 className="font-bold text-xl">What can I help you with?</h3>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3/4 p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                <div dangerouslySetInnerHTML={{ __html: message.content }} />
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            className="flex-1 bg-gray-800 text-white rounded-l-lg px-4 py-2 focus:outline-none"
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" className="bg-blue-600 text-white rounded-r-lg px-4 py-2" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;