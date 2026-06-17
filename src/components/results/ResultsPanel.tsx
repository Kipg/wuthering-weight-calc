import { useState } from 'react';
import type { CalculationResult, SubstatWeightItem } from '../../types';
import { ELEMENT_LABELS } from '../../types';
import { SectionTitle } from '../ui/SectionTitle';
import { DamageChart } from './DamageChart';
import { SkillBreakdownCard } from './SkillBreakdownCard';
import { SubstatWeightPanel } from './SubstatWeightPanel';
import { BarChart3, Calculator, ChevronDown } from 'lucide-react';

interface Props {
  result: CalculationResult | null;
  substatWeights: SubstatWeightItem[];
}

const FORMULA_ZONES = [
  { label: '基础值', desc: '角色基础值 + 武器基础值（按伤害类型:攻击/生命/防御）', color: 'bg-blue-100 text-blue-800' },
  { label: '总值', desc: '基础值 × (1 + 百分比%) + 固定值', color: 'bg-blue-100 text-blue-800' },
  { label: '倍率', desc: '总值 × 技能倍率%', color: 'bg-indigo-100 text-indigo-800' },
  { label: '倍率提升', desc: '技能基础伤害 × (1 + 倍率提升%)', color: 'bg-indigo-100 text-indigo-800' },
  { label: '伤害加深', desc: '倍率提升后 × (1 + 伤害加深%)', color: 'bg-purple-100 text-purple-800' },
  { label: '增伤', desc: '伤害加深后 × (1 + 元素伤% + 类型伤%)', color: 'bg-pink-100 text-pink-800' },
  { label: '暴击', desc: '增伤后 × 暴击倍率', color: 'bg-amber-100 text-amber-800' },
  { label: '防御', desc: '(100+Lv)/(199+Lv+怪物Lv) × (1-无视防御%)', color: 'bg-red-100 text-red-800' },
  { label: '抗性', desc: '1 - 属性抗性%', color: 'bg-red-100 text-red-800' },
  { label: '减免', desc: '1 - 伤害减免%', color: 'bg-red-100 text-red-800' },
];

function r1(v: number): string {
  return v % 1 === 0 ? String(v) : v.toFixed(1);
}

export function ResultsPanel({ result, substatWeights }: Props) {
  const [showFormula, setShowFormula] = useState(false);

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Calculator size={48} className="mx-auto mb-4 text-blue-300" />
          <p className="text-lg">输入参数后点击计算查看伤害结果</p>
        </div>
      </div>
    );
  }

  const cs = result.computedStats;
  const elemLabel = ELEMENT_LABELS[cs.elementType];

  return (
    <div className="space-y-4">
      {/* Stats Summary Panel */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">属性汇总</h3>
        <div className="grid grid-cols-4 gap-y-2 text-sm">
          <StatItem label="攻击力" value={cs.atk} />
          <StatItem label="生命值" value={cs.hp} />
          <StatItem label="防御力" value={cs.def} />
          <StatItem label="治疗加成" value={r1(cs.healingBonus) + '%'} />
          <StatItem label="暴击率" value={r1(cs.critRate) + '%'} />
          <StatItem label="暴击伤害" value={r1(cs.critDmg) + '%'} />
          <StatItem label="共鸣效率" value={r1(cs.energyRegen) + '%'} />
          <StatItem label={elemLabel} value={r1(cs.elementalDmg) + '%'} />
          <StatItem label="普攻伤害" value={r1(cs.basicDmg) + '%'} />
          <StatItem label="重击伤害" value={r1(cs.heavyDmg) + '%'} />
          <StatItem label="共鸣技能" value={r1(cs.skillDmg) + '%'} />
          <StatItem label="共鸣解放" value={r1(cs.burstDmg) + '%'} />
        </div>
      </div>

      {/* Total Damage Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-center shadow-md">
        <div className="text-sm text-blue-100 mb-1">总伤害</div>
        <div className="text-3xl font-bold text-white">
          {result.totalDamage.toLocaleString('zh-CN')}
        </div>
      </div>

<SubstatWeightPanel weights={substatWeights} />

      {/* Formula Display - collapsible, default collapsed */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 shadow-sm">
        <button
          type="button"
          onClick={() => setShowFormula(!showFormula)}
          className="w-full flex items-center justify-between px-5 py-3 text-gray-800 hover:text-blue-600 transition-colors"
        >
          <span className="font-semibold">伤害计算公式</span>
          <ChevronDown
            size={18}
            className="text-gray-400 transition-transform duration-300"
            style={{ transform: showFormula ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
        <div className={`grid transition-all duration-300 ease-in-out ${showFormula ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className={`${showFormula ? 'overflow-visible' : 'overflow-hidden'}`}>
            <div className="px-5 pb-4">
              <div className="text-sm text-gray-500 mb-3">
                最终伤害 = 基础值 × 技能倍率% × 各乘区
              </div>
              <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 p-3 rounded-lg">
                {FORMULA_ZONES.map((zone, i) => (
                  <div key={zone.label} className="relative group">
                    {i > 0 && <span className="text-gray-300 mx-1 text-xs">×</span>}
                    <span className={`px-2 py-1 rounded text-xs font-medium cursor-help ${zone.color}`}>
                      {zone.label}
                    </span>
                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block z-50">
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 whitespace-nowrap">
                        <p className="text-xs text-gray-700 leading-relaxed">{zone.desc}</p>
                      </div>
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DamageChart
        bySkillType={result.bySkillType}
        byDamageCategory={result.byDamageCategory}
      />

      <SectionTitle icon={BarChart3}>技能计算过程</SectionTitle>
      {result.skills.map((skill, i) => (
        <SkillBreakdownCard key={i} skill={skill} />
      ))}
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}
