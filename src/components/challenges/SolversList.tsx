import React from 'react';
import { formatRelativeDate } from '@/lib/utils'

export type Solver = {
  username: string;
  solvedAt: string;
};

interface SolversListProps {
  solvers: Solver[];
}

const SolversList: React.FC<SolversListProps> = ({ solvers }) => {
  return (
    <ul className="space-y-2 max-h-60 overflow-y-auto scroll-hidden">
      {solvers.length === 0 ? (
        <li className="text-gray-400 dark:text-gray-500">No solves yet.</li>
      ) : (
        solvers.map((solver, idx) => (
          <li key={idx} className="flex justify-between items-center text-gray-700 dark:text-gray-200">
            <div className="flex items-center gap-2">
                <a
                  href={`/user/${encodeURIComponent(solver.username)}`}
                  className={`hover:underline ${idx === 0 ? 'font-bold text-red-500 dark:text-red-400' : 'text-pink-600 dark:text-pink-300'} max-w-[120px] truncate block`}
                  style={{maxWidth: '120px'}}
                  title={solver.username}
                >
                  {solver.username}
                </a>
              {idx === 0 && (
                <span title="First Blood" className="text-red-500 dark:text-red-400 text-lg font-bold">🩸</span>
              )}
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-300">{formatRelativeDate(solver.solvedAt)}</span>
          </li>
        ))
      )}
    </ul>
  );
};

export default SolversList;
