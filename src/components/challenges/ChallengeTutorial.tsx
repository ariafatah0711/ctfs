'use client'
import { useEffect, useState } from 'react'
import { MessageCircleQuestionMark } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { DIALOG_CONTENT_CLASS } from "@/styles/dialog"
import APP from '@/config'

interface ChallengeTutorialProps {}

export default function ChallengeTutorial(_: ChallengeTutorialProps) {
  // start closed; user opens with floating button
  const [show, setShow] = useState(false)
  const [toggleCount, setToggleCount] = useState(0)

  // Use centralized dialog class for consistent width/positioning
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
        <DialogContent className={`${DIALOG_CONTENT_CLASS} z-50 p-4 sm:p-5 overflow-y-auto shadow-xl`}>
          <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <span className="text-2xl flex-shrink-0">🎯</span>
              <div className="min-w-0">
                <h3 className="font-bold text-indigo-800 dark:text-indigo-300 text-lg sm:text-xl" title="New to CTF? Start Here!">New to CTF?</h3>
              </div>
            </div>

            <button onClick={() => setShow(false)} className="text-gray-500 hover:text-red-500 dark:text-gray-400 flex-shrink-0 text-xl leading-none" title="Close">✕</button>
          </div>

          <div className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
            <div className="space-y-2 sm:space-y-3">
              <div>
                <p className="font-semibold text-xs sm:text-sm">Apa itu CTF?</p>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>CTF (Capture The Flag)</strong> adalah kompetisi keamanan siber berbasis tantangan. Setiap challenge berisi masalah yang harus dipecahkan untuk menemukan <strong>flag</strong> (jawaban unik, misal: <code className="text-[11px] sm:text-xs bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded">{APP.flagFormat}</code>). Flag dikumpulkan untuk mendapatkan poin dan naik peringkat di scoreboard.
                </p>
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">Bagaimana cara bermain?</p>
                <ol className="list-decimal list-inside text-xs sm:text-sm text-gray-700 dark:text-gray-300 pl-2 space-y-1 leading-relaxed">
                  <li>Pilih challenge dari daftar.</li>
                  <li>Baca deskripsi dan instruksi dengan teliti.</li>
                  <li>Unduh file jika tersedia, atau akses link yang diberikan.</li>
                  <li>Analisa dan pecahkan masalahnya.</li>
                  <li>Temukan dan submit flag (jawaban) sesuai format.</li>
                </ol>
                <p className="text-xs sm:text-sm mt-2"><strong>Contoh flag:</strong> <code className="text-[11px] sm:text-xs bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded">{APP.flagFormat}</code></p>
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">Kategori Challenge</p>
                <ul className="list-disc list-inside text-xs sm:text-sm text-gray-700 dark:text-gray-300 pl-2 space-y-1 leading-relaxed">
                  <li><strong>Misc</strong>: Soal bebas, unik, atau aneh.</li>
                  <li><strong>Web</strong>: Eksploitasi aplikasi web (bug, celah, dsb).</li>
                  <li><strong>Crypto</strong>: Kriptografi, enkripsi, dan dekripsi.</li>
                  <li><strong>Forensic</strong>: Analisa file, network, atau memory dump.</li>
                  <li><strong>Reverse</strong>: Membongkar program/aplikasi untuk mencari flag.</li>
                </ul>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed"><strong>Tips:</strong> Mulai dari challenge <strong>Baby/Easy</strong>, gunakan <strong>hint</strong> jika tersedia, dan jangan ragu bertanya jika mentok!</p>
            </div>

            <div className="mt-3 sm:mt-4">
              <a
                href="/tutorial.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-indigo-600 dark:text-indigo-300 px-3 py-2 border border-indigo-100 dark:border-indigo-700 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                title="Download full tutorial (PDF)"
                aria-label="Download full tutorial PDF"
              >
                <span className="text-base flex-shrink-0">📄</span>
                <span>Full tutorial (PDF)</span>
              </a>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
