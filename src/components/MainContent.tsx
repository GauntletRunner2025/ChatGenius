import { 
  React, 
  useState, 
  useChannelStore, 
  ChatMessages, 
  MessageInput, 
  QueryTab,
  type Tab,
  type TabButtonProps 
} from '../imports/components/main-content.imports';

const TAB_BUTTON_ACTIVE_CLASSNAME = "px-4 py-2 font-medium rounded-t-lg bg-white text-gray-900 border-b-2 border-indigo-500";
const TAB_BUTTON_INACTIVE_CLASSNAME = "px-4 py-2 font-medium rounded-t-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100";
const MAIN_CONTAINER_CLASSNAME = "h-full flex flex-col bg-gray-50";
const TAB_CONTAINER_CLASSNAME = "border-b border-gray-200";
const TAB_WRAPPER_CLASSNAME = "flex gap-2 px-4";
const CHAT_CONTAINER_CLASSNAME = "flex flex-col h-full";
const CHAT_HEADER_CLASSNAME = "px-6 py-4 border-b border-gray-700/50";
const CHAT_TITLE_CLASSNAME = "text-xl font-semibold text-gray-200";
const CHAT_TITLE_SPAN_CLASSNAME = "text-gray-400";
const CHAT_MESSAGES_CONTAINER_CLASSNAME = "flex-1 overflow-y-auto";
const JOIN_CHANNEL_CONTAINER_CLASSNAME = "flex flex-col items-center justify-center h-full";
const JOIN_CHANNEL_TEXT_CLASSNAME = "text-gray-500 mb-4";
const JOIN_CHANNEL_BUTTON_CLASSNAME = "px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors";
const SELECT_CHANNEL_CONTAINER_CLASSNAME = "flex items-center justify-center h-full text-gray-500";

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={active ? TAB_BUTTON_ACTIVE_CLASSNAME : TAB_BUTTON_INACTIVE_CLASSNAME}
    >
      {children}
    </button>
  );
}

export function MainContent() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const { selectedChannel, isJoined, joinChannel } = useChannelStore();

  const handleJoinChannel = async () => {
    if (selectedChannel) {
      try {
        await joinChannel(selectedChannel.id);
      } catch (error) {
        console.error('Failed to join channel:', error);
      }
    }
  };

  const renderChatContent = () => {
    if (!selectedChannel) {
      return (
        <div className={SELECT_CHANNEL_CONTAINER_CLASSNAME}>
          Select a channel to start chatting
        </div>
      );
    }

    if (!isJoined(selectedChannel.id)) {
      return (
        <div className={JOIN_CHANNEL_CONTAINER_CLASSNAME}>
          <div className={JOIN_CHANNEL_TEXT_CLASSNAME}>
            You need to join this channel to view messages
          </div>
          <button
            onClick={handleJoinChannel}
            className={JOIN_CHANNEL_BUTTON_CLASSNAME}
          >
            Join #{selectedChannel.slug}
          </button>
        </div>
      );
    }

    return (
      <div className={CHAT_CONTAINER_CLASSNAME}>
        <div className={CHAT_HEADER_CLASSNAME}>
          <div className="flex items-center">
            <h1 className={CHAT_TITLE_CLASSNAME}>
              <span className={CHAT_TITLE_SPAN_CLASSNAME}>#</span> {selectedChannel.slug}
            </h1>
          </div>
        </div>
        <div className={CHAT_MESSAGES_CONTAINER_CLASSNAME}>
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
      case 'query':
        return <QueryTab />;
    }
  };

  return (
    <div className={MAIN_CONTAINER_CLASSNAME}>
      <div className={TAB_CONTAINER_CLASSNAME}>
        <div className={TAB_WRAPPER_CLASSNAME}>
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
            active={activeTab === 'query'}
            onClick={() => setActiveTab('query')}
          >
            Query
          </TabButton>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}