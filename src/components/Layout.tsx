import React from 'react';
import ChannelList from './ChannelList';
import { UsersList } from './UsersList';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="layout">
            <ChannelList />
            {children}
            <UsersList />
        </div>
    );
};

export default Layout;