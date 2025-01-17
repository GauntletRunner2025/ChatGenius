import React from 'react';
import { Header } from '../Header';
import styles from './Layout.module.css';
import ChannelList from '../Channel/ChannelList';
import { UsersList } from '../UsersList';

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
