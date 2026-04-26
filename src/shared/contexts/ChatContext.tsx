'use client'

import { createContext, useContext, useState } from 'react'

interface ChatContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <ChatContext.Provider value={{ open, setOpen }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
