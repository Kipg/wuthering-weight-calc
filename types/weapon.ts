// 武器相关类型

import { Rarity, WeaponType, MultiplierZone, EffectType, DamageType } from "./bases";

export interface WeaponBaseStats {
  name: string;
  rarity: Rarity;
  weaponType: WeaponType;
  resonanceLevel: number; // 谐振等级 1-5

  weaponLevel: number;
  levelList: number[];

  baseATKList: number[];
  secondaryStatList: number[];
  secondaryStatType: string;

  imageKey?: string;
}

export interface WeaponSkill {
  name: string;
  description: string;
  enabled: boolean;
  effects: Array<{
    name: string;
    type: "属性加成" | "乘区加成";
    effect_Type?: MultiplierZone;
    enabled?: boolean;
    stacks?: number;
    maxStacks?: number;
    valuesByResonance: number[];
    effectCondition?: {
      effectType: EffectType;
      minStacks: number;
    };
    affectedDamageTypes?: DamageType[];
  }>;
}

export interface Weapon {
  baseStats: WeaponBaseStats;
  skill: WeaponSkill;
}
