// components/ChatInterface.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Code, Bug, Zap, Lock, FileText, Play, MessageSquare, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChatDetails, Message } from '../../app/(protected)/chat/page';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { lineNumbers } from '@codemirror/view';
import { EditorView } from '@codemirror/view';

interface ChatInterfaceProps {
  chatDetails: ChatDetails | null;
  onNewChat: (newChatId: string) => void;
  updateChatDetails: (updater: (prevDetails: ChatDetails | null) => Partial<ChatDetails>) => void;
}

interface ResponsePart {
  type: 'text' | 'code';
  content: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatDetails, onNewChat, updateChatDetails }) => {
  const [code, setCode] = useState<string>('');
  const [assistantResponse, setAssistantResponse] = useState<ResponsePart[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const actions = [
    { 
      value: 'analyze', 
      label: 'Analyze Code', 
      icon: Code,
      systemPrompt: `You are a code analysis expert. 
      Analyze the given code, identify potential issues, and suggest improvements. 
      Focus on code structure, efficiency, and best practices. 
      Only respond if something is code-related.
      No philosophical discussions.
      If the user didn't provide any code, let them know.`
    },
    { 
      value: 'debug', 
      label: 'Debug', 
      icon: Bug,
      systemPrompt: `You are a debugging expert. Examine the code for any errors, identify the root causes of issues, and suggest fixes. 
      If you find a potential bug, you should make sure it's an actual bug, and that it's not something that's not causing any problems. 
      Make sure you do not return the same code as the user, or very similar code.`
    },
    { 
      value: 'optimize', 
      label: 'Optimize', 
      icon: Zap,
      systemPrompt: `You are a code optimization specialist. 
      Analyze the given code and suggest optimizations to improve performance, reduce complexity, and enhance efficiency. 
      Explain the benefits of each optimization.
      Only respond if something is code-related. No philosophical discussions.`
    },
    { 
      value: 'secure', 
      label: 'Security Check', 
      icon: Lock,
      systemPrompt: `You are a cybersecurity expert. 
      Analyze the code for potential security vulnerabilities, suggest fixes, and explain best practices for writing secure code.
      Only respond if something is code-related. No philosophical discussions.`
    },
    { 
      value: 'document', 
      label: 'Generate Docs', 
      icon: FileText,
      systemPrompt: `You are a technical documentation expert. 
      Generate clear, concise, and comprehensive documentation for the given code. 
      Include function descriptions, parameter explanations, and usage examples.
      Only respond if something is code-related. No philosophical discussions.`
    },
    { 
      value: 'custom', 
      label: 'Custom Instruction', 
      icon: MessageSquare,
      systemPrompt: "You are a versatile coding assistant. Follow the user's custom instruction precisely - but ONLY if it's coding related. No philosophical discussions."
    },
  ];

  useEffect(() => {
    if (chatDetails?.messages && chatDetails.messages.length > 0) {
      const lastUserMessage = chatDetails.messages
        .filter(msg => msg.role === 'user')
        .pop();
      const lastAssistantMessage = chatDetails.messages
        .filter(msg => msg.role === 'assistant')
        .pop();
      if (lastUserMessage) {
        setCode(lastUserMessage.content);
      }
      if (lastAssistantMessage) {
        setAssistantResponse(parseResponse(lastAssistantMessage.content));
      }
    } else {
      setCode('');
      setAssistantResponse([]);
    }
  }, [chatDetails]);

  useEffect(() => {
    if (selectedAction === 'custom' && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [selectedAction]);

  const parseResponse = (response: string): ResponsePart[] => {
    const parts: ResponsePart[] = [];
    const codeRegex = /```[\s\S]*?```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(response)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: response.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', content: match[0].slice(3, -3) });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < response.length) {
      parts.push({ type: 'text', content: response.slice(lastIndex) });
    }

    return parts;
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      } else if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className={`text-[#ff79c6] bg-[#44475a] px-1 rounded`}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const handleAction = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!selectedAction || !code.trim() || isLoading) {
      return;
    }
    if (selectedAction === 'custom' && !customInstruction.trim()) {
      setError('Please enter a custom instruction.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAssistantResponse([]);

    const selectedActionObj = actions.find(action => action.value === selectedAction);
    const systemPrompt = selectedActionObj?.systemPrompt || '';
    const instruction = selectedAction === 'custom' ? customInstruction : '';
  
    const userMessage: Message = { 
      role: 'user', 
      content: code
    };
    updateChatDetails(prevDetails => ({ 
      messages: [...(prevDetails?.messages || []), userMessage]
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: code,
          chatId: chatDetails?.id,
          language: chatDetails?.language || 'JavaScript',
          action: selectedAction,
          systemPrompt: systemPrompt,
          instruction: instruction,
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
            try {
              const data = JSON.parse(line.slice(5));
              if (data.token) {
                assistantMessage += data.token;
                setAssistantResponse(parseResponse(assistantMessage));
              } else if (data.newChatId) {
                handleNewChat(data.newChatId);
              }
            } catch (err) {
              console.error('Error parsing streaming data:', err);
            }
          }
        }
      }

      const assistantResponseMessage: Message = {
        role: 'assistant',
        content: assistantMessage
      };
      const updatedMessages: Message[] = [
        ...(chatDetails?.messages || []),
        userMessage,
        assistantResponseMessage
      ];
      updateChatDetails(prevDetails => ({
        messages: updatedMessages
      }));

      await saveChatDetails({
        ...chatDetails,
        messages: updatedMessages
      } as ChatDetails);

    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing your request. Please try again.');
      setAssistantResponse([{ type: 'text', content: 'Error: Unable to process the request. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = (newChatId: string) => {
    setCode('');
    setAssistantResponse([]);
    setSelectedAction('');
    setCustomInstruction('');
    onNewChat(newChatId);
  };

  const saveChatDetails = async (details: ChatDetails) => {
    if (!details.id) {
      console.error('Cannot save chat details: missing chat ID');
      return;
    }
    try {
      const response = await fetch(`/api/chats/${details.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      if (!response.ok) {
        throw new Error('Failed to save chat details');
      }
    } catch (error) {
      console.error('Error saving chat details:', error);
      setError('Failed to save chat details. Your changes may not persist.');
    }
  };

  const codeMirrorOptions = [
    javascript({ jsx: true }),
    lineNumbers(),
    EditorView.lineWrapping,
    EditorView.theme({
      "&": {
        height: "100%"
      },
      ".cm-scroller": {
        overflow: "auto"
      },
      ".cm-content": {
        whiteSpace: "pre-wrap",
        wordBreak: "break-word"
      }
    })
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-300">
      <div className="flex items-center p-4 space-x-4 bg-gray-800">
        {selectedAction === 'custom' ? (
          <div className="flex-1 flex items-center space-x-2 bg-gray-700 rounded px-3 py-2">
            <Input
              ref={customInputRef}
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="Enter custom instruction"
              className="flex-1 bg-transparent text-white focus:outline-none"
            />
            <Button
              onClick={() => {
                setSelectedAction('');
                setCustomInstruction('');
              }}
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Select onValueChange={setSelectedAction} value={selectedAction}>
            <SelectTrigger className="w-[200px] bg-gray-700 border-gray-600">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {actions.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value} className="text-gray-300 focus:bg-gray-600 focus:text-gray-100">
                  <div className="flex items-center">
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          onClick={handleAction}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center px-6"
          disabled={isLoading || !selectedAction || (selectedAction === 'custom' && !customInstruction.trim()) || !code.trim()}
        >
          <Play className="mr-2 h-4 w-4" /> {isLoading ? 'Processing...' : 'Go'}
        </Button>
      </div>
      {error && (
        <div className="bg-red-600 text-white p-2 text-center">
          {error}
        </div>
      )}
      <div className="flex-grow flex overflow-hidden">
        <Card className="w-1/2 m-4 border-0 shadow-md bg-[#282A36] flex flex-col">
          <CardContent className="p-0 flex-grow overflow-hidden">
            <CodeMirror
              value={code}
              height="100%"
              theme={dracula}
              extensions={codeMirrorOptions}
              onChange={(value) => setCode(value)}
              className="h-full"
            />
          </CardContent>
        </Card>
        <Card className="w-1/2 m-4 border-0 shadow-md bg-[#282A36] flex flex-col">
          <CardContent className="p-0 flex-grow overflow-auto">
            <div className="font-mono text-sm">
              {assistantResponse.map((part, index) => (
                <div key={index} className={part.type === 'text' ? 'bg-[#1e1f29] p-4' : 'bg-[#282A36] p-2 border-l-4 border-[#bd93f9]'}>
                  {part.type === 'text' ? (
                    <div className="whitespace-pre-wrap text-[#f8f8f2]">
                      {renderFormattedText(part.content)}
                    </div>
                  ) : (
                    <div className="rounded overflow-hidden">
                      <CodeMirror
                        value={part.content}
                        height="auto"
                        theme={dracula}
                        extensions={codeMirrorOptions}
                        editable={false}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatInterface;