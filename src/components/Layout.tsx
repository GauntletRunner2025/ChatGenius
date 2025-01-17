
import React from 'react';
import ChannelList from './ChannelList';
import MainContent from './MainContent';
import UsersList from './UsersList';

const Layout: React.FC = () => {
    return (
        <div className="layout">
            <ChannelList />
            <MainContent />
            <UsersList />
        </div>
    );
};

export default Layout;