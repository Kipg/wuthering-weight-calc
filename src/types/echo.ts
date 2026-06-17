// ========== 声骸COST ==========
export type EchoCost = 1 | 3 | 4;

// ========== 声骸主属性类型 ==========
export type EchoMainStat =
  | 'atk_percent'
  | 'def_percent'
  | 'hp_percent'
  | 'crit_rate'
  | 'crit_dmg'
  | 'heal_bonus'
  | 'energy_regen'
  | 'aero_dmg'
  | 'fusion_dmg'
  | 'spectro_dmg'
  | 'glacio_dmg'
  | 'havoc_dmg'
  | 'electro_dmg';

export const ECHO_MAINSTAT_LABELS: Record<EchoMainStat, string> = {
  atk_percent: '攻击%',
  def_percent: '防御%',
  hp_percent: '生命%',
  crit_rate: '暴击率',
  crit_dmg: '暴击伤害',
  heal_bonus: '治疗效果',
  energy_regen: '共鸣效率',
  aero_dmg: '气动伤害加成',
  fusion_dmg: '热熔伤害加成',
  spectro_dmg: '衍射伤害加成',
  glacio_dmg: '冷凝伤害加成',
  havoc_dmg: '湮灭伤害加成',
  electro_dmg: '导电伤害加成',
};

// COST → 可用主属性映射
export const COST_MAIN_STATS: Record<EchoCost, EchoMainStat[]> = {
  1: ['atk_percent', 'def_percent', 'hp_percent'],
  3: [
    'energy_regen', 'atk_percent', 'def_percent', 'hp_percent',
    'aero_dmg', 'fusion_dmg', 'spectro_dmg', 'glacio_dmg', 'havoc_dmg', 'electro_dmg',
  ],
  4: ['crit_rate', 'crit_dmg', 'heal_bonus', 'atk_percent', 'def_percent', 'hp_percent'],
};

// COST → 固定副属性类型 + 基础值
export const COST_SECONDARY: Record<EchoCost, { type: string; label: string; value: number }> = {
  1: { type: 'flat_hp', label: '生命', value: 2280 },
  3: { type: 'flat_atk', label: '攻击', value: 100 },
  4: { type: 'flat_atk', label: '攻击', value: 150 },
};

// ========== 副词条类型 ==========
export type EchoSubStatType =
  | 'crit_rate'
  | 'crit_dmg'
  | 'atk_percent'
  | 'flat_atk'
  | 'def_percent'
  | 'flat_def'
  | 'hp_percent'
  | 'flat_hp'
  | 'energy_regen'
  | 'basic_dmg'
  | 'heavy_dmg'
  | 'skill_dmg'
  | 'burst_dmg';

export const ECHO_SUBSTAT_LABELS: Record<EchoSubStatType, string> = {
  crit_rate: '暴击率',
  crit_dmg: '暴击伤害',
  atk_percent: '攻击%',
  flat_atk: '攻击',
  def_percent: '防御%',
  flat_def: '防御',
  hp_percent: '生命%',
  flat_hp: '生命',
  energy_regen: '共鸣效率',
  basic_dmg: '普攻伤害加成',
  heavy_dmg: '重击伤害加成',
  skill_dmg: '共鸣技能伤害加成',
  burst_dmg: '共鸣解放伤害加成',
};

// 副词条可选值范围（从高到低）
export const SUBSTAT_VALUES: Record<EchoSubStatType, number[]> = {
  crit_rate: [10.5, 9.9, 9.3, 8.7, 8.1, 7.5, 6.9, 6.3],
  crit_dmg: [21, 19.8, 18.6, 17.4, 16.2, 15, 13.8, 12.6],
  atk_percent: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4],
  flat_atk: [60, 50, 40, 30],
  def_percent: [14.7, 13.8, 12.8, 11.8, 10.9, 10, 9, 8.1],
  flat_def: [70, 60, 50, 40],
  hp_percent: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4],
  flat_hp: [580, 540, 510, 470, 430, 390, 360, 320],
  energy_regen: [12.4, 11.6, 10.8, 10, 9.2, 8.4, 7.6, 6.8],
  basic_dmg: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4],
  heavy_dmg: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4],
  skill_dmg: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4],
  burst_dmg: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4],
};

// ========== 单条副词条 ==========
export interface EchoSubStatItem {
  type: EchoSubStatType;
  value: number;
}

// ========== 单个声骸 ==========
export interface EchoSlot {
  cost: EchoCost;
  mainStatType: EchoMainStat;
  mainStatValue: number;
  subStats: EchoSubStatItem[]; // 5条副词条
}

// ========== 套装效果词条 ==========
export type EchoSetBonusStatType = EchoSubStatType | 'elemental_dmg' | 'heal_bonus';

export interface EchoSetBonusItem {
  id: string;
  statType: EchoSetBonusStatType;
  value: number;
}

// ========== 声骸配置（5个槽位 + 套装效果） ==========
export interface EchoConfig {
  slots: EchoSlot[];
  setBonuses: EchoSetBonusItem[];
}

// ========== 声骸主属性默认值（满级） ==========
export const ECHO_MAINSTAT_VALUES: Record<EchoCost, Partial<Record<EchoMainStat, number>>> = {
  1: { atk_percent: 18, def_percent: 22.5, hp_percent: 22.5 },
  3: {
    atk_percent: 30, def_percent: 37.5, hp_percent: 30,
    energy_regen: 32,
    aero_dmg: 30, fusion_dmg: 30, spectro_dmg: 30, glacio_dmg: 30, havoc_dmg: 30, electro_dmg: 30,
  },
  4: {
    crit_rate: 22, crit_dmg: 44, heal_bonus: 15.4,
    atk_percent: 30, def_percent: 37.5, hp_percent: 30,
  },
};

// ========== 声骸统计（聚合后的属性加成） ==========
export interface EchoStats {
  atkPercent: number;
  flatAtk: number;
  defPercent: number;
  flatDef: number;
  hpPercent: number;
  flatHp: number;
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
