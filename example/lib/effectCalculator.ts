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
 * 公式：效应基础值 × 聚爆倍率 × (聚爆轨迹层数×10%+1) × 星屑共振倍率
 *
 * @param jubaoTrackStacks - 聚爆轨迹层数 (1-30)
 * @param jubaoUpperLimit - 聚爆效应层数上限 (10 或 13，带千咲)
 * @param xingchenJubaoEnabled - 星屑共振·聚爆状态 (主目标伤害倍率额外提升200%)
 * @returns 聚爆效应伤害总值
 */
export function calculateJubaoEffectDamage(
  jubaoTrackStacks: number = 1,
  jubaoUpperLimit: number = 10,
  xingchenJubaoEnabled: boolean = false
): number {
  const jubaoRatio = jubaoUpperLimit >= 13 ? JUBAO_EFFECT_RATIO_13 : JUBAO_EFFECT_RATIO_10;
  const trackMultiplier = jubaoTrackStacks * 0.10 + 1;
  const xingchenMultiplier = xingchenJubaoEnabled ? 2 : 1;
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

export { EFFECT_BASE_VALUE, JUBAO_EFFECT_RATIO_10, JUBAO_EFFECT_RATIO_13 };
