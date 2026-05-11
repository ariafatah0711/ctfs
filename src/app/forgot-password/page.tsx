'use client'

import { AuthPageShell, ForgotPasswordForm } from '@/features/auth'

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </AuthPageShell>
  )
}
