'use client'

import React from 'react'
import { MarkdownRenderer } from '@/shared/components/MarkdownRenderer'
import { formatRelativeDate } from '@/shared/lib/utils'

type NotificationItemProps = {
  notification: {
    id: string
    title: string
    message: string
    level: string
    created_at: string
  }
  isRead: boolean
  theme: string
  globalAdminStatus: boolean
  getLevelBadgeClass: (level: string) => string
  onDelete: (id: string) => void
}

export default function NotificationItem({
  notification,
  isRead,
  theme,
  globalAdminStatus,
  getLevelBadgeClass,
  onDelete,
}: NotificationItemProps) {
  return (
    <div
      className={`group relative px-3 py-2.5 rounded-lg transition-all duration-150 flex flex-col gap-1
        ${!isRead
          ? 'bg-blue-500/[0.03] dark:bg-blue-400/[0.03] border-l-2 border-blue-500'
          : 'border-l-2 border-transparent hover:bg-blue-500/5 dark:hover:bg-blue-400/10'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col min-w-0 flex-1 gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} leading-tight`} title={notification.title}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-1.5">
              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${getLevelBadgeClass(notification.level)}`}>
                {notification.level.replace('info_', '')}
              </span>
              {!isRead && (
                <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  New
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
            <MarkdownRenderer
              content={notification.message}
              variant="compact"
              className="line-clamp-2 break-words [&_a]:text-blue-600 dark:[&_a]:text-blue-400"
            />
          </div>
        </div>

      </div>

      <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
        {notification.created_at ? formatRelativeDate(notification.created_at) : ''}
      </div>
    </div>
  )
}
