import type {
  CalculationInput,
  CalculationResult,
  SkillDamageResult,
  CalculationStep,
  SkillType,
  DamageCategory,
  ComputedStats,
  SubstatWeightItem,
  BonusEntry,
} from '../types';
import type { EchoConfig, EchoStats, EchoSubStatType } from '../types/echo';
import { COST_SECONDARY, SUBSTAT_VALUES, ECHO_SUBSTAT_LABELS } from '../types/echo';
import { SKILL_TYPE_LABELS, SKILL_TYPE_COLORS, DAMAGE_CAT_LABELS, DAMAGE_CAT_COLORS } from '../types';

/** 聚合全局属性类增益（暴击率、暴击伤害、攻击力） */
function aggregateStatBonuses(entries: BonusEntry[]): { critRate: number; critDmg: number; atkPct: number } {
  const result = { critRate: 0, critDmg: 0, atkPct: 0 };
  if (!entries) return result;
  for (const entry of entries) {
    if (entry.targetType !== 'global') continue;
    switch (entry.effectType) {
      case 'crit_rate_boost': result.critRate += entry.value; break;
      case 'crit_dmg_boost': result.critDmg += entry.value; break;
      case 'atk_percent_boost': result.atkPct += entry.value; break;
    }
  }
  return result;
}

/** 根据增益条目列表和技能ID聚合出该技能的伤害类加成值 */
function aggregateBonusValues(entries: BonusEntry[], skillId: string): {
  damageAmplification: number;
  elementalDamage: number;
  basicDmg: number;
  heavyDmg: number;
  skillDmg: number;
  burstDmg: number;
  damageBoost: number;
} {
  const result = { damageAmplification: 0, elementalDamage: 0, basicDmg: 0, heavyDmg: 0, skillDmg: 0, burstDmg: 0, damageBoost: 0 };
  if (!entries) return result;
  for (const entry of entries) {
    const applies = entry.targetType === 'global' || entry.targetSkillIds.includes(skillId);
    if (!applies) continue;
    switch (entry.effectType) {
      case 'damage_amplification': result.damageAmplification += entry.value; break;
      case 'elemental_damage': result.elementalDamage += entry.value; break;
      case 'basic_dmg': result.basicDmg += entry.value; break;
      case 'heavy_dmg': result.heavyDmg += entry.value; break;
      case 'skill_dmg': result.skillDmg += entry.value; break;
      case 'burst_dmg': result.burstDmg += entry.value; break;
      case 'damage_boost': result.damageBoost += entry.value; break;
    }
  }
  return result;
}

function round(v: number): number {
  return Math.round(v);
}

function applySubStat(stats: EchoStats, type: string, value: number): void {
  switch (type) {
    case 'atk_percent': stats.atkPercent += value; break;
    case 'flat_atk': stats.flatAtk += value; break;
    case 'def_percent': stats.defPercent += value; break;
    case 'flat_def': stats.flatDef += value; break;
    case 'hp_percent': stats.hpPercent += value; break;
    case 'flat_hp': stats.flatHp += value; break;
    case 'crit_rate': stats.critRate += value; break;
    case 'crit_dmg': stats.critDmg += value; break;
    case 'energy_regen': stats.energyRegen += value; break;
    case 'basic_dmg': stats.basicDmg += value; break;
    case 'heavy_dmg': stats.heavyDmg += value; break;
    case 'skill_dmg': stats.skillDmg += value; break;
    case 'burst_dmg': stats.burstDmg += value; break;
    case 'heal_bonus': stats.healingBonus += value; break;
  }
}

