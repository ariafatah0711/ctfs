import React from 'react'
import { cn } from '@/shared/lib/utils'

type SegmentedTabsVariant = 'pill' | 'panel' | 'panelLarge' | 'compact'

type SegmentedTabsItem<T extends string> = {
  value: T
  label: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}

type SegmentedTabsProps<T extends string> = {
  items: SegmentedTabsItem<T>[]
  value: T
  onChange: (value: T) => void
  variant?: SegmentedTabsVariant
  className?: string
  stretch?: boolean
}

const containerClasses: Record<SegmentedTabsVariant, string> = {
  pill:
    'inline-flex rounded-full border border-gray-200 bg-white/50 p-1 backdrop-blur dark:border-white/10 dark:bg-gray-800/50',
  panel:
    'flex w-fit gap-1 rounded-xl border border-gray-200 bg-white/40 p-1.5 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/40',
  panelLarge:
    'flex gap-1 rounded-2xl border border-gray-200 bg-white/40 p-1 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/40',
  compact:
    'flex gap-1 rounded-xl border border-gray-200 bg-black/5 p-1 dark:border-gray-800 dark:bg-white/5',
}

const buttonClasses: Record<SegmentedTabsVariant, string> = {
  pill:
    'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
  panel:
    'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold transition-all',
  panelLarge:
    'flex items-center gap-2 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300',
  compact:
    'rounded-lg px-3 py-1.5 text-center text-xs font-bold transition-all',
}

const activeClasses: Record<SegmentedTabsVariant, string> = {
  pill:
    'bg-blue-500/20 text-blue-600 shadow-[0_0_18px_rgba(59,130,246,0.12)] dark:text-blue-400',
  panel:
    'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400',
  panelLarge:
    'bg-white text-blue-600 shadow-lg shadow-blue-500/10 dark:bg-gray-800 dark:text-blue-400',
  compact:
    'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400',
}

const inactiveClasses: Record<SegmentedTabsVariant, string> = {
  pill:
    'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400',
  panel:
    'text-gray-500 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200',
  panelLarge:
    'text-gray-500 hover:bg-white/50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200',
  compact:
    'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
}

const activeIconClasses: Partial<Record<SegmentedTabsVariant, string>> = {
  panel: 'animate-pulse',
  panelLarge: 'animate-pulse',
}

export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  variant = 'panel',
  className,
  stretch = false,
}: SegmentedTabsProps<T>) {
  return (
    <div className={cn(containerClasses[variant], className)}>
      {items.map((item) => {
        const Icon = item.icon
        const isActive = item.value === value

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              buttonClasses[variant],
              stretch && 'flex-1',
              isActive ? activeClasses[variant] : inactiveClasses[variant]
            )}
          >
            {Icon ? (
              <Icon
                className={cn(
                  variant === 'compact' ? 'h-4 w-4' : 'h-4 w-4',
                  isActive && activeIconClasses[variant]
                )}
              />
            ) : null}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
