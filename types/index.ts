// 鸣潮伤害计算器 - 核心类型定义

// ============ 基础枚举类型 ============
export type Rarity = 1 | 2 | 3 | 4 | 5;

export type WeaponType = "迅刀" | "长刃" | "佩枪" | "臂铠" | "音感仪";

export type ElementType = 
  | "气动伤害" 
  | "热熔伤害" 
  | "衍射伤害" 
  | "冷凝伤害" 
  | "湮灭伤害" 
  | "导电伤害";

export type ScalingTemplate = "攻击" | "生命" | "防御" | "共鸣效率";

export type DamageType = "普攻" | "重击" | "共鸣技能" | "共鸣解放" | "效应伤害" | "震谐伤害" | "无伤害";

export type SkillCategory = 
  | "常态攻击" 
  | "共鸣技能" 
  | "共鸣回路" 
  | "共鸣解放" 
  | "变奏技能";

export type MultiplierZone = 
  | "倍率提升" 
  | "伤害加深" 
  | "伤害加成" 
  | "无视防御" 
  | "无视抗性" 
  | "次数";

export type EchoCost = 1 | 3 | 4;

// ============ 效应类型 ============
export type EffectType = 
  | "光噪效应"
  | "风蚀效应"
  | "虚湮效应"
  | "聚爆效应"
  | "霜渐效应"
  | "电磁效应";

// ============ 角色相关类型 ============
export interface CharacterBaseStats {
  name: string;
  rarity: Rarity;
  weaponType: WeaponType;
  elementType: ElementType;
  scalingTemplate: ScalingTemplate;
  
  // 等级相关
  level: number;
  levelList: number[];
  
  // 基础属性（根据等级映射）
  baseHPList: number[];
  baseATKList: number[];
  baseDEFList: number[];
  
  // 固定属性
  baseCritRate: number; // 默认 5%
  baseCritDMG: number; // 默认 150%
  baseHealBonus: number; // 默认 0%
  baseElementDMG: number; // 默认 30%
  baseEnergyRegen: number; // 默认 100%
  
  // 图片资源
  imageKey?: string; // 用于构建图片路径的键名
}

export interface CharacterSkill {
  name: string;
  skillLevel: number; // 1-10
  damageType: DamageType;
  skillCategory: SkillCategory;
  multiplierList: number[]; // 对应技能等级的倍率
  zoneBonus: number; // 乘区加成，默认0
}

export interface CharacterBranchStats {
  branch1: { stat: string; value: number };
  branch2: { stat: string; value: number };
}

export interface CharacterPassiveSkill {
  name: string;
  description: string;
  enabled: boolean;
  effectScope: "面板加成" | "倍率提升" | "伤害加深" | "防御乘区" | "抗性乘区" | "次数乘区" | "队友加成" | "全队加成";
  effects: {
    zoneType?: MultiplierZone;
    value?: number;
    statBonus?: Record<string, number>;
    conditional?: {
      condition: string; // 如"风蚀效应层数"
      values: number[]; // 不同条件下的数值
    };
  };
  affectedSkillTypes?: SkillCategory[];
  affectedSkillNames?: string[];
  // UI配置：用于在界面上显示条件输入控件
  conditionalUI?: {
    type: "select" | "number" | "slider";
    label: string; // 显示的标签
    stateKey: string; // 关联的状态键名（如"erosionLayers"）
    options?: number[]; // 选项值（用于select类型）
    min?: number; // 最小值（用于number/slider）
    max?: number; // 最大值（用于number/slider）
    suffix?: string; // 后缀（如"层"）
  };
}

// 延奏技能：只有放在队友位置时生效，类似固有技能提供开关效果，效果作用到主位角色
// 注意：延奏技能的启用由队友配置中的enabledOutro控制，不需要enabled字段
export interface CharacterOutroSkill {
  name: string;
  description: string;
  effectScope: "面板加成" | "倍率提升" | "伤害加深" | "防御乘区" | "抗性乘区" | "次数乘区" | "全队加成";
  effects: {
    zoneType?: MultiplierZone;
    value?: number;
    statBonus?: Record<string, number>;
  };
  affectedSkillTypes?: SkillCategory[];
  affectedSkillNames?: string[];
}

