"use client";

// React Imports
import { useEffect, useState } from 'react'
import { motion } from "framer-motion";
import { Star, GitBranch, Users, Github, BookOpen, ScrollText, Info, ListOrdered, MessageSquare, Clock } from 'lucide-react'
import Image from "next/image";

// Shared Imports
import APP from "@/config";
import { VERSION, BUILD_TIME } from "@/version";
import Loader from '@/shared/components/Loader'
import ImageWithFallback from '@/shared/components/ImageWithFallback'
import BrandLogo from '@/shared/components/BrandLogo'
import PageBackground from '@/shared/components/PageBackground'
import Footer from "@/_layouts/Footer";
import { useAuth } from '@/shared/contexts/AuthContext'
import { THEME_PRIMARY_PILL_CLASS, THEME_PRIMARY_SELECTION_CLASS } from '@/shared/styles'

const CONTRIBUTORS = [
  "@ariafatah0711",
  // "@GZTimeWalker",
  // "@hez2010",
  // "@GrakePch",
  //   "@Hanmur",
  //   "@KPwnZ",
  //   "@kengwang",
  //   "@idawnlight",
  //   "@Konano",
  //   "@YanWQ-monad",
  //   "@Ad-Bean",
  //   "@Reverier-Xu",
  //   "@TonyCrane",
  //   "@mcyydscc",
  //   "@cyc4188",
  //   "@Zeroc0077",
  //   "@weyung",
  //   "@happybear1234",
  //   "@xfoxfu",
];

function fillContributors(list: string[], minLength = 14) {
  if (list.length === 0) return [];

  const result: string[] = [];
  let i = 0;

  while (result.length < minLength) {
    result.push(list[i % list.length]);
    i++;
  }

  return result;
}
const filledContributors = fillContributors(CONTRIBUTORS, 14);

const LINKS = [
  { name: "GitHub", href: APP.nxctf.nxctf_github || "#", icon: Github },
  { name: "Docs", href: APP.nxctf.nxctf_docs || "#", icon: BookOpen },
  { name: "Discord", href: APP.nxctf?.nxctf_discord || "#", icon: MessageSquare },
];

