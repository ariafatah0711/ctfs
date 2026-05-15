'use client'

import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { SURFACE_GLASS_CARD_COMPACT_CLASS, SURFACE_INTERACTIVE_HOVER_CLASS } from '@/shared/styles'

type ProfileChallengeListItemProps = {
  title: string
  subtitle: ReactNode
  titleBadge?: ReactNode
  trailing?: ReactNode
  className?: string
}

export default function ProfileChallengeListItem({
  title,
  subtitle,
  titleBadge,
  trailing,
  className,
}: ProfileChallengeListItemProps) {
  return (
    <div
      className={cn(
        'flex min-h-[72px] flex-col justify-between gap-2.5 p-3 sm:flex-row sm:items-center',
        SURFACE_GLASS_CARD_COMPACT_CLASS,
        SURFACE_INTERACTIVE_HOVER_CLASS,
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start gap-2">
          <h3 className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {titleBadge ? <div className="shrink-0">{titleBadge}</div> : null}
        </div>

        <div className="mt-1 min-h-4 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
          {subtitle}
        </div>
      </div>

      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  )
}
