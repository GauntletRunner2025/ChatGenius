import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from 'lucide-react'

const messages = [
  { id: 1, user: 'Alice', content: 'Hey everyone!' },
  { id: 2, user: 'Bob', content: 'Hi Alice, how are you?' },
  { id: 3, user: 'Charlie', content: 'Hello there!' },
]

export default function ChatArea() {
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
  )
}

