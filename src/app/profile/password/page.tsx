'use client'

import Link from 'next/link'
import { useAuth } from '@/shared/contexts/AuthContext'
import Loader from '@/shared/components/Loader'
import { AuthCard } from '@/features/auth/components/ui/AuthCard'
import { AuthHeader } from '@/features/auth/components/ui/AuthHeader'
import { AuthPageShell } from '@/features/auth/components/ui/AuthPageShell'
import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm'
import {
  THEME_PRIMARY_BG_CLASS,
  THEME_PRIMARY_BG_HOVER_CLASS,
  THEME_PRIMARY_SHADOW_CLASS,
} from '@/shared/styles'

export default function ChangePasswordPage() {
  const { user, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader fullscreen color="text-blue-500" />
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
              className={`relative flex w-full items-center justify-center overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${THEME_PRIMARY_BG_CLASS} ${THEME_PRIMARY_BG_HOVER_CLASS} ${THEME_PRIMARY_SHADOW_CLASS}`}
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
