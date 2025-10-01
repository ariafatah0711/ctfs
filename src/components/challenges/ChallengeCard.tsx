import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChallengeWithSolve, Attachment } from "@/types";
import React from "react";

interface ChallengeCardProps {
  challenge: ChallengeWithSolve;
  onClick: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      key={challenge.id}
    >
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
              maxWidth: '180px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
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
