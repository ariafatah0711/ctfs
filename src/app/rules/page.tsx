"use client"

import { motion } from "framer-motion";
import { ArrowLeft } from 'lucide-react';
import Link from "next/link";
import { RulesMarkdownRenderer, Loader, BrandLogo } from '@/shared/components'
import { Footer } from "@/shared/components/custom";
import { rulesConfig } from "@/rules";

export default function RulesPage() {
  const { loading } = require("@/shared/contexts").useAuth();

  if (loading) return <Loader fullscreen color="text-blue-500" />

  return (
    <div className="flex flex-col min-h-[calc(100lvh-60px)] bg-[#fafafa] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 selection:bg-blue-500/30 overflow-hidden">

      {/* Background Effects - Ultra Subtle */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
        <div className="absolute bottom-0 left-100 w-[50%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center pt-8 pb-8 relative z-10 w-full px-6">

        <div className="w-full max-w-6xl mx-auto">
          {/* ULTRA MINIMAL HEADER */}
          <header className="flex items-center justify-between mb-12 border-b border-gray-100 dark:border-gray-900/50 pb-6">
            <div className="flex items-center gap-4">
              <BrandLogo name="Rules" className="text-2xl md:text-3xl" />
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Dashboard</span>
            </Link>
          </header>

          {/* RULES LIST - Lightweight Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {rulesConfig.rules.map((rule, idx) => (
              <div
                key={idx}
                className="group flex flex-col gap-2 p-4 rounded-2xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all duration-200 cursor-pointer"
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
    </div>
  )
}
