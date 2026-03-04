// 鸣潮 - 爱弥斯特殊伤害计算

/**
 * 爱弥斯角色特殊伤害计算配置
 */
export interface AimisiDamageConfig {
  // 共鸣模态：震谐或聚爆
  resonanceMode: "震谐" | "聚爆";
  
  // 震谐模态相关
  zhenxieTrackStacks?: number; // 震谐轨迹层数 (0-30)
  xingchenZhenxieEnabled?: boolean; // 星屑共振·震谐状态 (将震谐伤害次数从5提升到10)
  hasZhenxieInterference?: boolean; // 目标是否有震谐干涉标记

  // 聚爆模态相关
  jubaoTrackStacks?: number; // 聚爆轨迹层数 (1-30)
  jubaoEffectStacks?: number; // 聚爆效应层数 (0-10或0-13，看队友千咲是否在队)
  jubaoUpperLimit?: number; // 聚爆效应层数上限 (10或13)
  xingchenJubaoEnabled?: boolean; // 星屑共振·聚爆状态 (对主目标额外200%倍率提升)
}

/**
 * 震谐伤害基础值（COST4）
 */
const ZHENXIE_BASE_VALUE = 10027;

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
 * 计算震谐伤害
 * 震谐伤害 = 偏斜基础值 * (震谐轨迹层数*4%+1) * 技能倍率提升 * 次数
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
 * 计算聚爆效应伤害
 * 效应伤害 = 效应基础值 * 聚爆倍率 * (聚爆轨迹层数*10%+1) * (星屑共振·聚爆 ? 2 : 1)
 * 
 * @param jubaoTrackStacks - 聚爆轨迹层数 (1-30)
 * @param jubaoUpperLimit - 聚爆效应层数上限 (10或13)
 * @param xingchenJubaoEnabled - 星屑共振·聚爆状态 (主目标伤害倍率额外提升200%)
 * @returns 聚爆效应伤害总值
 */
export function calculateJubaoEffectDamage(
  jubaoTrackStacks: number = 1,
  jubaoUpperLimit: number = 10,
  xingchenJubaoEnabled: boolean = false
): number {
  // 选择合适的聚爆倍率
  const jubaoRatio = jubaoUpperLimit >= 13 ? JUBAO_EFFECT_RATIO_13 : JUBAO_EFFECT_RATIO_10;
  
  // 聚爆轨迹倍率提升
  const trackMultiplier = jubaoTrackStacks * 0.10 + 1;
  
  // 星屑共振·聚爆的倍率提升
  const xingchenMultiplier = xingchenJubaoEnabled ? 2 : 1;
  
  return EFFECT_BASE_VALUE * jubaoRatio * trackMultiplier * xingchenMultiplier;
}

/**
 * 计算震谐响应·星爆伤害
 * 当目标附加了震谐干涉时，爱弥斯的技能使用震谐伤害公式来计算
 * 震谐伤害 = 偏斜基础值 * 技能倍率
 * 
 * @param skillMultiplier - 震谐响应·星爆技能的倍率
 * @returns 震谐响应伤害值
 */
export function calculateZhenxieResponseDamage(
  skillMultiplier: number
): number {
  return ZHENXIE_BASE_VALUE * skillMultiplier;
}

/**
 * 判断队友中是否有千咲并启用了效应层数提升技能
 */
export function hasQianxiaoEffectBoost(teammates?: Array<{ characterName: string; enabledPassives: boolean[] }>): boolean {
  if (!teammates) return false;
  
  return teammates.some(teammate => {
    return teammate.characterName === "千咲" && 
           teammate.enabledPassives && 
           teammate.enabledPassives[0]; // 假设千咲的第一个固有技能是层数提升
  });
}

/**
 * 获取聚爆效应层数上限
 */
export function getJubaoUpperLimit(teammates?: Array<{ characterName: string; enabledPassives: boolean[] }>): number {
  return hasQianxiaoEffectBoost(teammates) ? 13 : 10;
}
