'use client'

import React from 'react'
import { cn } from '@/shared/lib/utils'
import { SURFACE_GLASS_CARD_COMPACT_CLASS, SURFACE_INTERACTIVE_HOVER_CLASS } from '@/shared/styles'

type UserCardProps = {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function UserCard({ children, className, hover = true }: UserCardProps) {
  return (
    <div
      className={cn(
        SURFACE_GLASS_CARD_COMPACT_CLASS,
        hover && SURFACE_INTERACTIVE_HOVER_CLASS,
        className
      )}
    >
      {children}
    </div>
  )
}
