import type { FormState, CharacterInput, WeaponInput, BonusInput, DamageCategory, SkillEntry, EnemyInput, CritInput } from '../types';
import type { EchoSlot, EchoSetBonusItem } from '../types/echo';
import { SectionTitle } from './ui/SectionTitle';
import { Button } from './ui/Button';
import { CharacterSection } from './character/CharacterSection';
import { WeaponSection } from './weapon/WeaponSection';
import { BonusSection } from './bonus/BonusSection';
import { CritSection } from './crit/CritSection';
import { EnemySection } from './enemy/EnemySection';
import { SkillComboSection } from './skill/SkillComboSection';
import { EchoSection } from './echo/EchoSection';
import { User } from 'lucide-react';

interface Props {
  formState: FormState;
  onCharacterChange: (patch: Partial<CharacterInput>) => void;
  onWeaponChange: (patch: Partial<WeaponInput>) => void;
  onBonusesChange: (patch: Partial<BonusInput>) => void;
  onDamageCategoryBonusChange: (cat: DamageCategory, value: number) => void;
  onEnemyChange: (patch: Partial<EnemyInput>) => void;
  onCritChange: (patch: Partial<CritInput>) => void;
  onEchoSlotChange: (index: number, slot: EchoSlot) => void;
  onAddEchoSlot: () => void;
  onRemoveEchoSlot: (index: number) => void;
  onAddSetBonus: () => void;
  onRemoveSetBonus: (id: string) => void;
  onUpdateSetBonus: (id: string, patch: Partial<EchoSetBonusItem>) => void;
  onAddSkill: () => void;
  onRemoveSkill: (id: string) => void;
  onUpdateSkill: (id: string, changes: Partial<SkillEntry>) => void;
  onCalculate: () => void;
}

export function InputPanel({
  formState, onCharacterChange, onWeaponChange,
  onBonusesChange, onDamageCategoryBonusChange,
  onEnemyChange, onCritChange, onEchoSlotChange,
  onAddEchoSlot, onRemoveEchoSlot,
  onAddSetBonus, onRemoveSetBonus, onUpdateSetBonus,
  onAddSkill, onRemoveSkill, onUpdateSkill,
  onCalculate,
}: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle icon={User}>输入参数</SectionTitle>
      <CharacterSection character={formState.character} onChange={onCharacterChange} />
      <WeaponSection weapon={formState.weapon} onChange={onWeaponChange} />
      <CritSection crit={formState.crit} onChange={onCritChange} />
      <EchoSection
        echoConfig={formState.echoConfig}
        onSlotChange={onEchoSlotChange}
        onAddSlot={onAddEchoSlot}
        onRemoveSlot={onRemoveEchoSlot}
        onAddSetBonus={onAddSetBonus}
        onRemoveSetBonus={onRemoveSetBonus}
        onUpdateSetBonus={onUpdateSetBonus}
      />
      <EnemySection enemy={formState.enemy} onChange={onEnemyChange} />
      <BonusSection
        bonuses={formState.bonuses}
        damageCategoryBonuses={formState.damageCategoryBonuses}
        onBonusesChange={onBonusesChange}
        onDamageCategoryBonusChange={onDamageCategoryBonusChange}
      />
      <SkillComboSection
        skills={formState.skillCombo}
        onAdd={onAddSkill}
        onRemove={onRemoveSkill}
        onUpdate={onUpdateSkill}
      />
      <Button variant="primary" onClick={onCalculate} className="w-full !py-3 text-lg">
        计算伤害
      </Button>
    </div>
  );
}
