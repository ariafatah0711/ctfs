import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChallengeWithSolve } from "@/types";
import React from "react";
import APP from '@/config';

interface ChallengeCardProps {
  challenge: ChallengeWithSolve & {
    has_first_blood?: boolean;
    is_new?: boolean;
    is_team_solved?: boolean;
  };
  highlightTeamSolves?: boolean;
  onClick: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, highlightTeamSolves = true, onClick }) => {
  const isRecentlyCreated = challenge.is_new;
  const noFirstBlood = !challenge.has_first_blood;
  const isMaintenance = !!challenge.is_maintenance;
  const isTeamSolved = !!challenge.is_team_solved && highlightTeamSolves;

  let ribbonLabel: string | null = null;
  if (isMaintenance) ribbonLabel = "MAINTENANCE";
  else if (noFirstBlood) ribbonLabel = "🩸NEW CHALL🩸";
  else if (isRecentlyCreated) ribbonLabel = "NEW CHALL";

  // Difficulty color mapping (same as DifficultyBadge)
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

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      key={challenge.id}
      className="relative overflow-hidden group"
    >
      {/* Ribbon pojok kanan atas */}
      {ribbonLabel && (
        <div className="absolute top-2 right-[-32px] rotate-45 translate-y-[16px] z-20">
          <div className={`text-white text-[10px] font-bold px-8 py-1 shadow-md ${isMaintenance ? 'bg-amber-800' : 'bg-green-500'}`}>
            {ribbonLabel}
          </div>
        </div>
      )}

      {/* Difficulty badge top-left (icon + label) */}
      <div className="absolute top-1 left-1 z-10">
        <div
          className={`flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white shadow ${isMaintenance ? 'bg-amber-800' : diffCircleColor}`}
          title={`Difficulty: ${normalizedDiff}`}
          aria-label={`Difficulty: ${normalizedDiff}`}
        >
          <span className="capitalize">{normalizedDiff}</span>
        </div>
      </div>

      <Card
        onClick={isMaintenance ? undefined : onClick}
        className={`shadow-md rounded-md transition-colors
          ${isMaintenance
            ? 'bg-amber-800 dark:bg-amber-900 cursor-not-allowed opacity-95'
            : (challenge.is_solved
                ? 'bg-green-600 dark:bg-green-700 cursor-pointer'
                : (isTeamSolved
                    ? 'bg-purple-600 dark:bg-purple-700 cursor-pointer'
                    : 'bg-blue-600 dark:bg-blue-700 cursor-pointer'))}
        `}
      >
        <CardHeader className="flex items-center justify-center">
          <h3
            className="text-white dark:text-gray-100 font-semibold text-center truncate"
            style={{
              maxWidth: "180px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            }}
            title={challenge.title}
          >
            {challenge.title}
          </h3>
        </CardHeader>

        <CardContent className={`flex items-center justify-center gap-2 font-bold ${isMaintenance ? 'text-white' : 'text-yellow-300 dark:text-yellow-200'}`}>
          {challenge.points}
        </CardContent>
      </Card>

      {/* Solved count bottom-left */}
      <div className="absolute bottom-2 left-2 z-10">
        <div className={`text-white text-xs font-medium px-2 py-0.5 rounded-md shadow ${isMaintenance ? 'bg-amber-900/85' : 'bg-black/40'}`}>
          ✓ {challenge.total_solves ?? 0}
        </div>
      </div>

      {/* Maintenance hover info */}
      {isMaintenance && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="max-w-[260px] bg-amber-900/95 text-white text-[11px] leading-relaxed px-3 py-2 rounded-lg border border-amber-700 shadow-xl justify-center text-justify">
            <div className="font-semibold mb-1">⚠️ Informasi</div>
            <div>Saat ini service tidak dapat diakses karena VPS sudah tidak aktif.</div>
            <div>Peserta yang sudah mengerjakan tetap mendapatkan poin.</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChallengeCard;
