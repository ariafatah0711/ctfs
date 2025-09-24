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
        className={`cursor-pointer shadow-md rounded-md ${
          challenge.is_solved ? "bg-green-600" : "bg-blue-600"
        }`}
      >
        <CardHeader className="flex items-center justify-center">
          <h3 className="text-white font-semibold text-center truncate">
            {challenge.title}
          </h3>
        </CardHeader>
        <CardContent className="flex items-center justify-center gap-2 text-yellow-300 font-bold">
          🪙 {challenge.points}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChallengeCard;
