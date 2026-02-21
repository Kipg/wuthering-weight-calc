// 声骸数据 - 小翼龙-热熔

import { Echo } from "@/types";

export const XIAOYILONG_RERONG: Omit<Echo, "mainStatType" | "mainStatValue" | "secondaryStatValue" | "subStats" | "selectedSet" | "echoLevel" | "imageKey"> = {
  name: "小翼龙-热熔",
  cost: 1,
  possibleSets: ["奔狼燎原之焰", "愿戴荣光之旅"],
  secondaryStatType: "小生命"
};
