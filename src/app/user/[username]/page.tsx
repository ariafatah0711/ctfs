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
        const username = params.username as string
        const userData = await getUserByUsername(username)
        if (!userData) {
          setError('User not found')
          setLoading(false)
          return
        }

        setUserId(userData.id)
        setLoading(false)
      } catch (err) {
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
