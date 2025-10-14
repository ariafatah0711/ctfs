import React from 'react'
import { formatRelativeDate } from '@/lib/utils'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Solver {
  solve_id: string
  username: string
  challenge_title: string
  solved_at: string
}

interface RecentSolversListProps {
  solvers: Solver[]
  onViewAll: () => void
}

const RecentSolversList: React.FC<RecentSolversListProps> = ({ solvers, onViewAll }) => {
  return (
    <Card className="flex-1 flex flex-col bg-white dark:bg-gray-800 min-h-[180px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-900 dark:text-white">Recent Solvers</CardTitle>
        <Button variant="default" size="sm" onClick={onViewAll}>View All</Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto min-h-[140px]">
        {solvers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 dark:text-gray-300 text-sm">No solvers yet</div>
          </div>
        ) : (
          <div className="space-y-2">
            {solvers.slice(0, 15).map(s => (
                <div key={s.solve_id} className="flex items-center justify-between border-b dark:border-gray-700 pb-1">
                  <div>
                    <Link href={`/user/${encodeURIComponent(s.username)}`} className="font-medium text-blue-600 dark:text-blue-300 hover:underline" title={s.username}>
                      {s.username.length > 12 ? `${s.username.slice(0, 12)}...` : s.username}
                    </Link>
                    <span className="text-xs text-gray-500 dark:text-gray-300"> solved </span>
                    <span className="text-xs text-gray-700 dark:text-gray-200">{s.challenge_title}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-300">
                    {formatRelativeDate(s.solved_at)}
                  </span>
                </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentSolversList
