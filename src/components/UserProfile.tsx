"use client"

import { ChallengeWithSolve } from '@/types'
import { getFirstBloodChallengeIds } from '@/lib/challenges'
import { useEffect, useState } from 'react'
import { getUserDetail, getCategoryTotals } from '@/lib/users'
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import EditProfileModal from './custom/EditProfileModal'
import Loader from '@/components/custom/loading'
import BackButton from './custom/BackButton'

type UserDetail = {
  id: string
  username: string
  rank: number | null
  score: number
  picture?: string | null
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
  // Modal state removed, handled in EditProfileModal

  useEffect(() => {
    const fetchDetail = async () => {
      if (!userId) return
      setLoadingDetail(true)
      try {
        const detail = await getUserDetail(userId)
        setUserDetail(detail)

        if (detail) {
          const firstBlood = await getFirstBloodChallengeIds(detail.id)
          setFirstBloodIds(firstBlood)

          const totals = await getCategoryTotals()
          setCategoryTotals(totals)
        }
      } finally {
        setLoadingDetail(false)
      }
    }
    fetchDetail()
  }, [userId])

  const isLoading = loading || loadingDetail
  const hasError = error || !userDetail
  const solvedChallenges = userDetail?.solved_challenges || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Kondisi: Loader */}
        {isLoading && (
          <Loader fullscreen color="text-orange-500" />
        )}

        {/* Kondisi: Error */}
        {!isLoading && hasError && (
          <div className="max-w-4xl mx-auto py-16 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-red-400 dark:text-red-300">❌</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {error || 'User not found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {isCurrentUser
                ? 'Failed to load your profile.'
                : "The user you are looking for doesn’t exist or has been removed."}
            </p>
            {onBack && <Button onClick={onBack}>Go Back</Button>}
          </div>
        )}

        {/* Kondisi: Data */}
        {!isLoading && !hasError && userDetail && (
          <>
            {/* Back Button */}
            {onBack && (
              <BackButton href="/admin" label="Go Back" />
            )}

            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="flex items-center space-x-6 py-6">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center overflow-hidden">
                    {userDetail.picture ? (
                      <img
                        src={userDetail.picture}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full border border-gray-200 dark:border-gray-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-blue-600 dark:text-blue-300 text-2xl font-bold">
                        {userDetail.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{userDetail.username}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-300 mt-1">Score: <span className="font-semibold text-orange-600 dark:text-orange-400">{userDetail.score}</span></p>
                  </div>
                  {isCurrentUser && userDetail && (
                    <EditProfileModal
                      userId={userDetail.id}
                      currentUsername={userDetail.username}
                      onUsernameChange={username => setUserDetail({ ...userDetail, username })}
                      triggerButtonClass="bg-blue-600 dark:bg-blue-500 text-white font-semibold hover:bg-blue-700 dark:hover:bg-blue-400 border-none shadow"
                    />
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
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Rank</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">🏅</div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userDetail.rank === 0 ? '0' : `#${userDetail.rank}`}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Solved</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">✓</div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{solvedChallenges.length}</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">First Bloods</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">🩸</div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{firstBloodIds.length}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Progress */}
            {categoryTotals.map(({ category, total_challenges }) => {
              const solvedInCategory = solvedChallenges.filter(c => c.category === category)
              if (solvedInCategory.length === 0) return null

              const progress =
                total_challenges > 0
                  ? (solvedInCategory.length / total_challenges) * 100
                  : 0

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{category}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-300">
                      {solvedInCategory.length}/{total_challenges}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
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
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Recent Solved Challenges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {solvedChallenges.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No solved challenges yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {solvedChallenges.slice(0, 10).map((challenge) => (
                          <motion.div
                            key={challenge.id}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg"
                          >
                            <div>
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {challenge.title}
                                {firstBloodIds.includes(challenge.id) && (
                                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                                    First Blood
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-300">
                                {challenge.category} • {challenge.difficulty}
                              </p>
                            </div>
                            <span className="text-sm font-medium text-green-600 dark:text-green-300">
                              +{challenge.points}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