function aggregateEchoStats(echoConfig: EchoConfig, characterElement: string): EchoStats {
  const elementMainStatMap: Record<string, string> = {
    aero_dmg: 'aero', fusion_dmg: 'fusion', spectro_dmg: 'spectro',
    glacio_dmg: 'glacio', havoc_dmg: 'havoc', electro_dmg: 'electro',
  };

  const stats: EchoStats = {
    atkPercent: 0, flatAtk: 0, defPercent: 0, flatDef: 0,
    hpPercent: 0, flatHp: 0, critRate: 0, critDmg: 0,
    energyRegen: 0, elementalDmg: 0, healingBonus: 0,
    basicDmg: 0, heavyDmg: 0, skillDmg: 0, burstDmg: 0,
  };

  for (const slot of echoConfig.slots) {
    const ms = slot.mainStatType;

    if (ms === 'atk_percent') stats.atkPercent += slot.mainStatValue;
    else if (ms === 'def_percent') stats.defPercent += slot.mainStatValue;
    else if (ms === 'hp_percent') stats.hpPercent += slot.mainStatValue;
    else if (ms === 'crit_rate') stats.critRate += slot.mainStatValue;
    else if (ms === 'crit_dmg') stats.critDmg += slot.mainStatValue;
    else if (ms === 'energy_regen') stats.energyRegen += slot.mainStatValue;
    else if (ms === 'heal_bonus') stats.healingBonus += slot.mainStatValue;

    const mapped = elementMainStatMap[ms];
    if (mapped && mapped === characterElement) {
      stats.elementalDmg += slot.mainStatValue;
    }

    const secondary = COST_SECONDARY[slot.cost];
    if (secondary.type === 'flat_atk') stats.flatAtk += secondary.value;
    else if (secondary.type === 'flat_hp') stats.flatHp += secondary.value;

    for (const sub of slot.subStats) {
      applySubStat(stats, sub.type, sub.value);
    }
  }

  for (const bonus of echoConfig.setBonuses) {
    if (bonus.statType === 'elemental_dmg') {
      stats.elementalDmg += bonus.value;
    } else {
      applySubStat(stats, bonus.statType, bonus.value);
    }
  }

  return stats;
}

interface BaseStatInfo {
  label: string;
  baseValue: number;
  weaponBase: number;
  pctStat: number;
  flatStat: number;
}

function getBaseStatInfo(
  character: CalculationInput['character'],
  weapon: CalculationInput['weapon'],
  echo: EchoStats,
  skillBonus: { atkPct: number; hpPct: number; defPct: number },
): BaseStatInfo {
  switch (character.damageScaling) {
    case 'hp':
      return {
        label: '基础生命值',
        baseValue: character.baseHp,
        weaponBase: 0,
        pctStat: (weapon.mainStatType === 'hp_percent' ? weapon.mainStatValue : 0) + echo.hpPercent + skillBonus.hpPct,
        flatStat: echo.flatHp,
      };
    case 'def':
      return {
        label: '基础防御值',
        baseValue: character.baseDef,
        weaponBase: 0,
        pctStat: (weapon.mainStatType === 'def_percent' ? weapon.mainStatValue : 0) + echo.defPercent + skillBonus.defPct,
        flatStat: echo.flatDef,
      };
    default:
      return {
        label: '基础攻击力',
        baseValue: character.baseAtk,
        weaponBase: weapon.baseAtk,
        pctStat: (weapon.mainStatType === 'atk_percent' ? weapon.mainStatValue : 0) + echo.atkPercent + skillBonus.atkPct,
        flatStat: echo.flatAtk,
      };
  }
}

