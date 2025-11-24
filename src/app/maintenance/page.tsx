import { cookies } from 'next/headers'
import APP from '@/config'

// Disable caching untuk maintenance page
export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function MaintenancePage() {
  const cookieStore = await cookies()
  const errorType = (cookieStore.get('maintenance-type')?.value || 'unknown') as 'manual' | 'database' | 'unknown'
  const rawErrorMessage = cookieStore.get('maintenance-error')?.value || ''
  const errorMessage = rawErrorMessage
    ? decodeURIComponent(rawErrorMessage)
    : 'No error details available'

  // Get Supabase info for debugging
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'Not configured'
  const anonKeyStatus = supabaseAnonKey !== 'Not configured' ? 'Configured' : 'Not configured'

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4 overflow-hidden">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg mb-4">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Under Maintenance
            </h1>
            <p className="text-white/90 text-sm">
              We&apos;re working to improve your experience
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-200 text-center">
              {APP.maintenance.message}
            </p>

            {/* Status */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              {errorType === 'database' ? (
                <>
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                      Database Connection Error
                    </h2>
                  </div>

                  {/* Debug Info */}
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-4 mb-4 space-y-3">
                    <div className="flex items-start space-x-2">
                      <svg className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-2">Error Details:</p>
                        <div className="space-y-2">
                          <div className="bg-red-100 dark:bg-red-900/40 rounded px-2 py-1.5">
                            <p className="text-xs text-red-700 dark:text-red-300 font-mono break-all">
                              {errorMessage}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="bg-red-100 dark:bg-red-900/40 rounded px-2 py-1.5">
                              <p className="text-xs text-red-600 dark:text-red-400 font-mono break-all">
                                <span className="opacity-75">URL:</span> {supabaseUrl}
                              </p>
                            </div>
                            <div className="bg-red-100 dark:bg-red-900/40 rounded px-2 py-1.5">
                              <p className="text-xs text-red-600 dark:text-red-400 font-mono break-all">
                                <span className="opacity-75">Anon Key:</span> {anonKeyStatus}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <a
                      href="https://status.supabase.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors font-medium"
                    >
                      <span>Check Database Status</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      Scheduled Maintenance
                    </h2>
                  </div>
                  <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                    Platform sedang dalam maintenance terjadwal. Kami akan segera kembali.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Terima kasih atas kesabaran Anda 🙏
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Need help? Contact us at{' '}
                <a href={APP.links.discord} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Discord
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
