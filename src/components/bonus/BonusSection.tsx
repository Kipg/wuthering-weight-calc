import { useState } from 'react';
import type { BonusEntry, BonusEffectType, BonusTargetType, SkillEntry } from '../../types';
import { BONUS_EFFECT_OPTIONS, BONUS_EFFECT_LABELS } from '../../types';
import { Card } from '../ui/Card';
import { FormInput } from '../ui/FormInput';
import { FormSelect } from '../ui/FormSelect';
import { Button } from '../ui/Button';
import { Plus, Trash2, ChevronDown, GripVertical } from 'lucide-react';

const TARGET_OPTIONS: { value: BonusTargetType; label: string }[] = [
  { value: 'global', label: '全局' },
  { value: 'skills', label: '指定技能' },
];

interface Props {
  entries: BonusEntry[];
  skills: SkillEntry[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<BonusEntry>) => void;
}

export function BonusSection({ entries, skills, onAdd, onRemove, onUpdate }: Props) {
  const activeSkills = skills.filter(s => s.name.trim());

  const toggleSkillTarget = (entry: BonusEntry, skillId: string) => {
    const ids = entry.targetSkillIds.includes(skillId)
      ? entry.targetSkillIds.filter(id => id !== skillId)
      : [...entry.targetSkillIds, skillId];
    onUpdate(entry.id, { targetSkillIds: ids });
  };

  return (
    <Card title="额外增益" borderColor="amber">
      <Button variant="secondary" onClick={onAdd} className="w-full flex items-center justify-center gap-1 text-sm mb-3">
        <Plus size={14} />
        添加增益
      </Button>

      {entries.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-4">暂无增益，点击上方按钮添加</p>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry) => (
            <BonusEntryForm
              key={entry.id}
              entry={entry}
              skills={activeSkills}
              onUpdate={patch => onUpdate(entry.id, patch)}
              onRemove={() => onRemove(entry.id)}
              onToggleSkill={id => toggleSkillTarget(entry, id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function BonusEntryForm({
  entry, skills, onUpdate, onRemove, onToggleSkill,
}: {
  entry: BonusEntry;
  skills: SkillEntry[];
  onUpdate: (patch: Partial<BonusEntry>) => void;
  onRemove: () => void;
  onToggleSkill: (skillId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const effectLabel = BONUS_EFFECT_LABELS[entry.effectType] ?? entry.effectType;

  return (
    <div className="bg-white/60 border border-amber-100 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-amber-50/50 transition-colors cursor-pointer select-none"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded); } }}
      >
        <GripVertical size={14} className="text-gray-300 shrink-0" />
        <span className={`text-sm font-medium flex-1 truncate ${entry.name ? 'text-gray-700' : 'text-gray-400'}`}>
          {entry.name || '未命名增益'}
        </span>
        <span className="text-xs text-gray-400 shrink-0">{effectLabel}</span>
        <span className="text-sm font-semibold text-amber-600 shrink-0 w-14 text-right">
          {entry.value}%
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
          entry.targetType === 'global' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
        }`}>
          {entry.targetType === 'global' ? '全局' : `技能×${entry.targetSkillIds.length}`}
        </span>
        <ChevronDown size={14} className={`text-gray-300 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Expanded form */}
      <div className={`grid transition-all duration-200 ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
            <FormInput
              label="增益名称"
              value={entry.name}
              onChange={e => onUpdate({ name: e.target.value })}
              placeholder="如：延奏技能增伤"
            />
            <div className="grid grid-cols-2 gap-2">
              <FormSelect
                label="效果类型"
                value={entry.effectType}
                options={BONUS_EFFECT_OPTIONS}
                onChange={v => onUpdate({ effectType: v as BonusEffectType })}
              />
              <FormInput
                label="数值"
                type="number"
                min={0}
                step={0.1}
                value={entry.value || ''}
                onChange={e => onUpdate({ value: Number(e.target.value) })}
                suffix="%"
              />
            </div>
            <FormSelect
              label="目标"
              value={entry.targetType}
              options={TARGET_OPTIONS}
              onChange={v => onUpdate({ targetType: v as BonusTargetType, targetSkillIds: v === 'global' ? [] : entry.targetSkillIds })}
            />
            {entry.targetType === 'skills' && skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {skills.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onToggleSkill(s.id)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      entry.targetSkillIds.includes(s.id)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
            {entry.targetType === 'skills' && skills.length === 0 && (
              <p className="text-xs text-gray-400">暂无已命名技能，请先在技能组合中添加</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
