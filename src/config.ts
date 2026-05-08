export const APP = {
  shortName: "FGTE",
  fullName: "CTFS Platform",
  description: "Aplikasi CTF minimalis dengan Next.js dan Supabase",
  flagFormat: "FGTE{your_flag_here}",
  year: new Date().getFullYear(),

  challengeCategories: [
    "Intro",
    "Boot To Root",
    "Web",
    "Forensics",
    "Osint",
    "Crypto",
    "Reverse",
    "Pwn",
    "Stegnography",
    "Misc",
    "Network"
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
    Insane: 'purple',
  },

  // Base URL (otomatis ambil dari env kalau ada)
  baseUrl:
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", // opsional fallback
  image_icon: 'favicon.ico',
  image_preview: 'og-image.png',

  // Turnstile aktif otomatis kalau site key ada di env.
  captchaEnabled: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()),
  captchaSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || '',

  /* Setting Config */
  notifSolves: true, // notifikasi global saat ada yang solve challenge
  ChallengeTutorial: false, // enable / disable Challenge Tutorial component
  ChatBotAI: false, // enable / disable ChatBot AI component
  Live2DMaskotAnime: false, // enable / disable Live2D Maskot Anime component

  teams: {
    enabled: true,
    hideScoreboardIndividual: false,
    hidescoreboardTotal: false,
  },
  hideEventMain: false, // enable / disable hiding "Main Event" in event selector (useful for single event CTFs)
  // Label untuk challenges tanpa event_id (event_id = NULL). Jika kosong, fallback ke "Main".

  eventMainLabel: "FGTE 2026",
  // Gambar untuk "Main/Featured" event (boleh URL external atau path public). Contoh:
  // 'https://example.com/banner.png' atau '/images/banner.png'
  eventMainImageUrl: "https://raw.githubusercontent.com/ariafatah0711/fgte_s1/refs/heads/main/img/FGTE_2026.png",
  // Fallback image untuk event yang tidak punya image_url.
  eventFallbackImageUrl: "https://raw.githubusercontent.com/ariafatah0711/fgte_s1/refs/heads/main/img/FGTE_Blank.png",

  /* Maintenance configuration */
  // mode: 'no' | 'yes' | 'auto'
  // 'no'   -> normal operation
  // 'yes'  -> forced maintenance (harus ubah ke 'no' untuk kembali normal)
  // 'auto' -> otomatis masuk maintenance jika Supabase error (koneksi / query gagal)
  maintenance: {
    mode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE || "no",
    message:
      process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || "Platform sedang maintenance. Silakan kembali beberapa saat lagi."
  },

  // CTF Container (CTFC) Orchestrator Config
  ctfc: {
    apiUrl: process.env.CTFC_API_URL || "http://127.0.0.1:8000",
    apiToken: process.env.CTFC_API_TOKEN || "default_secret_token_change_me",
  },
}

export default APP
