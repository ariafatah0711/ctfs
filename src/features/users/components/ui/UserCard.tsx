'use client'

import React from 'react'
import { cn } from '@/shared/lib/utils'

type UserCardProps = {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function UserCard({ children, className, hover = true }: UserCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white/40 backdrop-blur-sm transition-all duration-200 dark:border-gray-800 dark:bg-gray-900/40',
        hover && 'hover:border-blue-500/50 hover:bg-white/80 hover:shadow-[0_10px_20px_rgba(59,130,246,0.1)] dark:hover:bg-gray-800/80',
        className
      )}
    >
      {children}
    </div>
  )
}
