"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';

const directMessages = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];

export default function LeftSidebar() {
  const [channels, setChannels] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/channels')
      .then(response => response.json())
      .then(data => setChannels(data));
  }, []);

  return (
    <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
      <h1 className="text-xl font-bold mb-4">Slack Clone</h1>
      
      <div className="mb-4">
        <h2 className="text-sm font-semibold mb-2 flex justify-between items-center">
          Channels
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </h2>
        <ul>
          {channels.map(channel => (
            <li key={channel.id} className="mb-1">
              <Button variant="ghost" className="w-full justify-start">
                # {channel.name}
              </Button>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h2 className="text-sm font-semibold mb-2 flex justify-between items-center">
          Direct Messages
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </h2>
        <ul>
          {directMessages.map(dm => (
            <li key={dm.id} className="mb-1">
              <Button variant="ghost" className="w-full justify-start">
                ● {dm.name}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