// ========== 公开：完整伤害计算（含步骤） ==========
export function calculateDamage(input: CalculationInput): CalculationResult {
  const { character, weapon, skillCombo, bonuses, enemy, crit, echoConfig } = input;

  // Echo stat aggregation
  const echo = aggregateEchoStats(echoConfig, character.elementType);

  // Skill bonus aggregation (character + weapon)
  const skillBonusStats = { atkPct: 0, hpPct: 0, defPct: 0, critRate: 0, critDmg: 0, energyRegen: 0, basicDmg: 0, heavyDmg: 0, skillDmg: 0, burstDmg: 0 };
  for (const sb of [...(character.skillBonuses ?? []), ...(weapon.skillBonuses ?? [])]) {
    if (sb.statType === 'none') continue;
    switch (sb.statType) {
      case 'atk_percent': skillBonusStats.atkPct += sb.value; break;
      case 'hp_percent': skillBonusStats.hpPct += sb.value; break;
      case 'def_percent': skillBonusStats.defPct += sb.value; break;
      case 'crit_rate': skillBonusStats.critRate += sb.value; break;
      case 'crit_dmg': skillBonusStats.critDmg += sb.value; break;
      case 'energy_regen': skillBonusStats.energyRegen += sb.value; break;
      case 'basic_dmg': skillBonusStats.basicDmg += sb.value; break;
      case 'heavy_dmg': skillBonusStats.heavyDmg += sb.value; break;
      case 'skill_dmg': skillBonusStats.skillDmg += sb.value; break;
      case 'burst_dmg': skillBonusStats.burstDmg += sb.value; break;
    }
  }

  // Weapon main stat contributions
  const weaponAtkPct = weapon.mainStatType === 'atk_percent' ? weapon.mainStatValue : 0;
  const weaponHpPct = weapon.mainStatType === 'hp_percent' ? weapon.mainStatValue : 0;
  const weaponDefPct = weapon.mainStatType === 'def_percent' ? weapon.mainStatValue : 0;
  const weaponCritDmg = weapon.mainStatType === 'crit_dmg' ? weapon.mainStatValue : 0;
  const weaponCritRate = weapon.mainStatType === 'crit_rate' ? weapon.mainStatValue : 0;

  // Stat bonuses from bonus entries (暴击率/暴击伤害/攻击力提升)
  const statBonuses = aggregateStatBonuses(bonuses.entries ?? []);

  // Total base stat for damage (varies by scaling type, includes skill bonuses + stat bonuses)
  const baseInfo = getBaseStatInfo(character, weapon, echo, {
    atkPct: skillBonusStats.atkPct + statBonuses.atkPct,
    hpPct: skillBonusStats.hpPct,
    defPct: skillBonusStats.defPct,
  });
  const totalBase = round(baseInfo.baseValue + baseInfo.weaponBase);
  const totalBaseValue = round(totalBase * (1 + baseInfo.pctStat / 100) + baseInfo.flatStat);

  // Total crit stats (base + weapon + echo + skill bonuses + stat bonuses)
  const totalCritRate = character.critRate + weaponCritRate + echo.critRate + skillBonusStats.critRate + statBonuses.critRate;
  const totalCritDmg = character.critDamage + weaponCritDmg + echo.critDmg + skillBonusStats.critDmg + statBonuses.critDmg;

  // Defense multiplier
  const enemyRawDef = 792 + 8 * enemy.level;
  const enemyDef = enemyRawDef * (1 - enemy.defenseIgnore / 100);
  const defMultiplier = 1 - enemyDef / (enemyDef + 800 + 8 * character.level);

  // Computed stats for summary panel
  const computedStats: ComputedStats = {
    elementType: character.elementType,
    atk: round((character.baseAtk + weapon.baseAtk) * (1 + (weaponAtkPct + echo.atkPercent + skillBonusStats.atkPct) / 100) + echo.flatAtk),
    hp: round(character.baseHp * (1 + (weaponHpPct + echo.hpPercent + skillBonusStats.hpPct) / 100) + echo.flatHp),
    def: round(character.baseDef * (1 + (weaponDefPct + echo.defPercent + skillBonusStats.defPct) / 100) + echo.flatDef),
    critRate: round(totalCritRate * 10) / 10,
    critDmg: round(totalCritDmg * 10) / 10,
    energyRegen: round((character.resonanceEfficiency + echo.energyRegen + skillBonusStats.energyRegen) * 10) / 10,
    elementalDmg: round((character.elementalDamageBonus + echo.elementalDmg) * 10) / 10,
    healingBonus: round(echo.healingBonus * 10) / 10,
    basicDmg: round((echo.basicDmg + skillBonusStats.basicDmg) * 10) / 10,
    heavyDmg: round((echo.heavyDmg + skillBonusStats.heavyDmg) * 10) / 10,
    skillDmg: round((echo.skillDmg + skillBonusStats.skillDmg) * 10) / 10,
    burstDmg: round((echo.burstDmg + skillBonusStats.burstDmg) * 10) / 10,
  };

  const skills: SkillDamageResult[] = skillCombo.map((skill) => {
    const steps: CalculationStep[] = [];
    const multDec = skill.multiplier / 100;
    const multBonusDec = skill.multiplierBonus / 100;

    let baseFormula: string;
    if (baseInfo.pctStat > 0 && baseInfo.flatStat > 0) {
      baseFormula = `(${baseInfo.baseValue}+${baseInfo.weaponBase})×(1+${baseInfo.pctStat}%)+${baseInfo.flatStat}=${totalBaseValue}`;
    } else if (baseInfo.pctStat > 0) {
      baseFormula = `(${baseInfo.baseValue}+${baseInfo.weaponBase})×(1+${baseInfo.pctStat}%)=${totalBaseValue}`;
    } else if (baseInfo.flatStat > 0) {
      baseFormula = `${totalBase}+${baseInfo.flatStat}=${totalBaseValue}`;
    } else {
      baseFormula = `${baseInfo.baseValue}+${baseInfo.weaponBase}=${totalBaseValue}`;
    }
    steps.push({ label: baseInfo.label, formula: baseFormula, value: totalBaseValue });

    const skillBaseDmg = round(totalBaseValue * multDec);
    steps.push({
      label: '技能基础伤害',
      formula: `${totalBaseValue} × ${skill.multiplier}% = ${skillBaseDmg}`,
      value: skillBaseDmg,
    });

    const afterMultBonus = round(skillBaseDmg * (1 + multBonusDec));
    steps.push({
      label: '倍率提升后',
      formula: `${skillBaseDmg} × (1 + ${skill.multiplierBonus}%) = ${afterMultBonus}`,
      value: afterMultBonus,
    });

    // 聚合本技能适用的增益
    const sv = aggregateBonusValues(bonuses.entries ?? [], skill.id);

    const afterAmp = round(afterMultBonus * (1 + sv.damageAmplification / 100));
    steps.push({
      label: '伤害加深后',
      formula: `${afterMultBonus} × (1 + ${sv.damageAmplification}%) = ${afterAmp}`,
      value: afterAmp,
    });

    const catBonus = skill.damageCategory === 'basic' ? sv.basicDmg
      : skill.damageCategory === 'heavy' ? sv.heavyDmg
      : skill.damageCategory === 'skill' ? sv.skillDmg
      : sv.burstDmg;
    const echoCatBonus = skill.damageCategory === 'basic' ? echo.basicDmg
      : skill.damageCategory === 'heavy' ? echo.heavyDmg
      : skill.damageCategory === 'skill' ? echo.skillDmg
      : echo.burstDmg;
    const skillCatBonus = skill.damageCategory === 'basic' ? skillBonusStats.basicDmg
      : skill.damageCategory === 'heavy' ? skillBonusStats.heavyDmg
      : skill.damageCategory === 'skill' ? skillBonusStats.skillDmg
      : skillBonusStats.burstDmg;
    const totalDmgBonus = character.elementalDamageBonus + sv.elementalDamage + echo.elementalDmg + catBonus + echoCatBonus + skillCatBonus;
    const afterBonus = round(afterAmp * (1 + totalDmgBonus / 100));
    const bonusParts: string[] = [];
    if (character.elementalDamageBonus > 0) bonusParts.push(`角色${character.elementalDamageBonus}%`);
    if (sv.elementalDamage > 0) bonusParts.push(`增益${sv.elementalDamage}%`);
    if (echo.elementalDmg > 0) bonusParts.push(`声骸${echo.elementalDmg}%`);
    if (catBonus > 0) bonusParts.push(`增益${catBonus}%`);
    if (echoCatBonus > 0) bonusParts.push(`声骸${echoCatBonus}%`);
    if (skillCatBonus > 0) bonusParts.push(`技能${skillCatBonus}%`);
    const bonusFormula = bonusParts.length > 0
      ? `${afterAmp} × (1 + ${bonusParts.join('+')}) = ${afterBonus}`
      : `${afterAmp} × (1 + 0%) = ${afterBonus}`;
    steps.push({
      label: '增伤后',
      formula: bonusFormula,
      value: afterBonus,
    });

    // Crit
    let critMult: number;
    let critDesc: string;
    const critDmgShow = round(totalCritDmg * 10) / 10;

    if (crit.critMode === 'none') {
      critMult = 1;
      critDesc = '不暴击 (×1)';
    } else if (crit.critMode === 'crit') {
      critMult = totalCritDmg / 100;
      critDesc = `暴击 (×${critDmgShow}%)`;
    } else {
      const rateDec = totalCritRate / 100;
      const dmgDec = totalCritDmg / 100;
      critMult = 1 + rateDec * (dmgDec - 1);
      critDesc = `期望暴击 (${round((1 - rateDec) * 100)}%×100% + ${round(totalCritRate * 10) / 10}%×${critDmgShow}%)`;
    }
    const afterCrit = round(afterBonus * critMult);
    steps.push({
      label: '暴击后',
      formula: `${afterBonus} × ${critDesc} = ${afterCrit}`,
      value: afterCrit,
    });

    const afterDef = round(afterCrit * defMultiplier);
    const defFormula = enemy.defenseIgnore > 0
      ? `${afterCrit} × (1 - ${round(enemyDef)} / (${round(enemyDef)} + 800 + 8×${character.level})) = ${afterDef}`
      : `${afterCrit} × (1 - ${round(enemyRawDef)} / (${round(enemyRawDef)} + 800 + 8×${character.level})) = ${afterDef}`;
    steps.push({
      label: '防御减免后',
      formula: defFormula,
      value: afterDef,
    });

    const afterRes = round(afterDef * (1 - enemy.elementalResistance / 100));
    steps.push({
      label: '抗性减免后',
      formula: `${afterDef} × (1 - ${enemy.elementalResistance}%) = ${afterRes}`,
      value: afterRes,
    });

    const preBoostDmg = round(afterRes * (1 - enemy.damageReduction / 100));
    steps.push({
      label: '减免后',
      formula: `${afterRes} × (1 - ${enemy.damageReduction}%) = ${preBoostDmg}`,
      value: preBoostDmg,
    });

    // 伤害提升（最终乘区）
    const finalDmg = sv.damageBoost > 0
      ? round(preBoostDmg * (1 + sv.damageBoost / 100))
      : preBoostDmg;
    if (sv.damageBoost > 0) {
      steps.push({
        label: '伤害提升后',
        formula: `${preBoostDmg} × (1 + ${sv.damageBoost}%) = ${finalDmg}`,
        value: finalDmg,
      });
    }

    return {
      skillName: skill.name,
      skillType: skill.skillType,
      damageCategory: skill.damageCategory,
      steps,
      finalDamage: finalDmg,
    };
  });

  const totalDamage = skills.reduce((sum, s) => sum + s.finalDamage, 0);

  const stMap = new Map<SkillType, number>();
  for (const s of skills) stMap.set(s.skillType, (stMap.get(s.skillType) ?? 0) + s.finalDamage);
  const bySkillType = Array.from(stMap.entries())
    .map(([type, value]) => ({ type, label: SKILL_TYPE_LABELS[type], value, color: SKILL_TYPE_COLORS[type] }))
    .sort((a, b) => b.value - a.value);

  const dcMap = new Map<DamageCategory, number>();
  for (const s of skills) dcMap.set(s.damageCategory, (dcMap.get(s.damageCategory) ?? 0) + s.finalDamage);
  const byDamageCategory = Array.from(dcMap.entries())
    .map(([type, value]) => ({ type, label: DAMAGE_CAT_LABELS[type], value, color: DAMAGE_CAT_COLORS[type] }))
    .sort((a, b) => b.value - a.value);

  return { totalDamage, skills, bySkillType, byDamageCategory, computedStats };
}

