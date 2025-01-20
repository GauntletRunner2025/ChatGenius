import React, { useEffect, useState } from 'react';
import { fetchDirectMessages, sendDirectMessage, supabase } from '../supabase';
import { useParams } from 'react-router-dom';
import styles from '../styles/modules/DirectMessages.module.css';

interface Message {
  id: string;
  sender: string;
  message: string;
}

const DirectMessages: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!userId) return;
      const data = await fetchDirectMessages(userId);
      setMessages(data);
    };

    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
    };

    getCurrentUser();
    loadMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel(`direct_messages:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'direct_messages',
        filter: `sender=eq.${userId} OR receiver=eq.${userId}`
      }, () => {
        loadMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !userId) return;

    try {
      await sendDirectMessage(currentUser, userId, newMessage.trim());
      setNewMessage('');
      const data = await fetchDirectMessages(userId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Direct Messages</h2>
      </div>
      <div className={styles.messagesContainer}>
        {messages.map((msg) => {
          const isOwnMessage = msg.sender === currentUser;
          return (
            <div
              key={msg.id}
              className={`${styles.message} ${isOwnMessage ? styles.messageOwn : ''}`}
            >
              <div className={`${styles.messageContent} ${isOwnMessage ? styles.messageContentOwn : ''}`}>
                <div className={`${styles.sender} ${isOwnMessage ? styles.senderOwn : ''}`}>
                  {isOwnMessage ? 'You' : 'Them'}
                </div>
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className={styles.input}
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className={styles.button}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default DirectMessages;
