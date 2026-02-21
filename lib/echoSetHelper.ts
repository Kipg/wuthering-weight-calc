// 声骸套装帮助模块 - 提供套装相关的帮助函数

import { ECHO_SETS } from "@/data/echoSets";

/**
 * 获取所有套装名称列表
 * @returns 套装名称数组
 */
export function getAllEchoSetNames(): string[] {
  return Object.keys(ECHO_SETS);
}

/**
 * 获取套装详细信息
 * @param setName - 套装名称
 * @returns 套装详细信息或undefined
 */
export function getEchoSetInfo(setName: string) {
  return ECHO_SETS[setName];
}

/**
 * 检查套装是否存在
 * @param setName - 套装名称
 * @returns 是否存在
 */
export function isValidEchoSet(setName: string): boolean {
  return setName in ECHO_SETS;
}
