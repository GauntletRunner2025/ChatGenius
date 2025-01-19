import { React, Header } from '../imports/components/main-layout.imports';

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