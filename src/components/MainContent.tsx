import React, { useState } from 'react';

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <div className="p-4">Chat Content</div>;
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