'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getUserByUsername } from '@/lib/users'
import UserProfile from '@/components/UserProfile'

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
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
  }, [router, params])

  return (
    <UserProfile
      userId={userId}
      loading={loading}
      error={error}
      onBack={() => router.back()}
      isCurrentUser={false}
    />
  )
}
