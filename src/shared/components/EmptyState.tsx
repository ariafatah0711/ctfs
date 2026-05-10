'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
  containerHeight?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
  containerHeight = "py-16"
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 ${containerHeight} ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
          {icon}
        </div>
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-lg font-medium text-gray-900 dark:text-white mb-2"
      >
        {title}
      </motion.h3>
      {description && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md mx-auto"
        >
          {description}
        </motion.div>
      )}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6"
        >
          {action}
        </motion.div>
      )}
    </div>
  )
}
