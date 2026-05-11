'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'

interface AuthCardProps {
  children: React.ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'w-full rounded-2xl border border-gray-200 bg-white/60 px-6 py-8 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(249,115,22,0.05)] dark:border-gray-800 dark:bg-[#111622]/60 sm:px-8 sm:py-10',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
