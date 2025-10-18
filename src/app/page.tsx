"use client"

import { motion } from "framer-motion"
import Loader from "@/components/custom/loading"
import Footer from "@/components/custom/Footer"
import { Button } from "@/components/ui/button"
import APP from '@/config'

export default function Home() {
  const { user, loading } = require("@/contexts/AuthContext").useAuth();

  if (loading) {
    return <Loader fullscreen color="text-orange-500" />
  }

  return (
    <div className="flex flex-col min-h-[calc(100lvh-60px)] bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Global Decorative background shapes */}
      <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-orange-100 dark:bg-orange-900 rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-orange-200 dark:bg-orange-800 rounded-full blur-3xl opacity-30 animate-pulse" />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl md:text-6xl font-extrabold text-orange-600 dark:text-orange-400 mb-4 drop-shadow-lg"
        >
          Welcome to{" "}
          <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            {APP.fullName}
          </span>{" "}
          🚩
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-2xl mb-8"
        >
          Practice your{" "}
          <span className="font-semibold text-orange-600 dark:text-orange-400">
            cybersecurity skills
          </span>{" "}
          through{" "}
          <span className="font-semibold text-orange-600 dark:text-orange-400">
            Jeopardy-style Capture The Flag (CTF)
          </span>{" "}
          challenges — solve chall, collect flags, and climb the{" "}
          <span className="font-semibold text-orange-600 dark:text-orange-400">
            leaderboard
          </span>
          {/* . Join our{" "}
          <a
            href={APP.links.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-orange-600 dark:text-orange-400 hover:underline"
          >
            Discord community
          </a>{" "}
          for discussions and help! */}
        </motion.p>

        {/* Flag Format Info Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mb-8 flex items-center justify-center"
        >
          <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 border border-orange-200 dark:border-orange-700 rounded-lg px-4 py-2 shadow-md text-base md:text-lg font-mono text-orange-600 dark:text-orange-400">
            <span className="font-bold">Flag format:</span>
            <span className="select-all">{APP.flagFormat}</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <div className="flex gap-4 z-10">
          {user ? (
            <>
              <Button
                asChild
                className="bg-orange-600 text-white hover:bg-orange-700 px-6 py-3 rounded-xl shadow-lg"
              >
                <a href="/challenges">Start Challenges</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="px-4 py-3 rounded-xl border-orange-600 text-orange-600 hover:bg-orange-50 shadow-lg"
              >
                <a href="/rules">Rules</a>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                className="bg-orange-600 text-white hover:bg-orange-700 px-6 py-3 rounded-xl shadow-lg"
              >
                <a href="/login">Login</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="px-6 py-3 rounded-xl border-orange-600 text-orange-600 hover:bg-orange-50 shadow-lg"
              >
                <a href="/register">Register</a>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer></Footer>
      {/* <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8 relative z-10">
        <div className="border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Built with{" "}
            <a
              href="https://nextjs.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 font-semibold hover:underline"
            >
              Next.js
            </a>
            ,{" "}
            <a
              href="https://tailwindcss.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 font-semibold hover:underline"
            >
              TailwindCSS
            </a>
            ,{" "}
            <a
              href="https://www.framer.com/motion/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 font-semibold hover:underline"
            >
              Framer Motion
            </a>
            , and hosted with{" "}
            <a
              href="https://supabase.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 font-semibold hover:underline"
            >
              Supabase
            </a>{" "}
            and{" "}
            <a
              href="https://vercel.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 font-semibold hover:underline"
            >
              Vercel
            </a>
            .
          </p>
          <p className="mt-1">
            Source code available on{" "}
            <a
              className="text-orange-500 font-semibold hover:underline"
              href={APP.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </a>
            , ©{APP.year} {APP.shortName}. All rights reserved.
          </p>
        </div>
      </footer> */}
    </div>
  )
}
