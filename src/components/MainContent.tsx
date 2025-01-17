import React, { useState } from 'react';
import { useChannelStore } from '../stores/channelStore';
import { ChatMessages } from './Chat/ChatMessages';
import { MessageInput } from './Chat/MessageInput';

type Tab = 'chat' | 'files' | 'search';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium rounded-t-lg ${
        active
          ? 'bg-white text-gray-900 border-b-2 border-indigo-500'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

export function MainContent() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const { selectedChannel } = useChannelStore();

  const renderChatContent = () => {
    if (!selectedChannel) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Select a channel to start chatting
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <ChatMessages channelId={selectedChannel.id} />
        </div>
        <MessageInput channelId={selectedChannel.id} />
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return renderChatContent();
      case 'files':
        return <div className="p-4">Files Content</div>;
      case 'search':
        return <div className="p-4">Search Content</div>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="border-b border-gray-200">
        <div className="flex gap-2 px-4">
          <TabButton
            active={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </TabButton>
          <TabButton
            active={activeTab === 'files'}
            onClick={() => setActiveTab('files')}
          >
            Files
          </TabButton>
          <TabButton
            active={activeTab === 'search'}
            onClick={() => setActiveTab('search')}
          >
            Search
          </TabButton>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}