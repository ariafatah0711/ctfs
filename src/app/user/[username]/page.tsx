'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getUserByUsername, getUserChallenges } from '@/lib/users'
import { User, ChallengeWithSolve } from '@/types'
import Navbar from '@/components/Navbar'

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [challenges, setChallenges] = useState<ChallengeWithSolve[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUserData = await getCurrentUser()
        if (!currentUserData) {
          router.push('/login')
          return
        }
        setCurrentUser(currentUserData)

        const username = params.username as string
        const userData = await getUserByUsername(username)

        console.log("params:", params)
        console.log("username param:", username)
        console.log("userData:", userData)

        if (!userData) {
          setError('User not found')
          setLoading(false)
          return
        }

        setUser(userData)
        const challengesData = await getUserChallenges(userData.id)
        setChallenges(challengesData)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load user profile')
        setLoading(false)
      }
    }

    fetchData()
  }, [router, params.username])

  if (loading) {
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

  if (error || !user) {
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
              The user you re looking for doesn t exist or has been removed.
            </p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const solvedChallenges = challenges.filter(c => c.is_solved)
  const totalPoints = solvedChallenges.reduce((sum, c) => sum + c.points, 0)
  const categories = Array.from(new Set(challenges.map(c => c.category)))
  const solvedCategories = Array.from(new Set(solvedChallenges.map(c => c.category)))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-2xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
              <p className="text-gray-600">CTF Player</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-500">🏆</span>
                  <span className="text-sm font-medium text-gray-900">{user.score} points</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-500">✓</span>
                  <span className="text-sm font-medium text-gray-900">{solvedChallenges.length} solved</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-500">📊</span>
                  <span className="text-sm font-medium text-gray-900">{challenges.length} total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">🏆</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">{user.score}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">📈</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {challenges.length > 0 ? Math.round((solvedChallenges.length / challenges.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Progress</h2>
          <div className="space-y-4">
            {categories.map(category => {
              const categoryChallenges = challenges.filter(c => c.category === category)
              const solvedInCategory = categoryChallenges.filter(c => c.is_solved)
              const progress = categoryChallenges.length > 0 ? (solvedInCategory.length / categoryChallenges.length) * 100 : 0

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

        {/* Recent Solved Challenges */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Solved Challenges</h2>
          {solvedChallenges.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">🎯</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No solved challenges yet</h3>
              <p className="text-gray-500">This user hasn t solved any challenges yet.</p>
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
                      <h3 className="text-sm font-medium text-gray-900">{challenge.title}</h3>
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
