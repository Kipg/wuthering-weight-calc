// 鸣潮 - 爱弥斯·聚爆效应伤害计算器

/**
 * 效应伤害基础值（90级）
 */
const EFFECT_BASE_VALUE = 3674;

/**
 * 聚爆效应倍率（层数上限10）
 */
const JUBAO_EFFECT_RATIO_10 = 6.9863;

/**
 * 聚爆效应倍率（层数上限13，带队友千咲）
 */
const JUBAO_EFFECT_RATIO_13 = 13.9726;

/**
 * 计算聚爆效应伤害
 * 公式：效应基础值 × 聚爆倍率 × (聚爆轨迹层数×15%+1) × 星屑共振倍率
 *
 * @param jubaoTrackStacks - 聚爆轨迹层数 (1-30)
 * @param jubaoUpperLimit - 聚爆效应层数上限 (10 或13，带千咊)
 * @param xingchenJubaoEnabled - 星屑共振·聚爆状态 (主目标伤害倍率额外提升200%，2链开启时提升至400%)
 * @param chain2Enabled - 是否开剱2链（星屑共振聚爆倍率由200%提升至400%）
 * @returns 聚爆效应伤害总值
 */
export function calculateJubaoEffectDamage(
  jubaoTrackStacks: number = 1,
  jubaoUpperLimit: number = 10,
  xingchenJubaoEnabled: boolean = false,
  chain2Enabled: boolean = false
): number {
  const jubaoRatio = jubaoUpperLimit >= 13 ? JUBAO_EFFECT_RATIO_13 : JUBAO_EFFECT_RATIO_10;
  const trackMultiplier = jubaoTrackStacks * 0.15 + 1;
  // 2链：星屑共振聚爆倻目标伤害倍率提升至400%；默认200%
  const xingchenMultiplier = xingchenJubaoEnabled ? (chain2Enabled ? 4 : 2) : 1;
  return EFFECT_BASE_VALUE * jubaoRatio * trackMultiplier * xingchenMultiplier;
}

/**
 * 根据队友阵容获取聚爆效应层数上限
 * 普通队：上限10层；带千咲队：上限13层
 */
export function getJubaoUpperLimit(teammates?: Array<{ characterName: string; [key: string]: any }>): number {
  if (!teammates) return 10;
  const hasSenzaki = teammates.some(tm => tm.characterName === "千咲");
  return hasSenzaki ? 13 : 10;
}

/**
 * 计算风蚀效应层数对应的倍率提升（倍率提升乘区加成）
 * 已知数据点：3层=225%, 6层=562.5%, 9层=900%, 12层=1237.5%
 * 各数据点之间线性插值；超过12层上限为1237.5%
 *
 * @param stacks - 风蚀效应层数
 * @returns 倍率提升小数（如 2.25 表示 +225%）
 */
export function getWindErosionMultiplierBoost(stacks: number): number {
  if (stacks <= 0) return 0;
  const clampedStacks = Math.min(stacks, 12);
  const dataPoints = [
    { s: 0, v: 0 },
    { s: 3, v: 2.25 },
    { s: 6, v: 5.625 },
    { s: 9, v: 9.00 },
    { s: 12, v: 12.375 }
  ];
  for (let i = 1; i < dataPoints.length; i++) {
    if (clampedStacks <= dataPoints[i].s) {
      const prev = dataPoints[i - 1];
      const curr = dataPoints[i];
      const t = (clampedStacks - prev.s) / (curr.s - prev.s);
      return prev.v + t * (curr.v - prev.v);
    }
  }
  return dataPoints[dataPoints.length - 1].v;
}

export { EFFECT_BASE_VALUE, JUBAO_EFFECT_RATIO_10, JUBAO_EFFECT_RATIO_13 };
