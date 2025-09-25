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
          A place to learn and compete in the field of{" "}
          <span className="font-semibold">Cybersecurity</span> through{" "}
          <span className="font-semibold">Capture The Flag (CTF)</span> challenges.
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
            Built with <span className="text-orange-500 font-semibold">Next.js</span>,{" "}
            <span className="text-orange-500 font-semibold">TailwindCSS</span>,{" "}
            <span className="text-orange-500 font-semibold">Framer Motion</span>,{" "}
            and hosted with{" "}
            <span className="text-orange-500 font-semibold">Supabase</span> and{" "}
            <span className="text-orange-500 font-semibold">Vercel</span>.
          </p>
          <p className="mt-1">© {new Date().getFullYear()} CTFS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
