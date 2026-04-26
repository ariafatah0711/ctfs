import React from 'react';

interface CustomBadgeProps {
  label: string;
  color?: string; // Tailwind color classes
  icon?: React.ReactNode;
  className?: string;
  width?: number; // minWidth in px
}

const CustomBadge: React.FC<CustomBadgeProps> = ({ label, color = '', icon, className = '', width }) => {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${color} ${className}`.trim()}
      style={{ minWidth: typeof width === 'number' ? width : 62, textAlign: 'center' }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
};

export default CustomBadge;
