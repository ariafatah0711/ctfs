'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'

export default function ChatToggle() {
  const [open, setOpen] = useState(false)
  const dataId = 'cmjuh1zfq0001ie04t5e6zu7d'

  return (
    <>
      {/* panel placed above the button in toolbar stack */}
      {/* panel is always mounted to avoid iframe reload on toggle; visibility controlled by classes */}
      <div
        role="dialog"
        aria-hidden={!open}
        className={`fixed z-10 bottom-0 left-0 w-full h-[50vh] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-xl overflow-hidden transition-transform duration-200 ease-in-out
          sm:bottom-6 sm:left-24 sm:w-[360px] sm:h-auto sm:rounded-2xl
          ${open ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-4 opacity-0 pointer-events-none'}`}
      >
        <div className="flex items-center justify-between p-2 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 pl-2">
            <span className="font-semibold">Chat</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">AI assistant</span>
          </div>
          <div className="pr-2">
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-red-500">✕</button>
          </div>
        </div>

        <div className="h-[calc(100%-48px)] sm:h-auto">
          <iframe
            src={`https://app.livechatai.com/aibot-iframe/${dataId}`}
            width="100%"
            allow="microphone"
            title="AI Chat"
            className="block w-full h-full sm:h-[520px]"
          />
        </div>
      </div>

      {/* button placed inside toolbar stack */}
      <div>
        <button
          data-chat-toggle="true"
          data-floating-toggle="true"
          aria-label={open ? 'Close chat' : 'Open chat'}
          onClick={() => setOpen(s => !s)}
          title={open ? 'Close chat' : 'Open chat'}
          className="h-12 w-12 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <MessageSquare size={20} />
        </button>
      </div>
    </>
  )
}
