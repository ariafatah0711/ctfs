'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import UserProfile from '@/components/UserProfile'

export default function ProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUserId(currentUser.id)
      setLoading(false)
    }
    fetchData()
  }, [router])

  return (
    <UserProfile
      userId={userId}
      loading={loading}
      onBack={() => router.back()}
      isCurrentUser={true}
    />
  )
}
