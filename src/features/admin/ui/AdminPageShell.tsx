'use client'

import React from 'react'

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
      <main className={`flex-1 ${mainClassName}`}>{children}</main>
    </div>
  )
}

export default AdminPageShell
