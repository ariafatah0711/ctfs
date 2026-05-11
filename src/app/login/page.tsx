'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/contexts'
import { Loader } from '@/shared/components'
import { AuthPageShell, LoginForm } from '@/features/auth'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/challenges')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return <Loader fullscreen color="text-orange-500" />
  }

  return (
    <AuthPageShell>
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </AuthPageShell>
  )
}
