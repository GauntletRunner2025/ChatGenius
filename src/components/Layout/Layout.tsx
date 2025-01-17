import React from 'react';
import { Header } from '../../components/Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
