import { Link, useAuth, UserCircleIcon } from '../imports/components/header.imports';
import styles from './Header.module.css';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>ChatGenius</h1>
        {user && (
          <Link
            to="/profile"
            className={styles.link}
          >
            <UserCircleIcon className={styles.icon} />
            <span>Profile</span>
          </Link>
        )}
      </div>
    </header>
  );
};