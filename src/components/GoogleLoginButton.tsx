'use client'

import { useState } from 'react'
import { loginGoogle } from '@/lib/auth'

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await loginGoogle()
      if (error) {
        setError(error)
      }
      // Supabase akan redirect ke callback URL
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
        className="flex items-center justify-center gap-2 w-full py-2 px-4 text-sm font-medium rounded-md border border-gray-400 bg-white text-gray-800 shadow-sm hover:bg-gray-100 focus:ring-2 focus:ring-offset-2 focus:ring-red-400 disabled:opacity-50 dark:border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
      >
        {/* Google SVG logo */}
        <svg
          className="w-5 h-5"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fill="#4285F4" d="M24 9.5c3.54 0 6.72 1.22 9.21 3.6l6.85-6.85C35.09 2.4 29.91 0 24 0 14.64 0 6.51 5.68 2.55 13.91l7.98 6.19C12.48 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#34A853" d="M46.1 24.55c0-1.57-.14-3.09-.39-4.55H24v9.13h12.4c-.54 2.93-2.15 5.41-4.6 7.09l7.19 5.59C43.98 37.58 46.1 31.54 46.1 24.55z"/>
          <path fill="#FBBC05" d="M10.53 28.09c-.48-1.43-.76-2.94-.76-4.54s.27-3.11.76-4.54L2.55 12.91C.91 16.08 0 19.44 0 23c0 3.56.91 6.92 2.55 10.09l7.98-6.19z"/>
          <path fill="#EA4335" d="M24 46c6.48 0 11.91-2.13 15.88-5.79l-7.19-5.59c-2 1.35-4.55 2.14-8.69 2.14-6.26 0-11.52-4.22-13.47-10.02l-7.98 6.19C6.51 42.32 14.64 48 24 48z"/>
        </svg>
        {loading ? 'Processing...' : 'Sign in with Google'}
      </button>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900 p-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
    </div>
  )
}
