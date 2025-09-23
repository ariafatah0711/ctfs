import Navbar from '@/components/Navbar'
import { ChallengeWithSolve } from '@/types'
import { getFirstBloodChallengeIds } from '@/lib/challenges'
import { useEffect, useState } from 'react'
import { getUserDetail } from '@/lib/users'

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
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !userDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-red-400">❌</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'User not found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {isCurrentUser
                ? 'Failed to load your profile.'
                : "The user you re looking for doesn t exist or has been removed."}
            </p>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const solvedChallenges = userDetail.solved_challenges || []
  // Only include categories with at least 1 solved challenge
  const categories = Array.from(new Set(solvedChallenges.filter(c => c.is_solved).map(c => c.category)))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        {onBack && (
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-2xl font-bold">
                {userDetail.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{userDetail.username}</h1>
              {/* You can add more user info here if needed */}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Rank di kiri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-lg">🏅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Rank</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userDetail.rank === 0 ? '0' : `#${userDetail.rank}`}
                </p>
              </div>
            </div>
          </div>
          {/* Solved Challenges */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">✓</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Solved Challenges</p>
                <p className="text-2xl font-bold text-gray-900">{solvedChallenges.length}</p>
              </div>
            </div>
          </div>
          {/* First Blood Solves */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-lg">🩸</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">First Bloods</p>
                <p className="text-2xl font-bold text-gray-900">{firstBloodIds.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Progress (only show if at least 1 solved challenge and at least 1 category) */}
        {solvedChallenges.length > 0 && categories.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Progress</h2>
            <div className="space-y-4">
              {categories.map((category: string) => {
                const categoryChallenges = solvedChallenges.filter((c: ChallengeWithSolve) => c.category === category)
                const solvedInCategory = categoryChallenges.filter((c: ChallengeWithSolve) => c.is_solved)
                const progress = categoryChallenges.length > 0 ? (solvedInCategory.length / categoryChallenges.length) * 100 : 0
                // Only show if at least 1 solved in this category
                if (solvedInCategory.length === 0) return null
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{category}</span>
                        <span className="text-sm text-gray-500">{solvedInCategory.length}/{categoryChallenges.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Solved Challenges */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Solved Challenges</h2>
          {solvedChallenges.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">🎯</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No solved challenges yet</h3>
              <p className="text-gray-500">
                {isCurrentUser
                  ? 'Start solving challenges to see them here!'
                  : "This user hasn t solved any challenges yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {solvedChallenges.slice(0, 10).map((challenge) => (
                <div key={challenge.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {challenge.title}
                        {firstBloodIds.includes(challenge.id) && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 ml-2"
                            title="First Blood"
                          >
                            <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 2C10 2 4 9.5 4 13a6 6 0 0012 0c0-3.5-6-11-6-11zm0 15a4 4 0 01-4-4c0-2.22 2.67-6.22 4-8.2C11.33 6.78 14 10.78 14 13a4 4 0 01-4 4z" />
                              <circle cx="10" cy="13" r="1.5" fill="#ef4444"/>
                            </svg>
                            First Blood
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500">{challenge.category} • {challenge.difficulty}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-green-600">+{challenge.points}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
