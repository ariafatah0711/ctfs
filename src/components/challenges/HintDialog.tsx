import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChallengeWithSolve } from "@/types";
import React from "react";

interface HintDialogProps {
  challenge: ChallengeWithSolve | null;
  hintIdx?: number;
  open: boolean;
  onClose: () => void;
}

const HintDialog: React.FC<HintDialogProps> = ({ challenge, hintIdx = 0, open, onClose }) => {
  if (!challenge) return null;
  const hints: string[] = Array.isArray(challenge.hint) ? challenge.hint : [];
  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent
        className="bg-[#232344] dark:bg-gray-900 rounded-md shadow-2xl max-w-xl min-w-[320px] w-full border border-[#35355e] dark:border-gray-700 p-6 font-mono [&_button.absolute.right-4.top-4]:block md:[&_button.absolute.right-4.top-4]:hidden [&_button.absolute.right-4.top-4]:text-white
"
        style={{ boxShadow: '0 8px 32px #0008', border: '1.5px solid #35355e' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-pink-300 dark:text-pink-200">
            <span className="w-8 h-8 bg-blue-200 dark:bg-blue-900 rounded-full flex items-center justify-center">💡</span>
            Hint for: {challenge.title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="bg-[#35355e] dark:bg-gray-800 border border-[#35355e] dark:border-gray-700 rounded-lg p-4">
            {hints[hintIdx] ? (
              <div className="text-gray-200 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">{hints[hintIdx]}</div>
            ) : (
              <p className="text-gray-400 dark:text-gray-400 italic">No hint available.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HintDialog;
