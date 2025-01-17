import React from 'react';
import ChannelList from '../components/Channel/ChannelList';

const MainPage: React.FC = () => {
  return (
    <div className="w-full h-full">
      <h1>Main Dashboard</h1>
      <ChannelList />
    </div>
  );
};

export default MainPage; 