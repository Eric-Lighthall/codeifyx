import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChatDetails, Message } from '../../app/(protected)/chat/page';

interface ChatInterfaceProps {
  chatDetails: ChatDetails | null;
  onNewChat: (newChatId: string) => void;
  updateChatDetails: (updater: (prevDetails: ChatDetails | null) => Partial<ChatDetails>) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatDetails, onNewChat, updateChatDetails }) => {
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatDetails?.messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const userMessage: Message = { role: 'user', content: input };
      updateChatDetails(prevDetails => ({ 
        messages: [...(prevDetails?.messages || []), userMessage]
      }));
      setInput('');
      setIsLoading(true);

      updateChatDetails(prevDetails => ({
        messages: [
          ...(prevDetails?.messages || []),
          { role: 'assistant', content: '' }
        ]
      }));

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: input,
            chatId: chatDetails?.id,
            language: chatDetails?.language || 'JavaScript',
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
                updateChatDetails(prevDetails => {
                  const updatedMessages = [...(prevDetails?.messages || [])];
                  updatedMessages[updatedMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage
                  };
                  return { messages: updatedMessages };
                });
                scrollToBottom();
              } else if (data.newChatId) {
                onNewChat(data.newChatId);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
        updateChatDetails(prevDetails => {
          const updatedMessages = [...(prevDetails?.messages || [])];
          updatedMessages[updatedMessages.length - 1] = {
            role: 'assistant',
            content: 'Sorry, an error occurred. Please try again.'
          };
          return { messages: updatedMessages };
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto py-4 px-6 md:px-12 lg:px-24"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {(!chatDetails || chatDetails.messages.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Image src="/images/codeifyxlogosmall.webp" alt="CodeifyX Logo" width={50} height={50} className="mb-3" />
              <h3 className="font-bold text-xl">What can I help you with?</h3>
              <p className="text-gray-400 mt-2">Ask me anything about {chatDetails?.language || 'programming'}!</p>
            </div>
          ) : (
            chatDetails.messages.map((message: Message, index: number) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-lg ${message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  <div dangerouslySetInnerHTML={{ __html: message.content }} />
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="bg-gray-800 py-4 px-6 md:px-12 lg:px-24">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              className="flex-1 bg-gray-700 text-white rounded-l-lg px-4 py-2 focus:outline-none"
              placeholder={`Type your ${chatDetails?.language || 'programming'} related message...`}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white rounded-r-lg px-4 py-2 disabled:bg-blue-400" 
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;