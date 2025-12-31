'use client'
import { useEffect, useState } from 'react'
import { MessageCircleQuestionMark } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog'
import APP from '@/config'

interface ChallengeTutorialProps {}

export default function ChallengeTutorial(_: ChallengeTutorialProps) {
  // start closed; user opens with floating button
  const [show, setShow] = useState(false)
  const [toggleCount, setToggleCount] = useState(0)

  // fixed large size for tutorial panel
  const sizeClasses = 'w-[520px] max-h-[80vh]'

   // No positioning logic here — toolbar container handles stacking.

  return (
    <>
      {/* Floating toggle button — position follows ScrollToggle when present */}
      {/* Position tutorial above other floating toggles; support up to 3 stacks */}
      {/** bottom spacing map: 0 -> 6, 1 -> 24, 2 -> 40, 3+ -> 56 */}
        <div>
        <button
          aria-label="Open tutorial"
          onClick={() => setShow(s => !s)}
            className="h-12 w-12 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          title={show ? 'Close tutorial' : 'Open tutorial'}
        >
          <MessageCircleQuestionMark size={20} />
        </button>
        </div>

      {/* detect presence of ScrollToggle and update position */}
      <script
        // noop: script tag to ensure client-only execution block for MutationObserver
        dangerouslySetInnerHTML={{ __html: '' }}
      />

      {/* Panel (Dialog) */}
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className={`${sizeClasses} z-50 bg-white dark:bg-gray-800 rounded-2xl transition-all border border-gray-200 dark:border-gray-700 p-3 sm:p-4 overflow-hidden shadow-xl`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl">🎯</span>
              <div className="min-w-0">
                <h3 className="font-bold text-indigo-800 dark:text-indigo-300 text-base sm:text-lg truncate" title="New to CTF? Start Here!">New to CTF?</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate" style={{ maxWidth: 260 }}>Panduan pemula — tekan Close untuk menutup.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setShow(false)} className="ml-1 text-gray-500 hover:text-red-500 dark:text-gray-400" title="Close">✕</button>
            </div>
          </div>

          <div className="text-gray-700 dark:text-gray-300 mt-3 text-xs sm:text-sm">
            <div className="space-y-2">
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
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-indigo-600 dark:text-indigo-300 px-2 py-1 border border-indigo-100 dark:border-indigo-700 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                title="Download full tutorial (PDF)"
                aria-label="Download full tutorial PDF"
              >
                <span className="text-sm">📄</span>
                <span>Full tutorial (PDF)</span>
              </a>
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
              Panduan pemula — tutup dialog jika sudah paham.
            </div>

            <div className="mt-3">
              <button
                onClick={() => setShow(false)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs sm:text-sm font-semibold shadow hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
