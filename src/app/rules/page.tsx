"use client"

import { ArrowLeft } from 'lucide-react';
import Link from "next/link";
import { RulesMarkdownRenderer } from '@/shared/markdown/MarkdownRenderer'
import Loader from '@/shared/components/Loader'
import BrandLogo from '@/shared/components/BrandLogo'
import PageBackground from '@/shared/components/PageBackground'
import Footer from "@/_layouts/Footer";
import { rulesConfig } from "@/rules";
import { useAuth } from '@/shared/contexts/AuthContext'
import { SURFACE_GLASS_CARD_COMPACT_CLASS, THEME_PRIMARY_SELECTION_CLASS } from '@/shared/styles'

export default function RulesPage() {
  const { loading } = useAuth()

  if (loading) return <Loader fullscreen />

  return (
    <PageBackground
      className="flex flex-col overflow-hidden"
      selectionClassName={THEME_PRIMARY_SELECTION_CLASS}
    >

      <main className="relative z-10 flex w-full flex-1 flex-col items-center px-4 py-8 sm:px-6">

        <div className="w-full max-w-6xl mx-auto">
          {/* ULTRA MINIMAL HEADER */}
          <header className="mb-6 flex items-center justify-between border-b border-gray-200/70 pb-4 dark:border-gray-800/80">
            <div className="flex items-center gap-4">
              <BrandLogo name="Rules" className="text-2xl md:text-3xl" />
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:bg-blue-500/10 hover:text-blue-500 md:text-sm"
            >
              <ArrowLeft size={16} />
              <span>Dashboard</span>
            </Link>
          </header>

          {/* RULES LIST - Lightweight Grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {rulesConfig.rules.map((rule, idx) => (
              <div
                key={idx}
                className={`group flex cursor-pointer flex-col gap-2 p-4 ${SURFACE_GLASS_CARD_COMPACT_CLASS} transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/40`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-mono font-black text-blue-600/20 group-hover:text-blue-500 transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-base font-black text-gray-800 dark:text-gray-200 tracking-tight uppercase">
                    {rule.title}
                  </h3>
                </div>

                <div className="pl-12 text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  <RulesMarkdownRenderer content={rule.description} />
                </div>
              </div>
            ))}
          </div>

          {/* STEALTH FLAG - Perfectly Invisible */}
          {rulesConfig.showHiddenFlag && (
            <div className="mt-4 flex justify-center">
              <p className="text-[8px] font-mono select-all cursor-help text-[#fafafa] dark:text-[#0b0f19] leading-none">
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
