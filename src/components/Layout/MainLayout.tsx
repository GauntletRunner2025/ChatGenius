import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ChannelList from '../Channel/ChannelList';
import { PlusIcon } from '@heroicons/react/24/outline';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { signOut } = useAuth();

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Left sidebar - Channels */}
      <div className="w-64 flex flex-col flex-shrink-0 bg-gray-800">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-between flex-shrink-0 px-4">
            <h1 className="text-xl font-semibold text-white">ChatGenius</h1>
            <button
              className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              onClick={() => {/* TODO: Add channel creation */}}
            >
              <PlusIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            <ChannelList />
          </nav>
          <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-md"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center panel - Tabbed view */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>

        {/* Right sidebar - Users */}
        <aside className="hidden lg:block lg:flex-shrink-0 lg:order-last">
          <div className="h-full relative flex flex-col w-64 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="flex-1 flex flex-col pt-5 pb-4">
              <div className="flex items-center flex-shrink-0 px-4">
                <h2 className="text-lg font-medium text-gray-900">Users</h2>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {/* User list will go here */}
                <div className="text-gray-600 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <div className="w-2 h-2 mr-2 rounded-full bg-green-400"></div>
                  John Doe
                </div>
              </nav>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
} 