export interface Character {
  baseStats: CharacterBaseStats;
  skills: CharacterSkill[];
  branchStats: CharacterBranchStats;
  passiveSkills: CharacterPassiveSkill[];
  outroSkill?: CharacterOutroSkill; // 延奏技能（队友加成）
  // 效应层数：记录角色携带的效应及其层数（部分效应，不同角色可能只有特定效应）
  effectStacks?: Partial<Record<EffectType, number>>;
}

// ============ 武器相关类型 ============
export interface WeaponBaseStats {
  name: string;
  rarity: Rarity;
  weaponType: WeaponType;
  resonanceLevel: number; // 谐振等级 1-5
  
  // 等级相关
  weaponLevel: number;
  levelList: number[];
  
  // 基础属性（根据等级映射）
  baseATKList: number[];
  secondaryStatList: number[]; // 副属性列表
  secondaryStatType: string; // 副属性类型
  
  imageKey?: string; // 用于构建图片路径的键名
}

export interface WeaponSkill {
  name: string;
  description: string;
  enabled: boolean;
  effects: Array<{
    name: string;
    type: "属性加成" | "乘区加成" | "面板加成";
    effect_Type?: MultiplierZone;
    enabled?: boolean; // 部分效果可独立开关
    valuesByResonance: number[]; // 对应谐振等级1-5的数值
    // 效应条件：当角色携带指定效应且层数满足条件时生效
    effectCondition?: {
      effectType: EffectType; // 需要的效应类型
      minStacks: number; // 最小层数
    };
    // 伤害类型限制：只对指定伤害类型生效
    affectedDamageTypes?: DamageType[];
  }>;
}

export interface Weapon {
  baseStats: WeaponBaseStats;
  skill: WeaponSkill;
}

// ============ 声骸相关类型 ============
export type MainStatType = 
  | "大攻击" 
  | "大防御" 
  | "大生命"
  | "暴击率"
  | "暴击伤害"
  | "治疗效果"
  | "共鸣效率"
  | "气动伤害加成"
  | "热熔伤害加成"
  | "衍射伤害加成"
  | "冷凝伤害加成"
  | "湮灭伤害加成"
  | "导电伤害加成";

export type SubStatType = 
  | MainStatType
  | "小攻击"
  | "小防御"
  | "小生命"
  | "普攻伤害加成"
  | "重击伤害加成"
  | "共鸣技能伤害加成"
  | "共鸣解放伤害加成";

export const COST_MAIN_STATS: Record<EchoCost, MainStatType[]> = {
  1: ["大攻击", "大防御", "大生命"],
  3: [
    "共鸣效率", "大攻击", "大防御", "大生命",
    "气动伤害加成", "热熔伤害加成", "衍射伤害加成",
    "冷凝伤害加成", "湮灭伤害加成", "导电伤害加成"
  ],
  4: [
    "暴击率", "暴击伤害", "治疗效果",
    "大攻击", "大防御", "大生命"
  ]
};

export const COST_SECONDARY_STATS: Record<EchoCost, SubStatType[]> = {
  1: ["小生命"],
  3: ["小攻击"],
  4: ["小攻击"]
};

export const SUB_STAT_VALUES: Record<string, number[]> = {
  "暴击率": [10.5, 9.9, 9.3, 8.7, 8.1, 7.5, 6.9, 6.3],
  "暴击伤害": [21, 19.8, 18.6, 17.4, 16.2, 15, 13.8, 12.6],
  "大攻击": [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4],
  "小攻击": [60, 50, 40, 30],
  "大防御": [14.7, 13.8, 12.8, 11.8, 10.9, 10, 9, 8.1],
  "小防御": [70, 60, 50, 40],
  "大生命": [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4],
  "小生命": [580, 540, 510, 470, 430, 390, 360, 320],
  "共鸣效率": [12.4, 11.6, 10.8, 10, 9.2, 8.4, 7.6, 6.8],
  "普攻伤害加成": [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4],
  "重击伤害加成": [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4],
  "共鸣技能伤害加成": [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4],
  "共鸣解放伤害加成": [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4]
};

