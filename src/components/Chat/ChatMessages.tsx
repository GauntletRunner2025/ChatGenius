import { 
  useEffect, 
  useMessageStore, 
  useChannelStore, 
  useAuth, 
  format, 
  supabase,
  type ChatMessagesProps 
} from '../../imports/components/chat/messages.imports';
import styles from '../../styles/ChatMessages.module.css';

export function ChatMessages({ channelId }: ChatMessagesProps) {
  const { messages, loading, error, fetchMessages } = useMessageStore();
  const { isJoined } = useChannelStore();
  const { user } = useAuth();

  useEffect(() => {
    // Only fetch if we have a channel ID and we've joined the channel
    if (channelId && isJoined(channelId)) {
      fetchMessages(channelId);

      // Set up real-time subscription for new messages
      const channel = supabase
        .channel(`messages:${channelId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'message',
          filter: `channel_id=eq.${channelId}`
        }, () => {
          // When we receive any change, refresh the messages
          fetchMessages(channelId, true);
        })
        .subscribe();

      return () => {
        // Clean up subscription when component unmounts or channel changes
        supabase.removeChannel(channel);
      };
    }
  }, [channelId, fetchMessages, isJoined]);

  if (!isJoined(channelId)) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        Error loading messages: {error}
      </div>
    );
  }

  const channelMessages = messages[channelId] || [];

  if (channelMessages.length === 0) {
    return (
      <div className={styles.noMessages}>
        No messages yet. Be the first to send one!
      </div>
    );
  }

  return (
    <div className={styles.messageContainer}>
      {channelMessages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`${styles.message} ${
              message.user_id === user?.id
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className={styles.messageHeader}>
              <span className={styles.messageUser}>
                {message.user_id === user?.id ? 'You' : 'User'}
              </span>
              <span className={styles.messageTime}>
                {format(new Date(message.inserted_at), 'MMM d, h:mm a')}
              </span>
            </div>
            <p className={styles.messageText}>{message.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}