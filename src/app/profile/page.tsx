'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import UserProfile from '@/components/UserProfile'
import Loader from '@/components/custom/loading'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // 🔒 redirect to /login if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader fullscreen color="text-orange-500" />
      </div>
    )
  }

  // jangan render apapun biar redirect jalan
  if (!user) return null

  return (
    <UserProfile
      userId={user.id}
      loading={false}
      onBack={() => router.back()}
      isCurrentUser={true}
    />
  )
}
