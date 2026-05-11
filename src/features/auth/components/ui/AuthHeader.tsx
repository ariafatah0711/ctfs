import React from 'react'

interface AuthHeaderProps {
  badge: string
  title: string
  subtitle?: string
}

export function AuthHeader({ badge, title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-600 shadow-sm shadow-orange-500/5 dark:text-orange-400">
        {badge}
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  )
}
