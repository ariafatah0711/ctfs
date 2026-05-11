'use client'

import React from 'react'
import { motion } from 'framer-motion'
import APP from '@/config'
import { cn } from '@/shared/lib/utils'

interface AuthPageShellProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function AuthPageShell({ children, className, contentClassName }: AuthPageShellProps) {
  const watermarkSrc = APP.nxctf?.nxctf_logo || APP.image_logo

  return (
    <div
      className={cn(
        'relative flex min-h-[calc(100vh-3.5rem)] flex-col overflow-hidden bg-[#fafafa] text-gray-900 selection:bg-orange-500/30 dark:bg-[#0b0f19] dark:text-gray-100',
        className
      )}
    >
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>

      {watermarkSrc && (
        <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.02]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={watermarkSrc}
            alt=""
            aria-hidden="true"
            className="h-auto w-[min(72vw,720px)] select-none object-contain"
          />
        </div>
      )}

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={cn(
          'relative z-10 flex flex-1 items-center justify-center px-6 py-10',
          contentClassName
        )}
      >
        {children}
      </motion.main>
    </div>
  )
}
