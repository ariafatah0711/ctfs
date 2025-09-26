'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getUserByUsername } from '@/lib/users'
import UserProfile from '@/components/UserProfile'
import { useAuth } from '@/contexts/AuthContext'
import Loader from '@/components/custom/loading'

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()

  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const username = decodeURIComponent(params.username as string)
        const userData = await getUserByUsername(username)

        if (!userData) {
          setError('User not found')
          setLoading(false)
          return
        }

        setUserId(userData.id)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching user:', err)
        setError('Failed to load user profile')
        setLoading(false)
      }
    }

    fetchData()
  }, [user, params])

  // Tunggu authContext
  if (authLoading) return <Loader fullscreen color="text-orange-500" />

  // Redirect kalau belum login
  if (!user) {
    router.push('/login')
    return null
  }

  // Kalau masih loading
  if (loading) {
    return <Loader fullscreen color="text-orange-500" />
  }

  // Kalau error / user nggak ada
  if (error) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Oops!</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {error || "Something went wrong."}
          </p>
          <button
            onClick={() => router.push('/challanges')}
            className="mt-6 px-6 py-2 rounded-lg bg-primary-600 dark:bg-primary-700 text-white font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition"
          >
            Back to Challenges
          </button>
        </div>
      </div>
    )
  }

  return (
    <UserProfile
      userId={userId}
      loading={loading}
      error={error}
      onBack={() => router.back()}
      isCurrentUser={userId === user?.id}
    />
  )
}
