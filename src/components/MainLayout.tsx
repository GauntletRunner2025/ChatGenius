import React from 'react';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 