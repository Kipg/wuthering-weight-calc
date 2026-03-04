// 声骸数据 - 小翼龙-衍射

import { Echo } from "@/types";

export const XIAOYILONG_YANSHE: Omit<Echo, "mainStatType" | "mainStatValue" | "secondaryStatValue" | "subStats" | "selectedSet" | "echoLevel" | "imageKey"> = {
  name: "小翼龙-衍射",
  cost: 1,
  possibleSets: ["奔狼燎原之焰", "愿戴荣光之旅"],
  secondaryStatType: "小生命"
};
