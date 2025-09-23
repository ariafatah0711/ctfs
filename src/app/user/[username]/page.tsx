'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getUserByUsername } from '@/lib/users'
import { getChallenges } from '@/lib/challenges'
import { User, ChallengeWithSolve } from '@/types'
import UserProfile from '@/components/UserProfile'

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
        if (!userData) {
          setError('User not found')
          setLoading(false)
          return
        }

        setUser(userData)
        const challengesData = await getChallenges(userData.id)
        setChallenges(challengesData)
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
      user={user}
      challenges={challenges}
      loading={loading}
      error={error}
      onBack={() => router.back()}
      isCurrentUser={false}
    />
  )
}
