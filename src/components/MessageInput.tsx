import { 
  useState, 
  type FormEvent, 
  useMessageStore, 
  useAuth, 
  PaperAirplaneIcon,
  type MessageInputProps 
} from '../imports/components/chat/input.imports';
import styles from '../styles/modules/MessageInput.module.css';

const PLACEHOLDER_TEXT = "Type your message...";

export function MessageInput({ channelId }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const { sendMessage } = useMessageStore();
  const { user } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    try {
      await sendMessage(channelId, message.trim(), user.id);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.container}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={PLACEHOLDER_TEXT}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className={styles.button}
        >
          <PaperAirplaneIcon className={styles.icon} />
        </button>
      </div>
    </form>
  );
}