export default function InfoPage() {
  const [repoStats, setRepoStats] = useState<{ stars: number; forks: number } | null>(null)
  const { loading } = useAuth()

  useEffect(() => {
    const repoUrl = APP.nxctf.nxctf_github
    if (!repoUrl) return
    try {
      const m = repoUrl.match(/github\.com\/(.+?)\/(.+?)(?:\.git|\/|$)/i)
      if (!m) return
      const owner = m[1]
      const repo = m[2]
      const api = `https://api.github.com/repos/${owner}/${repo}`
      fetch(api)
        .then(r => r.ok ? r.json() : null)
        .then((data) => {
          if (!data) return
          setRepoStats({ stars: data.stargazers_count || 0, forks: data.forks_count || 0 })
        })
        .catch(() => { })
    } catch (e) {
      // ignore
    }
  }, [])

  if (loading) return <Loader fullscreen color="text-blue-500" />;

  return (
    <PageBackground
      className="flex flex-col overflow-hidden"
      selectionClassName={THEME_PRIMARY_SELECTION_CLASS}
    >
      {/* Faint Watermark Logo */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.02] z-0">
        <ImageWithFallback
          src={APP.nxctf?.nxctf_logo}
          alt={`${APP.shortName} watermark`}
          size={1000}
          rounded={false}
        />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-6 py-12 lg:py-16">
        {/* HERO SECTION */}
        <section className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 flex flex-row items-center justify-center gap-4"
          >
            <ImageWithFallback
              src={APP.image_logo}
              alt={`${APP.shortName} logo`}
              size={160}
              rounded={false}
            />
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl mb-2"
            >
              <BrandLogo name={APP.nxctf.nxctf_title} />
            </motion.h1>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-2 leading-relaxed"
          >
            A modern Capture The Flag (CTF) platform built for security competitions, workshops, and training.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-mono text-sm text-gray-500 dark:text-gray-500 mb-8"
          >
            &gt; {APP.description || "Ngehack untuk senang-senang, bukan buat nyari profit"}
          </motion.p>
        </section>

        {/* COMBINED STATS & PROJECT INFO STRIP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-3xl mx-auto flex flex-col mb-12 p-5 rounded-2xl bg-white/60 dark:bg-[#111622]/60 border border-gray-200 dark:border-gray-800 backdrop-blur-xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(59,130,246,0.05)] transition-all duration-300"
        >
          {/* Top: GitHub Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pb-5">
            {repoStats && (
              <>
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${THEME_PRIMARY_PILL_CLASS}`}>
                    <Star className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{repoStats.stars}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Stars</div>
                  </div>
                </div>
                <div className="h-10 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${THEME_PRIMARY_PILL_CLASS}`}>
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{repoStats.forks}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Forks</div>
                  </div>
                </div>
                <div className="h-10 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>
              </>
            )}
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${THEME_PRIMARY_PILL_CLASS}`}>
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{CONTRIBUTORS.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Contributors</div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200 dark:bg-gray-800"></div>

          {/* Bottom: Technical Details */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 sm:gap-x-8 pt-4 text-sm font-mono text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-blue-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">v{VERSION}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-500" />
              <span>{BUILD_TIME}</span>
            </div>

            <a href={`${APP.nxctf.nxctf_github}/blob/main/LICENSE` || "https://www.apache.org/licenses/LICENSE-2.0"} target="_blank" rel="noopener" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
              <ScrollText size={16} className="group-hover:text-blue-500 transition-colors" /> Apache 2.0
            </a>

            <a href={`${APP.nxctf.nxctf_github}/blob/main/CHANGELOG.md` || '#'} target="_blank" rel="noopener" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
              <ListOrdered size={16} className="group-hover:text-blue-500 transition-colors" /> Changelog
            </a>
          </div>
        </motion.div>

        {/* QUICK LINKS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16"
        >
          {LINKS.map((link, i) => {
            const Icon = link.icon;
            if (link.href === "#") return null;
            return (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener"
                className="group flex flex-col items-center justify-center p-6 transition-all duration-300 bg-white/60 dark:bg-[#111622]/60 border border-gray-200 dark:border-gray-800 rounded-2xl backdrop-blur-xl hover:bg-white dark:hover:bg-[#151a28] hover:-translate-y-1 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(59,130,246,0.05)]"
              >
                <div className="mb-3 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                  {link.name}
                </span>
              </a>
            );
          })}
        </motion.div>

        {/* CONTRIBUTORS MARQUEE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full max-w-5xl mx-auto mb-8 relative"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <Users size={24} className="text-blue-500" /> Built by the Community
            </h2>
          </div>

          <div className="marquee-group relative w-full overflow-hidden space-y-4 py-2">
            {/* Gradient Fades for Marquee */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#fafafa] dark:from-[#0b0f19] to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#fafafa] dark:from-[#0b0f19] to-transparent z-10" />

            {/* ROW 1 */}
            <div className="marquee marquee-left">
              <div className="marquee-track" style={{ willChange: 'transform' }}>
                {[...filledContributors, ...filledContributors].map((name, i) => {
                  const username = name.replace("@", "");
                  return (
                    <a
                      key={`top-${i}`}
                      href={`https://github.com/${username}`}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-3 shrink-0 group px-4 py-2 mx-2 rounded-full bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800 hover:border-blue-500/50 hover:shadow-sm transition-all"
                    >
                      <ProfileAvatar username={username} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors">
                        {username}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* ROW 2 */}
            <div className="marquee marquee-right">
              <div className="marquee-track" style={{ willChange: 'transform' }}>
                {[...filledContributors, ...filledContributors].map((name, i) => {
                  const username = name.replace("@", "");
                  return (
                    <a
                      key={`bot-${i}`}
                      href={`https://github.com/${username}`}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-3 shrink-0 group px-4 py-2 mx-2 rounded-full bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800 hover:border-blue-500/50 hover:shadow-sm transition-all"
                    >
                      <ProfileAvatar username={username} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors">
                        {username}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

      </main>

      <Footer />
    </PageBackground>
  );
}

function ProfileAvatar({ username, size = 32 }: { username: string; size?: number }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const url = `https://github.com/${username}.png`

  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    setErrored(false)
    const img = new window.Image()
    img.src = url
    img.onload = () => { if (!cancelled) setLoaded(true) }
    img.onerror = () => { if (!cancelled) setErrored(true) }
    return () => { cancelled = true }
  }, [url])

  const sizeClass = size === 32 ? 'w-8 h-8' : `w-[${size}px] h-[${size}px]`

  if (!loaded) {
    return (
      <div className={`${sizeClass} rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse`} aria-hidden />
    )
  }

  return (
    <Image
      src={url}
      alt={`${username} avatar`}
      width={size}
      height={size}
      className={`${sizeClass} rounded-full grayscale group-hover:grayscale-0 transition-all duration-300 shadow-sm`}
      style={{ opacity: loaded && !errored ? 1 : 0 }}
      unoptimized
    />
  )
}
