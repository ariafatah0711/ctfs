'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import APP from '@/config'
import ConfirmDialog from '@/components/custom/ConfirmDialog'

interface ChallengeTutorialProps {
  solvedCount: number
  solveThreshold: number
  tutorialState: { minimized: boolean; dismissed: boolean }
  setTutorialState: React.Dispatch<React.SetStateAction<{ minimized: boolean; dismissed: boolean }>>
}

export default function ChallengeTutorial({ solvedCount, solveThreshold, tutorialState, setTutorialState }: ChallengeTutorialProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [show, setShow] = useState(false)

  // Delay tampil
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 700)
    return () => clearTimeout(t)
  }, [])

  // Jika sudah dismissed DAN sudah mencapai threshold, atau delay belum selesai, jangan tampilkan
  if ((tutorialState.dismissed && solvedCount >= solveThreshold) || !show) return null

  return (
    <div
      className={`bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-2xl transition-all border border-orange-200 dark:border-orange-800 p-3 sm:p-4 mb-4 sm:mb-8 overflow-hidden`}
    >
      {/* HEADER */}
      <div className="flex flex-row justify-between items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl sm:text-3xl">🎯</span>
          <div className="min-w-0">
            <h3
              className={`font-bold text-orange-800 dark:text-orange-300 ${
                tutorialState.minimized ? 'text-sm sm:text-lg mb-0' : 'text-base sm:text-xl mb-2'
              } truncate`}
              style={{ maxWidth: '300px' }}
              title="New to CTF? Start Here!"
            >
              New to CTF? {!tutorialState.minimized && 'Start Here!'}
            </h3>
            {tutorialState.minimized && (
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate" style={{ maxWidth: '500px' }}>
                {solvedCount >= solveThreshold
                  ? 'Klik untuk membuka panduan pemula'
                  : `Klik untuk membuka panduan pemula (${solveThreshold - solvedCount} solve lagi untuk bisa ditutup)`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Minimize/Maximize button: selalu tampil */}
          <button
            onClick={() => setTutorialState(s => ({ ...s, minimized: !s.minimized }))}
            className="ml-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors p-1 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30"
            title={tutorialState.minimized ? 'Show full guide' : 'Minimize guide'}
          >
            {tutorialState.minimized ? (
              <motion.span whileTap={{ scale: 0.92 }} className="inline-flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.span>
            ) : (
              <motion.span whileTap={{ scale: 0.92 }} className="inline-flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4 9a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.span>
            )}
          </button>
        </div>
      </div>

      {/* BODY */}
      <motion.div
        initial={false}
        animate={tutorialState.minimized ? { height: 0, opacity: 0 } : { height: 'auto', opacity: 1 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        style={{ overflow: 'hidden', position: 'relative' }}
        className="text-gray-700 dark:text-gray-300"
      >
        <div className="space-y-2 mt-2 text-xs sm:text-sm">
          <div className="grid gap-2">
            <div>
              <p className="font-semibold text-xs">Apa itu CTF?</p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <strong>CTF (Capture The Flag)</strong> adalah kompetisi keamanan siber berbasis tantangan. Setiap challenge berisi masalah yang harus dipecahkan untuk menemukan <strong>flag</strong> (jawaban unik, misal: <code className="text-[10px]">{APP.flagFormat}</code>). Flag dikumpulkan untuk mendapatkan poin dan naik peringkat di scoreboard.
              </p>
            </div>
            <div>
              <p className="font-semibold text-xs">Bagaimana cara bermain?</p>
              <ol className="list-decimal list-inside text-xs text-gray-700 dark:text-gray-300 pl-3">
                <li>Pilih challenge dari daftar.</li>
                <li>Baca deskripsi dan instruksi dengan teliti.</li>
                <li>Unduh file jika tersedia, atau akses link yang diberikan.</li>
                <li>Analisa dan pecahkan masalahnya.</li>
                <li>Temukan dan submit flag (jawaban) sesuai format.</li>
              </ol>
              <p className="text-xs mt-1"><strong>Contoh flag:</strong> <code className="text-[10px]">{APP.flagFormat}</code></p>
            </div>
            <div>
              <p className="font-semibold text-xs">Kategori Challenge</p>
              <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300 pl-3">
                <li><strong>Misc</strong>: Soal bebas, unik, atau aneh.</li>
                <li><strong>Web</strong>: Eksploitasi aplikasi web (bug, celah, dsb).</li>
                <li><strong>Crypto</strong>: Kriptografi, enkripsi, dan dekripsi.</li>
                <li><strong>Forensic</strong>: Analisa file, network, atau memory dump.</li>
                <li><strong>Reverse</strong>: Membongkar program/aplikasi untuk mencari flag.</li>
              </ul>
            </div>
            <p className="text-xs"><strong>Tips:</strong> Mulai dari challenge <strong>Baby/Easy</strong>, gunakan <strong>hint</strong> jika tersedia, dan jangan ragu bertanya jika mentok!</p>
          </div>
          <div className="mt-2">
            <a
              href="/tutorial.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-orange-600 dark:text-orange-400 px-2 py-1 border border-orange-200 dark:border-orange-800 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/20"
              title="Download full tutorial (PDF)"
              aria-label="Download full tutorial PDF"
            >
              <span className="text-sm">📄</span>
              <span>Full tutorial (PDF)</span>
            </a>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
            {solvedCount >= solveThreshold
              ? 'Kamu sudah cukup solve, kamu bisa menutup tutorial ini dengan tombol Close di kanan bawah.'
              : `${solveThreshold - solvedCount} solve lagi untuk bisa menutup tutorial ini secara permanen`}
          </div>
        </div>

        {/* Tombol close di kanan bawah, hanya jika sudah solvedCount >= solveThreshold dan tidak minimized */}
        {solvedCount >= solveThreshold && !tutorialState.minimized && (
          <button
            onClick={() => setShowConfirm(true)}
            className="fixed sm:absolute bottom-3 right-3 z-10 bg-orange-600 text-white dark:bg-orange-500 dark:text-gray-900 px-4 py-1.5 rounded-lg shadow hover:bg-orange-700 dark:hover:bg-orange-400 transition-colors text-xs sm:text-sm font-semibold"
            style={{ minWidth: 70 }}
          >
            Close
          </button>
        )}

        <ConfirmDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          title="Tutup Tutorial"
          description={
            <div className="space-y-2">
              <p>Apakah kamu yakin ingin menutup tutorial ini secara permanen?</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Kamu bisa menampilkannya kembali dengan membersihkan localStorage bagian ctf_tutorialState - dismissed: true.
              </p>
            </div>
          }
          confirmLabel="Tutup"
          cancelLabel="Batal"
          onConfirm={() => setTutorialState(s => ({ ...s, dismissed: true }))}
        />
      </motion.div>
    </div>
  )
}
