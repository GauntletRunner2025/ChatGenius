import { useEffect } from 'react';
import { useChannelStore } from '../../stores/channelStore';
import { useAuth } from '../../contexts/AuthContext';
import { HashtagIcon } from '@heroicons/react/24/outline';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function ChannelList() {
  const { channels, selectedChannel, loading, error, fetchChannels, selectChannel } = useChannelStore();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      fetchChannels();
    }
  }, [fetchChannels, user]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="px-2 py-4 text-gray-400">
        Loading channels...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2 py-4 text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-1">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => selectChannel(channel)}
            className={clsx(
              'w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md',
              selectedChannel?.id === channel.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            )}
          >
            <HashtagIcon 
              className={clsx(
                'mr-2 h-5 w-5',
                selectedChannel?.id === channel.id
                  ? 'text-white'
                  : 'text-gray-400 group-hover:text-gray-300'
              )}
            />
            {channel.slug}
          </button>
        ))}
      </div>
      <button
        onClick={handleLogout}
        className="mt-auto w-full text-left flex items-center px-2 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
      >
        <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
        Sign Out
      </button>
    </div>
  );
} 