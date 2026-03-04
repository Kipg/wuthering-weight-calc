// 声骸数据 - 苦信者的作诵

import { Echo } from "@/types";

export const KUXINZHEDEZUOSONG: Omit<Echo, "mainStatType" | "mainStatValue" | "secondaryStatValue" | "subStats" | "selectedSet" | "echoLevel" | "imageKey"> = {
  name: "苦信者的作诵",
  cost: 1,
  possibleSets: ["奔狼燎原之焰", "愿戴荣光之旅", "流云逝尽之空"],
  secondaryStatType: "小生命"
};