// ========== 副词条权重分析专用：轻量总伤害计算（无步骤/公式/图表） ==========

function addSubstatToEcho(echo: EchoStats, statType: EchoSubStatType, value: number): EchoStats {
  // shallow copy to avoid mutating the original
  return {
    atkPercent: echo.atkPercent + (statType === 'atk_percent' ? value : 0),
    flatAtk: echo.flatAtk + (statType === 'flat_atk' ? value : 0),
    defPercent: echo.defPercent + (statType === 'def_percent' ? value : 0),
    flatDef: echo.flatDef + (statType === 'flat_def' ? value : 0),
    hpPercent: echo.hpPercent + (statType === 'hp_percent' ? value : 0),
    flatHp: echo.flatHp + (statType === 'flat_hp' ? value : 0),
    critRate: echo.critRate + (statType === 'crit_rate' ? value : 0),
    critDmg: echo.critDmg + (statType === 'crit_dmg' ? value : 0),
    energyRegen: echo.energyRegen + (statType === 'energy_regen' ? value : 0),
    elementalDmg: echo.elementalDmg,
    healingBonus: echo.healingBonus,
    basicDmg: echo.basicDmg + (statType === 'basic_dmg' ? value : 0),
    heavyDmg: echo.heavyDmg + (statType === 'heavy_dmg' ? value : 0),
    skillDmg: echo.skillDmg + (statType === 'skill_dmg' ? value : 0),
    burstDmg: echo.burstDmg + (statType === 'burst_dmg' ? value : 0),
  };
}

