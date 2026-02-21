// 鸣潮 - 散华角色数据

import { Character } from "@/types";

export const SANHUA: Character = {
  baseStats: {
    name: "散华",
    rarity: 4,
    weaponType: "迅刀",
    elementType: "冷凝伤害",
    scalingTemplate: "攻击",
    
    level: 90,
    levelList: [20, 40, 50, 60, 70, 80, 90],
    
    baseHPList: [805, 2093, 3987, 5202, 6417, 7632, 8847, 10062],
    baseATKList: [22, 57, 110, 145, 180, 215, 245, 275],
    baseDEFList: [77, 197, 374, 487, 601, 714, 827, 941],
    
    baseCritRate: 0.05,
    baseCritDMG: 1.50,
    baseHealBonus: 0,
    baseElementDMG: 0.30,
    baseEnergyRegen: 1.00,
    
    imageKey: "sanhua"
  },
  
  skills: [
    // ========== 常态攻击 ==========
    {
      name: "第一段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.2450, 0.2651, 0.2852, 0.3134, 0.3334, 0.3565, 0.3887, 0.4208, 0.4530, 0.4871],
      zoneBonus: 0
    },
    {
      name: "第二段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.3710, 0.4015, 0.4319, 0.4745, 0.5049, 0.5399, 0.5886, 0.6372, 0.6859, 0.7376],
      zoneBonus: 0
    },
    {
      name: "第三段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [
        0.1085 * 4, 0.1174 * 4, 0.1263 * 4, 0.1388 * 4, 0.1477 * 4,
        0.1579 * 4, 0.1722 * 4, 0.1864 * 4, 0.2006 * 4, 0.2158 * 4
      ],
      zoneBonus: 0
    },
    {
      name: "第四段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [
        0.1995 * 2, 0.2159 * 2, 0.2323 * 2, 0.2552 * 2, 0.2715 * 2,
        0.2903 * 2, 0.3165 * 2, 0.3427 * 2, 0.3689 * 2, 0.3967 * 2
      ],
      zoneBonus: 0
    },
    {
      name: "第五段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [1.1760, 1.2725, 1.3689, 1.5039, 1.6004, 1.7112, 1.8655, 2.0198, 2.1741, 2.3381],
      zoneBonus: 0
    },
    {
      name: "重击伤害",
      skillLevel: 10,
      damageType: "重击",
      skillCategory: "常态攻击",
      multiplierList: [
        0.1120 * 5, 0.1212 * 5, 0.1304 * 5, 0.1433 * 5, 0.1525 * 5,
        0.1630 * 5, 0.1777 * 5, 0.1924 * 5, 0.2071 * 5, 0.2227 * 5
      ],
      zoneBonus: 0
    },
    {
      name: "空中攻击",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.4340, 0.4696, 0.5052, 0.5550, 0.5906, 0.6316, 0.6885, 0.7454, 0.8024, 0.8629],
      zoneBonus: 0
    },
    {
      name: "极限反击",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.8400, 0.9089, 0.9778, 1.0742, 1.1431, 1.2223, 1.3325, 1.4427, 1.5530, 1.6701],
      zoneBonus: 0
    },
    
    // ========== 共鸣技能 ==========
    {
      name: "共鸣技能·朔雪永冻",
      skillLevel: 10,
      damageType: "共鸣技能",
      skillCategory: "共鸣技能",
      multiplierList: [1.8100, 1.9585, 2.1069, 2.3147, 2.4631, 2.6338, 2.8713, 3.1087, 3.3462, 3.5985],
      zoneBonus: 0
    },
    
    // ========== 共鸣回路 ==========
    {
      name: "重击·爆裂",
      skillLevel: 10,
      damageType: "重击",
      skillCategory: "共鸣回路",
      multiplierList: [
        0.9370 * 2, 1.0139 * 2, 1.0907 * 2, 1.1983 * 2, 1.2751 * 2,
        1.3635 * 2, 1.4864 * 2, 1.6093 * 2, 1.7323 * 2, 1.8629 * 2
      ],
      zoneBonus: 0
    },
    {
      name: "冰绽·冰川",
      skillLevel: 10,
      damageType: "共鸣技能",
      skillCategory: "共鸣回路",
      multiplierList: [0.7000, 0.7574, 0.8148, 0.8952, 0.9526, 1.0186, 1.1105, 1.2023, 1.2941, 1.3917],
      zoneBonus: 0
    },
    {
      name: "冰绽·冰棱",
      skillLevel: 10,
      damageType: "共鸣技能",
      skillCategory: "共鸣回路",
      multiplierList: [0.4000, 0.4328, 0.4656, 0.5116, 0.5444, 0.5821, 0.6346, 0.6870, 0.7395, 0.7953],
      zoneBonus: 0
    },
    {
      name: "冰绽·冰棘",
      skillLevel: 10,
      damageType: "共鸣技能",
      skillCategory: "共鸣回路",
      multiplierList: [0.3000, 0.3246, 0.3492, 0.3837, 0.4083, 0.4366, 0.4759, 0.5153, 0.5547, 0.5965],
      zoneBonus: 0
    },
    
    // ========== 共鸣解放 ==========
    {
      name: "焦瞑冻土",
      skillLevel: 10,
      damageType: "共鸣解放",
      skillCategory: "共鸣解放",
      multiplierList: [4.0716, 4.4055, 4.7394, 5.2068, 5.5407, 5.9246, 6.4588, 6.9930, 7.5272, 8.0948],
      zoneBonus: 0
    },
    
    // ========== 变奏技能 ==========
    {
      name: "变奏·凛刺",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "变奏技能",
      multiplierList: [0.7000, 0.7574, 0.8148, 0.8952, 0.9526, 1.0186, 1.1105, 1.2023, 1.2941, 1.3917],
      zoneBonus: 0
    }
  ],
  
  branchStats: {
    branch1: { stat: "冷凝伤害加成", value: 0.12 },
    branch2: { stat: "大攻击", value: 0.12 }
  },
  
  passiveSkills: [
    {
      name: "凝冰",
      description: "施放变奏技能时，散华的共鸣技能伤害提升20%，持续8秒。",
      enabled: false,
      effectScope: "倍率提升",
      effects: {
        zoneType: "倍率提升",
        value: 0.20,
        statBonus: { "共鸣技能伤害提升": 0.20 }
      },
      affectedSkillTypes: ["共鸣技能", "共鸣回路"]
    }
  ],

  // 延奏技能：只有放在队友位置时生效
  outroSkill: {
    name: "延奏·凛絜",
    description: "下一位登场角色（或附近队伍中激活延奏技能的角色）普攻伤害加深38%，效果持续14秒，若切换至其他角色则该效果提前结束。",
    effectScope: "伤害加深",
    effects: {
      zoneType: "伤害加深",
      value: 0.38,
      statBonus: { "普攻伤害加深": 0.38 }
    },
    affectedSkillTypes: ["常态攻击"]
  },

  // 效应层数：散华无法添加效应
  effectStacks: {}
};
