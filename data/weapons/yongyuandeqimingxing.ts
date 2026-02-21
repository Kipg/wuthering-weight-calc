// 鸣潮 - 永远的启明星武器数据

import { Weapon } from "@/types";

export const YONGYUAN_DE_QIMINGXING: Weapon = {
  baseStats: {
    name: "永远的启明星",
    rarity: 5,
    weaponType: "迅刀",
    resonanceLevel: 1,
    
    weaponLevel: 90,
    levelList: [20, 40, 50, 60, 70, 80, 90],
    
    baseATKList: [122, 232, 303, 374, 445, 516, 587],
    secondaryStatList: [0.095, 0.137, 0.158, 0.179, 0.200, 0.221, 0.243],
    secondaryStatType: "暴击率",
    
    imageKey: "yongyuandeqimingxing"
  },
  
  skill: {
    name: "永恒的启明星",
    description: "全属性伤害提升（12%/15%/18%/21%/24%）。附加震谐·偏移或聚爆效应时，共鸣解放伤害无视目标（32%/40%/48%/56%/64%）防御，无视目标（10%/15%/20%/25%/30%）热熔抗性。",
    enabled: true,
    effects: [
      {
        name: "全属性伤害提升",
        type: "属性加成",
        valuesByResonance: [0.12, 0.15, 0.18, 0.21, 0.24]
      },
      {
        name: "无视防御力",
        type: "乘区加成",
        effect_Type: "无视防御",
        valuesByResonance: [0.32, 0.40, 0.48, 0.56, 0.64],
        affectedDamageTypes: ["共鸣解放"] // 只对共鸣解放生效
      },
      {
        name: "无视热熔抗性",
        type: "乘区加成",
        effect_Type: "无视抗性",
        valuesByResonance: [0.10, 0.15, 0.20, 0.25, 0.30],
        affectedDamageTypes: ["共鸣解放"] // 只对共鸣解放生效
      }
    ]
  }
};
