'use client'

import { useState } from 'react'
import { AlertCircle, Chrome, Loader2 } from 'lucide-react'
import { AuthService } from '@/features/auth/services/auth.service'
import { THEME_PRIMARY_RING_CLASS } from '@/shared/styles'

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await AuthService.loginWithGoogle()
      if (error) {
        setError(error)
      }
    } catch {
      setError('Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`relative flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white/60 px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-white hover:shadow-[0_8px_30px_rgba(59,130,246,0.06)] focus:outline-none ${THEME_PRIMARY_RING_CLASS} disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
        <span>{loading ? 'Processing...' : 'Sign in with Google'}</span>
      </button>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4 flex-none" />
          {error}
        </div>
      )}
    </div>
  )
}
