'use client'

import Link from 'next/link'
import { useAuth } from '@/shared/contexts/AuthContext'
import { Loader } from '@/shared/components'
import {
  AuthCard,
  AuthHeader,
  AuthPageShell,
  ResetPasswordForm,
} from '@/features/auth'

export default function ChangePasswordPage() {
  const { user, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader fullscreen color="text-orange-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <AuthPageShell>
        <div className="w-full max-w-md">
          <AuthCard>
            <AuthHeader
              badge="Security"
              title="Login required"
              subtitle="You need to sign in before changing your password"
            />
            <Link
              href="/login"
              className="relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-orange-500/30 active:scale-[0.98]"
            >
              Login
            </Link>
          </AuthCard>
        </div>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell>
      <div className="w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </AuthPageShell>
  )
}
