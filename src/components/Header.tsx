import type { ReactNode } from 'react';

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="border-b border-blue-100 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">鸣潮伤害计算器</h1>
          <p className="text-sm text-gray-500 mt-0.5">Wuthering Waves Damage Calculator</p>
        </div>
        {children}
      </div>
    </header>
  );
}
