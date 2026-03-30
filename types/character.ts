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

export interface ChainBonus {
  level: number; // 0-6
  description: string;
  effectSummary?: string; // 简短效果说明（用于UI显示）
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
  chainBonuses?: ChainBonus[]; // 链度加成说明
  damagePlugin?: CharacterDamagePlugin; // 角色专属伤害计算插件（链度加成等）
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
    jubaoTrackStacks?: number;
    jubaoEffectStacks?: number;
    xingchenJubaoEnabled?: boolean;
    chainLevel?: number; // 共鸣链等级 0-6
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
  /** 基础加成：直接修改面板属性（如攻击力%、暴击伤害等），可按技能大类/名称/伤害量类型过滤 */
  extraBaseBonuses?: Array<{
    /**
     * 属性类型：
     *   大攻击 / 大生命 / 大防御 — 百分比（如 0.1 = +10% 基础攻击）
     *   暴击率 / 暴击伤害 / 共鸣效率 — 直接加到对应面板值（小数，如 1.5 = +150%）
     *   小攻击 / 小生命 / 小防御 — 固定数值
     */
    stat: "大攻击" | "大生命" | "大防御" | "暴击率" | "暴击伤害" | "小攻击" | "小生命" | "小防御" | "共鸣效率";
    value: number;
    label?: string;
    /** 生效范围：全部 / 按技能大类 / 按技能名 / 按伤害量类型 */
    filterMode?: "all" | "byCategory" | "byName" | "byDamageType";
    /** 对应 filterMode 的值列表 */
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

// ============ 角色专属伤害计算插件接口 ============

export interface DamageContextModification {
  /** 添加到 adjustedStats.critDMG，调用方自动重算 critMultiplier */
  critDMGAdd?: number;
  /** 倍率提升区加成条目 */
  multiplierBoostEntries?: Array<{ value: number; note: string }>;
  /** 伤害加成区加成条目 */
  damageBonusEntries?: Array<{ value: number; note: string }>;
  /** 伤害加深区加成条目 */
  damageDeepenEntries?: Array<{ value: number; note: string }>;
  /** 覆盖受到伤害提升乘区（默认 1.0，如 6 链 ×1.4）*/
  receiveDamageMultiplier?: number;
}

export interface CharacterDamagePlugin {
  /**
   * 在 calculateCombatStats 遍历被动时调用：返回 true 则跳过该被动。
   * 例如爱弥斯的"星与星之间·震谐/聚爆"需根据共鸣模态过滤。
   */
  shouldSkipPassive?(passive: CharacterPassiveSkill, input: DamageCalculationInput): boolean;
  /**
   * 处理特殊伤害类型（震谐伤害、效应伤害等）。
   * 返回 number 表示由插件处理完毕；返回 null/undefined 则走通用乘区公式。
   */
  calculateSpecialDamage?(
    input: DamageCalculationInput,
    selectedSkill: CharacterSkill
  ): number | null | undefined;
  /**
   * 在通用乘区计算完成后、最终公式之前，注入角色专属链度/风蚀等加成。
   */
  modifyDamageContext?(
    input: DamageCalculationInput,
    selectedSkill: CharacterSkill,
    adjustedStats: CombatStats,
    critMode: "期望" | "暴击" | "不暴击"
  ): DamageContextModification | void;
}
