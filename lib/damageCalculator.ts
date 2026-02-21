// 鸣潮 - 伤害计算公式系统

import {
  Character,
  Weapon,
  Echo,
  EchoSetBonus,
  DamageCalculationInput,
  DamageCalculationResult,
  CombatStats,
  CharacterSkill,
  ElementType
} from "@/types";
import { ECHO_SETS } from "@/data/echoSets";
import {
  calculateZhenxieDamage,
  calculateJubaoEffectDamage,
  calculateZhenxieResponseDamage,
  getJubaoUpperLimit
} from "./aimisiDamageHelper";

/**
 * 获取等级对应的属性值
 */
function getStatByLevel(level: number, levelList: number[], statList: number[]): number {
  const index = levelList.indexOf(level);
  return index >= 0 ? statList[index] : statList[statList.length - 1];
}

/**
 * 计算声骸套装激活情况
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
 * 计算声骸套装加成
 */
function calculateSetBonuses(
  activeSets: Record<string, number>,
  echoSetEnabled?: Record<string, { piece2?: boolean; piece3?: boolean; piece5?: boolean }>
): Record<string, number> {
  const bonuses: Record<string, number> = {};
  
  Object.entries(activeSets).forEach(([setName, count]) => {
    const setData = ECHO_SETS[setName];
    if (!setData) return;
    
    const enabledState = echoSetEnabled?.[setName] || {};
    
    setData.effects.forEach(effect => {
      if (count >= effect.pieceCount) {
        // 检查该件套效果是否启用
        let isEnabled = true;
        if (effect.pieceCount === 2) {
          isEnabled = enabledState.piece2 !== false; // 默认启用
        } else if (effect.pieceCount === 3) {
          isEnabled = enabledState.piece3 !== false;
        } else if (effect.pieceCount === 5) {
          isEnabled = enabledState.piece5 !== false;
        }
        
        if (isEnabled) {
          Object.entries(effect.stats).forEach(([stat, value]) => {
            bonuses[stat] = (bonuses[stat] || 0) + value;
          });
        }
      }
    });
  });
  
  return bonuses;
}

/**
 * 计算声骸总属性加成
 */
function calculateEchoStats(echoes: Echo[]): Record<string, number> {
  const stats: Record<string, number> = {};
  
  echoes.forEach(echo => {
    // 主属性
    const mainStat = echo.mainStatType;
    stats[mainStat] = (stats[mainStat] || 0) + echo.mainStatValue / 100;
    
    // 副属性
    const secondaryStat = echo.secondaryStatType;
    if (secondaryStat.startsWith("小")) {
      stats[secondaryStat] = (stats[secondaryStat] || 0) + echo.secondaryStatValue;
    } else {
      stats[secondaryStat] = (stats[secondaryStat] || 0) + echo.secondaryStatValue / 100;
    }
    
    // 副词条
    echo.subStats.forEach(subStat => {
      if (subStat.type.startsWith("小")) {
        stats[subStat.type] = (stats[subStat.type] || 0) + subStat.value;
      } else {
        stats[subStat.type] = (stats[subStat.type] || 0) + subStat.value / 100;
      }
    });
  });
  
  return stats;
}

/**
 * 计算总面板属性
 */
