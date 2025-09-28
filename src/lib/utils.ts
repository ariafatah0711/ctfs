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
