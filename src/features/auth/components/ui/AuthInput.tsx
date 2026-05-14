import React, { forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { SURFACE_GLASS_INPUT_CLASS } from '@/shared/styles'

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
          <Icon className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400" />
          <input
            ref={ref}
            className={cn(
              SURFACE_GLASS_INPUT_CLASS,
              'relative z-0 px-11',
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
