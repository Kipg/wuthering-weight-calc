import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
  children: ReactNode;
  icon?: LucideIcon;
}

export function SectionTitle({ children, icon: Icon }: SectionTitleProps) {
  return (
    <h2 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
      {Icon && <Icon size={20} />}
      {children}
    </h2>
  );
}
