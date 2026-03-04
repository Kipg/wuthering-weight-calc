// 声骸数据 - 梦魇·凯尔匹

import { Echo } from "@/types";

export const KAIERPI: Omit<Echo, "mainStatType" | "mainStatValue" | "secondaryStatValue" | "subStats" | "selectedSet" | "echoLevel" | "imageKey"> = {
  name: "梦魇·凯尔匹",
  cost: 4,
  possibleSets: ["愿戴荣光之旅", "流云逝尽之空"],
  secondaryStatType: "小攻击"
};
