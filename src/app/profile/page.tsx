'use client'

// React Imports
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Shared Imports
import { Loader } from '@/shared/components'
import { UserProfile } from '@/shared/components/user'
import { useAuth } from '@/shared/contexts'

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
