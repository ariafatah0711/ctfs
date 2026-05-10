'use client'

import { motion } from 'framer-motion'

type AllEventsButtonProps = {
  selected: boolean
  mainLabel: string
  onSelect: () => void
}

export default function AllEventsButton({
  selected,
  mainLabel,
  onSelect,
}: AllEventsButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`w-full p-4 rounded-lg border-2 transition ${selected
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400'
        }`}
    >
      <div className="text-left">
        <div className="font-bold text-blue-700 dark:text-blue-300">ALL Events</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Show all challenges from all events (Exclude - Intro Category that are not {mainLabel}, and Challenge have Event Ended)</div>
      </div>
    </motion.button>
  )
}
