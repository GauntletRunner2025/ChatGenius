import {
    React,
    useEffect,
    useState,
    useChannelStore,
    useAuth,
    ArrowRightOnRectangleIcon,
    PlusIcon,
    useNavigate,
    clsx,
    type FormEvent,
    type MouseEvent
} from '../imports/components/channel-list.imports';
import styles from '../styles/modules/ChannelList.module.css';

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

export function ChannelList() {
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

  const handleLeaveChannel = async (e: MouseEvent, channelId: number) => {
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
      <div className={styles.loading}>
        {LOADING_CHANNELS_TEXT}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.flex1}>
        {(error || createError) && (
          <div className={styles.error}>
            {error || createError}
          </div>
        )}
        
        <div className="mb-2">
          <h3 className={styles.sectionTitle}>{JOINED_CHANNELS_TEXT}</h3>
          <div className="space-y-0.5">
            {channels.filter(channel => isJoined(channel.id)).map((channel) => (
              <div
                key={channel.id}
                onClick={() => handleChannelSelect(channel)}
                className={clsx(
                  styles.channelItem,
                  selectedChannel?.id === channel.id ? styles.selectedChannel : ''
                )}
              >
                <button
                  onClick={(e) => handleLeaveChannel(e, channel.id)}
                  className={styles.leaveButton}
                >
                  -
                </button>
                <span className={styles.channelName}># {padChannelName(channel.slug)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className={styles.sectionTitle}>{AVAILABLE_CHANNELS_TEXT}</h3>
          <div className="space-y-0.5">
            {channels.filter(channel => !isJoined(channel.id)).map((channel) => (
              <div
                key={channel.id}
                onClick={() => handleChannelSelect(channel)}
                className={styles.availableChannelItem}
              >
                <span className="truncate text-sm"># {channel.slug.slice(0, 20)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.borderTop}>
        {isCreating ? (
          <form onSubmit={handleCreateChannel} className={styles.form}>
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder={ENTER_CHANNEL_NAME_PLACEHOLDER}
              className={styles.input}
              autoFocus
            />
          </form>
        ) : (
          <button
            onClick={() => {
              setIsCreating(true);
              setCreateError(null);
            }}
            className={styles.addButton}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            <span>{ADD_CHANNEL_TEXT}</span>
          </button>
        )}

        <button
          onClick={handleLogout}
          className={styles.signOutButton}
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          <span>{SIGN_OUT_TEXT}</span>
        </button>
      </div>
    </div>
  );
}