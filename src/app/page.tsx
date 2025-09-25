'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/custom/loading'

export default function Home() {
  const router = useRouter()
  const { user, loading } = require('@/contexts/AuthContext').useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/challanges')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return <Loader fullscreen color="text-orange-500" />
  }

  // jangan render apa-apa biar redirect jalan bersih
  return null
}
