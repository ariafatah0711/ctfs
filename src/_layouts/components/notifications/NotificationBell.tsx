'use client'

import React from 'react'
import { Bell } from 'lucide-react'

type NotificationBellProps = {
  notifButtonRef: React.RefObject<HTMLButtonElement>
  notifOpen: boolean
  theme: string
  unreadCount: number
  onToggle: () => void
}

export default function NotificationBell({
  notifButtonRef,
  notifOpen,
  theme,
  unreadCount,
  onToggle,
}: NotificationBellProps) {
  return (
    <div className="relative mr-2" data-tour="navbar-notifications">
      <button
        ref={notifButtonRef}
        className={`rounded-full p-1 transition-colors duration-150 ${notifOpen ? (theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100') : ''}`}
        title="Notifications"
        aria-label="Notifications"
        onClick={onToggle}
      >
        <Bell size={22} className="text-blue-500" />
      </button>

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold bg-red-600 text-white">
          {unreadCount > 99 ? '99+' : String(unreadCount)}
        </span>
      )}
    </div>
  )
}
