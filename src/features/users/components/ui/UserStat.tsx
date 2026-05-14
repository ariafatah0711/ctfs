import type React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type UserStatProps = {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  detail?: React.ReactNode
  onClick?: () => void
  className?: string
}

export function UserStat({ icon: Icon, label, value, detail, onClick, className }: UserStatProps) {
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group flex min-h-[72px] w-full items-center gap-3 rounded-xl border border-gray-200 bg-white/40 p-3 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/50 hover:bg-white/80 hover:shadow-[0_10px_20px_rgba(59,130,246,0.1)] dark:border-white/10 dark:bg-gray-900/40 dark:hover:bg-gray-800/80 sm:min-h-[84px]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20 transition-transform duration-300 group-hover:scale-105 dark:text-blue-400 sm:h-10 sm:w-10 sm:rounded-xl">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-2xl">
          {value}
        </div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </div>
        {detail && (
          <div className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
            {detail}
          </div>
        )}
      </div>
    </Component>
  )
}
