// 鸣潮 - 漂泊者·湮灭角色数据

import { Character } from "@/types";

export const PIAOBOZHE_YANMIE: Character = {
  baseStats: {
    name: "漂泊者·湮灭",
    rarity: 5,
    weaponType: "迅刀",
    elementType: "湮灭伤害",


    level: 90,
    levelList: [20, 40, 50, 60, 70, 80, 90],

    baseHPList: [2250, 4289, 5596, 6903, 8210, 9517, 10825],
    baseATKList: [85, 166, 218, 271, 323, 368, 412],
    baseDEFList: [264, 500, 652, 803, 955, 1107, 1258],

    baseCritRate: 0.05,
    baseCritDMG: 1.50,
    baseHealBonus: 0,
    baseElementDMG: 0.20,
    baseEnergyRegen: 1.00,

    imageKey: "piaobozhe_yanmie"
  },

  skills: [
    // ========== 常态攻击==========
    {
      name: "第一段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.2850, 0.3084, 0.3318, 0.3645, 0.3879, 0.4148, 0.4521, 0.4895, 0.5269, 0.5667],
    },
    {
      name: "第二段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.2850*2, 0.3084*2, 0.3318*2, 0.3645*2, 0.3879*2, 0.4148*2, 0.4521*2, 0.4895*2, 0.5269*2, 0.5667*2],
    },
    {
      name: "第三段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.4275, 0.4626, 0.4977, 0.5467, 0.5818, 0.6221, 0.6782, 0.7343, 0.7904, 0.8500],
    },
    {
      name: "第四段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.2027*3, 0.2193*3, 0.2360*3, 0.2592*3, 0.2758*3, 0.2950*3, 0.3215*3, 0.3481*3, 0.3747*3, 0.4030*3],
    },
    {
      name: "第五段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.4750*2, 0.5140*2, 0.5529*2, 0.6075*2, 0.6464*2, 0.6912*2, 0.7535*2, 0.8159*2, 0.8782*2, 0.9444*2],
    },
    {
      name: "闪避反击伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.9025, 0.9766, 1.0506, 1.1542, 1.2282, 1.3133, 1.4317, 1.5501, 1.6685, 1.7943],
    },
    {
      name: "重击伤害",
      skillLevel: 10,
      damageType: "重击",
      skillCategory: "常态攻击",
      multiplierList: [0.4800, 0.5194, 0.5588, 0.6139, 0.6532, 0.6985, 0.7615, 0.8244, 0.8874, 0.9543],
    },
    {
      name: "空中攻击",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.5890, 0.6373, 0.6856, 0.7533, 0.8016, 0.8571, 0.9344, 1.0117, 1.0889, 1.1710],
    },

    // ========== 共鸣技能==========
    {
      name: "共鸣技能·行进",
      skillLevel: 10,
      damageType: "共鸣技能",
      skillCategory: "共鸣技能",
      multiplierList: [1.4400*2, 1.5581*2, 1.6762*2, 1.8415*2, 1.9596*2, 2.0954*2, 2.2843*2, 2.4732*2, 2.6622*2, 2.8629*2],
    },

    // ========== 共鸣回路 ==========
    {
      name: "灭音",
      skillLevel: 10,
      damageType: "重击",
      skillCategory: "共鸣回路",
      multiplierList: [1.1475, 1.2416, 1.3357, 1.4675, 1.5616, 1.6698, 1.8203, 1.9709, 2.1214, 2.2814],
    },
    {
      name: "暗流·普攻第一段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣回路",
      multiplierList: [0.2835, 0.3068, 0.3300, 0.3626, 0.3858, 0.4126, 0.4498, 0.4870, 0.5242, 0.5637],
    },
    {
      name: "暗流·普攻第二段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣回路",
      multiplierList: [0.4725, 0.5113, 0.5500, 0.6043, 0.6430, 0.6876, 0.7496, 0.8116, 0.8736, 0.9394],
    },
    {
      name: "暗流·普攻第三段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣回路",
      multiplierList: [0.7830, 0.8473, 0.9115, 1.0014, 1.0656, 1.1394, 1.2421, 1.3449, 1.4476, 1.5567],
    },
    {
      name: "暗流·普攻第四段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣回路",
      multiplierList: [0.1868*3+0.5603, 0.2021*3+0.6062, 0.2174*3+0.6522, 0.2389*3+0.7165, 0.2542*3+0.7624, 0.2718*3+0.8153, 0.2963*3+0.8888, 0.3208*3+0.9623, 0.3453*3+1.0358, 0.3713*3+1.1139],
    },
    {
      name: "暗流·普攻第五段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣回路",
      multiplierList: [0.1435*4+0.5738, 0.1552*4+0.6208, 0.1670*4+0.6679, 0.1835*4+0.7338, 0.1952*4+0.7808, 0.2088*4+0.8349, 0.2276*4+0.9102, 0.2464*4+0.9855, 0.2652*4+1.0607, 0.2852*4+1.1407],
    },
    {
      name: "暗流·重击伤害",
      skillLevel: 10,
      damageType: "重击",
      skillCategory: "共鸣回路",
      multiplierList: [0.6480, 0.7012, 0.7543, 0.8287, 0.8818, 0.9430, 1.0280, 1.1130, 1.1980, 1.2883],
    },
    {
      name: "暗流·鸣刃伤害",
      skillLevel: 10,
      damageType: "重击",
      skillCategory: "共鸣回路",
      multiplierList: [0.6370+0.0500*4, 0.6893+0.0541*4, 0.7415+0.0582*4, 0.8146+0.0640*4, 0.8669+0.0681*4, 0.9269+0.0728*4, 1.0105+0.0794*4, 1.0941+0.0859*4, 1.1777+0.0925*4, 1.2665+0.0995*4],
    },
    {
      name: "暗流·下落攻击伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣回路",
      multiplierList: [0.6200, 0.6709, 0.7217, 0.7929, 0.8437, 0.9022, 0.9836, 1.0649, 1.1462, 1.2327],
    },
    {
      name: "暗流·闪避反击伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣回路",
      multiplierList: [1.5930, 1.7237, 1.8543, 2.0372, 2.1678, 2.3180, 2.5270, 2.7360, 2.9450, 3.1671],
    },
    {
      name: "暗流·破命伤害",
      skillLevel: 10,
      damageType: "共鸣技能",
      skillCategory: "共鸣回路",
      multiplierList: [1.3900*2+0.0500*4, 1.5040*2+0.0541*4, 1.6180*2+0.0582*4, 1.7776*2+0.0640*4, 1.8916*2+0.0681*4, 2.0226*2+0.0728*4, 2.2050*2+0.0794*4, 2.3874*2+0.0859*4, 2.5697*2+0.0925*4, 2.7635*2+0.0995*4],
    },

    // ========== 共鸣解放 ==========
    {
      name: "共鸣解放·临渊死寂",
      skillLevel: 10,
      damageType: "共鸣解放",
      skillCategory: "共鸣解放",
      multiplierList: [7.6500, 8.2773, 8.9046, 9.7829, 10.4102, 11.1316, 12.1352, 13.1389, 14.1426, 15.2090],
    }
  ],

  branchStats: {
    branch1: { stat: "湮灭伤害加成", value: 0.12 },
    branch2: { stat: "大攻击", value: 0.12 }
  },

  passiveSkills: [
    {
      name: "变格",
      description: "处于暗涌状态时，湮灭伤害加成提升20%。",
      enabled: true,
      effects: {
        statBonus: { "湮灭伤害加成": 0.20 }
      }
    }
  ],

  // 效应层数：无
  effectStacks: {}
};
