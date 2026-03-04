// COST 主属性与固定副属性配置

import { EchoCost } from "./bases";
import { MainStatType, SubStatType } from "./echo";

export const COST_MAIN_STATS: Record<EchoCost, MainStatType[]> = {
  1: ["大攻击", "大防御", "大生命"],
  3: [
    "共鸣效率", "大攻击", "大防御", "大生命",
    "气动伤害加成", "热熔伤害加成", "衍射伤害加成",
    "冷凝伤害加成", "湮灭伤害加成", "导电伤害加成"
  ],
  4: [
    "暴击率", "暴击伤害", "治疗效果",
    "大攻击", "大防御", "大生命"
  ]
};

// COST 对应的固定副属性类型（影响小攻击/小生命的值）
export const COST_SECONDARY_STATS: Record<EchoCost, SubStatType[]> = {
  1: ["小生命"],
  3: ["小攻击"],
  4: ["小攻击"]
};

// COST 对应的固定副属性基础值（用于初始化声骸）
export const COST_SECONDARY_BASE_VALUES: Record<EchoCost, number> = {
  1: 2280,
  3: 100,
  4: 150
};