const ZERO_ECHO: EchoStats = {
  atkPercent: 0, flatAtk: 0, defPercent: 0, flatDef: 0,
  hpPercent: 0, flatHp: 0, critRate: 0, critDmg: 0,
  energyRegen: 0, elementalDmg: 0, healingBonus: 0,
  basicDmg: 0, heavyDmg: 0, skillDmg: 0, burstDmg: 0,
};

function computeTotalDamageFast(input: CalculationInput, extraStatType?: EchoSubStatType, extraValue?: number, skipEcho?: boolean): number {
  const { character, weapon, skillCombo, bonuses, enemy, crit } = input;

  // Echo stats (with optional substat applied via explicit copy)
  const rawEcho = skipEcho ? { ...ZERO_ECHO } : aggregateEchoStats(input.echoConfig, character.elementType);
  const echo = (extraStatType && extraValue)
    ? addSubstatToEcho(rawEcho, extraStatType, extraValue)
    : rawEcho;

  // Skill bonuses
  const sb = { atkPct: 0, hpPct: 0, defPct: 0, critRate: 0, critDmg: 0, energyRegen: 0, basicDmg: 0, heavyDmg: 0, skillDmg: 0, burstDmg: 0 };
  for (const b of (character.skillBonuses ?? [])) {
    switch (b.statType) {
      case 'atk_percent': sb.atkPct += b.value; break;
      case 'hp_percent': sb.hpPct += b.value; break;
      case 'def_percent': sb.defPct += b.value; break;
      case 'crit_rate': sb.critRate += b.value; break;
      case 'crit_dmg': sb.critDmg += b.value; break;
      case 'energy_regen': sb.energyRegen += b.value; break;
      case 'basic_dmg': sb.basicDmg += b.value; break;
      case 'heavy_dmg': sb.heavyDmg += b.value; break;
      case 'skill_dmg': sb.skillDmg += b.value; break;
      case 'burst_dmg': sb.burstDmg += b.value; break;
    }
  }
  for (const b of (weapon.skillBonuses ?? [])) {
    switch (b.statType) {
      case 'atk_percent': sb.atkPct += b.value; break;
      case 'hp_percent': sb.hpPct += b.value; break;
      case 'def_percent': sb.defPct += b.value; break;
      case 'crit_rate': sb.critRate += b.value; break;
      case 'crit_dmg': sb.critDmg += b.value; break;
      case 'energy_regen': sb.energyRegen += b.value; break;
      case 'basic_dmg': sb.basicDmg += b.value; break;
      case 'heavy_dmg': sb.heavyDmg += b.value; break;
      case 'skill_dmg': sb.skillDmg += b.value; break;
      case 'burst_dmg': sb.burstDmg += b.value; break;
    }
  }

  // Weapon stats
  const wpAtkPct = weapon.mainStatType === 'atk_percent' ? weapon.mainStatValue : 0;
  const wpCritDmg = weapon.mainStatType === 'crit_dmg' ? weapon.mainStatValue : 0;
  const wpCritRate = weapon.mainStatType === 'crit_rate' ? weapon.mainStatValue : 0;

  // Stat bonuses from bonus entries
  const statBonuses = aggregateStatBonuses(bonuses.entries ?? []);

  // Base stat
  const baseInfo = getBaseStatInfo(character, weapon, echo, {
    atkPct: sb.atkPct + statBonuses.atkPct, hpPct: sb.hpPct, defPct: sb.defPct,
  });
  const totalBase = baseInfo.baseValue + baseInfo.weaponBase;
  const totalBaseValue = totalBase * (1 + baseInfo.pctStat / 100) + baseInfo.flatStat;

  // Crit
  const totalCritRate = character.critRate + wpCritRate + echo.critRate + sb.critRate + statBonuses.critRate;
  const totalCritDmg = character.critDamage + wpCritDmg + echo.critDmg + sb.critDmg + statBonuses.critDmg;

  // Defense
  const enemyRawDef = 792 + 8 * enemy.level;
  const enemyDef = enemyRawDef * (1 - enemy.defenseIgnore / 100);
  const defMult = 1 - enemyDef / (enemyDef + 800 + 8 * character.level);

  // Crit multiplier
  let critMultBase: number;
  if (crit.critMode === 'none') {
    critMultBase = 1;
  } else if (crit.critMode === 'crit') {
    critMultBase = totalCritDmg / 100;
  } else {
    critMultBase = 1 + (totalCritRate / 100) * (totalCritDmg / 100 - 1);
  }

  // Sum skill damages
  let total = 0;
  for (const skill of skillCombo) {
    const md = skill.multiplier / 100;
    const mbd = skill.multiplierBonus / 100;

    const skillBase = totalBaseValue * md;
    const afterMult = skillBase * (1 + mbd);
    const sv = aggregateBonusValues(bonuses.entries ?? [], skill.id);

    const afterAmp = afterMult * (1 + sv.damageAmplification / 100);

    const catB = skill.damageCategory === 'basic' ? sv.basicDmg
      : skill.damageCategory === 'heavy' ? sv.heavyDmg
      : skill.damageCategory === 'skill' ? sv.skillDmg
      : sv.burstDmg;
    const echoCat = skill.damageCategory === 'basic' ? echo.basicDmg
      : skill.damageCategory === 'heavy' ? echo.heavyDmg
      : skill.damageCategory === 'skill' ? echo.skillDmg
      : echo.burstDmg;
    const skillCat = skill.damageCategory === 'basic' ? sb.basicDmg
      : skill.damageCategory === 'heavy' ? sb.heavyDmg
      : skill.damageCategory === 'skill' ? sb.skillDmg
      : sb.burstDmg;
    const dmgBonus = character.elementalDamageBonus + sv.elementalDamage + echo.elementalDmg + catB + echoCat + skillCat;
    const afterBonus = afterAmp * (1 + dmgBonus / 100);

    const afterCrit = afterBonus * critMultBase;
    const afterDef = afterCrit * defMult;
    const afterRes = afterDef * (1 - enemy.elementalResistance / 100);
    const preBoost = afterRes * (1 - enemy.damageReduction / 100);
    total += sv.damageBoost > 0 ? preBoost * (1 + sv.damageBoost / 100) : preBoost;
  }
  return round(total);
}

