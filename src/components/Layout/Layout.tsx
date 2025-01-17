import React from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          ChatGenius
        </div>
        <nav className={styles.navigation}>
          {/* Navigation items will go here */}
        </nav>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};
