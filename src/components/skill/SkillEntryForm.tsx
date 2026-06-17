import { useState, useRef } from 'react';
import type { SkillEntry, SkillType, DamageCategory } from '../../types';
import { SKILL_TYPE_OPTIONS, DAMAGE_CAT_OPTIONS, SKILL_TYPE_LABELS, DAMAGE_CAT_LABELS } from '../../types';
import { FormInput } from '../ui/FormInput';
import { FormSelect } from '../ui/FormSelect';
import { Button } from '../ui/Button';
import { ChevronDown, Trash2, GripVertical } from 'lucide-react';
import { evaluateExpr } from '../../utils/expression';

interface Props {
  skill: SkillEntry;
  index: number;
  onChange: (changes: Partial<SkillEntry>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function SkillEntryForm({ skill, index, onChange, onRemove, canRemove }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [multText, setMultText] = useState(() => String(skill.multiplier));
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setMultText(text);
    const num = Number(text);
    if (!isNaN(num) && text.trim() !== '') {
      onChange({ multiplier: num } as Partial<SkillEntry>);
    }
  };

  const handleMultBlur = () => {
    const trimmed = multText.trim();
    if (trimmed === '') return;
    const result = evaluateExpr(trimmed);
    if (result !== null && result >= 0) {
      onChange({ multiplier: result } as Partial<SkillEntry>);
      if (/[+\-*/()]/.test(trimmed)) {
        setMultText(trimmed);
      } else {
        setMultText(String(result));
      }
    } else {
      setMultText(String(skill.multiplier));
    }
  };

  const typeLabel = SKILL_TYPE_LABELS[skill.skillType];
  const catLabel = DAMAGE_CAT_LABELS[skill.damageCategory];

  return (
    <div className="bg-white/60 border border-blue-100 rounded-lg overflow-hidden transition-shadow hover:shadow-sm">
      {/* Collapsed header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-blue-50/50 transition-colors cursor-pointer select-none"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded); } }}
      >
        <GripVertical size={14} className="text-gray-300 shrink-0" />
        <span className="text-xs font-bold text-blue-400 w-6 shrink-0">#{index + 1}</span>
        <span className={`text-sm font-medium flex-1 truncate ${skill.name ? 'text-gray-700' : 'text-gray-400'}`}>
          {skill.name || '未命名'}
        </span>
        <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">{typeLabel}</span>
        <span className="text-xs text-gray-300 hidden sm:inline">·</span>
        <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">{catLabel}</span>
        <span className="text-sm font-semibold text-gray-600 shrink-0 ml-2 text-right min-w-[4rem]">
          {skill.multiplierBonus > 0
            ? `${Math.round(skill.multiplier * (1 + skill.multiplierBonus / 100) * 100) / 100}%`
            : `${skill.multiplier}%`
          }
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-300 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
        {canRemove && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            title="删除"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Expanded form */}
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <FormInput
                label="技能名称"
                value={skill.name}
                onChange={e => onChange({ name: e.target.value })}
                placeholder="如：一段"
              />
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-600">倍率</span>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={multText}
                    onChange={handleMultChange}
                    onBlur={handleMultBlur}
                    placeholder="如：3.78+5.68*3"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pr-10 text-gray-800
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-all duration-200 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">%</span>
                </div>
              </label>
              <FormInput
                label="倍率提升"
                type="number"
                min={0}
                step={0.01}
                value={skill.multiplierBonus || ''}
                onChange={e => onChange({ multiplierBonus: Number(e.target.value) })}
                suffix="%"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FormSelect
                label="技能类型"
                value={skill.skillType}
                options={SKILL_TYPE_OPTIONS}
                onChange={v => onChange({ skillType: v as SkillType })}
              />
              <FormSelect
                label="伤害类别"
                value={skill.damageCategory}
                options={DAMAGE_CAT_OPTIONS}
                onChange={v => onChange({ damageCategory: v as DamageCategory })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
