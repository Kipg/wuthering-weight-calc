import type { EnemyInput } from '../../types';
import { Card } from '../ui/Card';
import { FormInput } from '../ui/FormInput';

interface Props {
  enemy: EnemyInput;
  onChange: (patch: Partial<EnemyInput>) => void;
}

export function EnemySection({ enemy, onChange }: Props) {
  return (
    <Card title="防御区" borderColor="red">
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          label="怪物等级"
          type="number"
          min={1}
          max={120}
          value={enemy.level || ''}
          onChange={e => onChange({ level: Number(e.target.value) })}
        />
        <div>
          <FormInput
            label="属性抗性"
            type="number"
            min={0}
            step={0.1}
            value={enemy.elementalResistance || ''}
            onChange={e => onChange({ elementalResistance: Number(e.target.value) })}
            suffix="%"
          />
          <p className="text-xs text-gray-400 mt-1">默认10% 深塔60% 全息80%</p>
        </div>
        <FormInput
          label="伤害减免"
          type="number"
          min={0}
          step={0.1}
          value={enemy.damageReduction || ''}
          onChange={e => onChange({ damageReduction: Number(e.target.value) })}
          suffix="%"
        />
      </div>
      {/* 无视防御力单独一行 */}
      <div className="mt-3">
        <FormInput
          label="无视防御力"
          type="number"
          min={0}
          step={0.1}
          value={enemy.defenseIgnore || ''}
          onChange={e => onChange({ defenseIgnore: Number(e.target.value) })}
          suffix="%"
        />
      </div>
    </Card>
  );
}
