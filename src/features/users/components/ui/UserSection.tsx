'use client'

import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { UserCard } from './UserCard'
import { cn } from '@/shared/lib/utils'

type UserSectionProps = {
  title?: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function UserSection({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  contentClassName,
}: UserSectionProps) {
  return (
    <UserCard className={className} hover={false}>
      {(title || action) && (
        <div className="flex flex-col gap-3 border-b border-gray-200/80 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div>
              {title && (
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action}
        </div>
      )}
      <div className={cn('p-5', contentClassName)}>{children}</div>
    </UserCard>
  )
}
