import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Cache untuk menyimpan status maintenance
let maintenanceCache: {
  isActive: boolean
  errorType: 'manual' | 'database' | null
  lastCheck: number
} = {
  isActive: false,
  errorType: null,
  lastCheck: 0
}

const CACHE_TTL = 30000 // 30 detik

async function checkMaintenance(): Promise<{ isActive: boolean; errorType: 'manual' | 'database' | null }> {
  const mode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE || 'no'

  // Mode manual
  if (mode === 'yes') {
    return { isActive: true, errorType: 'manual' }
  }

  // Mode normal
  if (mode !== 'auto') {
    return { isActive: false, errorType: null }
  }

  // Mode auto - check cache dulu
  const now = Date.now()
  if (now - maintenanceCache.lastCheck < CACHE_TTL) {
    return {
      isActive: maintenanceCache.isActive,
      errorType: maintenanceCache.errorType
    }
  }

  // Check database connection
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { error } = await supabase
      .from('keep-alive')
      .select('id')
      .limit(1)
    console.log('Maintenance check error:', error)

    const hasConnectionError = !!(error && (
      error.message?.includes('fetch') ||
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch') ||
      error.code === 'PGRST301' ||
      error.code === 'PGRST204'
    ))

    // Update cache
    maintenanceCache = {
      isActive: hasConnectionError,
      errorType: hasConnectionError ? 'database' : null,
      lastCheck: now
    }

    return {
      isActive: hasConnectionError,
      errorType: hasConnectionError ? 'database' : null
    }
  } catch (e) {
    // Update cache dengan error
    maintenanceCache = {
      isActive: true,
      errorType: 'database',
      lastCheck: now
    }

    return { isActive: true, errorType: 'database' }
  }
}

export async function middleware(request: NextRequest) {
  const { isActive, errorType } = await checkMaintenance()

  if (isActive) {
    const url = request.nextUrl.clone()

    // Jika sudah di /maintenance, biarkan lewat dengan header pathname
    if (url.pathname === '/maintenance') {
      const response = NextResponse.next()
      response.headers.set('x-pathname', url.pathname)
      return response
    }

    // Redirect ke /maintenance tanpa query params
    url.pathname = '/maintenance'
    url.search = '' // hapus semua query params

    // Set cookie untuk menyimpan error type
    const response = NextResponse.redirect(url)
    response.cookies.set('maintenance-type', errorType || 'unknown', {
      path: '/',
      maxAge: 60 * 5 // 5 menit
    })
    return response
  }

  // Maintenance tidak aktif - redirect dari /maintenance ke home jika ada yang stuck
  if (request.nextUrl.pathname === '/maintenance') {
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.delete('maintenance-type')
    return response
  }

  // Set pathname header untuk semua request
  const response = NextResponse.next()
  response.headers.set('x-pathname', request.nextUrl.pathname)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
