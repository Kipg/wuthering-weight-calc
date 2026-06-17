// ========== 属性类型（6种元素） ==========
export type ElementType =
  | 'aero'
  | 'fusion'
  | 'spectro'
  | 'glacio'
  | 'havoc'
  | 'electro';

export const ELEMENT_LABELS: Record<ElementType, string> = {
  aero: '气动伤害',
  fusion: '热熔伤害',
  spectro: '衍射伤害',
  glacio: '冷凝伤害',
  havoc: '湮灭伤害',
  electro: '导电伤害',
};

export const ELEMENT_OPTIONS: { value: ElementType; label: string }[] = [
  { value: 'aero', label: '气动' },
  { value: 'fusion', label: '热熔' },
  { value: 'spectro', label: '衍射' },
  { value: 'glacio', label: '冷凝' },
  { value: 'havoc', label: '湮灭' },
  { value: 'electro', label: '导电' },
];

// ========== 武器主词条类型 ==========
export type WeaponMainStat = 'crit_rate' | 'crit_dmg' | 'atk_percent' | 'hp_percent' | 'def_percent';

export const MAINSTAT_LABELS: Record<WeaponMainStat, string> = {
  crit_rate: '暴击率',
  crit_dmg: '暴击伤害',
  atk_percent: '攻击百分比',
  hp_percent: '生命百分比',
  def_percent: '防御百分比',
};

export const MAINSTAT_OPTIONS: { value: WeaponMainStat; label: string }[] = [
  { value: 'crit_rate', label: '暴击率' },
  { value: 'crit_dmg', label: '暴击伤害' },
  { value: 'atk_percent', label: '攻击百分比' },
  { value: 'hp_percent', label: '生命百分比' },
  { value: 'def_percent', label: '防御百分比' },
];

// ========== 暴击模式 ==========
export type CritMode = 'none' | 'crit' | 'expected';

export const CRIT_MODE_LABELS: Record<CritMode, string> = {
  none: '不暴击',
  crit: '暴击',
  expected: '期望暴击',
};

export const CRIT_MODE_OPTIONS: { value: CritMode; label: string }[] = [
  { value: 'none', label: '不暴击' },
  { value: 'crit', label: '暴击' },
  { value: 'expected', label: '期望暴击' },
];

// ========== 技能类型（6类，按动作分类） ==========
export type SkillType =
  | 'normal_attack'
  | 'skill'
  | 'circuit'
  | 'burst'
  | 'intro'
  | 'outro';

export const SKILL_TYPE_LABELS: Record<SkillType, string> = {
  normal_attack: '常态攻击',
  skill: '共鸣技能',
  circuit: '共鸣回路',
  burst: '共鸣解放',
  intro: '变奏技能',
  outro: '协奏技能',
};

export const SKILL_TYPE_OPTIONS: { value: SkillType; label: string }[] = [
  { value: 'normal_attack', label: '常态攻击' },
  { value: 'skill', label: '共鸣技能' },
  { value: 'circuit', label: '共鸣回路' },
  { value: 'burst', label: '共鸣解放' },
  { value: 'intro', label: '变奏技能' },
  { value: 'outro', label: '协奏技能' },
];

export const SKILL_TYPE_COLORS: Record<SkillType, string> = {
  normal_attack: '#3B82F6',
  skill: '#10B981',
  circuit: '#8B5CF6',
  burst: '#EF4444',
  intro: '#F59E0B',
  outro: '#EC4899',
};

// ========== 伤害类别（4类，按伤害属性分类） ==========
export type DamageCategory =
  | 'basic'
  | 'heavy'
  | 'skill'
  | 'burst';

export const DAMAGE_CAT_LABELS: Record<DamageCategory, string> = {
  basic: '普攻伤害',
  heavy: '重击伤害',
  skill: '共鸣技能伤害',
  burst: '共鸣解放伤害',
};

