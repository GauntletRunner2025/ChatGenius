import React, { useEffect } from 'react';
import { useChannelStore } from '../stores/channelStore';

const Channels: React.FC = () => {
  const { channels, fetchChannels, loading, error } = useChannelStore();

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Channels</h2>
      <ul>
        {channels.map(channel => (
          <li key={channel.id}>{channel.slug}</li>
        ))}
      </ul>
    </div>
  );
};

export default Channels;