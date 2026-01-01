"use client";

import APP from "@/config";
import { Users, Github, BookOpen, ScrollText, Info, ListOrdered } from 'lucide-react';
import { motion } from "framer-motion";
import { useEffect, useState } from 'react'
import Loader from "@/components/custom/loading";
import Footer from "@/components/custom/Footer";
import { VERSION, BUILD_TIME } from "@/version";
import { Star, GitBranch } from 'lucide-react'

function DiscordIcon({
  size = 16,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.078.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.078-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.045-.32 13.579.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.201 13.201 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.25-.192.369-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.062 0a.073.073 0 0 1 .078.01c.12.099.246.197.372.291a.077.077 0 0 1-.006.128 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.106c.36.699.772 1.364 1.225 1.994a.076.076 0 0 0 .084.028 19.876 19.876 0 0 0 5.993-3.03.077.077 0 0 0 .031-.056c.5-5.177-.838-9.673-3.548-13.66a.061.061 0 0 0-.031-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.946 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z" />
    </svg>
  );
}

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
  { name: "GitHub", href: APP.links?.github || "#" },
  { name: "Docs", href: APP.links?.docs || "#" },
  { name: "Discord", href: APP.links?.discord || "#" },
];

export default function InfoPage() {
  const { loading } = require("@/contexts/AuthContext").useAuth();
  if (loading) return <Loader fullscreen color="text-orange-500" />;

  const [repoStats, setRepoStats] = useState<{ stars: number; forks: number } | null>(null)

  useEffect(() => {
    const repoUrl = APP.links?.github
    if (!repoUrl) return
    try {
      // extract owner/repo from URL like https://github.com/owner/repo
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
        .catch(() => {})
    } catch (e) {
      // ignore
    }
  }, [])

  return (
    <div className="flex flex-col min-h-[calc(100lvh-60px)] bg-gray-50/100 dark:bg-gray-900/100 relative overflow-hidden">
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Decorative background shapes */}
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-orange-100 dark:bg-orange-900 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] bg-orange-200 dark:bg-orange-800 rounded-full blur-3xl opacity-30 animate-pulse" />

        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} layout>
          <h1 className="text-5xl font-extrabold tracking-tight">
            <span className="text-orange-600 dark:text-orange-400 drop-shadow-lg">CTF</span><span className="text-orange-500">:S</span>
          </h1>

          <p className="mt-2 text-gray-400">Community-driven Capture The Flag platform</p>

          <p className="mt-4 font-mono text-sm text-gray-300">
            &gt; {APP.description || "Ngehack untuk senang-senang, bukan buat nyari profit"}
          </p>
        </motion.div>

        {/* LINKS */}
        <div className="mt-6 flex gap-4">
          {LINKS.map((link, i) => {
            let icon = null;
            if (link.name === 'GitHub') icon = <Github size={18} className="mr-1" />;
            if (link.name === 'Docs') icon = <BookOpen size={18} className="mr-1" />;
            if (link.name === 'Discord')
                icon = <DiscordIcon size={18} className="mr-1" />;
            return link.href !== "#" ? (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener"
                className="px-4 py-2 border border-gray-400 dark:border-orange-700 rounded-md font-mono text-sm flex items-center transition
                  text-orange-600 dark:text-orange-400
                  hover:border-orange-500 hover:text-orange-500 dark:hover:text-orange-300"
              >
                {icon} {link.name}
              </a>
            ) : null;
          })}
        </div>

        {/* DIVIDER */}
        <div className="my-10 w-24 border-t border-gray-700" />

        {/* CONTRIBUTORS */}
        <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2"><Users size={20} className="mr-1" /> Contributors</h2>

        <div className="marquee-group relative w-full max-w-4xl overflow-hidden space-y-4">
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
                    className="flex items-center gap-2 shrink-0 group px-2"
                  >
                    <ProfileAvatar username={username} />
                    <span
                      className="text-xs font-mono text-gray-300
                             group-hover:text-orange-400 transition"
                    >
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
                    className="flex items-center gap-2 shrink-0 group px-2"
                  >
                    <ProfileAvatar username={username} />
                    <span
                      className="text-xs font-mono text-gray-300
                             group-hover:text-orange-400 transition"
                    >
                      {username}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-10 w-24 border-t border-gray-700" />

        {/* VERSION & LICENSE */}
          <div className="flex flex-col items-center gap-1 mt-2">
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-gray-500 flex items-center gap-1">
              <Info size={15} className="mr-1" /> v{VERSION} · build {BUILD_TIME}
            </div>
            {repoStats && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <a href={APP.links.github} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-orange-500">
                  <Star size={14} className="text-yellow-500" /> {repoStats.stars}
                </a>
                <a href={APP.links.github} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-orange-500">
                  <GitBranch size={14} className="text-gray-500" /> {repoStats.forks}
                </a>
              </div>
            )}
          </div>
          <div className="text-xs font-mono text-gray-500 flex items-center gap-1 mt-1">
            <ScrollText size={15} className="mr-1" />
            <span>Licensed under <a href={`${APP.links.github}/blob/main/LICENSE` || "https://www.apache.org/licenses/LICENSE-2.0"} target="_blank" rel="noopener" className="underline hover:text-orange-500">Apache 2.0</a></span>
          </div>

          {/* Change Log */}
          <div className="text-xs font-mono text-gray-500 flex items-center gap-1 mt-1">
            <ListOrdered size={15} className="mr-1" />
            <span>See the <a href={`${APP.links.github}/blob/main/CHANGELOG.md` || '#'} target="_blank" rel="noopener" className="underline hover:text-orange-500">Change Log</a></span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ProfileAvatar({ username, size = 36 }: { username: string; size?: number }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const url = `https://github.com/${username}.png`

  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    setErrored(false)
    const img = new Image()
    img.src = url
    img.onload = () => { if (!cancelled) setLoaded(true) }
    img.onerror = () => { if (!cancelled) setErrored(true) }
    return () => { cancelled = true }
  }, [url])

  const sizeClass = size === 36 ? 'w-9 h-9' : `w-[${size}px] h-[${size}px]`

  if (!loaded) {
    return (
      <div className={`${sizeClass} rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse`} aria-hidden />
    )
  }

  return (
    <img
      src={url}
      alt={`${username} avatar`}
      className={`${sizeClass} rounded-full grayscale group-hover:grayscale-0 transition-opacity duration-200`}
      style={{ opacity: loaded && !errored ? 1 : 0 }}
    />
  )
}
