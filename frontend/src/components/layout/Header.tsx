import { Bell } from 'lucide-react'
import { useWSStore } from '@/stores/websocket'

export default function Header() {
  const wsConnected = useWSStore((s) => s.connected)

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Real-time inventory management</span>
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            wsConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
          title={wsConnected ? 'Connected' : 'Disconnected'}
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            0
          </span>
        </button>
      </div>
    </header>
  )
}
