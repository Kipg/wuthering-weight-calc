// 角色相关类型

import { Rarity, WeaponType, ElementType, EffectType } from "./bases";
import {
  CharacterSkill,
  CharacterPassiveSkill,
  CharacterOutroSkill,
  CharacterSpecialConfig,
} from "./skill";
import { Weapon } from "./weapon";
import { Echo, EchoSetEnabledState } from "./echo";

export interface CharacterBaseStats {
  name: string;
  rarity: Rarity;
  weaponType: WeaponType;
  elementType: ElementType;

  level: number;
  levelList: number[];

  baseHPList: number[];
  baseATKList: number[];
  baseDEFList: number[];

  baseCritRate: number;
  baseCritDMG: number;
  baseHealBonus: number;
  baseElementDMG: number;
  baseEnergyRegen: number;

  imageKey?: string;
}

export interface CharacterBranchStats {
  branch1: { stat: string; value: number };
  branch2: { stat: string; value: number };
}

export interface Character {
  baseStats: CharacterBaseStats;
  skills: CharacterSkill[];
  branchStats: CharacterBranchStats;
  passiveSkills: CharacterPassiveSkill[];
  outroSkill?: CharacterOutroSkill;
  outroSkills?: CharacterOutroSkill[];
  effectStacks?: Partial<Record<EffectType, number>>;
  specialConfig?: CharacterSpecialConfig;
}

// ============ 队友配置 ============
export interface TeammateConfig {
  characterName: string;
  character: Character;
  enabledOutro: boolean;
  enabledPassives: boolean[];
}

// ============ 战斗面板属性 ============
export interface CombatStats {
  totalATK: number;
  totalHP: number;
  totalDEF: number;
  critRate: number;
  critDMG: number;
  healBonus: number;
  energyRegen: number;
  elementDMG: number;
  normalATKBonus: number;
  heavyATKBonus: number;
  skillBonus: number;
  liberationBonus: number;
}

// ============ 计算输入输出 ============
export interface DamageCalculationInput {
  character: Character;
  weapon: Weapon;
  echoes: Echo[];
  activeEchoSets: Record<string, number>;
  echoSetEnabled?: Record<string, EchoSetEnabledState>;
  targetLevel: number;
  enemyResistance: number;
  selectedSkill: CharacterSkill;
  critMode: "期望" | "暴击" | "不暴击";
  effectStacks?: Record<string, number>;
  teammates?: TeammateConfig[];
  moningConfig?: {
    energyRegen: number;
  };
  aimisiConfig?: {
    resonanceMode?: "震谐" | "聚爆";
    zhenxieTrackStacks?: number;
    xingchenZhenxieEnabled?: boolean;
    hasZhenxieInterference?: boolean;
    jubaoTrackStacks?: number;
    jubaoEffectStacks?: number;
    xingchenJubaoEnabled?: boolean;
  };
  extraBonuses?: Array<{
    zone: "倍率提升" | "伤害加深" | "伤害加成" | "无视防御" | "无视抗性";
    value: number;
    label?: string;
    /** 生效范围：全部 / 按技能大类 / 按技能名 */
    filterMode?: "all" | "byCategory" | "byName";
    /** filterMode 为 byCategory 时存 SkillCategory[], 为 byName 时存技能名数组 */
    filterValues?: string[];
  }>;
}

export interface DamageCalculationResult {
  baseDamage: number;
  skillMultiplier: number;
  multiplierBoost: number;
  critMultiplier: number;
  damageDeepen: number;
  damageBonus: number;
  defenseMultiplier: number;
  resistanceMultiplier: number;
  finalDamage: number;
  combatStats: CombatStats;
  details?: {
    multiplierBoostSources?: string[];
    damageDeepenSources?: string[];
    damageBonusSources?: string[];
    defenseIgnoreSources?: string[];
    resistanceReductionSources?: string[];
  };
}

// ============ 输出流程相关 ============
export interface SkillRotationStep {
  skillName: string;
  count: number;
  critMode: "期望" | "暴击" | "不暴击";
}

export interface SkillRotation {
  characterName: string;
  steps: SkillRotationStep[];
}

export interface DamageDistribution {
  skillName: string;
  damageType: import("./bases").DamageType;
  totalDamage: number;
  percentage: number;
}
