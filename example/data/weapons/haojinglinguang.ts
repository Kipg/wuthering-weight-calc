// 鸣潮 - 千古洑流武器数据

import { Weapon } from "@/types";

export const HAOJINGLINGUANG: Weapon = {
  baseStats: {
    name: "浩境粼光",
    rarity: 5,
    weaponType: "长刃",
    resonanceLevel: 1,

    weaponLevel: 90,
    levelList: [20, 40, 50, 60, 70, 80, 90],

    baseATKList: [122, 232, 303, 374, 445, 516, 587],
    secondaryStatList: [0.143, 0.206, 0.238, 0.269, 0.301, 0.332, 0.364],
    secondaryStatType: "大攻击",

    imageKey: "haojinglinguang"
  },

  skill: {
    name: "扬波无止",
    description: "共鸣效率提升（12.8%/16%/19.2%/22.4%/25.6%）。施放共鸣技能时，共鸣解放伤害加成提升（7%/8.75%/10.5%/12.25%/14%），可叠加3层，持续12秒。",
    enabled: true,
    effects: [
      {
        name: "共鸣效率提升",
        type: "属性加成",
        enabled: true,
        valuesByResonance: [0.128, 0.16, 0.192, 0.224, 0.256]
      },
      {
        name: "共鸣解放伤害加成提升",
        type: "属性加成",
        enabled: true,
        stacks: 3,
        maxStacks: 3,
        valuesByResonance: [0.07, 0.0875, 0.105, 0.1225, 0.14]
      }
    ]
  }
};
