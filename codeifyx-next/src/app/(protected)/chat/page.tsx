import { NextPage } from 'next';
import ChatInterface from '../../components/ChatInterface';
import Sidebar from '../../components/Sidebar';
import LanguageDropdown from '../../components/LanguageDropdown';

const ChatPage: NextPage = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <LanguageDropdown />
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;