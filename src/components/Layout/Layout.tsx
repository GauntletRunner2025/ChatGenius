import React from 'react';
import { Header } from '../Header';
import styles from './Layout.module.css';
import ChannelList from '../Channel/ChannelList';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.logo}>ChatGenius</div>
        <nav className={styles.navigation}>
          <ChannelList />
        </nav>
      </div>
      <div className={styles.main}>
        <Header />
        {children}
      </div>
    </div>
  );
}
