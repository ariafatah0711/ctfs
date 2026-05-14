import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import {
  THEME_PRIMARY_BG_CLASS,
  THEME_PRIMARY_BG_HOVER_CLASS,
  THEME_PRIMARY_SHADOW_CLASS,
} from '@/shared/styles'

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  loading?: boolean
}

export function AuthButton({ children, loading, className = '', disabled, ...props }: AuthButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        `relative flex w-full items-center justify-center overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 ${THEME_PRIMARY_SHADOW_CLASS}`,
        className
      )}
    >
      <div className={`absolute inset-0 transition-colors ${THEME_PRIMARY_BG_CLASS} ${THEME_PRIMARY_BG_HOVER_CLASS}`} />
      <div className="absolute inset-0 opacity-0 transition-opacity duration-200 hover:opacity-20 bg-white" />

      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          children
        )}
      </span>
    </button>
  )
}
