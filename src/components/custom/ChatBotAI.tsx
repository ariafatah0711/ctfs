'use client'

import { useChat } from '@/contexts/ChatContext'

export default function ChatBotAI() {
  const { open, setOpen } = useChat()
  const dataId = 'cmjuh1zfq0001ie04t5e6zu7d'

  return (
    <div
      role="dialog"
      aria-hidden={!open}
      className={`fixed z-50 bottom-0 left-0 w-full h-[55vh] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-xl overflow-hidden transition-transform duration-200 ease-in-out
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
  )
}
