"use client"

import { BookOpen, Clock, ArrowRight } from "lucide-react"
import Footer from "@/components/custom/Footer"
import Link from "next/link"
import { motion } from "framer-motion"

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-[calc(100lvh-60px)] bg-gray-50/100 dark:bg-gray-900/100 relative overflow-hidden">
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
       {/* Decorative background shapes */}
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-orange-100 dark:bg-orange-900 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] bg-orange-200 dark:bg-orange-800 rounded-full blur-3xl opacity-30 animate-pulse" />

        <div
          className="
            w-full max-w-3xl
            bg-white dark:bg-gray-800/70 backdrop-blur-sm
            rounded-xl p-8
            shadow-md dark:shadow-lg/10
            translate-y-[-0.5rem]
          "
        >
          {/* ICON */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 flex justify-center"
          >
            <BookOpen size={56} className="text-blue-500" />
          </motion.div>

          {/* TITLE */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-orange-600 dark:text-orange-400 drop-shadow">
            Documentation
          </h1>

          {/* SUBTITLE */}
          <p className="mt-3 text-gray-700 dark:text-gray-200 max-w-xl mx-auto">
            Official guides and references for the CTF platform
          </p>

          {/* COMING SOON BADGE */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-md
                          border border-yellow-500/40 bg-yellow-50/40
                          text-yellow-600 dark:border-yellow-400/30 dark:bg-transparent dark:text-yellow-300
                          font-mono text-sm">
            <Clock size={16} />
            Coming Soon
          </div>

          {/* DESC */}
          <p className="mt-6 text-sm text-gray-700 dark:text-gray-200 max-w-md mx-auto font-mono">
            We’re preparing installation guides, configuration, and other documentation.
          </p>

          {/* ACTIONS */}
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2
                         border border-gray-300 dark:border-gray-600
                         rounded-md font-mono text-sm
                         hover:border-blue-500 hover:text-blue-500
                         dark:hover:border-blue-400 dark:hover:text-blue-400 transition"
            >
              Back to Home <ArrowRight size={16} />
            </Link>

            <Link
              href="/info"
              className="inline-flex items-center gap-2 px-4 py-2
                         border border-gray-300 dark:border-gray-600
                         rounded-md font-mono text-sm
                         hover:border-orange-500 hover:text-orange-500
                         dark:hover:border-orange-400 dark:hover:text-orange-400 transition"
            >
              Platform Info <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