export const DAMAGE_CAT_OPTIONS: { value: DamageCategory; label: string }[] = [
  { value: 'basic', label: '普攻伤害' },
  { value: 'heavy', label: '重击伤害' },
  { value: 'skill', label: '共鸣技能伤害' },
  { value: 'burst', label: '共鸣解放伤害' },
];

export const DAMAGE_CAT_COLORS: Record<DamageCategory, string> = {
  basic: '#60A5FA',
  heavy: '#FBBF24',
  skill: '#34D399',
  burst: '#F87171',
};

// ========== 伤害倍率基准类型 ==========
export type DamageScalingType = 'atk' | 'hp' | 'def';

export const SCALING_LABELS: Record<DamageScalingType, string> = {
  atk: '攻击',
  hp: '生命',
  def: '防御',
};

export const SCALING_OPTIONS: { value: DamageScalingType; label: string }[] = [
  { value: 'atk', label: '攻击' },
  { value: 'hp', label: '生命' },
  { value: 'def', label: '防御' },
];

// ========== 角色技能属性加成类型 ==========
export type SkillBonusStatType =
  | 'none'
  | 'crit_rate'
  | 'crit_dmg'
  | 'atk_percent'
  | 'hp_percent'
  | 'def_percent'
  | 'energy_regen'
  | 'basic_dmg'
  | 'heavy_dmg'
  | 'skill_dmg'
  | 'burst_dmg';

export const SKILL_BONUS_STAT_LABELS: Record<SkillBonusStatType, string> = {
  none: '未选择',
  crit_rate: '暴击率',
  crit_dmg: '暴击伤害',
  atk_percent: '攻击力%',
  hp_percent: '生命值%',
  def_percent: '防御力%',
  energy_regen: '共鸣效率',
  basic_dmg: '普攻伤害加成',
  heavy_dmg: '重击伤害加成',
  skill_dmg: '共鸣技能伤害加成',
  burst_dmg: '共鸣解放伤害加成',
};

export const SKILL_BONUS_STAT_OPTIONS: { value: SkillBonusStatType; label: string }[] = [
  { value: 'none', label: '未选择' },
  { value: 'crit_rate', label: '暴击率' },
  { value: 'crit_dmg', label: '暴击伤害' },
  { value: 'atk_percent', label: '攻击力%' },
  { value: 'hp_percent', label: '生命值%' },
  { value: 'def_percent', label: '防御力%' },
  { value: 'energy_regen', label: '共鸣效率' },
  { value: 'basic_dmg', label: '普攻伤害加成' },
  { value: 'heavy_dmg', label: '重击伤害加成' },
  { value: 'skill_dmg', label: '共鸣技能伤害加成' },
  { value: 'burst_dmg', label: '共鸣解放伤害加成' },
];

export interface SkillAttributeBonus {
  statType: SkillBonusStatType;
  value: number;
}

// ========== 输入 ==========
export interface CharacterInput {
  name: string;
  level: number;
  baseAtk: number;
  baseHp: number;
  baseDef: number;
  elementType: ElementType;
  damageScaling: DamageScalingType;
  resonanceEfficiency: number;
  elementalDamageBonus: number;
  critRate: number;
  critDamage: number;
  skillBonuses: [SkillAttributeBonus, SkillAttributeBonus];
}

export interface WeaponInput {
  name: string;
  baseAtk: number;
  mainStatType: WeaponMainStat;
  mainStatValue: number;
  skillBonuses: [SkillAttributeBonus, SkillAttributeBonus];
}

export interface SkillEntry {
  id: string;
  name: string;
  multiplier: number;
  multiplierBonus: number;
  skillType: SkillType;
  damageCategory: DamageCategory;
}

