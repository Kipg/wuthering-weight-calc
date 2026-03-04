// 鸣潮 - 千古洑流武器数据

import { Weapon } from "@/types";

export const QIANGUFULIU: Weapon = {
  baseStats: {
    name: "千古洑流",
    rarity: 5,
    weaponType: "迅刀",
    resonanceLevel: 1,

    weaponLevel: 90,
    levelList: [20, 40, 50, 60, 70, 80, 90],

    baseATKList: [122, 232, 303, 374, 445, 516, 587],
    secondaryStatList: [0.095, 0.137, 0.158, 0.179, 0.200, 0.221, 0.243],
    secondaryStatType: "暴击率",

    imageKey: "qiangufuliu"
  },
  skill: {
    name: "流涡无垠",
    description: "共鸣效率提升（12.8%/16%/19.2%/22.4%/25.6%）。施放共鸣技能时，攻击提升（6%/7.5%/9%/10.5%/12%），可叠加2层，持续10秒。",
    enabled: false,
    effects: [
      {
        name: "共鸣效率提升",
        type: "属性加成",
        enabled: true,
        valuesByResonance: [0.128, 0.16, 0.192, 0.224, 0.256]
      },
      {
        name: "大攻击提升",
        type: "属性加成",
        enabled: true,
        stacks: 2,
        maxStacks: 2,
        valuesByResonance: [0.06, 0.075, 0.09, 0.105, 0.12]
      }
    ]
  }
};
