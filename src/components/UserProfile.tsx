"use client"

import Navbar from '@/components/Navbar'
import { ChallengeWithSolve } from '@/types'
import { getFirstBloodChallengeIds } from '@/lib/challenges'
import { useEffect, useState } from 'react'
import { getUserDetail, getCategoryTotals } from '@/lib/users'
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type UserDetail = {
  id: string
  username: string
  rank: number | null
  solved_challenges: ChallengeWithSolve[]
}

type Props = {
  userId: string | null
  loading: boolean
  error?: string | null
  onBack?: () => void
  isCurrentUser?: boolean
}

export default function UserProfile({
  userId,
  loading,
  error,
  onBack,
  isCurrentUser = false,
}: Props) {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [firstBloodIds, setFirstBloodIds] = useState<string[]>([])
  const [categoryTotals, setCategoryTotals] = useState<{ category: string; total_challenges: number }[]>([])
  const [loadingDetail, setLoadingDetail] = useState<boolean>(true)

  useEffect(() => {
    const fetchDetail = async () => {
      if (userId) {
        setLoadingDetail(true)
        const detail = await getUserDetail(userId)
        setUserDetail(detail)

        if (detail) {
          const firstBlood = await getFirstBloodChallengeIds(detail.id)
          setFirstBloodIds(firstBlood)

          const totals = await getCategoryTotals()
          setCategoryTotals(totals)
          console.log(totals)
        }
        setLoadingDetail(false)
      }
    }
    fetchDetail()
  }, [userId])

  if (loading || loadingDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !userDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-16 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-400">❌</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'User not found'}
          </h3>
          <p className="text-gray-500 mb-6">
            {isCurrentUser
              ? 'Failed to load your profile.'
              : "The user you are looking for doesn’t exist or has been removed."}
          </p>
          {onBack && <Button onClick={onBack}>Go Back</Button>}
        </div>
      </div>
    )
  }

  const solvedChallenges = userDetail.solved_challenges || []
  const categories = Array.from(new Set(solvedChallenges.filter(c => c.is_solved).map(c => c.category)))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Button */}
        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            className="flex items-center space-x-2"
          >
            ← Back
          </Button>
        )}

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardContent className="flex items-center space-x-6 py-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-2xl font-bold">
                  {userDetail.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{userDetail.username}</h1>
              </div>
              {isCurrentUser && (
                <Button variant="outline">Edit Profile</Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Rank</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">🏅</div>
              <p className="text-2xl font-bold text-gray-900">
                {userDetail.rank === 0 ? '0' : `#${userDetail.rank}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Solved</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">✓</div>
              <p className="text-2xl font-bold text-gray-900">{solvedChallenges.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>First Bloods</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">🩸</div>
              <p className="text-2xl font-bold text-gray-900">{firstBloodIds.length}</p>
            </CardContent>
          </Card>
        </motion.div>

      {/* Category Progress */}
      {categoryTotals.map(({ category, total_challenges }) => {
        const solvedInCategory = solvedChallenges.filter(c => c.category === category)
        if (solvedInCategory.length === 0) return null // <- skip kalau user belum solve

        const progress =
          total_challenges > 0
            ? (solvedInCategory.length / total_challenges) * 100
            : 0

        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">{category}</span>
              <span className="text-sm text-gray-500">
                {solvedInCategory.length}/{total_challenges}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="bg-blue-600 h-2 rounded-full"
              />
            </div>
          </div>
        )
      })}

        {/* Recent Solved Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Solved Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              {solvedChallenges.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No solved challenges yet
                </div>
              ) : (
                <div className="space-y-3">
                  {solvedChallenges.slice(0, 10).map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {challenge.title}
                          {firstBloodIds.includes(challenge.id) && (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">
                              First Blood
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {challenge.category} • {challenge.difficulty}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        +{challenge.points}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
