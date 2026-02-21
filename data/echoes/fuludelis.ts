// 声骸数据 - 共鸣回响·芙露德莉斯

import { Echo } from "@/types";

export const FULUDELIS: Omit<Echo, "mainStatType" | "mainStatValue" | "secondaryStatValue" | "subStats" | "selectedSet" | "echoLevel" | "imageKey"> = {
  name: "共鸣回响·芙露德莉斯",
  cost: 4,
  possibleSets: ["愿戴荣光之旅", "流云逝尽之空"],
  secondaryStatType: "小攻击"
};
