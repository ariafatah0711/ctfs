"use client"

import { motion } from "framer-motion"
import Loader from "@/components/custom/loading"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { user, loading } = require("@/contexts/AuthContext").useAuth();

  if (loading) {
    return <Loader fullscreen color="text-orange-500" />
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 bg-gradient-to-b from-orange-50 to-gray-50">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl font-extrabold text-orange-600 mb-4"
        >
          Welcome to CTFS Platform 🚩
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-gray-700 max-w-2xl mb-8"
        >
          Practice your{" "}
          <span className="font-semibold">cybersecurity skills</span> through{" "}
          <span className="font-semibold">Jeopardy-style Capture The Flag (CTF)</span>{" "}
          challenges — solve chall, collect flags, and climb the{" "}
          <span className="font-semibold">leaderboard</span>.
        </motion.p>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          {user ? (
            <Button
              asChild
              className="bg-orange-600 text-white hover:bg-orange-700 px-6 py-3 rounded-xl"
            >
              <a href="/challanges">Start Challenges</a>
            </Button>
          ) : (
            <>
              <Button
                asChild
                className="bg-orange-600 text-white hover:bg-orange-700 px-6 py-3 rounded-xl"
              >
                <a href="/login">Login</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="px-6 py-3 rounded-xl border-orange-600 text-orange-600 hover:bg-orange-50"
              >
                <a href="/register">Register</a>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-8">
        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
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
            {/* Made With{" "}
            <a
              className="text-orange-500 font-semibold hover:underline"
              href="https://github.com/ariafatah0711"
              target="_blank"
              rel="noopener noreferrer"
            >
              aria
            </a> */}
            Source code available on{" "}
            <a
              className="text-orange-500 font-semibold hover:underline"
              href="https://github.com/ariafatah0711/ctfs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </a>
            , ©2025 CTFS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
