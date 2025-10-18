"use client"

import { useState, useEffect } from "react";
import Loader from '@/components/custom/loading';
import Footer from "@/components/custom/Footer"
import { motion } from "framer-motion";
import APP from '@/config';
import { RulesMarkdownRenderer } from '@/components/MarkdownRenderer'
import { Button } from '@/components/ui/button';

const RULES = [
  {
    title: "Fokus ke Challenge",
    description: "Mainkan challenge untuk mencari solusi/flag. Fokus pada permainan — jangan ganggu atau eksploitasi layanan lain."
  },
  {
    title: "Kolaborasi & Bantuan",
    description: "Boleh bekerja sama, pakai AI, atau tanya ke author/admin. Tapi **jangan pernah** membagikan flag ke publik atau pihak ketiga."
  },
  {
    title: "Membuat Writeup",
    description: "Writeup boleh dipublikasikan **setelah 30 hari** sejak challenge dipublikasikan dan hanya jika challenge sudah disolve **minimal 10 orang**. Semua flag harus dibuat **{REDACTED}**. Agar tidak mengurangi keseruan peserta lain."
  },
  {
    title: "Akun & Identitas",
    description: "Gunakan satu akun per peserta. Dilarang membuat akun ganda untuk keuntungan apa pun (misalnya farming poin atau hadiah)."
  },
  {
    title: "Etika & Privasi",
    description: "Hormati privasi peserta lain. Jangan mengambil, menyebarkan, atau menyalahgunakan data pribadi."
  },
  {
    title: "Larangan Serangan & Bruteforce",
    description: "Jangan menyerang host atau website platform ini. Dilarang melakukan bruteforce terhadap website utama CTF atau layanan pendukungnya."
  },
  {
    title: "Pelaporan Bug",
    description: "Jika menemukan celah keamanan, atau Bug pada platform, segera laporkan ke admin!"
  },
];

export default function RulesPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600); // 600ms for smoothness
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader fullscreen color="text-orange-500" />;
  }

  return (
    <div className="flex flex-col min-h-[calc(100lvh-60px)] bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-orange-100 dark:bg-orange-900 rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-orange-200 dark:bg-orange-800 rounded-full blur-3xl opacity-30 animate-pulse" />

     <section className="flex flex-col items-center justify-start pt-8 md:pt-12 flex-1 text-center px-4 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-3xl md:text-4xl font-extrabold text-orange-600 dark:text-orange-400 mb-2 drop-shadow"
        >
          Platform Rules 🚩
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-base md:text-lg text-gray-700 dark:text-gray-200 max-w-2xl md:max-w-3xl mb-6"
        >
          Mohon baca dan patuhi aturan berikut sebelum mengikuti challenge di {APP.fullName}.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className="mb-6 flex flex-col items-center justify-center gap-3 w-full cursor-pointer"
        >
          <div className="w-full max-w-3xl">
           {RULES.map((rule, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.01, y: -1 }}
              transition={{ type: "spring", stiffness: 250, damping: 15 }}
              className={`group flex gap-3 items-start bg-white/90 dark:bg-gray-800/90
                          border border-transparent dark:border-transparent rounded-md
                          px-4 py-3 shadow-sm text-sm md:text-base text-left w-full
                          hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-700
                          hover:bg-orange-100 dark:hover:bg-gray-800/70
                          transition-all duration-300 ease-out
                          ${idx < RULES.length - 1 ? 'mb-2' : ''}`}
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-3 h-3 rounded-full bg-orange-600 dark:bg-orange-500
                                group-hover:scale-125 transition-transform duration-300" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-orange-700 dark:text-orange-400 group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors duration-300">
                  {rule.title}
                </div>
                <div className="text-gray-700 dark:text-gray-200 leading-snug mt-1">
                  <RulesMarkdownRenderer content={rule.description} />
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </motion.div>

        <p className="text-gray-50 dark:text-gray-900">
          RkdURXtZb3VfSGF2ZV9BY2NlcHRlZF9BbGxfUnVsZXNfQW5kX0V0aGljc30=
        </p>

        <div className="w-full max-w-3xl mt-2 flex justify-center">
          <Button asChild className="bg-orange-600 text-white hover:bg-orange-700 px-4 py-2 rounded-lg shadow text-sm">
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </section>

      <Footer></Footer>
    </div>
  )
}
