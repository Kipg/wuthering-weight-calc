import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  borderColor?: 'blue' | 'amber' | 'purple' | 'red' | 'green' | 'cyan';
}

const borderColors: Record<string, string> = {
  blue: 'border-l-blue-400',
  amber: 'border-l-amber-400',
  purple: 'border-l-purple-400',
  red: 'border-l-red-400',
  green: 'border-l-green-400',
  cyan: 'border-l-cyan-400',
};

export function Card({ title, children, className = '', borderColor }: CardProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-blue-100 shadow-sm
      ${borderColor ? borderColors[borderColor] + ' border-l-4' : ''} ${className}`}
    >
      {title && <h3 className="text-base font-semibold text-gray-800 mb-3">{title}</h3>}
      {children}
    </div>
  );
}
