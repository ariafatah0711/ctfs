// React Imports
import React from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles, AlertTriangle, Globe, Bomb, Binary, Cpu, Search, Puzzle, Shield, Terminal, Lightbulb, Eye, Image as ImageIcon, Wifi } from 'lucide-react';

// Shared Imports
import APP from '@/config';
import { ChallengeWithSolve } from '@/shared/types'

const getCategoryDetails = (category: string) => {
  const cat = (category || '').toLowerCase();
  // Matching APP.challengeCategories from config
  if (cat.includes('intro')) return { Icon: Lightbulb, color: 'text-yellow-500' };
  if (cat.includes('boot to root')) return { Icon: Terminal, color: 'text-emerald-500' };
  if (cat.includes('web')) return { Icon: Globe, color: 'text-blue-500' };
  if (cat.includes('forensic')) return { Icon: Search, color: 'text-teal-500' };
  if (cat.includes('osint')) return { Icon: Eye, color: 'text-cyan-500' };
  if (cat.includes('crypto')) return { Icon: Binary, color: 'text-purple-500' };
  if (cat.includes('rev')) return { Icon: Cpu, color: 'text-orange-500' };
  if (cat.includes('pwn') || cat.includes('exploit')) return { Icon: Bomb, color: 'text-red-500' };
  if (cat.includes('steg')) return { Icon: ImageIcon, color: 'text-pink-500' };
  if (cat.includes('network')) return { Icon: Wifi, color: 'text-indigo-500' };
  if (cat.includes('misc')) return { Icon: Puzzle, color: 'text-gray-500' };

  return { Icon: Shield, color: 'text-gray-500' }; // fallback
};

