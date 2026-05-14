"use client"

// React Imports
import { motion } from "framer-motion"
import {
  Trophy, Users, Zap, Shield, ArrowRight,
  ListChecks, Server, CalendarDays, Terminal
} from 'lucide-react'
import Link from "next/link"

// Shared Imports
import APP from '@/config'
import Loader from '@/shared/components/Loader'
import BrandLogo from '@/shared/components/BrandLogo'
import PageBackground from '@/shared/components/PageBackground'
import Footer from "@/_layouts/Footer"
import { useAuth } from '@/shared/contexts/AuthContext'
import { THEME_PRIMARY_SELECTION_CLASS } from '@/shared/styles'

const FEATURES = [
  {
    icon: Trophy,
    title: "Real-time Scoreboard",
    description: "Compete with live updates, dynamic scoring, and real-time rank tracking."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Form squads, share progress, and climb the leaderboard together."
  },
  {
    icon: Zap,
    title: "Dynamic Challenges",
    description: "Deploy isolated, ephemeral instances for each challenge environment."
  },
  {
    icon: ListChecks,
    title: "Multi-Task Challenges",
    description: "Solve complex challenges by answering multiple sub-questions to get the flag."
  },
  {
    icon: Server,
    title: "NXCTL Instance",
    description: "On-demand service creation. Spin up your own challenge environment instantly."
  },
  {
    icon: CalendarDays,
    title: "Multi-Event Management",
    description: "Host and manage multiple CTF events simultaneously with ease."
  },
  {
    icon: Terminal,
    title: "Flag Placeholders",
    description: "Customizable flag formats and placeholders for complex challenge scenarios."
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Robust security with seamless login flows and role-based access control."
  }
]

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loader fullscreen />
  }

  return (
    <PageBackground
      className="flex flex-col overflow-hidden"
      selectionClassName={THEME_PRIMARY_SELECTION_CLASS}
    >
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-6 py-10 lg:py-16">
        {/* HERO SECTION */}
        <section className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 backdrop-blur-md mb-6 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-600 dark:text-gray-400">
              Flag format: <span className="font-mono text-blue-600 dark:text-blue-400">{APP.flagFormat}</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl mb-2"
          >
            <BrandLogo name={APP.fullName} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mb-8 leading-relaxed"
          >
            Modern CTF Infrastructure. Featuring <b>nxctl</b> instances, multi-step tasks, and enterprise-grade event management.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-row items-center gap-3"
          >
            <Link
              href={user ? "/challenges" : "/login"}
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white transition-all bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {user ? "Enter Arena" : "Get Started"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/info"
              className="px-6 py-2.5 text-sm font-bold transition-all rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              About Platform
            </Link>
          </motion.div>
        </section>

        {/* FEATURES GRID - 8 Items */}
        <section className="w-full max-w-6xl mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }} // Efek melayang dikit pas hover
                  className="cursor-pointer group relative p-5 bg-white/40 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-xl backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-[0_10px_20px_rgba(59,130,246,0.1)]"
                >
                  {/* Icon Section - Sekarang defaultnya biru sesuai request lo */}
                  <div className="mb-3 inline-flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </section>
      </main>

      <Footer />
    </PageBackground>
  )
}
