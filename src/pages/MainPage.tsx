import React from 'react';
import { MainContent } from '../components/MainContent';
import styles from '../styles/modules/MainPage.module.css';

const MainPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <MainContent />
    </div>
  );
};

export default MainPage; 