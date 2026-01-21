'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TeamChallenge } from '@/lib/teams'

interface TeamSolvesProps {
  challenges: TeamChallenge[]
  title?: string
}

export default function TeamSolves({
  challenges,
  title = 'Recent Team Solves',
}: TeamSolvesProps) {
  const [showAllSolves, setShowAllSolves] = useState(false)

  const formatDate = (value?: string | null) => {
    if (!value) return '-'
    const dt = new Date(value)
    if (Number.isNaN(dt.getTime())) return String(value)
    return dt.toLocaleString()
  }

  return (
    <>
      {/* === RECENT SOLVES === */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            {title}
          </CardTitle>

          {challenges.length > 10 && (
            <Button size="sm" variant="outline" onClick={() => setShowAllSolves(true)}>
              Show All ({challenges.length})
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {challenges.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">No solves yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Challenge</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Points</TableHead>
                  <TableHead>First Solve</TableHead>
                  <TableHead>First Solver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challenges.slice(0, 10).map((c) => (
                  <TableRow key={c.challenge_id}>
                    <TableCell className="font-medium text-gray-900 dark:text-white">{c.title}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">{c.category}</TableCell>
                    <TableCell className="text-center">{c.points}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">{formatDate(c.first_solved_at)}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{c.first_solver_username}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* === MODAL SHOW ALL === */}
      <Dialog open={showAllSolves} onOpenChange={setShowAllSolves}>
        <DialogContent
          className="max-w-4xl max-h-[80vh] overflow-hidden p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
              All Team Solves ({challenges.length})
            </DialogTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAllSolves(false)}
              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            >
              ✕
            </Button>
          </div>

          {/* Body */}
          {challenges.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">No solves yet.</div>
          ) : (
            <div className="overflow-y-auto max-h-[70vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Challenge</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                    <TableHead>First Solve</TableHead>
                    <TableHead>First Solver</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challenges.map((c) => (
                    <TableRow key={c.challenge_id}>
                      <TableCell className="font-medium text-gray-900 dark:text-white">{c.title}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">{c.category}</TableCell>
                      <TableCell className="text-center">{c.points}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">{formatDate(c.first_solved_at)}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{c.first_solver_username}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
