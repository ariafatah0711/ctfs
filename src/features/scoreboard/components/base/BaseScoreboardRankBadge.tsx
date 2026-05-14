import { LocateFixed } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type BaseScoreboardRankBadgeProps = {
  label: string
  rank?: number | null
  score?: React.ReactNode
  scoreLabel?: string
  rowHref?: string | null
  missingLabel: string
  className?: string
}

export default function BaseScoreboardRankBadge({
  label,
  rank,
  score,
  scoreLabel = 'Score',
  rowHref,
  missingLabel,
  className,
}: BaseScoreboardRankBadgeProps) {
  const hasRank = typeof rank === 'number' && rank > 0

  return (
    <div
      className={cn(
        'flex min-h-9 max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs shadow-[0_0_18px_rgba(59,130,246,0.08)]',
        className
      )}
    >
      <span className="shrink-0 font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
        {label}
      </span>
      {hasRank ? (
        <>
          <span className="font-black text-gray-900 dark:text-white">#{rank}</span>
          {typeof score !== 'undefined' && (
            <span className="font-semibold text-gray-500 dark:text-gray-300">
              {scoreLabel}: {score}
            </span>
          )}
          {rowHref && (
            <a
              href={rowHref}
              className="inline-flex h-6 shrink-0 items-center justify-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 text-[10px] font-black uppercase tracking-widest text-blue-600 transition hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:text-blue-400 dark:hover:text-white"
            >
              <LocateFixed size={12} />
              Jump
            </a>
          )}
        </>
      ) : (
        <span className="min-w-0 font-semibold text-gray-500 dark:text-gray-400">
          {missingLabel}
        </span>
      )}
    </div>
  )
}
