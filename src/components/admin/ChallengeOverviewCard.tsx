import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Challenge } from '@/types'
import { motion } from 'framer-motion'

interface ChallengeOverviewCardProps {
  challenges: Challenge[]
}

const ChallengeOverviewCard: React.FC<ChallengeOverviewCardProps> = ({ challenges }) => {
  return (
    <Card className="shrink-0 bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg border bg-white dark:bg-gray-800 shadow-sm">
            <div className="text-sm text-muted-foreground dark:text-gray-300">Challenges</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{challenges.length}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-3 rounded-lg border bg-white dark:bg-gray-800 shadow-sm">
            <div className="text-sm text-muted-foreground dark:text-gray-300">Active</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{challenges.filter(c => c.is_active).length}</div>
          </motion.div>
        </div>
        <div className="mb-6">
          <div className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">By Category</div>
          <div className="space-y-2">
            {Array.from(new Set(challenges.map(c => c.category))).map(cat => {
              const count = challenges.filter(c => c.category === cat).length
              return (
                <div key={cat} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{cat}</span>
                  <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">{count}</Badge>
                </div>
              )
            })}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">By Difficulty</div>
          <div className="space-y-2">
            {["Easy", "Medium", "Hard"].map(diff => {
              const count = challenges.filter(c => c.difficulty === diff).length
              return (
                <div key={diff} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{diff}</span>
                  <Badge className={diff === "Easy" ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" : diff === "Medium" ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"}>{count}</Badge>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChallengeOverviewCard
