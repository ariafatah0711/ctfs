'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getChallenges } from '@/lib/challenges'
import { User, ChallengeWithSolve } from '@/types'
import UserProfile from '@/components/UserProfile'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [challenges, setChallenges] = useState<ChallengeWithSolve[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      const challengesData = await getChallenges(currentUser.id)
      setChallenges(challengesData)
      setLoading(false)
    }
    fetchData()
  }, [router])

  return (
    <UserProfile
      user={user}
      challenges={challenges}
      loading={loading}
      isCurrentUser={true}
    />
  )
}
