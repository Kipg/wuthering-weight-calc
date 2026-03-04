// 声骸数据 - 辛吉勒姆

import { Echo } from "@/types";

export const XINJILEMU: Omit<Echo, "mainStatType" | "mainStatValue" | "secondaryStatValue" | "subStats" | "selectedSet" | "echoLevel" | "imageKey"> = {
  name: "辛吉勒姆",
  cost: 4,
  possibleSets: ["长路启航之星"],
  secondaryStatType: "小攻击"
};
