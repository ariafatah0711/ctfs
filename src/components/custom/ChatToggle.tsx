'use client'

import { MessageSquare } from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'

export default function ChatToggle() {
  const { open, setOpen } = useChat()

  return (
    <button
      data-chat-toggle="true"
      data-floating-toggle="true"
      aria-label={open ? 'Close chat' : 'Open chat'}
      onClick={() => setOpen(!open)}
      title={open ? 'Close chat' : 'Open chat'}
      className="h-12 w-12 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
    >
      <MessageSquare size={20} />
    </button>
  )
}
