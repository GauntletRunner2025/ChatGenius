import React from 'react';
import styles from './Layout.module.css';
import ChannelList from './ChannelList';
import { UsersList } from './UsersList';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.channels}>
        <div className={styles.logo}>ChatGenius</div>
        <ChannelList />
      </div>
      <main className={styles.main}>
        {children}
      </main>
      <div className={styles.users}>
        <UsersList />
      </div>
    </div>
  );
}

// Default export for flexibility in importing
export default Layout;
