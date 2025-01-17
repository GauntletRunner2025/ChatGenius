import { useEffect, useState, FormEvent } from 'react';
import { useChannelStore } from '../../stores/channelStore';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function ChannelList() {
  const { 
    channels, 
    selectedChannel, 
    loading, 
    error, 
    fetchChannels, 
    selectChannel, 
    createChannel,
    joinChannel,
    leaveChannel,
    isJoined,
    fetchJoinedChannels
  } = useChannelStore();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [newChannelName, setNewChannelName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchChannels();
      fetchJoinedChannels();
    }
  }, [fetchChannels, fetchJoinedChannels, user]);

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
      setCreateError(null);
      await createChannel(newChannelName.trim(), user.id);
      setNewChannelName('');
      setIsCreating(false);
    } catch (error) {
      setCreateError((error as Error).message);
      console.error('Failed to create channel:', error);
    }
  };

  const handleChannelSelect = async (channel: any) => {
    if (!isJoined(channel.id)) {
      try {
        await joinChannel(channel.id);
      } catch (error) {
        console.error('Failed to join channel:', error);
        return;
      }
    }
    selectChannel(channel);
    navigate('/main');
  };

  const handleLeaveChannel = async (e: React.MouseEvent, channelId: number) => {
    e.stopPropagation();
    try {
      await leaveChannel(channelId);
    } catch (error) {
      console.error('Failed to leave channel:', error);
    }
  };

  const padChannelName = (name: string) => {
    return name.length >= 20 ? name.slice(0, 20) : name.padEnd(20);
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {(error || createError) && (
          <div className="px-3 py-2 mx-2 my-2 text-sm text-red-400 bg-red-900/20 rounded">
            {error || createError}
          </div>
        )}
        
        <div className="mb-2">
          <h3 className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined Channels</h3>
          <div className="space-y-0.5">
            {channels.filter(channel => isJoined(channel.id)).map((channel) => (
              <div
                key={channel.id}
                onClick={() => handleChannelSelect(channel)}
                className={clsx(
                  'w-full flex items-center h-8 px-3 hover:bg-gray-700/50 transition-colors text-left cursor-pointer',
                  selectedChannel?.id === channel.id ? 'bg-gray-700/50' : ''
                )}
              >
                <button
                  onClick={(e) => handleLeaveChannel(e, channel.id)}
                  className="mr-2 text-xs text-gray-400 hover:text-red-400 transition-opacity"
                >
                  -
                </button>
                <span className="truncate text-sm text-gray-200"># {padChannelName(channel.slug)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Channels</h3>
          <div className="space-y-0.5">
            {channels.filter(channel => !isJoined(channel.id)).map((channel) => (
              <div
                key={channel.id}
                onClick={() => handleChannelSelect(channel)}
                className="w-full flex items-center h-8 px-3 hover:bg-gray-700/50 transition-colors text-left text-gray-400 cursor-pointer"
              >
                <span className="truncate text-sm"># {channel.slug.slice(0, 20)}</span>
              </div>
            ))}
          </div>
        </div>
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
            onClick={() => {
              setIsCreating(true);
              setCreateError(null);
            }}
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