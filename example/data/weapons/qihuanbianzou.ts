// 鸣潮 - 奇幻变奏武器数据

import { Weapon } from "@/types";

export const QIHUANBIANZOU: Weapon = {
  baseStats: {
    name: "奇幻变奏",
    rarity: 4,
    weaponType: "音感仪",
    resonanceLevel: 1,

    weaponLevel: 90,
    levelList: [20, 40, 50, 60, 70, 80, 90],

    baseATKList: [70, 133, 174, 215, 255, 296, 337],
    secondaryStatList: [0.204, 0.294, 0.339, 0.383, 0.428, 0.473, 0.518],
    secondaryStatType: "共鸣效率",

    imageKey: "qihuanbianzou"
  },

  skill: {
    name: "咏叹之音",
    description: "施放共鸣技能时，回复(8/10/12/14/16)点协奏能量，每20秒可触发1次。",
    enabled: false,
    effects: []
  }
};
