import { React, ChannelList, UsersList } from '../imports/components/layout.imports';
import styles from './Layout.module.css';

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
