// 声骸数据索引

export { XINJILEMU } from "./xinjilemu";
export { FULUDELIS } from "./fuludelis";
export { KAIERPI } from "./kaierpi";
export { KUXINZHEDEZUOSONG } from "./kuxinzhedezuosong";
export { XIAOYILONG_RERONG } from "./xiaoyilong_rerong";
export { XIAOYILONG_YANSHE } from "./xiaoyilong_yanshe";

import { XINJILEMU } from "./xinjilemu";
import { FULUDELIS } from "./fuludelis";
import { KAIERPI } from "./kaierpi";
import { KUXINZHEDEZUOSONG } from "./kuxinzhedezuosong";
import { XIAOYILONG_RERONG } from "./xiaoyilong_rerong";
import { XIAOYILONG_YANSHE } from "./xiaoyilong_yanshe";

export const ECHO_DATA = {
  "xinjilemu": { ...XINJILEMU, imageKey: "xinjilemu" },
  "fuludelis": { ...FULUDELIS, imageKey: "fuludelis" },
  "kaierpi": { ...KAIERPI, imageKey: "kaierpi" },
  "kuxinzhedezuosong": { ...KUXINZHEDEZUOSONG, imageKey: "kuxinzhedezuosong" },
  "xiaoyilong_rerong": { ...XIAOYILONG_RERONG, imageKey: "xiaoyilong_rerong" },
  "xiaoyilong_yanshe": { ...XIAOYILONG_YANSHE, imageKey: "xiaoyilong_yanshe" }
};
