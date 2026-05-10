'use client'

import { Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/shared/ui'

type MainEventCardProps = {
  label: string
  imageUrl: string | null
  selected: boolean
  delay: number
  onSelect: () => void
}

export default function MainEventCard({
  label,
  imageUrl,
  selected,
  delay,
  onSelect,
}: MainEventCardProps) {
  return (
    <motion.button
      key="__main__"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      onClick={onSelect}
      className="h-full text-left transition transform group bg-transparent p-0 border-none shadow-none"
    >
      <Card
        className={`h-full flex flex-col overflow-hidden transition-all duration-200 ${selected
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-600 dark:border-emerald-400 ring-2 ring-emerald-600 dark:ring-emerald-400'
            : 'bg-white dark:bg-gray-800 hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-400'
          } group-hover:scale-[1.025] group-hover:-translate-y-1 group-hover:shadow-2xl`}
      >
        {imageUrl ? (
          <div className="h-72 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <img
              src={imageUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-72 w-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-300">
            No image
          </div>
        )}

        <div className="flex-1 p-4 flex flex-col">
          <div className="mb-3">
            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              {label}
            </h4>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              Active
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
            Default challenges dari platform ini.
          </p>

          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Always available</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.button>
  )
}
