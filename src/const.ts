export const LINKS = {
  github: 'https://github.com/nxctf/nxctf',
  discord: 'https://discord.gg/5etKks6aQQ',
  docs: 'https://docs.nxctf.my.id/',
  nextjs: 'https://nextjs.org/',
  tailwind: 'https://tailwindcss.com/',
  framer: 'https://www.framer.com/motion/',
  supabase: 'https://supabase.com/',
  vercel: 'https://vercel.com/',
}

export const YEAR = new Date().getFullYear()

export const DIFFICULTY_STYLES: Record<string, string> = {
  Baby: 'cyan',
  Easy: 'green',
  Medium: 'yellow',
  Hard: 'red',
  Insane: 'purple',
}

// Supabase configuration
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Maintenance mode
export const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE || 'no'

export default { LINKS, YEAR, DIFFICULTY_STYLES, SUPABASE_URL, SUPABASE_ANON_KEY, MAINTENANCE_MODE }
