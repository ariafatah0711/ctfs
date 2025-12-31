'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'

export default function ChatToggle() {
  const [open, setOpen] = useState(false)
  const dataId = 'cmjuh1zfq0001ie04t5e6zu7d'

  return (
    <>
      {/* panel placed above the button in toolbar stack */}
      {open && (
        <div className="fixed bottom-6 left-24 z-10 w-[360px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 pl-2">
              <span className="font-semibold">Chat</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">AI assistant</span>
            </div>
            <div className="pr-2">
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-red-500">✕</button>
            </div>
          </div>

          <iframe
            src={`https://app.livechatai.com/aibot-iframe/${dataId}`}
            width="100%"
            height={520}
            allow="microphone"
            title="AI Chat"
            className="block"
          />
        </div>
      )}

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
