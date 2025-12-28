export const APP = {
  shortName: 'FGTE',
  fullName: 'CTFS Platform',
  description: 'Aplikasi CTF minimalis dengan Next.js dan Supabase',
  flagFormat: 'FGTE{your_flag_here}',
  year: new Date().getFullYear(),
  // Maintenance configuration
  // mode: 'no' | 'yes' | 'auto'
  // 'no'   -> normal operation
  // 'yes'  -> forced maintenance (harus ubah ke 'no' untuk kembali normal)
  // 'auto' -> otomatis masuk maintenance jika Supabase error (koneksi / query gagal)
  maintenance: {
    mode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE || 'no',
    message:
      process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE ||
      'Platform sedang maintenance. Silakan kembali beberapa saat lagi.'
  },

  challengeCategories: [
    'Intro',
    'Misc',
    'Osint',
    'Crypto',
    'Forensics',
    'Web',
    'Reverse',
  ],
  links: {
    github: 'https://github.com/ariafatah0711/ctfs',
    discord: 'https://discord.com/invite/A5rgMZBHPr',
    nextjs: 'https://nextjs.org/',
    tailwind: 'https://tailwindcss.com/',
    framer: 'https://www.framer.com/motion/',
    supabase: 'https://supabase.com/',
    vercel: 'https://vercel.com/',
    docs: '#',
  },

  // Difficulty style mapping (use lowercase keys). Only color name, badge will map to classes.
  difficultyStyles: {
    Baby: 'cyan',
    Easy: 'green',
    Medium: 'yellow',
    Hard: 'red',
    Impossible: 'purple',
  },

  // Base URL (otomatis ambil dari env kalau ada)
  baseUrl:
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', // opsional fallback
  image_icon:
    process.env.NEXT_PUBLIC_SITE_ICON || 'favicon.ico',
  image_preview:
    process.env.NEXT_PUBLIC_SITE_PREVIEW || 'og-image.png',
}

export default APP
