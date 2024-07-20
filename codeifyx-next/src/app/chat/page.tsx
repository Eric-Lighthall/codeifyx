'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface RecentChat {
  id: string
  title: string
  languageLogo: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [recentChats, setRecentChats] = useState<RecentChat[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState({ name: 'JavaScript', logo: '/images/javascript-logo.png' })

  const languages = [
    { name: 'JavaScript', logo: '/images/javascript-logo.png' },
    { name: 'Python', logo: '/images/python-logo.png' },
    { name: 'Java', logo: '/images/java-logo.png' },
    // Add more languages as needed
  ]

  useEffect(() => {
    // Fetch recent chats
    // This is a placeholder. You'll need to implement the actual API call.
    setRecentChats([
      { id: '1', title: 'Chat 1', languageLogo: '/images/javascript-logo.png' },
      { id: '2', title: 'Chat 2', languageLogo: '/images/python-logo.png' },
    ])
  }, [])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = { role: 'user', content: inputMessage }
    setMessages([...messages, newMessage])
    setInputMessage('')

    // Send message to API and get response
    // This is a placeholder. You'll need to implement the actual API call.
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: inputMessage }),
    })
    const data = await response.json()

    setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: data.response }])
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <div className="mb-8">
          <Link href="/">
            <Image src="/images/codeifyxlogo3.webp" alt="CodeifyX Logo" width={150} height={50} />
          </Link>
        </div>
        <button className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4">New Chat</button>
        <h2 className="text-xl mb-2">Recent Chats</h2>
        <ul>
          {recentChats.map(chat => (
            <li key={chat.id} className="mb-2">
              <Link href={`/chat/${chat.id}`} className="flex items-center">
                <Image src={chat.languageLogo} alt="Language Logo" width={20} height={20} className="mr-2" />
                <span>{chat.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Language selector */}
        <div className="bg-gray-200 p-4">
          <select 
            value={selectedLanguage.name}
            onChange={(e) => setSelectedLanguage(languages.find(lang => lang.name === e.target.value) || selectedLanguage)}
            className="p-2 rounded"
          >
            {languages.map(lang => (
              <option key={lang.name} value={lang.name}>{lang.name}</option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="bg-gray-200 p-4">
          <div className="flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 p-2 rounded-l"
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage} className="bg-blue-500 text-white p-2 rounded-r">Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}