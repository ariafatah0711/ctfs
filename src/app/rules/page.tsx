"use client"

import { RulesMarkdownRenderer } from '@/shared/markdown/MarkdownRenderer'
import Loader from '@/shared/components/Loader'
import PageBackground from '@/shared/components/PageBackground'
import Footer from "@/_layouts/Footer";
import { rulesConfig } from "@/rules";
import { useAuth } from '@/shared/contexts/AuthContext'
import {
  SURFACE_GLASS_CARD_COMPACT_CLASS,
  THEME_PRIMARY_SELECTION_CLASS,
  TYPO_PAGE_TITLE_CLASS,
  TYPO_CARD_TITLE_CLASS,
  TYPO_METADATA_CLASS
} from '@/shared/styles'
import { cn } from '@/shared/lib/utils'
import BackButton from '@/shared/components/BackButton'

export default function RulesPage() {
  const { loading } = useAuth()

  if (loading) return <Loader fullscreen />

  return (
    <PageBackground
      className="flex flex-col overflow-hidden"
      selectionClassName={THEME_PRIMARY_SELECTION_CLASS}
    >

      <main className="relative z-10 flex w-full flex-1 flex-col items-center px-4 py-6 sm:px-6">

        <div className="w-full max-w-6xl mx-auto">
          {/* TACTICAL HEADER */}
          <header className="mb-8 flex items-center justify-between border-b border-gray-200/50 pb-5 dark:border-gray-800/60">
            <div className="flex flex-col">
              <h1 className={TYPO_PAGE_TITLE_CLASS}>
                Platform Rules
              </h1>
              <div className={cn("flex items-center gap-1.5", TYPO_METADATA_CLASS)}>
                <div className="h-1 w-1 rounded-full bg-blue-500" />
                Play fair, hack hard
              </div>
            </div>

            <BackButton
              href="/"
              label="Dashboard"
              className="h-10 rounded-xl border border-gray-200/50 bg-white/50 px-4 hover:bg-white dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:bg-gray-800"
            />
          </header>

          {/* RULES LIST - Lightweight Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {rulesConfig.rules.map((rule, idx) => (
              <div
                key={idx}
                className={cn("group flex flex-col gap-2 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/40", SURFACE_GLASS_CARD_COMPACT_CLASS)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-mono font-black text-blue-600/10 group-hover:text-blue-500/20 transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h3 className={cn(TYPO_CARD_TITLE_CLASS, "uppercase tracking-tight")}>
                    {rule.title}
                  </h3>
                </div>

                <div className="pl-12 text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  <RulesMarkdownRenderer content={rule.description} />
                </div>
              </div>
            ))}
          </div>

          {/* STEALTH FLAG - Perfectly Invisible */}
          {rulesConfig.showHiddenFlag && (
            <div className="mt-8 flex justify-center">
              <p className="text-[8px] font-mono select-all cursor-help text-[#fafafa] dark:text-[#0b0f19] leading-none opacity-5 hover:opacity-100 transition-opacity">
                {rulesConfig.hiddenFlagBase64}
              </p>
            </div>
          )}
        </div>

      </main>

      <Footer />
    </PageBackground>
  )
}
