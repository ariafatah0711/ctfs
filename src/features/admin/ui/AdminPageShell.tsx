'use client'

import React from 'react'
import { cn } from '@/shared/lib/utils'

interface AdminPageShellProps {
  children: React.ReactNode
  mainClassName?: string
  backButtonClassName?: string
}

const AdminPageShell = ({
  children,
  mainClassName = '',
  backButtonClassName = '',
}: AdminPageShellProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <main
        className={cn(
          'mx-auto w-full max-w-7xl flex-1 px-4 py-3 sm:px-6 sm:py-4 lg:px-8',
          mainClassName
        )}
      >
        {children}
      </main>
    </div>
  )
}

export default AdminPageShell
