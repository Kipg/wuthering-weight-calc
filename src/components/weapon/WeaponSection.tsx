import type { WeaponInput, WeaponMainStat, SkillBonusStatType, SkillAttributeBonus } from '../../types';
import { MAINSTAT_OPTIONS, SKILL_BONUS_STAT_OPTIONS } from '../../types';
import { Card } from '../ui/Card';
import { FormInput } from '../ui/FormInput';
import { FormSelect } from '../ui/FormSelect';

interface Props {
  weapon: WeaponInput;
  onChange: (patch: Partial<WeaponInput>) => void;
}

export function WeaponSection({ weapon, onChange }: Props) {
  const handleSkillBonusChange = (index: number, patch: Partial<SkillAttributeBonus>) => {
    const newBonuses: [SkillAttributeBonus, SkillAttributeBonus] = [
      { ...(weapon.skillBonuses?.[0] ?? { statType: 'none' as SkillBonusStatType, value: 0 }) },
      { ...(weapon.skillBonuses?.[1] ?? { statType: 'none' as SkillBonusStatType, value: 0 }) },
    ];
    newBonuses[index] = { ...newBonuses[index], ...patch };
    onChange({ skillBonuses: newBonuses });
  };

  return (
    <Card title="武器面板" borderColor="blue">
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          label="武器名称"
          value={weapon.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="如：不屈命定之冠"
        />
        <FormInput
          label="基础攻击力"
          type="number"
          min={0}
          value={weapon.baseAtk || ''}
          onChange={e => onChange({ baseAtk: Number(e.target.value) })}
        />
        <FormSelect
          label="加成类型"
          value={weapon.mainStatType}
          options={MAINSTAT_OPTIONS}
          onChange={v => onChange({ mainStatType: v as WeaponMainStat })}
        />
        <FormInput
          label="加成数值"
          type="number"
          min={0}
          step={0.1}
          value={weapon.mainStatValue || ''}
          onChange={e => onChange({ mainStatValue: Number(e.target.value) })}
          suffix="%"
        />
      </div>

      {/* 武器技能属性加成 */}
      <div className="border-t border-gray-100 pt-3 mt-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">技能属性加成</h4>
        {[0, 1].map((index) => {
          const bonus = weapon.skillBonuses?.[index] ?? { statType: 'none' as SkillBonusStatType, value: 0 };
          return (
            <div key={index} className="grid grid-cols-2 gap-2 mb-2">
              <FormSelect
                label={`加成属性 ${index + 1}`}
                value={bonus.statType}
                options={SKILL_BONUS_STAT_OPTIONS}
                onChange={v => handleSkillBonusChange(index, { statType: v as SkillBonusStatType, value: bonus.statType === v ? bonus.value : 0 })}
              />
              <FormInput
                label="数值"
                type="number"
                min={0}
                step={0.1}
                value={bonus.statType !== 'none' ? (bonus.value || '') : ''}
                disabled={bonus.statType === 'none'}
                onChange={e => handleSkillBonusChange(index, { value: Number(e.target.value) })}
                suffix="%"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
