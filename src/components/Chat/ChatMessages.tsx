import { useEffect } from 'react';
import { useMessageStore } from '../../stores/messageStore';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { supabase } from '../../supabase';

interface ChatMessagesProps {
  channelId: number;
}

export function ChatMessages({ channelId }: ChatMessagesProps) {
  const { messages, loading, error, fetchMessages } = useMessageStore();
  const { user } = useAuth();

  useEffect(() => {
    // Only fetch if we have a channel ID
    if (channelId) {
      fetchMessages(channelId);
    }

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
  }, [channelId, fetchMessages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 text-gray-500">
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        Error loading messages: {error}
      </div>
    );
  }

  const channelMessages = messages[channelId] || [];

  if (channelMessages.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-gray-500">
        No messages yet. Be the first to send one!
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {channelMessages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] rounded-lg p-3 ${
              message.user_id === user?.id
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium">
                {message.user_id === user?.id ? 'You' : 'User'}
              </span>
              <span className="text-xs opacity-75">
                {format(new Date(message.inserted_at), 'MMM d, h:mm a')}
              </span>
            </div>
            <p className="text-sm">{message.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 