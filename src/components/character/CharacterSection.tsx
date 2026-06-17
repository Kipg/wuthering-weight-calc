import type { CharacterInput, ElementType, DamageScalingType, SkillBonusStatType, SkillAttributeBonus } from '../../types';
import { ELEMENT_OPTIONS, SCALING_OPTIONS, SKILL_BONUS_STAT_OPTIONS } from '../../types';
import { Card } from '../ui/Card';
import { FormInput } from '../ui/FormInput';
import { FormSelect } from '../ui/FormSelect';

interface Props {
  character: CharacterInput;
  onChange: (patch: Partial<CharacterInput>) => void;
}

export function CharacterSection({ character, onChange }: Props) {
  const handleSkillBonusChange = (index: number, patch: Partial<SkillAttributeBonus>) => {
    const newBonuses: [SkillAttributeBonus, SkillAttributeBonus] = [
      { ...character.skillBonuses[0] },
      { ...character.skillBonuses[1] },
    ];
    newBonuses[index] = { ...newBonuses[index], ...patch };
    onChange({ skillBonuses: newBonuses });
  };

  return (
    <Card title="角色基础面板" borderColor="blue">
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          label="角色名称"
          value={character.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="如：卡提希娅"
        />
        <FormSelect
          label="伤害类型"
          value={character.damageScaling}
          options={SCALING_OPTIONS}
          onChange={v => onChange({ damageScaling: v as DamageScalingType })}
        />
        <FormSelect
          label="属性类型"
          value={character.elementType}
          options={ELEMENT_OPTIONS}
          onChange={v => onChange({ elementType: v as ElementType })}
        />
        <FormInput
          label="属性伤害加成"
          type="number"
          min={0}
          step={0.1}
          value={character.elementalDamageBonus || ''}
          onChange={e => onChange({ elementalDamageBonus: Number(e.target.value) })}
          suffix="%"
        />
        <FormInput
          label="攻击力"
          type="number"
          min={0}
          value={character.baseAtk || ''}
          onChange={e => onChange({ baseAtk: Number(e.target.value) })}
        />
        <FormInput
          label="防御力"
          type="number"
          min={0}
          value={character.baseDef || ''}
          onChange={e => onChange({ baseDef: Number(e.target.value) })}
        />
        <FormInput
          label="生命值"
          type="number"
          min={0}
          value={character.baseHp || ''}
          onChange={e => onChange({ baseHp: Number(e.target.value) })}
        />
        <FormInput
          label="共鸣效率"
          type="number"
          min={0}
          max={300}
          step={1}
          value={character.resonanceEfficiency || ''}
          onChange={e => onChange({ resonanceEfficiency: Number(e.target.value) })}
          suffix="%"
        />
        <FormInput
          label="暴击率"
          type="number"
          min={0}
          step={0.1}
          value={character.critRate || ''}
          onChange={e => onChange({ critRate: Number(e.target.value) })}
          suffix="%"
        />
        <FormInput
          label="暴击伤害"
          type="number"
          min={0}
          step={0.1}
          value={character.critDamage || ''}
          onChange={e => onChange({ critDamage: Number(e.target.value) })}
          suffix="%"
        />
      </div>

      {/* 技能属性加成 */}
      <div className="border-t border-gray-100 pt-3 mt-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">技能属性加成</h4>
        {[0, 1].map((index) => {
          const bonus = character.skillBonuses?.[index] ?? { statType: 'none' as SkillBonusStatType, value: 0 };
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
