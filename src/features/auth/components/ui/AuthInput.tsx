import React, { forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon
  rightElement?: React.ReactNode
  error?: string
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ icon: Icon, rightElement, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <div className="group relative">
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-orange-500" />
          <input
            ref={ref}
            className={cn(
              'h-12 w-full rounded-xl border border-gray-200 bg-white/70 px-11 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-500 focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/30 dark:border-white/10 dark:bg-white/5 dark:text-gray-100',
              rightElement && 'pr-12',
              error && 'border-red-400/60 focus:border-red-400 focus:ring-red-500/20 dark:border-red-500/50',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  }
)

AuthInput.displayName = 'AuthInput'