// ========== 增益类型 ==========
export type BonusEffectType =
  | 'damage_amplification'  // 伤害加深
  | 'elemental_damage'      // 属性伤害加成
  | 'basic_dmg'             // 普攻伤害加成
  | 'heavy_dmg'             // 重击伤害加成
  | 'skill_dmg'             // 共鸣技能伤害加成
  | 'burst_dmg'             // 共鸣解放伤害加成
  | 'damage_boost'          // 伤害提升（最终乘区）
  | 'crit_rate_boost'       // 暴击率提升
  | 'crit_dmg_boost'        // 暴击伤害提升
  | 'atk_percent_boost';    // 攻击力提升

export const BONUS_EFFECT_LABELS: Record<BonusEffectType, string> = {
  damage_amplification: '伤害加深',
  elemental_damage: '属性伤害加成',
  basic_dmg: '普攻伤害加成',
  heavy_dmg: '重击伤害加成',
  skill_dmg: '共鸣技能伤害加成',
  burst_dmg: '共鸣解放伤害加成',
  damage_boost: '伤害提升',
  crit_rate_boost: '暴击率提升',
  crit_dmg_boost: '暴击伤害提升',
  atk_percent_boost: '攻击力提升',
};

export const BONUS_EFFECT_OPTIONS: { value: BonusEffectType; label: string }[] = [
  { value: 'damage_amplification', label: '伤害加深' },
  { value: 'elemental_damage', label: '属性伤害加成' },
  { value: 'basic_dmg', label: '普攻伤害加成' },
  { value: 'heavy_dmg', label: '重击伤害加成' },
  { value: 'skill_dmg', label: '共鸣技能伤害加成' },
  { value: 'burst_dmg', label: '共鸣解放伤害加成' },
  { value: 'damage_boost', label: '伤害提升' },
  { value: 'crit_rate_boost', label: '暴击率提升' },
  { value: 'crit_dmg_boost', label: '暴击伤害提升' },
  { value: 'atk_percent_boost', label: '攻击力提升' },
];

export type BonusTargetType = 'global' | 'skills';

export interface BonusEntry {
  id: string;
  name: string;
  effectType: BonusEffectType;
  value: number;
  targetType: BonusTargetType;
  targetSkillIds: string[];
}

export interface BonusInput {
  entries: BonusEntry[];
}

export interface EnemyInput {
  level: number;
  elementalResistance: number;
  damageReduction: number;
  defenseIgnore: number;
}

export interface CritInput {
  critMode: CritMode;
}

// ========== 输出 ==========
export interface CalculationStep {
  label: string;
  formula: string;
  value: number;
}

export interface SkillDamageResult {
  skillName: string;
  skillType: SkillType;
  damageCategory: DamageCategory;
  steps: CalculationStep[];
  finalDamage: number;
}

export interface DamageTypeTotal {
  type: string;
  label: string;
  value: number;
  color: string;
}

export interface ComputedStats {
  elementType: ElementType;
  atk: number;
  hp: number;
  def: number;
  critRate: number;
  critDmg: number;
  energyRegen: number;
  elementalDmg: number;
  healingBonus: number;
  basicDmg: number;
  heavyDmg: number;
  skillDmg: number;
  burstDmg: number;
}

export interface CalculationResult {
  totalDamage: number;
  skills: SkillDamageResult[];
  bySkillType: DamageTypeTotal[];
  byDamageCategory: DamageTypeTotal[];
  computedStats: ComputedStats;
}

import type { EchoConfig } from './echo';

// ========== 聚合输入 ==========
export interface CalculationInput {
  character: CharacterInput;
  weapon: WeaponInput;
  skillCombo: SkillEntry[];
  bonuses: BonusInput;
  enemy: EnemyInput;
  crit: CritInput;
  echoConfig: EchoConfig;
}

// ========== 副词条权重分析 ==========
export interface SubstatWeightItem {
  statType: string;
  label: string;
  avgValue: number;
  baselineDamage: number;
  modifiedDamage: number;
  increasePercent: number;
  weight: number; // 归一化权重 (0~1)
}

// ========== 图表展示模式 ==========
export type ChartMode = 'skillType' | 'damageCategory';

// ========== 表单状态（同聚合输入） ==========
export type FormState = CalculationInput;
