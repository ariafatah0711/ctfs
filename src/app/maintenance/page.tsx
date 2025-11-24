import { cookies } from 'next/headers'
import APP from '@/config'

// Disable caching untuk maintenance page
export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function MaintenancePage() {
  const cookieStore = await cookies()
  const errorType = (cookieStore.get('maintenance-type')?.value || 'unknown') as 'manual' | 'database' | 'unknown'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 px-4 py-16 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/30 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      </div>

      <div className="max-w-3xl w-full relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 dark:from-yellow-600 dark:via-orange-600 dark:to-red-600 p-12 text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-gray-800 shadow-2xl mb-6">
                <svg className="w-12 h-12 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                Under Maintenance
              </h1>
              <p className="text-white/95 text-base md:text-lg font-medium">
                We&apos;re working to improve your experience
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 space-y-8">
            <div className="text-center">
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 font-medium leading-relaxed">
                {APP.maintenance.message}
              </p>
            </div>

            {/* Status */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                {errorType === 'database' ? (
                  <>
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                        Database Connection Error
                      </h2>
                    </div>
                    <p className="text-center text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                      Tidak dapat terhubung ke database. Platform akan kembali normal setelah koneksi pulih.
                    </p>
                    <div className="flex justify-center">
                      <a
                        href="https://status.supabase.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Check Database Status</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        Scheduled Maintenance
                      </h2>
                    </div>
                    <p className="text-center text-gray-600 dark:text-gray-400 leading-relaxed">
                      Platform sedang dalam maintenance terjadwal. Kami akan segera kembali.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-base text-blue-900 dark:text-blue-100 font-semibold mb-2">
                    What&apos;s happening?
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    {errorType === 'database'
                      ? 'We detected a database connectivity issue. Our team is working to resolve it as quickly as possible.'
                      : 'We are performing scheduled maintenance to improve our services.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/70 dark:to-gray-800/70 px-8 py-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-4">
              <p className="text-base text-gray-700 dark:text-gray-300 font-medium">
                Terima kasih atas kesabaran Anda 🙏
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Need help? Contact us at{' '}
                <a href={APP.links.discord} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
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