export function calculateCombatStats(input: DamageCalculationInput): CombatStats {
  const { character, weapon, echoes, activeEchoSets, echoSetEnabled } = input;
  const { baseStats, branchStats, passiveSkills } = character;
  const setBonuses = calculateSetBonuses(activeEchoSets, echoSetEnabled);
  const echoStats = calculateEchoStats(echoes);
  
  // 辅助函数：检查武器效果是否满足效应条件
  const checkWeaponEffectCondition = (effect: any): boolean => {
    if (!effect.effectCondition) return true; // 无条件限制
    const effectStacks = input.effectStacks || {};
    const requiredStacks = effectStacks[effect.effectCondition.effectType] || 0;
    return requiredStacks >= effect.effectCondition.minStacks;
  };
  
  // 获取角色等级对应的基础属性
  const baseHP = getStatByLevel(baseStats.level, baseStats.levelList, baseStats.baseHPList);
  const baseATK = getStatByLevel(baseStats.level, baseStats.levelList, baseStats.baseATKList);
  const baseDEF = getStatByLevel(baseStats.level, baseStats.levelList, baseStats.baseDEFList);
  
  // 获取武器等级对应的属性
  const weaponATK = getStatByLevel(weapon.baseStats.weaponLevel, weapon.baseStats.levelList, weapon.baseStats.baseATKList);
  const weaponSecondaryStat = getStatByLevel(weapon.baseStats.weaponLevel, weapon.baseStats.levelList, weapon.baseStats.secondaryStatList);
  
  // 武器技能加成
  let weaponHPBonus = 0;
  let weaponATKBonus = 0;
  if (weapon.skill.enabled) {
    weapon.skill.effects.forEach(effect => {
      if (effect.type === "属性加成" && checkWeaponEffectCondition(effect)) {
        const value = effect.valuesByResonance[weapon.baseStats.resonanceLevel - 1];
        if (effect.name.includes("生命")) {
          weaponHPBonus += value;
        } else if (effect.name.includes("攻击")) {
          weaponATKBonus += value;
        }
      }
    });
  }
  
  // 计算百分比加成
  const totalHPPercent = 
    (branchStats.branch2.stat === "大生命" ? branchStats.branch2.value : 0) +
    (echoStats["大生命"] || 0) +
    (setBonuses["大生命"] || 0) +
    weaponHPBonus +
    (weapon.baseStats.secondaryStatType === "大生命" ? weaponSecondaryStat : 0);
  
  const totalATKPercent = 
    (branchStats.branch1.stat === "大攻击" ? branchStats.branch1.value : 0) +
    (branchStats.branch2.stat === "大攻击" ? branchStats.branch2.value : 0) +
    (echoStats["大攻击"] || 0) +
    (setBonuses["大攻击"] || 0) +
    weaponATKBonus +
    (weapon.baseStats.secondaryStatType === "大攻击" ? weaponSecondaryStat : 0);
  
  const totalDEFPercent = 
    (branchStats.branch1.stat === "大防御" ? branchStats.branch1.value : 0) +
    (branchStats.branch2.stat === "大防御" ? branchStats.branch2.value : 0) +
    (echoStats["大防御"] || 0) +
    (setBonuses["大防御"] || 0);
  
  // 计算扁平值
  const flatHP = echoStats["小生命"] || 0;
  const flatATK = (echoStats["小攻击"] || 0);
  const flatDEF = echoStats["小防御"] || 0;
  
  // 计算最终属性
  const totalATK = (baseATK + weaponATK) * (1 + totalATKPercent) + flatATK;
  const totalHP = baseHP * (1 + totalHPPercent) + flatHP;
  const totalDEF = baseDEF * (1 + totalDEFPercent) + flatDEF;
  
  // 计算暴击属性
  const critRate = 
    baseStats.baseCritRate +
    (branchStats.branch1.stat === "暴击率" ? branchStats.branch1.value : 0) +
    (branchStats.branch2.stat === "暴击率" ? branchStats.branch2.value : 0) +
    (echoStats["暴击率"] || 0) +
    (setBonuses["暴击率"] || 0) +
    (weapon.baseStats.secondaryStatType === "暴击率" ? weaponSecondaryStat : 0);
  
  // 角色固有技能的面板加成（如暴击伤害）
  let passiveSkillCritDMGBonus = 0;
  passiveSkills.forEach(passive => {
    if (passive.enabled && passive.effectScope === "面板加成" && passive.effects.statBonus) {
      // 处理 conditional 条件加成
      if (passive.effects.conditional && passive.conditionalUI) {
        const effectStacks = input.effectStacks || {};
        const stateKey = passive.conditionalUI.stateKey; // 使用 conditionalUI.stateKey 作为 key
        const stateValue = effectStacks[stateKey] || 0;
        const conditionalValue = passive.effects.conditional.values[stateValue] || 0;
        
        // 遍历 statBonus 中的所有属性
        Object.entries(passive.effects.statBonus).forEach(([stat, _baseValue]) => {
          if (stat === "暴击伤害" && conditionalValue > 0) {
            passiveSkillCritDMGBonus += conditionalValue;
          }
        });
      }
    }
  });
  
  const critDMG = 
    baseStats.baseCritDMG +
    (echoStats["暴击伤害"] || 0) +
    (setBonuses["暴击伤害"] || 0) +
    passiveSkillCritDMGBonus +
    (weapon.baseStats.secondaryStatType === "暴击伤害" ? weaponSecondaryStat : 0);
  
  // 其他属性
  const healBonus = 
    baseStats.baseHealBonus +
    (echoStats["治疗效果"] || 0) +
    (setBonuses["治疗效果"] || 0);
  
  const energyRegen = 
    baseStats.baseEnergyRegen +
    (echoStats["共鸣效率"] || 0) +
    (setBonuses["共鸣效率"] || 0);
  
  // 元素伤害加成
  const elementKey = `${baseStats.elementType}加成`;
  const elementDMG = 
    baseStats.baseElementDMG +
    (echoStats[elementKey] || 0) +
    (echoStats[baseStats.elementType] || 0) +
    (setBonuses[elementKey] || 0) +
    (setBonuses[baseStats.elementType] || 0);
  
  // 伤害类型加成
  const normalATKBonus = (echoStats["普攻伤害加成"] || 0) + (setBonuses["普攻伤害加成"] || 0);
  const heavyATKBonus = (echoStats["重击伤害加成"] || 0) + (setBonuses["重击伤害加成"] || 0);
  const skillBonus = (echoStats["共鸣技能伤害加成"] || 0) + (setBonuses["共鸣技能伤害加成"] || 0);
  const liberationBonus = (echoStats["共鸣解放伤害加成"] || 0) + (setBonuses["共鸣解放伤害加成"] || 0);
  
  return {
    totalATK,
    totalHP,
    totalDEF,
    critRate,
    critDMG,
    healBonus,
    energyRegen,
    elementDMG,
    normalATKBonus,
    heavyATKBonus,
    skillBonus,
    liberationBonus
  };
}

