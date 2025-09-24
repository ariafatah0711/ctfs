import React from 'react';

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
        <li className="text-gray-400">No solves yet.</li>
      ) : (
        solvers.map((solver, idx) => (
          <li key={idx} className="flex justify-between text-gray-200 items-center">
            <div className="flex items-center gap-2">
              <a
                href={`/user/${solver.username}`}
                className={`hover:underline ${idx === 0 ? 'font-bold text-red-400' : 'text-pink-300'}`}
              >
                {solver.username}
              </a>
              {idx === 0 && (
                <span title="First Blood" className="text-red-400 text-lg font-bold">🩸</span>
              )}
            </div>
            <span className="text-xs text-gray-400">{new Date(solver.solvedAt).toLocaleString()}</span>
          </li>
        ))
      )}
    </ul>
  );
};

export default SolversList;
