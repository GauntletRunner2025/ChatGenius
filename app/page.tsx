import LeftSidebar from '@/components/LeftSidebar'
import ChatArea from '@/components/ChatArea'
import RightSidebar from '@/components/RightSidebar'

export default function Home() {
  return (
    <div className="flex h-screen">
      <LeftSidebar />
      <ChatArea />
      <RightSidebar />
    </div>
  )
}

