// React Imports
import React from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles, AlertTriangle, Globe, Bomb, Binary, Cpu, Search, Puzzle, Shield, Terminal, Lightbulb, Eye, Image as ImageIcon, Wifi, Flag, CheckCircle2 } from 'lucide-react';

// Shared Imports
import APP from '@/config';
import { ChallengeWithSolve } from '@/shared/types'
import { getCategoryDetails, getDifficultyStyle } from '../lib'


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

  const isSolved = challenge.is_solved;
  const isAnySolved = isSolved || isTeamSolved;

  // Difficulty color mapping
  const rawDiff = (challenge.difficulty || '').toString().trim();
  const normalizedDiff = rawDiff === 'imposible' ? 'Impossible' : rawDiff.charAt(0).toUpperCase() + rawDiff.slice(1).toLowerCase();
  const colorName = (APP as any).difficultyStyles?.[normalizedDiff];
  const { dotClass: diffDotColor, textClass: diffTextColor } = getDifficultyStyle(colorName);

  // Icon lookup for background decoration (UI-layer only)
  const categoryIconMap: Record<string, React.ElementType> = {
    'text-yellow-500': Lightbulb, 'text-emerald-500': Terminal, 'text-blue-500': Globe,
    'text-teal-500': Search, 'text-cyan-500': Eye, 'text-purple-500': Binary,
    'text-orange-500': Cpu, 'text-red-500': Bomb, 'text-pink-500': ImageIcon,
    'text-indigo-500': Wifi, 'text-gray-500': Puzzle,
  };
  const { color: categoryIconColor, borderColor: categoryBorderColor, badgeColor: categoryBadgeColor } = getCategoryDetails(challenge.category);
  const CategoryIcon = categoryIconMap[categoryIconColor] ?? Shield;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.98 }}
      key={challenge.id}
      className={`relative h-full group ${isMaintenance ? 'cursor-not-allowed' : 'cursor-pointer'} transition-opacity duration-300
        ${isAnySolved ? 'opacity-55 hover:opacity-85' : 'opacity-100'}`}
      onClick={isMaintenance ? undefined : onClick}
    >
      {/* Hover Glow Overlay */}
      <div className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none
        ${isSolved ? 'group-hover:bg-green-500/[0.05]' :
          isTeamSolved ? 'group-hover:bg-purple-500/[0.05]' :
            'group-hover:bg-blue-500/[0.06]'}`} />

      {/* Top Accent Line — only for unsolved */}
      {!isAnySolved && !isMaintenance && (
        <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      <div className={`relative h-full flex flex-col p-4 md:p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300
        ${isMaintenance
          ? 'bg-amber-500/[0.02] border-amber-500/20 dark:border-amber-500/10 border-dashed shadow-none'
          : isSolved
            ? 'bg-gray-800/60 border-green-500/25 dark:border-green-500/20 shadow-none'
            : isTeamSolved
              ? 'bg-gray-800/60 border-purple-500/25 dark:border-purple-500/20 shadow-none'
              : 'bg-gray-800/85 border-gray-600/50 group-hover:border-blue-400/60 shadow-md shadow-black/30 group-hover:shadow-blue-500/10'}`}
      >

        {/* Subtle Background Category Icon */}
        <div className={`absolute right-0 bottom-0 pointer-events-none z-0 overflow-hidden rounded-br-2xl ${categoryIconColor}
          ${isAnySolved ? 'opacity-[0.04]' : 'opacity-[0.15] group-hover:opacity-[0.16] transition-opacity duration-500'}`}>
          <CategoryIcon size={110} strokeWidth={1.2} />
        </div>

        {/* Solved Flag Badge — flush top-right corner, only user-solved */}
        {isSolved && (
          <div className="absolute top-0 right-0 z-20 flex items-center justify-center w-9 h-9 rounded-tr-2xl rounded-bl-2xl bg-green-500/15 border-b border-l border-green-500/40">
            <Flag size={13} className="text-green-400 fill-green-400" strokeWidth={2} />
          </div>
        )}

        {/* Team Solved Badge — top-right, only team solved (not personally) */}
        {isTeamSolved && !isSolved && (
          <div className="absolute top-0 right-0 z-20 flex items-center justify-center w-9 h-9 rounded-tr-2xl rounded-bl-2xl bg-purple-500/15 border-b border-l border-purple-500/40">
            <CheckCircle2 size={13} className="text-purple-400" strokeWidth={2} />
          </div>
        )}

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

            {/* LEFT: Category Badge + Feature Badge */}
            <div className="flex items-center gap-2">
              <div className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md w-fit
                ${isAnySolved
                  ? `${categoryBadgeColor} opacity-60`
                  : categoryBadgeColor}`}>
                {challenge.category}
              </div>

              {/* Feature Badge (T / S / TS) */}
              {featureBadge && (
                <span className="text-[11px] font-bold bg-gray-700/60 text-gray-400 px-1.5 rounded uppercase tracking-tight">
                  {featureBadge}
                </span>
              )}
            </div>

            {/* RIGHT: Points */}
            {/* mr-8 to avoid overlap with flag badge */}
            <div className={`text-base font-black tracking-tight leading-none ${isSolved ? 'mr-8' : isTeamSolved ? 'mr-8' : ''}
                ${isSolved
                ? 'text-green-400'
                : isTeamSolved
                  ? 'text-purple-400'
                  : 'text-white'}`}>
              {challenge.points} <span className="text-[10px] font-bold opacity-60">pts</span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-4 flex-1">
            <h3 className={`text-sm font-bold leading-5 line-clamp-1 md:text-base md:leading-6 transition-colors duration-200
              ${isSolved
                ? 'text-gray-400 group-hover:text-green-300'
                : isTeamSolved
                  ? 'text-gray-400 group-hover:text-purple-300'
                  : 'text-white group-hover:text-blue-300'}`}>
              {challenge.title}
            </h3>
          </div>
        </div>

        {/* Footer Area */}
        <div className={`flex items-center justify-between pt-3 border-t z-10 relative ${categoryBorderColor}`}>
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
            {isMaintenance ? (
              <span className="text-amber-500 flex items-center gap-1.5 font-black">
                <AlertTriangle size={12} className="animate-pulse" />
                Maintenance
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${diffTextColor.replace('text-', 'bg-').replace('-400', '-500')}`} />
                <span className="text-[11px] font-semibold tracking-tight text-gray-500">
                  {normalizedDiff}
                </span>
              </div>
            )}
          </div>

          {!isMaintenance && (
            <div className="flex items-center gap-3">
              {noFirstBlood ? (
                <span className="text-red-400 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                  <Flame size={11} className="fill-current" />
                  First Blood
                </span>
              ) : isRecentlyCreated ? (
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                    <Sparkles size={11} />
                    New
                  </span>
                  <div className="w-[1px] h-3 bg-gray-700" />
                  <div className="text-[10px] font-mono text-gray-500">
                    {challenge.total_solves ?? 0} solves
                  </div>
                </div>
              ) : (
                <div className="text-[10px] font-mono text-gray-500">
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
