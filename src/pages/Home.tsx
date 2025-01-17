import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';

function TabPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      {children}
    </div>
  );
}

export default function Home() {
  const tabs = [
    { name: 'Chat', content: 'Chat content will go here' },
    { name: 'Files', content: 'Files content will go here' },
    { name: 'Search', content: 'Search content will go here' },
  ];

  return (
    <MainLayout>
      <div className="h-full">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-4">
            {tabs.map((tab) => (
              <Tab.Panel
                key={tab.name}
                className={clsx(
                  'rounded-xl bg-white p-3',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                )}
              >
                <TabPanel>{tab.content}</TabPanel>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </MainLayout>
  );
} 