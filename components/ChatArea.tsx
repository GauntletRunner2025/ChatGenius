import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from 'lucide-react';

export default function ChatArea() {
  const [messages, setMessages] = useState<{ id: number; user: string; content: string }[]>([]);

  useEffect(() => {
    fetch('/api/messages')
      .then(response => response.json())
      .then(data => setMessages(data));
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gray-100 p-4 border-b">
        <h2 className="text-xl font-semibold">#general</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(message => (
          <div key={message.id} className="mb-4">
            <span className="font-bold">{message.user}: </span>
            <span>{message.content}</span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <form className="flex items-center">
          <Input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1 mr-2"
          />
          <Button type="submit">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

