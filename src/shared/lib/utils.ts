import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Validasi username: max 30 karakter, tanpa emoji, tanpa karakter berbahaya, hanya huruf, angka, _ . -
export function isValidUsername(username: string): string | null {
  // Tidak boleh lebih dari 30 karakter
  if (username.length > 30) {
    return 'Username must be at most 30 characters.'
  }
  // Tidak boleh kurang dari 3 karakter
  if (username.length < 3) {
    return 'Username must be at least 3 characters.'
  }
  // Tidak boleh mengandung karakter berbahaya
  if (/[><\/?"'\\]/.test(username)) {
    return 'Username contains invalid characters.'
  }
  // Tidak boleh mengandung emoji (unicode range emoji, tanpa flag 'u')
  // Ini blokir sebagian besar emoji umum
  if (/([\uD83C-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF])/.test(username)) {
    return 'Username cannot contain emoji.'
  }
  // Hanya boleh huruf, angka, underscore, titik, strip
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return 'Username can only contain letters, numbers, ".", "_", and "-".'
  }
  return null // valid
}

// Format a date ISO string into a relative string (English).
// Rules:
// - seconds/minutes/hours as before
// - days up to 30 days: "X days ago • HH:MM"
// - older than 30 days: localized date/time
export function formatRelativeDate(isoDate: string) {
  const then = new Date(isoDate).getTime()
  if (isNaN(then)) return isoDate
  const now = Date.now()
  const diffMs = now - then
  const diffSeconds = Math.floor(diffMs / 1000)

  if (diffSeconds < 60) return `${diffSeconds} ${diffSeconds === 1 ? 'second' : 'seconds'} ago`
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) {
    if (diffDays === 0) return '0 days ago'
    const timeStr = new Date(isoDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago • ${timeStr}`
  }

  return new Date(isoDate).toLocaleString()
}

export type EventTimingLike = {
  start_time?: string | null
  end_time?: string | null
}

// Compact duration formatter for event countdowns.
// Rules:
// - >= 1 year: "1y" (caps long countdowns)
// - > 30 days: "200d" (days only)
// - otherwise: "4d 2h" / "3h 12m" / "8m"
export function formatEventDurationCompact(ms: number) {
  const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0
  const totalMinutes = Math.floor(safeMs / 60000)
  const totalHours = Math.floor(totalMinutes / 60)
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  const minutes = totalMinutes % 60

  if (days >= 365) return '1y'
  if (days > 30) return `${days}d`
  if (days > 0) return `${days}d ${hours}h`
  if (totalHours > 0) return `${totalHours}h ${minutes}m`
  return `${minutes}m`
}

export function formatEventTimingLabel(evt?: EventTimingLike, now: Date = new Date()): string | null {
  if (!evt) return null
  const start = evt.start_time ? new Date(evt.start_time) : null
  const end = evt.end_time ? new Date(evt.end_time) : null

  if (start && !Number.isNaN(start.getTime()) && now < start) {
    return `Starts in ${formatEventDurationCompact(start.getTime() - now.getTime())}`
  }

  if (end && !Number.isNaN(end.getTime()) && now > end) {
    return 'Ended'
  }

  if (end && !Number.isNaN(end.getTime())) {
    return `Ends in ${formatEventDurationCompact(end.getTime() - now.getTime())}`
  }

  if (start && !Number.isNaN(start.getTime())) {
    return 'Ongoing'
  }

  return null
}
