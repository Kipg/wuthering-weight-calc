import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DamageTypeTotal, ChartMode } from '../../types';
import { BarChart3 } from 'lucide-react';

interface Props {
  bySkillType: DamageTypeTotal[];
  byDamageCategory: DamageTypeTotal[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload) return null;
  const items = payload.filter(p => p.name && p.value > 0);
  if (items.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      {items.map((item, i) => (
        <div key={i} className="flex justify-between gap-4">
          <span className="text-gray-600">{item.name}</span>
          <span className="font-semibold text-gray-800">{item.value.toLocaleString('zh-CN')}</span>
        </div>
      ))}
    </div>
  );
}

export function DamageChart({ bySkillType, byDamageCategory }: Props) {
  const [mode, setMode] = useState<ChartMode>('damageCategory');

  const data = mode === 'skillType' ? bySkillType : byDamageCategory;
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-blue-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-500" />
          伤害分布
        </h3>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setMode('damageCategory')}
            className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${
              mode === 'damageCategory'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            按伤害类别
          </button>
          <button
            type="button"
            onClick={() => setMode('skillType')}
            className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${
              mode === 'skillType'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            按技能类型
          </button>
        </div>
      </div>

      {total === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
          暂无伤害数据
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              key={mode}
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ label, percent }) => `${label} ${(percent * 100).toFixed(1)}%`}
            >
              {data.map(entry => (
                <Cell key={entry.type} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
