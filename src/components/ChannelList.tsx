import { useEffect, useState, FormEvent } from 'react';
import { useChannelStore } from '../stores/channelStore';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const LOADING_CHANNELS_TEXT = "Loading channels...";
const JOINED_CHANNELS_TEXT = "Joined Channels";
const AVAILABLE_CHANNELS_TEXT = "Available Channels";
const ENTER_CHANNEL_NAME_PLACEHOLDER = "Enter channel name";
const ADD_CHANNEL_TEXT = "Add Channel";
const SIGN_OUT_TEXT = "Sign Out";
const FAILED_TO_SIGN_OUT_ERROR = "Failed to sign out:";
const FAILED_TO_CREATE_CHANNEL_ERROR = "Failed to create channel:";
const FAILED_TO_JOIN_CHANNEL_ERROR = "Failed to join channel:";
const FAILED_TO_LEAVE_CHANNEL_ERROR = "Failed to leave channel:";

const LOADING_CLASS = "px-2 py-4 text-gray-400";
const CONTAINER_CLASS = "flex flex-col h-full";
const FLEX_1_CLASS = "flex-1";
const ERROR_CLASS = "px-3 py-2 mx-2 my-2 text-sm text-red-400 bg-red-900/20 rounded";
const SECTION_TITLE_CLASS = "px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider";
const CHANNEL_ITEM_CLASS = "w-full flex items-center h-8 px-3 hover:bg-gray-700/50 transition-colors text-left cursor-pointer";
const SELECTED_CHANNEL_CLASS = "bg-gray-700/50";
const LEAVE_BUTTON_CLASS = "mr-2 text-xs text-gray-400 hover:text-red-400 transition-opacity";
const CHANNEL_NAME_CLASS = "truncate text-sm text-gray-200";
const AVAILABLE_CHANNEL_ITEM_CLASS = "w-full flex items-center h-8 px-3 hover:bg-gray-700/50 transition-colors text-left text-gray-400 cursor-pointer";
const FORM_CLASS = "px-2";
const INPUT_CLASS = "w-full px-2 py-1 text-sm bg-gray-700/30 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-200";
const ADD_BUTTON_CLASS = "w-full flex items-center px-2 py-1 rounded hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-gray-200";
const SIGN_OUT_BUTTON_CLASS = "w-full flex items-center px-2 py-1 mt-2 rounded hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-gray-200";
const BORDER_TOP_CLASS = "mt-4 border-t border-gray-700/50 pt-4";

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
      console.error(FAILED_TO_SIGN_OUT_ERROR, error);
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
      console.error(FAILED_TO_CREATE_CHANNEL_ERROR, error);
    }
  };

  const handleChannelSelect = async (channel: any) => {
    if (!isJoined(channel.id)) {
      try {
        await joinChannel(channel.id);
      } catch (error) {
        console.error(FAILED_TO_JOIN_CHANNEL_ERROR, error);
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
      console.error(FAILED_TO_LEAVE_CHANNEL_ERROR, error);
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
      <div className={LOADING_CLASS}>
        {LOADING_CHANNELS_TEXT}
      </div>
    );
  }

  return (
    <div className={CONTAINER_CLASS}>
      <div className={FLEX_1_CLASS}>
        {(error || createError) && (
          <div className={ERROR_CLASS}>
            {error || createError}
          </div>
        )}
        
        <div className="mb-2">
          <h3 className={SECTION_TITLE_CLASS}>{JOINED_CHANNELS_TEXT}</h3>
          <div className="space-y-0.5">
            {channels.filter(channel => isJoined(channel.id)).map((channel) => (
              <div
                key={channel.id}
                onClick={() => handleChannelSelect(channel)}
                className={clsx(
                  CHANNEL_ITEM_CLASS,
                  selectedChannel?.id === channel.id ? SELECTED_CHANNEL_CLASS : ''
                )}
              >
                <button
                  onClick={(e) => handleLeaveChannel(e, channel.id)}
                  className={LEAVE_BUTTON_CLASS}
                >
                  -
                </button>
                <span className={CHANNEL_NAME_CLASS}># {padChannelName(channel.slug)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className={SECTION_TITLE_CLASS}>{AVAILABLE_CHANNELS_TEXT}</h3>
          <div className="space-y-0.5">
            {channels.filter(channel => !isJoined(channel.id)).map((channel) => (
              <div
                key={channel.id}
                onClick={() => handleChannelSelect(channel)}
                className={AVAILABLE_CHANNEL_ITEM_CLASS}
              >
                <span className="truncate text-sm"># {channel.slug.slice(0, 20)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={BORDER_TOP_CLASS}>
        {isCreating ? (
          <form onSubmit={handleCreateChannel} className={FORM_CLASS}>
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder={ENTER_CHANNEL_NAME_PLACEHOLDER}
              className={INPUT_CLASS}
              autoFocus
            />
          </form>
        ) : (
          <button
            onClick={() => {
              setIsCreating(true);
              setCreateError(null);
            }}
            className={ADD_BUTTON_CLASS}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            <span>{ADD_CHANNEL_TEXT}</span>
          </button>
        )}

        <button
          onClick={handleLogout}
          className={SIGN_OUT_BUTTON_CLASS}
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          <span>{SIGN_OUT_TEXT}</span>
        </button>
      </div>
    </div>
  );
}