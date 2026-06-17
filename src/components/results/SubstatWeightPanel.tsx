import type { SubstatWeightItem } from '../../types';
import { TrendingUp } from 'lucide-react';

interface Props {
  weights: SubstatWeightItem[];
}

function pct(v: number): string {
  const fixed = v.toFixed(2);
  return v > 0 ? `+${fixed}%` : `${fixed}%`;
}

const BAR_COLORS = [
  'bg-gradient-to-r from-red-400 to-red-500',
  'bg-gradient-to-r from-orange-400 to-orange-500',
  'bg-gradient-to-r from-amber-400 to-amber-500',
  'bg-gradient-to-r from-yellow-400 to-yellow-500',
  'bg-gradient-to-r from-lime-400 to-lime-500',
  'bg-gradient-to-r from-green-400 to-green-500',
  'bg-gradient-to-r from-emerald-400 to-emerald-500',
  'bg-gradient-to-r from-teal-400 to-teal-500',
  'bg-gradient-to-r from-cyan-400 to-cyan-500',
  'bg-gradient-to-r from-sky-400 to-sky-500',
  'bg-gradient-to-r from-blue-400 to-blue-500',
  'bg-gradient-to-r from-indigo-400 to-indigo-500',
  'bg-gradient-to-r from-purple-400 to-purple-500',
];

export function SubstatWeightPanel({ weights }: Props) {
  if (weights.length === 0) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
        <TrendingUp size={16} className="text-blue-500" />
        声骸副词条权重分析
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        基于各副词条平均值，对比提升一条副词条后的伤害变化
        <span className="block mt-0.5 text-amber-500 bg-amber-50 rounded px-1.5 py-0.5 inline-block">
          不计算声骸已有属性——用于声骸强化选择参考
        </span>
      </p>

      <div className="space-y-1.5">
        {weights.map((item, i) => (
          <div key={item.statType} className="flex items-center gap-2">
            {/* Rank */}
            <span className="w-5 text-xs font-bold text-gray-400 text-right shrink-0">
              {i + 1}
            </span>

            {/* Stat label + avg value */}
            <span className="w-24 text-xs text-gray-700 shrink-0 truncate" title={item.label}>
              {item.label}
              <span className="text-gray-400 ml-0.5">{item.avgValue}</span>
            </span>

            {/* Bar */}
            <div className="flex-1 h-5 bg-gray-100 rounded-full relative overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[i] ?? 'bg-blue-400'}`}
                style={{ width: `${Math.max(item.weight * 100, 1)}%` }}
              />
            </div>

            {/* Increase % */}
            <span className={`w-16 text-xs font-semibold text-right shrink-0 ${
              item.increasePercent > 0 ? 'text-green-600' : 'text-gray-400'
            }`}>
              {pct(item.increasePercent)}
            </span>

            {/* Weight */}
            <span className="w-10 text-xs text-gray-400 text-right shrink-0">
              {item.weight.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
        <span>排名 / 词条（平均值）</span>
        <span className="flex gap-6">
          <span>伤害提升</span>
          <span>归一化权重</span>
        </span>
      </div>
    </div>
  );
}
