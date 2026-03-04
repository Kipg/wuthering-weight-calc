// 副词条权重分析工具

import { SUB_STAT_VALUES, SubStatType, Echo, CharacterSkill, DamageCalculationInput } from "@/types";
import { calculateRotationDamage } from "./damageCalculator";

/**
 * 计算每个副词条的平均值
 */
export function getSubStatAverage(statType: SubStatType): number {
  const values = SUB_STAT_VALUES[statType];
  if (!values || values.length === 0) return 0;
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * 获取所有可用的副词条类型
 */
export function getAllSubStatTypes(): SubStatType[] {
  return Object.keys(SUB_STAT_VALUES) as SubStatType[];
}

/**
 * 副词条权重分析结果
 */
export interface SubStatWeightResult {
  statType: SubStatType;
  averageValue: number;
  damageIncrease: number; // 伤害提升百分比
  damageIncreasePercent: string; // 格式化的百分比字符串
}

/**
 * 分析副词条权重（基于整个输出流程的总伤害）
 * @param baseInput 基础伤害计算输入（不包含echoes、activeEchoSets、selectedSkill、critMode）
 * @param skillRotation 技能流程配置
 * @param includeCurrentEchoes 是否包含当前声骸数据
 * @param currentEchoes 当前装备的声骸列表
 * @returns 副词条权重分析结果（按伤害提升降序排列）
 */
export function analyzeSubStatWeights(
  baseInput: Omit<DamageCalculationInput, 'echoes' | 'activeEchoSets' | 'selectedSkill' | 'critMode'>,
  skillRotation: Array<{ skill: CharacterSkill; count: number; critMode: "期望" | "暴击" | "不暴击" }>,
  includeCurrentEchoes: boolean = false,
  currentEchoes: (Echo | null)[] = []
): SubStatWeightResult[] {
  const results: SubStatWeightResult[] = [];
  
  // 如果没有配置技能流程，返回空结果
  if (!skillRotation || skillRotation.length === 0) {
    return results;
  }
  
  // 计算基础伤害（根据模式决定是否包含当前声骸）
  const validEchoes = currentEchoes.filter(e => e !== null) as Echo[];
  const baseRotationInput = includeCurrentEchoes 
    ? { 
        ...baseInput, 
        echoes: validEchoes,
        activeEchoSets: calculateActiveSets(validEchoes)
      } 
    : { 
        ...baseInput, 
        echoes: [],
        activeEchoSets: {}
      };
  
  // 计算基础流程总伤害
  const baseRotationResults = calculateRotationDamage(baseRotationInput, skillRotation);
  const baseTotalDamage = baseRotationResults.reduce((sum, result) => sum + result.totalDamage, 0);
  
  // 遍历所有副词条类型
  const allSubStats = getAllSubStatTypes();
  
  for (const statType of allSubStats) {
    const averageValue = getSubStatAverage(statType);
    
    // 创建临时声骸，添加该副词条的平均值
    const tempEcho: Echo = {
      name: "临时声骸",
      cost: 4,
      possibleSets: [],
      mainStatType: "大攻击",
      mainStatValue: 0,
      secondaryStatType: "小攻击",
      secondaryStatValue: 0,
      echoLevel: 25,
      subStats: [
        {
          type: statType,
          value: averageValue
        }
      ]
    };
    
    // 计算加上该副词条后的伤害
    const tempEchoes = includeCurrentEchoes 
      ? [...validEchoes, tempEcho]
      : [tempEcho];
    
    const tempRotationInput = {
      ...baseRotationInput,
      echoes: tempEchoes,
      activeEchoSets: calculateActiveSets(tempEchoes)
    };
    
    // 计算新的流程总伤害
    const newRotationResults = calculateRotationDamage(tempRotationInput, skillRotation);
    const newTotalDamage = newRotationResults.reduce((sum, result) => sum + result.totalDamage, 0);
    
    // 计算伤害提升百分比
    const damageIncrease = baseTotalDamage > 0 
      ? ((newTotalDamage - baseTotalDamage) / baseTotalDamage) 
      : 0;
    
    results.push({
      statType,
      averageValue,
      damageIncrease,
      damageIncreasePercent: `${(damageIncrease * 100).toFixed(2)}%`
    });
  }
  
  // 按伤害提升降序排列
  results.sort((a, b) => b.damageIncrease - a.damageIncrease);
  
  return results;
}

/**
 * 计算激活的套装
 */
function calculateActiveSets(echoes: Echo[]): Record<string, number> {
  const setCount: Record<string, number> = {};
  
  echoes.forEach(echo => {
    if (echo.selectedSet) {
      setCount[echo.selectedSet] = (setCount[echo.selectedSet] || 0) + 1;
    }
  });
  
  return setCount;
}

/**
 * 格式化副词条值（根据类型决定是否添加%符号）
 */
export function formatSubStatValue(statType: SubStatType, value: number): string {
  // 小攻击、小防御、小生命是扁平值，不带%
  if (statType === "小攻击" || statType === "小防御" || statType === "小生命") {
    return value.toFixed(0);
  }
  
  // 其他都是百分比
  return `${value.toFixed(2)}%`;
}
