import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChallengeWithSolve } from "@/types";
import React from "react";
import APP from '@/config';

interface ChallengeCardProps {
  challenge: ChallengeWithSolve & {
    has_first_blood?: boolean;
    is_new?: boolean;
  };
  onClick: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onClick }) => {
  const isRecentlyCreated = challenge.is_new;
  const noFirstBlood = !challenge.has_first_blood;

  let ribbonLabel: string | null = null;
  if (noFirstBlood) ribbonLabel = "🩸NEW CHALL🩸";
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
      className="relative overflow-hidden"
    >
      {/* Ribbon pojok kanan atas */}
      {ribbonLabel && (
        <div className="absolute top-2 right-[-32px] rotate-45 translate-y-[16px]">
          <div className="bg-green-500 text-white text-[10px] font-bold px-8 py-1 shadow-md">
            {ribbonLabel}
          </div>
        </div>
      )}

      {/* Difficulty circle kanan atas */}
      <div className="absolute top-2 right-2 z-10">
        <span className={`block w-2 h-2 rounded-full shadow ${diffCircleColor}`}></span>
      </div>

      <Card
        onClick={onClick}
        className={`cursor-pointer shadow-md rounded-md transition-colors
          ${challenge.is_solved
            ? 'bg-green-600 dark:bg-green-700'
            : 'bg-blue-600 dark:bg-blue-700'}
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

        <CardContent className="flex items-center justify-center gap-2 text-yellow-300 dark:text-yellow-200 font-bold">
          🪙 {challenge.points}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChallengeCard;