export interface EchoSubStat {
  type: SubStatType;
  value: number;
}

export interface Echo {
  name: string;
  imageKey?: string; // 图片文件名的key（如fuludelis）
  cost: EchoCost;
  possibleSets: string[]; // 可能的套装
  selectedSet?: string; // 当前选择的套装
  
  // 主属性
  mainStatType: MainStatType;
  mainStatValue: number;
  
  // 副属性
  secondaryStatType: SubStatType;
  secondaryStatValue: number;
  
  // 副词条（等级5-10-15-20-25提供1-2-3-4-5个）
  subStats: EchoSubStat[];
  echoLevel: 5 | 10 | 15 | 20 | 25;
}

export interface EchoSetBonus {
  name: string;
  piece2?: string; // 2件套效果描述
  piece3?: string; // 3件套效果描述
  piece5?: string; // 5件套效果描述
  effects: {
    pieceCount: 2 | 3 | 5;
    stats: Record<string, number>; // 属性加成
  }[];
}

// 声骸套装效果启用状态
export interface EchoSetEnabledState {
  piece2?: boolean;
  piece3?: boolean;
  piece5?: boolean;
}

// ============ 计算相关类型 ============
export interface CombatStats {
  // 基础属性
  totalATK: number;
  totalHP: number;
  totalDEF: number;
  
  // 百分比属性
  critRate: number;
  critDMG: number;
  healBonus: number;
  energyRegen: number;
  elementDMG: number;
  
  // 伤害加成
  normalATKBonus: number;
  heavyATKBonus: number;
  skillBonus: number;
  liberationBonus: number;
}

export interface DamageCalculationInput {
  character: Character;
  weapon: Weapon;
  echoes: Echo[];
  activeEchoSets: Record<string, number>; // 套装名称 -> 件数
  echoSetEnabled?: Record<string, EchoSetEnabledState>; // 套装效果启用状态
  targetLevel: number;
  enemyResistance: number;
  selectedSkill: CharacterSkill;
  critMode: "期望" | "暴击" | "不暴击";
  effectStacks?: Record<string, number>; // 角色效应层数（如风蚀效应等）
  teammates?: TeammateConfig[]; // 队友配置
  // 爱弥斯特殊配置
  aimisiConfig?: {
    resonanceMode?: "震谐" | "聚爆"; // 共鸣模态
    zhenxieTrackStacks?: number; // 震谐轨迹层数 (0-30)
    xingchenZhenxieEnabled?: boolean; // 星屑共振·震谐
    hasZhenxieInterference?: boolean; // 是否有震谐干涉标记
    jubaoTrackStacks?: number; // 聚爆轨迹层数 (1-30)
    jubaoEffectStacks?: number; // 聚爆效应层数
    xingchenJubaoEnabled?: boolean; // 星屑共振·聚爆
  };
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
  hitsMultiplier: number;
  finalDamage: number;
  combatStats: CombatStats;
  // 详细计算信息
  details?: {
    multiplierBoostSources?: string[]; // 倍率提升来源
    damageDeepenSources?: string[]; // 伤害加深来源
    damageBonusSources?: string[]; // 伤害加成来源
    defenseIgnoreSources?: string[]; // 无视防御来源
    resistanceReductionSources?: string[]; // 抗性削减来源
  };
}

// ============ 输出流程相关 ============
export interface SkillRotationStep {
  skillName: string;
  count: number; // 释放次数
  critMode: "期望" | "暴击" | "不暴击";
}

export interface SkillRotation {
  characterName: string;
  steps: SkillRotationStep[];
}

export interface DamageDistribution {
  skillName: string;
  damageType: DamageType;
  totalDamage: number;
  percentage: number;
}

// ============ 队友配置 ============
export interface TeammateConfig {
  characterName: string;
  character: Character;
  enabledOutro: boolean; // 是否启用延奏技能
  enabledPassives: boolean[]; // 启用的固有技能列表（全队加成）
}

