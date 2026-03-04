// 鸣潮 - 维里奈角色数据

import { Character } from "@/types";

export const WEILINAI: Character = {
  baseStats: {
    name: "维里奈",
    rarity: 5,
    weaponType: "音感仪",
    elementType: "衍射伤害",

    level: 90,
    levelList: [20, 40, 50, 60, 70, 80, 90],

    baseHPList: [2962, 5614, 7360, 9070, 10799, 12518, 14237],
    baseATKList: [70, 135, 178, 221, 264, 301, 337],
    baseDEFList: [230, 437, 570, 702, 835, 967, 1099],

    baseCritRate: 0.05,
    baseCritDMG: 1.50,
    baseHealBonus: 0,
    baseElementDMG: 0.20,
    baseEnergyRegen: 1.00,

    imageKey: "weilinai"
  },

  skills: [
    // ========== 常态攻击==========
    {
      name: "第一段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.1904, 0.2061, 0.2217, 0.2435, 0.2591, 0.2771, 0.3021, 0.3270, 0.3520, 0.3786],
    },
    {
      name: "第二段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.2573, 0.2784, 0.2995, 0.3291, 0.3502, 0.3744, 0.4082, 0.4419, 0.4757, 0.5116],
    },
    {
      name: "第三段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.1287*2, 0.1392*2, 0.1498*2, 0.1646*2, 0.1751*2, 0.1872*2, 0.2041*2, 0.2210*2, 0.2379*2, 0.2558*2],
    },
    {
      name: "第四段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.3386, 0.3664, 0.3942, 0.4330, 0.4608, 0.4927, 0.5372, 0.5816, 0.6260, 0.6732],
    },
    {
      name: "第五段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.3603, 0.3898, 0.4193, 0.4607, 0.4902, 0.5242, 0.5714, 0.6187, 0.6660, 0.7162],
    },
    {
      name: "闪避反击伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.6500, 0.7033, 0.7566, 0.8313, 0.8846, 0.9459, 1.0311, 1.1164, 1.2017, 1.2923],
    },
    {
      name: "重击伤害",
      skillLevel: 10,
      damageType: "重击",
      skillCategory: "常态攻击",
      multiplierList: [0.5000, 0.5410, 0.5820, 0.6394, 0.6804, 0.7276, 0.7932, 0.8588, 0.9244, 0.9941],
    },
    {
      name: "空中攻击·第一段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.2835, 0.3068, 0.3300, 0.3626, 0.3858, 0.4126, 0.4498, 0.4870, 0.5242, 0.5637],
    },
    {
      name: "空中攻击·第二段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.2675, 0.2895, 0.3114, 0.3421, 0.3641, 0.3893, 0.4244, 0.4595, 0.4946, 0.5319],
    },
    {
      name: "空中攻击·第三段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.1279*3, 0.1384*3, 0.1488*3, 0.1635*3, 0.1740*3, 0.1861*3, 0.2028*3, 0.2196*3, 0.2364*3, 0.2542*3],
    },
    {
      name: "空中重击伤害",
      skillLevel: 10,
      damageType: "重击",
      skillCategory: "常态攻击",
      multiplierList: [0.3100, 0.3355, 0.3609, 0.3965, 0.4219, 0.4511, 0.4918, 0.5325, 0.5731, 0.6164],
    },

    // ========== 共鸣技能==========
    {
      name: "共鸣技能·扩繁试验",
      skillLevel: 10,
      damageType: "共鸣技能",
      skillCategory: "共鸣技能",
      multiplierList: [0.1800*3+0.3600, 0.1948*3+0.3896, 0.2096*3+0.4191, 0.2302*3+0.4604, 0.2450*3+0.4899, 0.2620*3+0.5239, 0.2856*3+0.5711, 0.3092*3+0.6183, 0.3328*3+0.6656, 0.3579*3+0.7158],
    },

    // ========== 共鸣回路 ==========
    // 维里奈共鸣回路无独立伤害技能

    // ========== 共鸣解放 ==========
    {
      name: "重击·星星花绽放伤害",
      skillLevel: 10,
      damageType: "重击",
      skillCategory: "共鸣解放",
      multiplierList: [0.3267+0.4900, 0.3535+0.5302, 0.3803+0.5704, 0.4178+0.6267, 0.4446+0.6668, 0.4754+0.7130, 0.5182+0.7773, 0.5611+0.8416, 0.6040+0.9059, 0.6495+0.9742],
    },
    {
      name: "空中攻击·星星花绽放第一段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣解放",
      multiplierList: [0.3402, 0.3681, 0.3960, 0.4351, 0.4630, 0.4951, 0.5397, 0.5843, 0.6290, 0.6764],
    },
    {
      name: "空中攻击·星星花绽放第二段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣解放",
      multiplierList: [0.3210, 0.3474, 0.3737, 0.4105, 0.4369, 0.4671, 0.5093, 0.5514, 0.5935, 0.6382],
    },
    {
      name: "空中攻击·星星花绽放第三段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣解放",
      multiplierList: [0.1534*3, 0.1660*3, 0.1786*3, 0.1962*3, 0.2088*3, 0.2233*3, 0.2434*3, 0.2635*3, 0.2836*3, 0.3050*3],
    },
    {
      // 治疗量：multiplierList 为攻击倍率部分，flatValueList 为扁平治疗量
      name: "星星花绽放治疗量",
      skillLevel: 10,
      damageType: "治疗",
      skillCategory: "共鸣解放",
      multiplierList: [0.1417, 0.1629, 0.1771, 0.1983, 0.2125, 0.2267, 0.2408, 0.2550, 0.2692, 0.2975],
      flatValueList: [625, 750, 875, 1000, 1032, 1113, 1125, 1144, 1163, 1188],
    }
  ],

  branchStats: {
    branch1: { stat: "治疗效果", value: 0.12 },
    branch2: { stat: "大攻击", value: 0.12 }
  },

  passiveSkills: [
    {
      name: "自然的献礼",
      description: "施放重击星星花绽放、空中攻击星星花绽放、共鸣解放草木生长或延奏技能盛放时，队伍中的角色攻击提升20%，持续20秒。",
      enabled: false,
      effects: {}
    }
  ],

  outroSkills: [
    {
      name: "自然的献礼",
      description: "施放重击星星花绽放、空中攻击星星花绽放、共鸣解放草木生长或延奏技能盛放时，队伍中的角色攻击提升20%，持续20秒。",
      effects: {
        statBonus: { "大攻击": 0.20 }
      }
    }
  ],

  // 效应层数：无
  effectStacks: {}
};
