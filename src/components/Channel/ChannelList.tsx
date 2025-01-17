import { useEffect, useState, FormEvent } from 'react';
import { useChannelStore } from '../../stores/channelStore';
import { useAuth } from '../../contexts/AuthContext';
import { HashtagIcon } from '@heroicons/react/24/outline';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function ChannelList() {
  const { channels, selectedChannel, loading, error, fetchChannels, selectChannel, createChannel } = useChannelStore();
  const { user, signOut } = useAuth();
  const [newChannelName, setNewChannelName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreateChannel = async (e: FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim() || !user) return;

    try {
      await createChannel(newChannelName.trim(), user.id);
      setNewChannelName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create channel:', error);
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
              'w-full flex items-center px-2 py-1 rounded hover:bg-gray-700/50 transition-colors',
              selectedChannel?.id === channel.id ? 'bg-gray-700/50' : ''
            )}
          >
            <HashtagIcon className="h-4 w-4 mr-2" />
            <span className="truncate">{channel.slug}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-gray-700/50 pt-4">
        {isCreating ? (
          <form onSubmit={handleCreateChannel} className="px-2">
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Enter channel name"
              className="w-full px-2 py-1 text-sm bg-gray-700/30 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-200"
              autoFocus
            />
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center px-2 py-1 rounded hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-gray-200"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            <span>Add Channel</span>
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center px-2 py-1 mt-2 rounded hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-gray-200"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
} 