interface ChallengeCardProps {
  challenge: ChallengeWithSolve & {
    has_first_blood?: boolean;
    is_new?: boolean;
    has_questions?: boolean;
    is_team_solved?: boolean;
    is_maintenance?: boolean;
  };
  highlightTeamSolves?: boolean;
  showCategory?: boolean;
  onClick: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, highlightTeamSolves = true, showCategory = false, onClick }) => {
  const isRecentlyCreated = challenge.is_new;
  const noFirstBlood = !challenge.has_first_blood;
  const isMaintenance = !!challenge.is_maintenance;
  const isTeamSolved = !!challenge.is_team_solved && highlightTeamSolves;

  const hasQuestions = !!challenge.has_questions;
  const hasServices = Array.isArray((challenge as any).services) && (challenge as any).services.length > 0;
  const featureBadge = hasQuestions && hasServices ? 'TS' : hasQuestions ? 'T' : hasServices ? 'S' : null;

  // Difficulty color mapping
  const rawDiff = (challenge.difficulty || '').toString().trim();
  const normalizedDiff = rawDiff === 'imposible' ? 'Impossible' : rawDiff.charAt(0).toUpperCase() + rawDiff.slice(1).toLowerCase();
  const colorName = (APP as any).difficultyStyles?.[normalizedDiff];
  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-400',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };
  const diffCircleColor = colorMap[colorName] || 'bg-gray-300';

  const { Icon: CategoryIcon, color: categoryIconColor } = getCategoryDetails(challenge.category);

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      key={challenge.id}
      className={`relative h-full group ${isMaintenance ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={isMaintenance ? undefined : onClick}
    >
      {/* Glow Effect on Hover */}
      <div className={`absolute inset-0 rounded-2xl transition-colors duration-300 pointer-events-none
        ${challenge.is_solved ? 'bg-green-500/0 group-hover:bg-green-500/[0.06]' :
          isTeamSolved ? 'bg-purple-500/0 group-hover:bg-purple-500/[0.06]' :
          'bg-blue-500/0 group-hover:bg-blue-500/[0.04]'}`} />

      <div className={`relative h-full flex flex-col p-4 md:p-5 rounded-2xl border backdrop-blur-md transition-all duration-300
        ${isMaintenance
          ? 'bg-amber-500/[0.02] border-amber-500/20 dark:border-amber-500/10 border-dashed opacity-70 shadow-none'
          : challenge.is_solved
            ? 'bg-green-500/[0.08] border-green-500/50 dark:bg-green-500/[0.05] dark:border-green-500/40 shadow-sm shadow-green-500/20'
            : isTeamSolved
              ? 'bg-purple-500/[0.08] border-purple-500/50 dark:bg-purple-500/[0.05] dark:border-purple-500/40 shadow-sm shadow-purple-500/20'
              : 'bg-white/40 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 group-hover:border-blue-500/50 shadow-sm'}
       hover:shadow-md`}
      >

        {/* Subtle Background Icon */}
        <div className={`absolute right-0 pointer-events-none opacity-[0.2] dark:opacity-[0.04] z-0 transition-transform duration-500 ease-out group-hover:scale-110 blur-[1px] overflow-hidden rounded-br-2xl ${categoryIconColor}`}>
          <CategoryIcon size={120} strokeWidth={1.5} />
        </div>

        <div className="relative flex-1 flex flex-col z-10">
          {/* Maintenance Overlay Info */}
          {isMaintenance && (
            <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/70 dark:bg-gray-950 backdrop-blur-[4px] rounded-xl pointer-events-none">
              <p className="text-[10px] font-black text-center px-4 text-amber-600 dark:text-amber-500 leading-relaxed uppercase tracking-wider">
                This service is currently unavailable. Points remain awarded to those who solved it.
              </p>
            </div>
          )}

          {/* Header Area */}
          <div className="flex items-start justify-between mb-3">

            {/* LEFT: Category + Difficulty */}
            <div className="flex items-center gap-2">
              <div className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md w-fit
        ${isMaintenance
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                  : challenge.is_solved
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                    : isTeamSolved
                      ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400'
                      : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'}`}>
                {challenge.category}
              </div>

              {/* MODE (T / S / TS) */}
              {featureBadge && (
                <span className="text-[11px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 px-1.5 rounded uppercase tracking-tight">
                  {featureBadge}
                </span>
              )}
            </div>

            {/* RIGHT: Mode + Points */}
            <div className="flex flex-col items-end justify-between h-full gap-1">

              {/* POINTS */}
              <div className={`text-lg font-black tracking-tight leading-none
                  ${challenge.is_solved
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-900 dark:text-white'}`}>
                {challenge.points}
              </div>

            </div>
          </div>

          {/* Title */}
          <div className="mb-4 h-10 overflow-hidden md:h-12">
            <h3 className={`h-full overflow-hidden text-ellipsis break-words text-sm font-bold leading-5 text-gray-900 transition-colors line-clamp-2 dark:text-gray-100 md:text-base md:leading-6
              ${challenge.is_solved ? 'group-hover:text-green-600 dark:group-hover:text-green-400' :
                isTeamSolved ? 'group-hover:text-purple-600 dark:group-hover:text-purple-400' :
                'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
              {challenge.title}
            </h3>
          </div>
        </div>

        {/* Footer Area */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/50 z-10 relative">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
            {isMaintenance ? (
              <span className="text-amber-600 dark:text-amber-500 flex items-center gap-1.5 font-black">
                <AlertTriangle size={12} className="animate-pulse" />
                Maintenance
              </span>
            ) : (
              /* DEFAULT: Show Difficulty Indicator */
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${diffCircleColor}`} />
                <span className="text-gray-400 dark:text-gray-500 font-bold tracking-tight">
                  {normalizedDiff}
                </span>
              </div>
            )}
          </div>

          {!isMaintenance && (
            <div className="flex items-center gap-3">
              {noFirstBlood ? (
                <span className="text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                  <Flame size={12} className="fill-current" />
                  First Blood Available
                </span>
              ) : isRecentlyCreated ? (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                    <Sparkles size={12} />
                    New
                  </span>
                  <div className="w-[1px] h-3 bg-gray-200 dark:bg-gray-800/50 ml-1" />
                  <div className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                    {challenge.total_solves ?? 0} {challenge.total_solves === 1 ? 'solve' : 'solves'}
                  </div>
                </div>
              ) : (
                <div className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                  {challenge.total_solves ?? 0} {challenge.total_solves === 1 ? 'solve' : 'solves'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
};

export default ChallengeCard;