// ========== 副词条权重分析 ==========

export function analyzeSubstatWeights(input: CalculationInput): SubstatWeightItem[] {
  try {
    // 不计算声骸已有属性——权重分析用于声骸强化选择参考
    const baselineDamage = computeTotalDamageFast(input, undefined, undefined, true);
    if (baselineDamage <= 0) return [];

    const substatTypes = Object.keys(SUBSTAT_VALUES) as EchoSubStatType[];
    const results: SubstatWeightItem[] = [];

    for (const statType of substatTypes) {
      const values = SUBSTAT_VALUES[statType];
      if (!values) continue;
      const avgValue = values.reduce((a, b) => a + b, 0) / values.length;

      const modifiedDamage = computeTotalDamageFast(input, statType, avgValue, true);

      const increasePercent = baselineDamage > 0
        ? ((modifiedDamage - baselineDamage) / baselineDamage) * 100
        : 0;

      results.push({
        statType,
        label: ECHO_SUBSTAT_LABELS[statType] ?? statType,
        avgValue: round(avgValue * 10) / 10,
        baselineDamage,
        modifiedDamage,
        increasePercent: round(increasePercent * 100) / 100,
        weight: 0,
      });
    }

    const maxIncrease = Math.max(...results.map(r => r.increasePercent), 0.01);
    for (const r of results) {
      r.weight = maxIncrease > 0 ? round((r.increasePercent / maxIncrease) * 1000) / 1000 : 0;
    }

    results.sort((a, b) => b.increasePercent - a.increasePercent);
    return results;
  } catch (e) {
    console.error('Substat weight analysis failed:', e);
    return [];
  }
}
