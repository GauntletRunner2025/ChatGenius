import { 
  useState, 
  useChannelStore, 
  ChatMessages, 
  MessageInput, 
  QueryTab,
  type Tab,
  type TabButtonProps 
} from '../imports/components/main-content.imports';
import styles from '../styles/modules/MainContent.module.css';

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={active ? styles.tabButtonActive : styles.tabButtonInactive}
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
        <div className={styles.selectChannelContainer}>
          Select a channel to start chatting
        </div>
      );
    }

    if (!isJoined(selectedChannel.id)) {
      return (
        <div className={styles.joinChannelContainer}>
          <div className={styles.joinChannelText}>
            You need to join this channel to view messages
          </div>
          <button
            onClick={handleJoinChannel}
            className={styles.joinChannelButton}
          >
            Join #{selectedChannel.slug}
          </button>
        </div>
      );
    }

    return (
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <div className="flex items-center">
            <h1 className={styles.chatTitle}>
              <span className={styles.chatTitleSpan}>#</span> {selectedChannel.slug}
            </h1>
          </div>
        </div>
        <div className={styles.chatMessagesContainer}>
          <ChatMessages channelId={selectedChannel.id} />
        </div>
        <MessageInput channelId={selectedChannel.id} />
      </div>
    );
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.tabContainer}>
        <div className={styles.tabWrapper}>
          <TabButton
            active={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </TabButton>
          <TabButton
            active={activeTab === 'query'}
            onClick={() => setActiveTab('query')}
          >
            Query
          </TabButton>
        </div>
      </div>
      {activeTab === 'chat' ? renderChatContent() : <QueryTab />}
    </div>
  );
}