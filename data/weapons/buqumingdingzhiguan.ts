// 鸣潮 - 不屈命定之冠武器数据

import { Weapon } from "@/types";

export const UNSHAKABLE_CROWN: Weapon = {
  baseStats: {
    name: "不屈命定之冠",
    rarity: 5,
    weaponType: "迅刀",
    resonanceLevel: 1,
    
    weaponLevel: 90,
    levelList: [20, 40, 50, 60, 70, 80, 90],
    
    baseATKList: [85, 163, 213, 263, 312, 362, 412],
    secondaryStatList: [0.285, 0.41, 0.472, 0.534, 0.597, 0.659, 0.722],
    secondaryStatType: "大生命",
    
    imageKey: "buqumingdingzhiguan"
  },
  
  skill: {
    name: "自由骑士之舞",
    description: "生命提升（12%/15%/18%/21%/24%）。施放变奏技能或普攻后15秒内，自身造成伤害无视目标（8%/10%/12%/14%/16%）防御，当目标的风蚀效应不少于1层时，对目标造成的伤害加深（20%/25%/30%/35%/40%）。",
    enabled: true,
    effects: [
      {
        name: "生命提升",
        type: "属性加成",
        enabled: true,
        valuesByResonance: [0.12, 0.15, 0.18, 0.21, 0.24]
      },
      {
        name: "无视防御",
        type: "乘区加成",
        effect_Type: "无视防御",
        enabled: true,
        valuesByResonance: [0.08, 0.10, 0.12, 0.14, 0.16]
      },
      {
        name: "伤害加深",
        type: "乘区加成",
        effect_Type: "伤害加深",
        enabled: true,
        valuesByResonance: [0.20, 0.25, 0.30, 0.35, 0.40],
        effectCondition: {
          effectType: "风蚀效应",
          minStacks: 1
        }
      }
    ]
  }
};
