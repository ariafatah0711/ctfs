import React from 'react'
import APP from '@/config'
import { VERSION, BUILD_TIME } from "@/version";
import { Github, Coffee, Code2, Shield } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto relative z-10 py-12 border-t border-gray-100 dark:border-gray-900/50">
      <div className="max-w-6xl mx-auto px-6">

        {/* Layout 3 Kolom Presisi (33% masing-masing) */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">

          {/* KOLOM KIRI: Brand & Build */}
          <div className="flex flex-col items-center md:items-start space-y-2 overflow-hidden">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-lg font-black tracking-tighter text-gray-900 dark:text-white uppercase leading-none">
                {APP.shortName}<span className="text-blue-600"></span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400/80 font-mono">
                V{VERSION}
              </span>
              <span className="opacity-30">|</span>
              <span className="font-mono text-[9px]">{BUILD_TIME.split('T')[0]}</span>
            </div>
          </div>

          {/* KOLOM TENGAH: Support & Links */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
              <a href={APP.nxctf.nxctf_github} className="hover:text-blue-500 transition-colors">Repo</a>
              <a href={APP.nxctf.nxctf_docs} className="hover:text-blue-500 transition-colors">Docs</a>
              <a href={APP.links.discord} className="hover:text-blue-500 transition-colors">Discord</a>
            </div>

            <a
              href={APP.nxctf.nxctf_donation}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 px-3 py-2 bg-blue-600/5 dark:bg-blue-400/5 border border-blue-500/20 hover:border-orange-500/50 hover:bg-orange-500/5 text-blue-600 dark:text-blue-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-full transition-all duration-300 group shadow-sm"
            >
              <Coffee size={14} className="animate-bounce text-orange-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Support Dev</span>
            </a>
          </div>

          {/* KOLOM KANAN: Developer & Social (Gaya Favorit Lo) */}
          <div className="flex items-center justify-center md:justify-end gap-3">
            {/* Org Link */}
            <a
              href={APP.nxctf.nxctf_github_org}
              target="_blank"
              className="flex items-center gap-3 pl-3 pr-4 py-3 rounded-xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:border-blue-500 transition-all group shadow-sm"
              title="Organization"
            >
              <div className="p-1 rounded-lg bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Github size={18} />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Org</span>
                <span className="text-xs font-black text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{APP.nxctf.nxctf_title}</span>
              </div>
            </a>

            {/* Personal Link Card */}
            <a
              href={APP.nxctf.nxctf_author}
              target="_blank"
              className="flex items-center gap-3 pl-3 pr-4 py-3 rounded-xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:border-blue-500 transition-all group shadow-sm"
            >
              <div className="p-1 rounded-lg bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Code2 size={16} />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Creator</span>
                <span className="text-xs font-black text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">Aria Fatah</span>
              </div>
            </a>
          </div>

        </div>
      </div >
    </footer >
  )
}

export default Footer
