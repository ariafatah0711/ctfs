'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import UserProfile from '@/components/UserProfile'
import Loader from '@/components/custom/loading'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  if (loading) return <div className="flex justify-center py-16"><Loader fullscreen color="text-orange-500" /></div>
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
