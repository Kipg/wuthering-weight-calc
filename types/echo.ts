// 声骸相关类型

import { EchoCost } from "./bases";

export type MainStatType =
  | "大攻击"
  | "大防御"
  | "大生命"
  | "暴击率"
  | "暴击伤害"
  | "治疗效果"
  | "共鸣效率"
  | "气动伤害加成"
  | "热熔伤害加成"
  | "衍射伤害加成"
  | "冷凝伤害加成"
  | "湮灭伤害加成"
  | "导电伤害加成";

export type SubStatType =
  | MainStatType
  | "小攻击"
  | "小防御"
  | "小生命"
  | "普攻伤害加成"
  | "重击伤害加成"
  | "共鸣技能伤害加成"
  | "共鸣解放伤害加成";

export interface EchoSubStat {
  type: SubStatType;
  value: number;
}

export interface Echo {
  name: string;
  imageKey?: string;
  cost: EchoCost;
  possibleSets: string[];
  selectedSet?: string;

  mainStatType: MainStatType;
  mainStatValue: number;

  secondaryStatType: SubStatType;
  secondaryStatValue: number;

  subStats: EchoSubStat[];
  echoLevel: 5 | 10 | 15 | 20 | 25;
}

export interface EchoSetBonus {
  name: string;
  piece2?: string;
  piece3?: string;
  piece5?: string;
  effects: {
    pieceCount: 2 | 3 | 5;
    stats: Record<string, number>;
  }[];
}

export interface EchoSetEnabledState {
  piece2?: boolean;
  piece3?: boolean;
  piece5?: boolean;
}