/**
 * 计算伤害 - 完整的乘区计算
 */
export function calculateDamage(input: DamageCalculationInput): DamageCalculationResult {
  const { character, weapon, echoes, activeEchoSets, echoSetEnabled, targetLevel, enemyResistance, selectedSkill, critMode } = input;
  
  // ========== 特殊伤害类型：震谐伤害和效应伤害 ==========
  // 这些伤害类型不走正常的乘区计算，使用专门的公式
  if (selectedSkill.damageType === "震谐伤害") {
    const aimisiConfig = input.aimisiConfig;
    let finalDamage = 0;
    
    // 如果是震谐响应·星爆伤害（目标有震谐干涉标记）
    if (selectedSkill.name === "震谐响应·星爆伤害" && aimisiConfig?.hasZhenxieInterference) {
      const skillMultiplier = selectedSkill.multiplierList[selectedSkill.skillLevel - 1];
      finalDamage = calculateZhenxieResponseDamage(skillMultiplier);
    }
    // 如果是光翼共奏追加伤害
    else if (selectedSkill.name === "光翼共奏追加伤害（每次）" && aimisiConfig?.resonanceMode === "震谐") {
      const skillMultiplier = selectedSkill.multiplierList[selectedSkill.skillLevel - 1];
      finalDamage = calculateZhenxieDamage(
        skillMultiplier,
        aimisiConfig.zhenxieTrackStacks || 0,
        aimisiConfig.xingchenZhenxieEnabled || false
      );
    }
    
    const combatStats = calculateCombatStats(input);
    
    return {
      baseDamage: finalDamage,
      skillMultiplier: 1,
      multiplierBoost: 1,
      critMultiplier: 1,
      damageDeepen: 1,
      damageBonus: 1,
      defenseMultiplier: 1,
      resistanceMultiplier: 1,
      hitsMultiplier: 1,
      finalDamage,
      combatStats,
      details: {
        multiplierBoostSources: ["震谐伤害（特殊计算）"],
        damageDeepenSources: [],
        damageBonusSources: [],
        defenseIgnoreSources: [],
        resistanceReductionSources: []
      }
    };
  }
  
  if (selectedSkill.damageType === "效应伤害") {
    const aimisiConfig = input.aimisiConfig;
    let finalDamage = 0;
    
    // 聚爆效应伤害
    if (aimisiConfig?.resonanceMode === "聚爆") {
      const jubaoUpperLimit = getJubaoUpperLimit(input.teammates);
      finalDamage = calculateJubaoEffectDamage(
        aimisiConfig.jubaoTrackStacks || 1,
        jubaoUpperLimit,
        aimisiConfig.xingchenJubaoEnabled || false
      );
    }
    
    const combatStats = calculateCombatStats(input);
    
    return {
      baseDamage: finalDamage,
      skillMultiplier: 1,
      multiplierBoost: 1,
      critMultiplier: 1,
      damageDeepen: 1,
      damageBonus: 1,
      defenseMultiplier: 1,
      resistanceMultiplier: 1,
      hitsMultiplier: 1,
      finalDamage,
      combatStats,
      details: {
        multiplierBoostSources: ["效应伤害（特殊计算）"],
        damageDeepenSources: [],
        damageBonusSources: [],
        defenseIgnoreSources: [],
        resistanceReductionSources: []
      }
    };
  }
  
  // ========== 正常技能伤害计算 ==========
  const combatStats = calculateCombatStats(input);
  
  // 辅助函数：检查武器效果是否满足效应条件
  const checkWeaponEffectCondition = (effect: any): boolean => {
    if (!effect.effectCondition) return true; // 无条件限制
    const effectStacks = input.effectStacks || {};
    const requiredStacks = effectStacks[effect.effectCondition.effectType] || 0;
    return requiredStacks >= effect.effectCondition.minStacks;
  };
  
  // 辅助函数：检查武器效果是否适用于当前技能的伤害类型
  const checkWeaponEffectDamageType = (effect: any, skillDamageType: string): boolean => {
    if (!effect.affectedDamageTypes || effect.affectedDamageTypes.length === 0) return true; // 无限制
    return effect.affectedDamageTypes.includes(skillDamageType);
  };
  
  // ========== 1. 基础乘区 ==========
  let baseDamage = 0;
  switch (character.baseStats.scalingTemplate) {
    case "攻击":
      baseDamage = combatStats.totalATK;
      break;
    case "生命":
      baseDamage = combatStats.totalHP;
      break;
    case "防御":
      baseDamage = combatStats.totalDEF;
      break;
    case "共鸣效率":
      baseDamage = combatStats.energyRegen * 100; // 转换为数值
      break;
  }
  
  // ========== 2. 技能倍率乘区 ==========
  const skillMultiplier = selectedSkill.multiplierList[selectedSkill.skillLevel - 1];
  
  // ========== 3. 倍率提升乘区 ==========
  let multiplierBoost = 1.0;
  const multiplierBoostSources: string[] = [];
  
  // 角色固有技能的倍率提升
  character.passiveSkills.forEach(passive => {
    if (passive.enabled && passive.effects.zoneType === "倍率提升") {
      if (passive.effects.conditional) {
        // 带条件的倍率提升（如风蚀效应层数）
        const effectStacks = input.effectStacks || {};
        const effectType = passive.effects.conditional.condition;
        const stateValue = effectStacks[effectType] || 0;
        const conditionalValue = passive.effects.conditional.values[stateValue] || 0;
        if (conditionalValue > 0) {
          multiplierBoost *= (1 + conditionalValue);
          multiplierBoostSources.push(`${passive.name}: +${(conditionalValue * 100).toFixed(1)}%`);
        }
      } else if (passive.effects.value) {
        multiplierBoost *= (1 + passive.effects.value);
        multiplierBoostSources.push(`${passive.name}: +${(passive.effects.value * 100).toFixed(1)}%`);
      }
    }
  });
  
  // 队友延奏技能的倍率提升
  if (input.teammates) {
    input.teammates.forEach(teammate => {
      if (teammate.enabledOutro && teammate.character.outroSkill) {
        const outro = teammate.character.outroSkill;
        if (outro.effects.zoneType === "倍率提升") {
          // 检查是否影响当前技能类别
          if (!outro.affectedSkillTypes || outro.affectedSkillTypes.includes(selectedSkill.skillCategory)) {
            if (outro.effects.value) {
              multiplierBoost *= (1 + outro.effects.value);
              multiplierBoostSources.push(`${teammate.characterName}-${outro.name}: +${(outro.effects.value * 100).toFixed(1)}%`);
            }
          }
        }
      }
      
      // 队友固有技能的全队加成（倍率提升）
      teammate.character.passiveSkills.forEach((passive, index) => {
        if (teammate.enabledPassives[index] && passive.enabled && passive.effectScope === "全队加成" && passive.effects.zoneType === "倍率提升") {
          if (passive.effects.value) {
            multiplierBoost *= (1 + passive.effects.value);
            multiplierBoostSources.push(`${teammate.characterName}-${passive.name}: +${(passive.effects.value * 100).toFixed(1)}%`);
          }
        }
      });
    });
  }
  
  // 武器技能的倍率提升
  if (weapon.skill.enabled) {
    weapon.skill.effects.forEach(effect => {
      if (effect.effect_Type === "倍率提升" && 
          checkWeaponEffectCondition(effect) && 
          checkWeaponEffectDamageType(effect, selectedSkill.damageType)) {
        const value = effect.valuesByResonance[weapon.baseStats.resonanceLevel - 1];
        multiplierBoost *= (1 + value);
        multiplierBoostSources.push(`${weapon.skill.name}-${effect.name}: +${(value * 100).toFixed(1)}%`);
      }
    });
  }
  
  // ========== 4. 暴击倍率乘区 ==========
  let critMultiplier = 1.0;
  switch (critMode) {
    case "期望":
      critMultiplier = Math.min(combatStats.critRate, 1) * combatStats.critDMG + (1 - Math.min(combatStats.critRate, 1));
      break;
    case "暴击":
      critMultiplier = combatStats.critDMG;
      break;
    case "不暴击":
      critMultiplier = 1.0;
      break;
  }
  
  // ========== 5. 伤害加深乘区 ==========
  let damageDeepen = 1.0;
  const damageDeepenSources: string[] = [];
  
  // 角色固有技能的伤害加深
  character.passiveSkills.forEach(passive => {
    if (passive.enabled && passive.effects.zoneType === "伤害加深") {
      if (passive.effects.value) {
        damageDeepen *= (1 + passive.effects.value);
        damageDeepenSources.push(`${passive.name}: +${(passive.effects.value * 100).toFixed(1)}%`);
      }
    }
  });
  
  // 队友延奏技能的伤害加深
  if (input.teammates) {
    input.teammates.forEach(teammate => {
      if (teammate.enabledOutro && teammate.character.outroSkill) {
        const outro = teammate.character.outroSkill;
        if (outro.effects.zoneType === "伤害加深") {
          // 检查是否影响当前技能类别
          if (!outro.affectedSkillTypes || outro.affectedSkillTypes.includes(selectedSkill.skillCategory)) {
            if (outro.effects.value) {
              damageDeepen *= (1 + outro.effects.value);
              damageDeepenSources.push(`${teammate.characterName}-${outro.name}: +${(outro.effects.value * 100).toFixed(1)}%`);
            }
          }
        }
      }
      
      // 队友固有技能的全队加成（伤害加深）
      teammate.character.passiveSkills.forEach((passive, index) => {
        if (teammate.enabledPassives[index] && passive.enabled && passive.effectScope === "全队加成" && passive.effects.zoneType === "伤害加深") {
          if (passive.effects.value) {
            damageDeepen *= (1 + passive.effects.value);
            damageDeepenSources.push(`${teammate.characterName}-${passive.name}: +${(passive.effects.value * 100).toFixed(1)}%`);
          }
        }
      });
    });
  }
  
  // 武器技能的伤害加深
  if (weapon.skill.enabled) {
    weapon.skill.effects.forEach(effect => {
      if (effect.effect_Type === "伤害加深" && 
          checkWeaponEffectCondition(effect) && 
          checkWeaponEffectDamageType(effect, selectedSkill.damageType)) {
        const value = effect.valuesByResonance[weapon.baseStats.resonanceLevel - 1];
        damageDeepen *= (1 + value);
        damageDeepenSources.push(`${weapon.skill.name}-${effect.name}: +${(value * 100).toFixed(1)}%`);
      }
    });
  }
  
  // ========== 6. 伤害加成乘区 ==========
  let damageBonus = 1.0;
  const damageBonusSources: string[] = [];
  
  // 元素伤害加成
  if (combatStats.elementDMG > 0) {
    damageBonus += combatStats.elementDMG;
    damageBonusSources.push(`元素伤害: +${(combatStats.elementDMG * 100).toFixed(1)}%`);
  }
  
  // 伤害类型加成
  switch (selectedSkill.damageType) {
    case "普攻":
      if (combatStats.normalATKBonus > 0) {
        damageBonus += combatStats.normalATKBonus;
        damageBonusSources.push(`普攻加成: +${(combatStats.normalATKBonus * 100).toFixed(1)}%`);
      }
      break;
    case "重击":
      if (combatStats.heavyATKBonus > 0) {
        damageBonus += combatStats.heavyATKBonus;
        damageBonusSources.push(`重击加成: +${(combatStats.heavyATKBonus * 100).toFixed(1)}%`);
      }
      break;
    case "共鸣技能":
      if (combatStats.skillBonus > 0) {
        damageBonus += combatStats.skillBonus;
        damageBonusSources.push(`共鸣技能加成: +${(combatStats.skillBonus * 100).toFixed(1)}%`);
      }
      break;
    case "共鸣解放":
      if (combatStats.liberationBonus > 0) {
        damageBonus += combatStats.liberationBonus;
        damageBonusSources.push(`共鸣解放加成: +${(combatStats.liberationBonus * 100).toFixed(1)}%`);
      }
      break;
  }
  
  // 固有技能的伤害加成
  character.passiveSkills.forEach(passive => {
    if (passive.enabled && passive.effects.zoneType === "伤害加成") {
      if (passive.effects.value) {
        damageBonus += passive.effects.value;
        damageBonusSources.push(`${passive.name}: +${(passive.effects.value * 100).toFixed(1)}%`);
      }
    }
  });
  
  // ========== 7. 防御乘区 ==========
  let defenseIgnore = 0;
  const defenseIgnoreSources: string[] = [];
  
  // 角色固有技能的无视防御
  character.passiveSkills.forEach(passive => {
    if (passive.enabled && passive.effects.zoneType === "无视防御") {
      if (passive.effects.value) {
        defenseIgnore += passive.effects.value;
        defenseIgnoreSources.push(`${passive.name}: ${(passive.effects.value * 100).toFixed(1)}%`);
      }
    }
  });
  
  // 武器技能的无视防御
  if (weapon.skill.enabled) {
    weapon.skill.effects.forEach(effect => {
      if (effect.effect_Type === "无视防御" && 
          checkWeaponEffectCondition(effect) && 
          checkWeaponEffectDamageType(effect, selectedSkill.damageType)) {
        const value = effect.valuesByResonance[weapon.baseStats.resonanceLevel - 1];
        defenseIgnore += value;
        defenseIgnoreSources.push(`${weapon.skill.name}-${effect.name}: ${(value * 100).toFixed(1)}%`);
      }
    });
  }
  
  const targetDefense = 792 + 8 * targetLevel;
  const effectiveDefense = targetDefense * (1 - defenseIgnore);
  const defenseMultiplier = 1 - effectiveDefense / (effectiveDefense + 800 + 8 * character.baseStats.level);
  
  // ========== 8. 抗性乘区 ==========
  let resistanceReduction = 0;
  const resistanceReductionSources: string[] = [];
  
  // 角色固有技能的抗性削减
  character.passiveSkills.forEach(passive => {
    if (passive.enabled && passive.effects.zoneType === "无视抗性") {
      if (passive.effects.value) {
        resistanceReduction += passive.effects.value;
        resistanceReductionSources.push(`${passive.name}: ${(passive.effects.value * 100).toFixed(1)}%`);
      }
    }
  });
  
  // 武器技能的无视抗性
  if (weapon.skill.enabled) {
    weapon.skill.effects.forEach(effect => {
      if (effect.effect_Type === "无视抗性" && checkWeaponEffectCondition(effect) && checkWeaponEffectDamageType(effect, selectedSkill.damageType)) {
        const value = effect.valuesByResonance[weapon.baseStats.resonanceLevel - 1];
        resistanceReduction += value;
        resistanceReductionSources.push(`${weapon.skill.name}-${effect.name}: ${(value * 100).toFixed(1)}%`);
      }
    });
  }
  
  const resistanceMultiplier = 1 - (enemyResistance - resistanceReduction);
  
  // ========== 9. 次数乘区 ==========
  let hitsMultiplier = 1.0;
  
  // 角色固有技能的次数加成
  character.passiveSkills.forEach(passive => {
    if (passive.enabled && passive.effects.zoneType === "次数") {
      if (passive.effects.value) {
        hitsMultiplier += passive.effects.value;
      }
    }
  });
  
  // ========== 最终伤害计算 ==========
  const finalDamage = 
    baseDamage *
    skillMultiplier *
    multiplierBoost *
    critMultiplier *
    damageDeepen *
    damageBonus *
    defenseMultiplier *
    resistanceMultiplier *
    hitsMultiplier;
  
  return {
    baseDamage,
    skillMultiplier,
    multiplierBoost,
    critMultiplier,
    damageDeepen,
    damageBonus,
    defenseMultiplier,
    resistanceMultiplier,
    hitsMultiplier,
    finalDamage,
    combatStats,
    details: {
      multiplierBoostSources,
      damageDeepenSources,
      damageBonusSources,
      defenseIgnoreSources,
      resistanceReductionSources
    }
  };
}

/**
 * 计算技能循环总伤害
 */
export function calculateRotationDamage(
  input: Omit<DamageCalculationInput, "selectedSkill" | "critMode">,
  rotation: Array<{ skill: CharacterSkill; count: number; critMode: "期望" | "暴击" | "不暴击" }>
): Array<{ skillName: string; damage: number; count: number; totalDamage: number }> {
  return rotation.map(step => {
    const result = calculateDamage({
      ...input,
      selectedSkill: step.skill,
      critMode: step.critMode
    });
    
    return {
      skillName: step.skill.name,
      damage: result.finalDamage,
      count: step.count,
      totalDamage: result.finalDamage * step.count
    };
  });
}
