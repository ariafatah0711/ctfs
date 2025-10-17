export const APP = {
  shortName: 'FGTE',
  fullName: 'CTFS Platform',
  description: 'Aplikasi CTF minimalis dengan Next.js dan Supabase',
  flagFormat: 'FGTE{your_flag_here}',
  year: new Date().getFullYear(),
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
  },

  // 🌐 Base URL (otomatis ambil dari env kalau ada)
  baseUrl:
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', // opsional fallback
  image_icon:
    process.env.NEXT_PUBLIC_SITE_IMAGE || 'favicon.ico', // opsional fallback
}

export default APP
