// 鸣潮 - 爱弥斯·震谐伤害计算器

/**
 * 震谐伤害基础值（COST4 声骸偏斜基础值）
 */
const ZHENXIE_BASE_VALUE = 10027;

/**
 * 计算震谐伤害
 * 公式：偏斜基础值 × (震谐轨迹层数×4%+1) × 技能倍率 × 次数
 *
 * @param skillMultiplier - 技能"光翼共奏追加伤害（每次）"对应技能等级的倍率
 * @param zhenxieTrackStacks - 震谐轨迹层数 (0-30)
 * @param xingchenZhenxieEnabled - 星屑共振·震谐状态 (将次数从5提升到10)
 * @returns 震谐伤害总值
 */
export function calculateZhenxieDamage(
  skillMultiplier: number,
  zhenxieTrackStacks: number = 0,
  xingchenZhenxieEnabled: boolean = false
): number {
  const trackMultiplier = zhenxieTrackStacks * 0.04 + 1;
  const hitCount = xingchenZhenxieEnabled ? 10 : 5;
  return ZHENXIE_BASE_VALUE * trackMultiplier * skillMultiplier * hitCount;
}

/**
 * 计算震谐响应·星爆伤害
 * 当目标附加了震谐干涉时，使用简化公式：
 * 震谐伤害 = 偏斜基础值 × 技能倍率
 *
 * @param skillMultiplier - 震谐响应·星爆技能的倍率
 * @returns 震谐响应伤害值
 */
export function calculateZhenxieResponseDamage(skillMultiplier: number): number {
  return ZHENXIE_BASE_VALUE * skillMultiplier;
}

export { ZHENXIE_BASE_VALUE };
