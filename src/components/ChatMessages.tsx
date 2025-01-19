import { 
  useEffect, 
  useMessageStore, 
  useChannelStore, 
  useAuth, 
  format, 
  supabase,
  type ChatMessagesProps 
} from '../imports/components/chat/messages.imports';

const loadingClass = "flex items-center justify-center p-4 text-gray-500";
const errorClass = "flex items-center justify-center p-4 text-red-500";
const noMessagesClass = "flex items-center justify-center p-4 text-gray-500";
const messageContainerClass = "space-y-4 p-4";
const messageClass = "max-w-[70%] rounded-lg p-3";
const messageHeaderClass = "flex items-center space-x-2 mb-1";
const messageUserClass = "text-sm font-medium";
const messageTimeClass = "text-xs opacity-75";
const messageTextClass = "text-sm";

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
      <div className={loadingClass}>
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div className={errorClass}>
        Error loading messages: {error}
      </div>
    );
  }

  const channelMessages = messages[channelId] || [];

  if (channelMessages.length === 0) {
    return (
      <div className={noMessagesClass}>
        No messages yet. Be the first to send one!
      </div>
    );
  }

  return (
    <div className={messageContainerClass}>
      {channelMessages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`${messageClass} ${
              message.user_id === user?.id
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className={messageHeaderClass}>
              <span className={messageUserClass}>
                {message.user_id === user?.id ? 'You' : 'User'}
              </span>
              <span className={messageTimeClass}>
                {format(new Date(message.inserted_at), 'MMM d, h:mm a')}
              </span>
            </div>
            <p className={messageTextClass}>{message.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}