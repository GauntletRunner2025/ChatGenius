import React from 'react';
import Layout from '../components/Layout';
import Channels from '../components/Channels';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Home</h1>
      <Channels />
      <Layout />
    </div>
  );
};

export default Home;