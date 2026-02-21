// 图片资源帮助模块 - 统一管理所有图片路径

/**
 * 获取角色图片路径
 * @param imageKey - 角色的图片键名（如 "katixiya"）
 * @returns 角色图片完整路径
 */
export function getCharacterImagePath(imageKey?: string): string {
  if (!imageKey) return "";
  return `/characters/T_Luckdraw_${imageKey}_UI.png`;
}

/**
 * 获取武器图片路径
 * @param imageKey - 武器的图片键名（如 "buqumingdingzhiguan"）
 * @returns 武器图片完整路径
 */
export function getWeaponImagePath(imageKey?: string): string {
  if (!imageKey) return "";
  return `/weapons/TL_${imageKey}_UI.png`;
}

/**
 * 获取声骸图片路径
 * @param imageKey - 声骸的图片键名（如 "fuludelis"）
 * @returns 声骸图片完整路径
 */
export function getEchoImagePath(imageKey?: string): string {
  if (!imageKey) return "";
  return `/echoes/TM_${imageKey}_UI.png`;
}

/**
 * 获取元素图标路径
 * @param elementType - 元素类型（如 "气动伤害"）
 * @returns 元素图标完整路径
 */
export function getElementIconPath(elementType: string): string {
  const iconMap: Record<string, string> = {
    "气动伤害": "/element_icon/aero.png",
    "热熔伤害": "/element_icon/fusion.png",
    "衍射伤害": "/element_icon/spectro.png",
    "冷凝伤害": "/element_icon/glacio.png",
    "湮灭伤害": "/element_icon/havoc.png",
    "导电伤害": "/element_icon/electro.png"
  };
  return iconMap[elementType] || "";
}
