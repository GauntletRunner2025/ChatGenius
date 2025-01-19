import React, { useEffect, useState } from 'react';
import { fetchDirectMessages, sendDirectMessage, supabase } from '../supabase';
import { useParams } from 'react-router-dom';

const DirectMessages: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const loadMessages = async () => {
      const data = await fetchDirectMessages(userId!);
      setMessages(data);
    };

    loadMessages();
  }, [userId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const { data: { user } } = await supabase.auth.getUser();
    const sender = user?.id;
    if (!sender) return;

    await sendDirectMessage(sender, userId!, newMessage);
    setNewMessage('');
    const data = await fetchDirectMessages(userId!);
    setMessages(data);
  };

  return (
    <div>
      <h2>Direct Messages</h2>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.sender === userId ? 'You' : 'Them'}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default DirectMessages;
