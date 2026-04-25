import React from 'react'
import APP from '@/config'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8 relative z-10">
      <div className="border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Built with{' '}
          <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer" className="text-orange-500 font-semibold hover:underline">Next.js</a>,{' '}
          <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer" className="text-orange-500 font-semibold hover:underline">TailwindCSS</a>,{' '}
          <a href="https://www.framer.com/motion/" target="_blank" rel="noopener noreferrer" className="text-orange-500 font-semibold hover:underline">Framer Motion</a>, and hosted with{' '}
          <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="text-orange-500 font-semibold hover:underline">Supabase</a>{' '}
          and{' '}
          <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" className="text-orange-500 font-semibold hover:underline">Vercel</a>.
        </p>
        <p className="mt-1">Source code available on{' '}
          <a className="text-orange-500 font-semibold hover:underline" href={APP.links.github} target="_blank" rel="noopener noreferrer">Github</a>, ©{APP.year} {APP.shortName}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
