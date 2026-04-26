import { motion } from 'framer-motion'

const ScoreboardEmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
    >
      <span className="text-4xl text-gray-400 dark:text-gray-500">🎯</span>
    </motion.div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No challenges solved yet.
    </h3>
    <p className="text-gray-500 dark:text-gray-300 text-sm sm:text-base">
      Leaderboard is empty!<br />
      Be the first to solve a challenge 🚀
    </p>
  </div>
)

export default ScoreboardEmptyState
