// 鸣潮 - 数据索引

// 角色
import { KATIXIYA } from "./characters/katixiya";
import { SANHUA } from "./characters/sanhua";
import { AIMISI } from "./characters/aimisi";
import { QIANXIAO } from "./characters/qianxiao";
import { MONING } from "./characters/moning";
import { PIAOBOZHE_YANMIE } from "./characters/piaobozhe_yanmie";
import { WEILINAI } from "./characters/weilinai";
import { YOUNUO } from "./characters/younuo";

// 武器
import { BUQUMINGDINGZHIGUAN } from "./weapons/buqumingdingzhiguan";
import { YONGYUANDEQIMINGXING } from "./weapons/yongyuandeqimingxing";
import { YIXIANGKONGLING } from "./weapons/yixiangkongling";
import { QIANGUFULIU } from "./weapons/qiangufuliu";
import { QIHUANBIANZOU } from "./weapons/qihuanbianzou";
import { HAOJINGLINGUANG } from "./weapons/haojinglinguang";

// 声骸 / 图标
export { ECHO_SETS, ELEMENT_ICONS } from "./echoSets";
export { ECHO_DATA } from "./echoes/index";

// 角色列表
export const CHARACTERS = {
  "卡提希娅": KATIXIYA,
  "散华": SANHUA,
  "爱弥斯": AIMISI,
  "千咲": QIANXIAO,
  "莫宁": MONING,
  "漂泊者·湮灭": PIAOBOZHE_YANMIE,
  "维里奈": WEILINAI,
  "尤诺": YOUNUO,
};

// 武器列表
export const WEAPONS = {
  "不屈命定之冠": BUQUMINGDINGZHIGUAN,
  "永远的启明星": YONGYUANDEQIMINGXING,
  "异响空灵": YIXIANGKONGLING,
  "千古洑流": QIANGUFULIU,
  "奇幻变奏": QIHUANBIANZOU,
  "浩境粼光": HAOJINGLINGUANG,
};

// 单独导出（供按需引用）
export {
  KATIXIYA, SANHUA, AIMISI, QIANXIAO, MONING, PIAOBOZHE_YANMIE, WEILINAI,
  BUQUMINGDINGZHIGUAN, YONGYUANDEQIMINGXING, YIXIANGKONGLING,
  QIANGUFULIU, QIHUANBIANZOU, HAOJINGLINGUANG,YOUNUO,
};
