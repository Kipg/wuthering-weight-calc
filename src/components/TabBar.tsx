import { User, Cpu, Swords, Zap, BarChart3, TrendingUp } from 'lucide-react';

export type TabKey = 'char-weapon' | 'echo' | 'skill' | 'buff' | 'result' | 'analysis';

export interface TabDef {
  key: TabKey;
  label: string;
  icon: typeof User;
}

export const TABS: TabDef[] = [
  { key: 'char-weapon', label: '角色&武器', icon: User },
  { key: 'echo', label: '声骸', icon: Cpu },
  { key: 'skill', label: '技能', icon: Swords },
  { key: 'buff', label: '额外Buff', icon: Zap },
  { key: 'result', label: '计算结果', icon: BarChart3 },
  { key: 'analysis', label: '计算分析', icon: TrendingUp },
];

interface Props {
  active: TabKey;
  onChange: (key: TabKey) => void;
  hasResult: boolean;
}

export function TabBar({ active, onChange, hasResult }: Props) {
  return (
    <div className="flex gap-1 p-1 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
              isActive
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon size={16} />
            {tab.label}
            {(tab.key === 'result' || tab.key === 'analysis') && hasResult && !isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
