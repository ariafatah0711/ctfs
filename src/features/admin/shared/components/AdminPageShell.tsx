"use client"

import type { ReactNode } from 'react'
import BackButton from '@/shared/components/BackButton'
import { cn } from '@/shared/lib/utils'

interface AdminPageShellProps {
  children: ReactNode
  backHref?: string
  backLabel?: string
  className?: string
  mainClassName?: string
  backButtonClassName?: string
}

const AdminPageShell = ({
  children,
  backHref = '/admin',
  backLabel = 'Go Back',
  className,
  mainClassName,
  backButtonClassName = 'mb-4',
}: AdminPageShellProps) => {
  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', className)}>
      <main className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6', mainClassName)}>
        <div className={cn(backButtonClassName)}>
          <BackButton href={backHref} label={backLabel} />
        </div>
        {children}
      </main>
    </div>
  )
}

export default AdminPageShell
