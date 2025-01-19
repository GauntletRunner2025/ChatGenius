import { useState, FormEvent } from 'react';
import { useMessageStore } from '../../stores/messageStore';
import { useAuth } from '../../contexts/AuthContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface MessageInputProps {
  channelId: number;
}

const PLACEHOLDER_TEXT = "Type your message...";
const INPUT_CLASSNAME = "flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";
const BUTTON_CLASSNAME = "inline-flex items-center justify-center rounded-lg bg-indigo-500 p-2 text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50";
const FORM_CLASSNAME = "p-4 border-t";
const DIV_CLASSNAME = "flex items-center space-x-2";

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
    <form onSubmit={handleSubmit} className={FORM_CLASSNAME}>
      <div className={DIV_CLASSNAME}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={PLACEHOLDER_TEXT}
          className={INPUT_CLASSNAME}
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className={BUTTON_CLASSNAME}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}