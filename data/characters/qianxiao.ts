// 鸣潮 - 千咲角色数据

import { Character } from "@/types";

export const QIANXIAO: Character = {
  baseStats: {
    name: "千咲",
    rarity: 5,
    weaponType: "佩枪",
    elementType: "导电伤害",
    scalingTemplate: "攻击",
    
    level: 90,
    levelList: [20, 40, 50, 60, 70, 80, 90],
    
    // 待填入基础数值
    baseHPList: [0, 0, 0, 0, 0, 0, 0],
    baseATKList: [0, 0, 0, 0, 0, 0, 0],
    baseDEFList: [0, 0, 0, 0, 0, 0, 0],
    
    baseCritRate: 0.05,
    baseCritDMG: 1.50,
    baseHealBonus: 0,
    baseElementDMG: 0.30,
    baseEnergyRegen: 1.00,
    
    imageKey: "qianxiao"
  },
  
  skills: [
    // 待填入技能数据
  ],
  
  branchStats: {
    branch1: { stat: "暴击率", value: 0.08 },
    branch2: { stat: "大攻击", value: 0.12 }
  },

  passiveSkills: [
    {
      name: "异常效应层数上限提升",
      description: "队伍中所有角色的异常效应层数上限+3。",
      enabled: false,
      effectScope: "全队加成",
      effects: {
        // 这是一个特殊效果，会影响爱弥斯的聚爆效应伤害计算
        // 具体实现需要在计算器中处理
      }
    }
  ]
};
