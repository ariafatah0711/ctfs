'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Loader from '@/components/custom/loading'

export default function NotFound() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/challenges' : '/login')
    }
  }, [user, loading, router])

  return <Loader fullscreen color="text-orange-500" />
}
