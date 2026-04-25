import React from 'react'
import CustomBadge from '@/components/ui/CustomBadge'
import APP from '@/config'

interface DifficultyBadgeProps {
  difficulty?: string | null
  className?: string
  width?: number
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty, className = '', width }) => {
  // Capitalize first letter agar cocok dengan config
  const raw = (difficulty || '').toString().trim();
  const normalized = raw === 'imposible' ? 'Impossible' : raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  const styles = (APP as any).difficultyStyles || {};
  const colorName = styles[normalized];
  // Map color name to Tailwind classes
  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-600 text-white dark:bg-cyan-600 dark:text-white',
    green: 'bg-green-600 text-white dark:bg-green-600 dark:text-white',
    yellow: 'bg-yellow-500 text-white dark:bg-yellow-600 dark:text-white',
    red: 'bg-red-600 text-white dark:bg-red-600 dark:text-white',
    purple: 'bg-purple-600 text-white dark:bg-purple-600 dark:text-white',
  };
  const color = colorMap[colorName] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white';
  const label = difficulty || 'N/A';
  return (
    <CustomBadge label={label} color={color} className={className} width={typeof width === 'number' ? width : 62} />
  );
}

export default DifficultyBadge
