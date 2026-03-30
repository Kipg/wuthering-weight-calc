// 鸣潮 - 爱弥斯角色数据

import { Character, CharacterDamagePlugin } from "@/types";
import { calculateZhenxieDamage, calculateZhenxieResponseDamage } from "@/lib/zhenxieCalculator";
import { calculateJubaoEffectDamage, getJubaoUpperLimit, getWindErosionMultiplierBoost } from "@/lib/effectCalculator";

// ============ 爱弥斯伤害计算插件 ============

const aimisiPlugin: CharacterDamagePlugin = {
  // 根据共鸣模态过滤"星与星之间"被动（震谐/聚爆互斥）
  shouldSkipPassive(passive, input) {
    if (passive.name === "星与星之间·震谐" || passive.name === "星与星之间·聚爆") {
      const resonanceMode = input.aimisiConfig?.resonanceMode ?? "震谐";
      if (passive.name === "星与星之间·震谐" && resonanceMode !== "震谐") return true;
      if (passive.name === "星与星之间·聚爆" && resonanceMode !== "聚爆") return true;
    }
    return false;
  },

  // 处理震谐伤害和效应伤害（绕过通用乘区公式）
  calculateSpecialDamage(input, selectedSkill) {
    const aimisiConfig = input.aimisiConfig;
    const chainLevel = aimisiConfig?.chainLevel ?? 0;

    if (selectedSkill.damageType === "震谐伤害") {
      const skillMultiplier = selectedSkill.multiplierList[selectedSkill.skillLevel - 1];
      if (selectedSkill.name === "震谐响应·星爆伤害") {
        return calculateZhenxieResponseDamage(skillMultiplier);
      }
      if (selectedSkill.name === "光翼共奏追加伤害·震谐" && aimisiConfig?.resonanceMode === "震谐") {
        const chain2En = chainLevel >= 2;
        let damage = calculateZhenxieDamage(
          skillMultiplier,
          aimisiConfig.zhenxieTrackStacks || 0,
          aimisiConfig.xingchenZhenxieEnabled || false,
          chain2En
        );
        // 6链：震谐伤害可暴击，固定按暴击值（×2.75）计算
        if (chainLevel >= 6) damage *= 2.75;
        return damage;
      }
      return 0;
    }

    if (selectedSkill.damageType === "效应伤害") {
      if (aimisiConfig?.resonanceMode === "聚爆") {
        const jubaoUpperLimit = getJubaoUpperLimit(input.teammates);
        const chain2En = chainLevel >= 2;
        let damage = calculateJubaoEffectDamage(
          aimisiConfig.jubaoTrackStacks || 1,
          jubaoUpperLimit,
          aimisiConfig.xingchenJubaoEnabled || false,
          chain2En
        );
        // 6链：效应伤害可暴击，固定按暴击值（×2.75）计算
        if (chainLevel >= 6) damage *= 2.75;
        return damage;
      }
      return 0;
    }

    return null; // 非特殊类型，走通用乘区公式
  },

  // 注入链度加成和风蚀效应加成（在通用乘区计算完成后调用）
  modifyDamageContext(input, selectedSkill) {
    const aimisiConfig = input.aimisiConfig;
    const chainLevel = aimisiConfig?.chainLevel ?? 0;

    const multiplierBoostEntries: Array<{ value: number; note: string }> = [];
    const damageBonusEntries: Array<{ value: number; note: string }> = [];
    let critDMGAdd: number | undefined;
    let receiveDamageMultiplier: number | undefined;

    // ── 风蚀效应倍率提升 ──
    const windErosionStacks = (input.effectStacks?.["风蚀效应"]) ?? 0;
    if (windErosionStacks > 0) {
      const windBoost = getWindErosionMultiplierBoost(windErosionStacks);
      if (windBoost > 0) {
        multiplierBoostEntries.push({
          value: windBoost,
          note: `风蚀效应(${windErosionStacks}层): +${(windBoost * 100).toFixed(1)}%`
        });
      }
    }

    // ── 1链：重击暴击伤害 +300% ──
    if (chainLevel >= 1) {
      const chainHeavySkills = [
        "重击·一段蓄力伤害", "重击·二段蓄力伤害",
        "机兵·重击·一段蓄力伤害", "机兵·重击·二段蓄力伤害"
      ];
      if (chainHeavySkills.includes(selectedSkill.name)) {
        critDMGAdd = 3.0;
      }
    }

    // ── 2链：光翼共奏·登台/降临 倍率提升 +100% ──
    if (chainLevel >= 2) {
      const chain2SkillNames = ["光翼共奏·登台伤害", "光翼共奏·降临伤害"];
      if (chain2SkillNames.includes(selectedSkill.name)) {
        multiplierBoostEntries.push({ value: 1.0, note: "2链：光翼共奏倍率提升 +100%" });
      }
    }

    // ── 3链：共鸣解放倍率提升 ──
    if (chainLevel >= 3) {
      if (selectedSkill.name === "星辉破界而来·终结") {
        multiplierBoostEntries.push({ value: 1.0, note: "3链：共鸣解放·终结倍率提升 +100%" });
      } else if (selectedSkill.name === "星辉破界而来·过载") {
        multiplierBoostEntries.push({ value: 0.4, note: "3链：共鸣解放·过载倍率提升 +40%" });
      }
    }

    // ── 4链：全属性伤害加成 +20% ──
    if (chainLevel >= 4) {
      damageBonusEntries.push({ value: 0.2, note: "4链：全属性伤害加成 +20%" });
    }

    // ── 6链：共鸣解放受到伤害提升 ×1.4 ──
    if (chainLevel >= 6 && selectedSkill.skillCategory === "共鸣解放") {
      receiveDamageMultiplier = 1.4;
    }

    return {
      critDMGAdd,
      multiplierBoostEntries: multiplierBoostEntries.length > 0 ? multiplierBoostEntries : undefined,
      damageBonusEntries: damageBonusEntries.length > 0 ? damageBonusEntries : undefined,
      receiveDamageMultiplier,
    };
  },
};

export const AIMISI: Character = {
  baseStats: {
    name: "爱弥斯",
    rarity: 5,
    weaponType: "迅刀",
    elementType: "热熔伤害",
    
    level: 90,
    levelList: [20, 40, 50, 60, 70, 80, 90],
    
    baseHPList: [2294, 4368, 5699, 7031, 8362, 9693, 11025],
    baseATKList: [88, 171, 225, 279, 333, 379, 425],
    baseDEFList: [241, 456, 595, 733, 872, 1010, 1148],
    
    baseCritRate: 0.05,
    baseCritDMG: 1.50,
    baseHealBonus: 0,
    baseElementDMG: 0.20,
    baseEnergyRegen: 1.00,
    
    imageKey: "aimisi"
  },
  
  skills: [
    // ========== 常态攻击==========
    {
      name: "第一段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.2300,0.2500,0.2700,0.3000,0.3200,0.3400,0.3700,0.4000,0.4300,0.4600],
    },
    {
      name: "第二段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.0699+0.1048+0.1747,0.0756+0.1134+0.1890,0.0814+0.1220+0.2033,0.0894+0.1341+0.2234,0.0951+0.1426+0.2377,0.1017+0.1525+0.2542,0.1109+0.1663+0.2771,0.1200+0.1800+0.3000,0.1292+0.1938+0.3229,0.1389+0.2084+0.3473],
    },
    {
      name: "第三段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.0469*3+0.0937+0.2342,0.0507*3+0.1014+0.2534,0.0546*3+0.1091+0.2726,0.0599*3+0.1198+0.2995,0.0638*3+0.1275+0.3187,0.0682*3+0.1363+0.3408,0.0743*3+0.1486+0.3715,0.0805*3+0.1609+0.4022,0.0866*3+0.1732+0.4329,0.0932*3+0.1863+0.4656],
    },
    {
      name: "第四段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList:[0.0339*5+0.5077,0.0367*5+0.5494,0.0394*5+0.5910,0.0433*5+0.6493,0.0461*5+0.6909,0.0493*5+0.7388,0.0537*5+0.8054,0.0582*5+0.8720,0.0626*5+0.9386,0.0673*5+1.0094],
    },
    {
      name: "闪避反击伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.1309*3+0.2617+0.6542,0.1416*3+0.2832+0.7078,0.1523*3+0.3046+0.7615,0.1674*3+0.3347+0.8366,0.1781*3+0.3561+0.8902,0.1904*3+0.3808+0.9519,0.2076*3+0.4151+1.0377,0.2248*3+0.4495+1.1236,0.2419*3+0.4838+1.2094,0.2602*3+0.5203+1.3006],
    },
    {
      name: "重击·一段蓄力伤害",
      skillLevel: 10,
      damageType: "重击",
      skillCategory: "常态攻击",
      multiplierList: [0.0934+0.3736,0.1011+0.4042,0.1087+0.4348,0.1195+0.4777,0.1271+0.5083,0.1359+0.5436,0.1482+0.5926,0.1604+0.6416,0.1727+0.6906,0.1857+0.7426],
    },
    {
      name: "重击·二段蓄力伤害",
      skillLevel: 10,
      damageType: "重击",
      skillCategory: "常态攻击",
      multiplierList: [0.0584*4+0.9336,0.0632*4+1.0101,0.0680*4+1.0867,0.0747*4+1.1938,0.0794*4+1.2704,0.0849*4+1.3584,0.0926*4+1.4809,0.1003*4+1.6034,0.1079*4+1.7258,0.1160*4+1.8560],
    },
    {
      name: "空中攻击",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "常态攻击",
      multiplierList: [0.4300,0.4700,0.5100,0.5600,0.5900,0.6300,0.6900,0.7500,0.8000,0.8600],
    },
    
    // ========== 共鸣技能==========
    {
      name: "合击·突刺·兵装融合伤害",
      skillLevel: 10,
      damageType: "共鸣技能",
      skillCategory: "共鸣技能",
      multiplierList: [0.1354+0.2031+0.3385,0.1465+0.2198+0.3663,0.1576+0.2364+0.3940,0.1732+0.2597+0.4329,0.1843+0.2764+0.4606,0.1970+0.2955+0.4925,0.2148+0.3222+0.5369,0.2326+0.3488+0.5813,0.2503+0.3755+0.6257,0.2692+0.4038+0.6729],
    },
    {
      name: "合击·突刺·启明之音伤害",
      skillLevel: 10,
      damageType: "共鸣技能",
      skillCategory: "共鸣技能",
      multiplierList: [0.0822*3+0.5748,0.0889*3+0.6220,0.0956*3+0.6691,0.1051*3+0.7351,0.1118*3+0.7822,0.1195*3+0.8364,0.1303*3+0.9118,0.1411*3+0.9872,0.1518*3+1.0626,0.1633*3+1.1428],
    },
    {
      name: "机兵·第一段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣技能",
      multiplierList: [0.1167*3,0.1263*3,0.1358*3,0.1492*3,0.1588*3,0.1698*3,0.1851*3,0.2004*3,0.2157*3,0.2320*3],
    },
    {
      name: "机兵·第二段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣技能",
      multiplierList: [0.0934+0.3736,0.1011+0.4042,0.1087+0.4348,0.1195+0.4777,0.1271+0.5083,0.1359+0.5436,0.1482+0.5926,0.1604+0.6416,0.1727+0.6906,0.1857+0.7426],
    },
    {
      name: "机兵·第三段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣技能",
      multiplierList: [0.0196*6+0.4102+0.0586,0.0212*6+0.4438+0.0634,0.0228*6+0.4774+0.0682,0.0250*6+0.5245+0.0750,0.0266*6+0.5582+0.0798,0.0285*6+0.5968+0.0853,0.0310*6+0.6506+0.0930,0.0336*6+0.7044+0.1007,0.0362*6+0.7583+0.1084,0.0389*6+0.8154+0.1165],
    },
    {
      name: "机兵·第四段伤害",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣技能",
      multiplierList: [0.2031+0.4739,0.2198+0.5127,0.2364+0.5516,0.2597+0.6060,0.2764+0.6448,0.2955+0.6895,0.3222+0.7517,0.3488+0.8139,0.3755+0.8760,0.4038+0.9421],
    },
    {
      name: "机兵·重击·一段蓄力伤害",
      skillLevel: 10,
      damageType: "重击",
      skillCategory: "共鸣技能",
      multiplierList: [0.4669,0.5052,0.5435,0.5971,0.6354,0.6794,0.7407,0.8020,0.8632,0.9283],
    },
    {
      name: "机兵·重击·二段蓄力伤害",
      skillLevel: 10,
      damageType: "重击",
      skillCategory: "共鸣技能",
      multiplierList: [1.1669,1.2626,1.3583,1.4923,1.5880,1.6980,1.8511,2.0042,2.1573,2.3200],
    },
    {
      name: "机兵·空中攻击",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣技能",
      multiplierList:[0.3689+0.0217*3,0.3992+0.0235*3,0.4294+0.0253*3,0.4718+0.0278*3,0.5020+0.0296*3,0.5368+0.0316*3,0.5852+0.0345*3,0.6336+0.0373*3,0.6820+0.0402*3,0.7335+0.0432*3],
    },
    {
      name: "机兵·闪避反击",
      skillLevel: 10,
      damageType: "普攻",
      skillCategory: "共鸣技能",
      multiplierList: [0.0476*6+0.9982+0.1426,0.0515*6+1.0800+0.1543,0.0554*6+1.1619+0.1660,0.0608*6+1.2765+0.1824,0.0647*6+1.3583+0.1941,0.0692*6+1.4524+0.2075,0.0754*6+1.5834+0.2262,0.0817*6+1.7143+0.2449,0.0879*6+1.8453+0.2637,0.0945*6+1.9844+0.2835],
    },
    
    // ========== 共鸣回路 ==========
    {
      name: "光翼共奏·登台伤害",
      skillLevel: 10,
      damageType: "共鸣解放",
      skillCategory: "共鸣回路",
      multiplierList: [0.0900*4+0.1800*3+0.9000,0.0974*4+0.1948*3+0.9738,0.1048*4+0.2096*3+1.0476,0.1151*4+0.2302*3+1.1510,0.1225*4+0.2450*3+1.2248,0.1310*4+0.2620*3+1.3096,0.1428*4+0.2856*3+1.4277,0.1546*4+0.3092*3+1.5458,0.1664*4+0.3328*3+1.6639,0.1790*4+0.3579*3+1.7893],
    },
    {
      name: "光翼共奏·降临伤害",
      skillLevel: 10,
      damageType: "共鸣解放",
      skillCategory: "共鸣回路",
      multiplierList: [0.0900+0.0750*6+0.1200*3+0.3000*3,0.0974+0.0812*6+0.1299*3+0.3246*3,0.1048+0.0873*6+0.1397*3+0.3492*3,0.1151+0.0960*6+0.1535*3+0.3837*3,0.1225+0.1021*6+0.1633*3+0.4083*3,0.1310+0.1092*6+0.1747*3+0.4366*3,0.1428+0.1190*6+0.1904*3+0.4759*3,0.1546+0.1289*6+0.2061*3+0.5153*3,0.1664+0.1387*6+0.2219*3+0.5547*3,0.1790+0.1492*6+0.2386*3+0.5965*3],
    },
    {
      name: "震谐响应·星爆伤害",
      skillLevel: 10,
      damageType: "震谐伤害",
      skillCategory: "共鸣回路",
      multiplierList: [3.0000,3.2460,3.4920,3.8364,4.0824,4.3653,4.7589,5.1525,5.5461,5.9643],
    },
    {
      name: "光翼共奏追加伤害·震谐",
      skillLevel: 10,
      damageType: "震谐伤害",
      skillCategory: "共鸣回路",
      multiplierList: [0.5500,0.5951,0.6402,0.7034,0.7485,0.8004,0.8725,0.9447,1.0168,1.0935],
    },
    {
      name: "光翼共奏追加伤害·聚爆",
      skillLevel: 10,
      damageType: "效应伤害",
      skillCategory: "共鸣回路",
      multiplierList: [0.5500,0.5951,0.6402,0.7034,0.7485,0.8004,0.8725,0.9447,1.0168,1.0935],
    },
    
    // ========== 共鸣解放 ==========
    {
      name: "星辉破界而来·过载",
      skillLevel: 10,
      damageType: "共鸣解放",
      skillCategory: "共鸣解放",
      multiplierList: [1.0100+1.3467*3, 1.0929+1.4571*3, 1.1757+1.5676*3, 1.2916+1.7222*3, 1.3745+1.8326*3, 1.4697+1.9596*3, 1.6022+2.1363*3, 1.7347+2.3129*3, 1.8672+2.4896*3, 2.0080+2.6774*3],
    },
    {
      name: "星辉破界而来·终结",
      skillLevel: 10,
      damageType: "共鸣解放",
      skillCategory: "共鸣解放",
      multiplierList: [9.0000, 9.7380, 10.4760, 11.5092, 12.2472, 13.0959, 14.2767, 15.4575, 16.6383, 17.8929],
    }
  ],
  
  branchStats: {
    branch1: { stat: "暴击率", value: 0.08 },
    branch2: { stat: "大攻击", value: 0.12 }
  },
  
  passiveSkills: [
    {
      name: "于万籁之中",
      description: "处于即刻响应状态时，重击·爱弥斯、重击·机兵造成的伤害加深1100%。",
      enabled: false,
      effects: {
        statBonus: { "伤害加深": 2.00 }
      },
      affectedSkillNames: ["重击·一段蓄力伤害", "重击·二段蓄力伤害", "机兵·重击·一段蓄力伤害", "机兵·重击·二段蓄力伤害"]
    },
    {
      name: "星与星之间·震谐",
      description: "处于共鸣模态·震谐时，队伍中的角色附加【震谐·偏移】或造成震谐伤害时，爱弥斯暴击伤害提升20%，最多可叠加3层。该效果每名角色仅可触发1次。\n达到3层时，共鸣解放星辉破界而来·终结伤害加深25%。\n角色编入队伍或切换模态时，重置该效果。",
      enabled: false,
      effects: {
        statBonus: { "暴击伤害": 0.20 },
        conditional: {
          condition: "震谐偏移层数",
          values: [0, 0.20, 0.40, 0.60] // 0-3层
        }
      },
      conditionalUI: {
        type: "slider",
        label: "震谐偏移层数",
        stateKey: "zhenxieShiftStacks",
        min: 0,
        max: 3,
        suffix: "层"
      }
    },
    {
      name: "星与星之间·聚爆",
      description: "处于共鸣模态·聚爆时，队伍中的角色附加【聚爆效应】时，爱弥斯暴击伤害提升30%，最多可叠加2层。该效果每名角色仅可触发1次。\n达到2层时，共鸣解放星辉破界而来·终结伤害加深25%。\n角色编入队伍或切换模态时，重置该效果。",
      enabled: false,
      effects: {
        statBonus: { "暴击伤害": 0.30 },
        conditional: {
          condition: "聚爆效应层数",
          values: [0, 0.30, 0.60] // 0-2层
        }
      },
      conditionalUI: {
        type: "slider",
        label: "聚爆效应层数",
        stateKey: "jubaoEffectStacks",
        min: 0,
        max: 2,
        suffix: "层"
      }
    }
  ],

  specialConfig: {
    sectionTitle: "共鸣模态",
    controls: [
      {
        key: "resonanceMode",
        type: "radio",
        label: "共鸣模态",
        defaultValue: "震谐",
        options: [
          { value: "震谐", label: "震谐", activeClass: "bg-yellow-500 text-white shadow-lg" },
          { value: "聚爆", label: "聚爆", activeClass: "bg-orange-500 text-white shadow-lg" }
        ]
      },
      // ── 震谐模态专属 ──
      {
        key: "zhenxieTrackStacks",
        type: "slider",
        label: "震谐轨迹层数",
        defaultValue: 0,
        min: 0,
        max: 30,
        suffix: "层",
        showWhen: { key: "resonanceMode", value: "震谐" },
        group: "震谐"
      },
      {
        key: "xingchenZhenxieEnabled",
        type: "checkbox",
        label: "星屑共振·震谐",
        description: "共鸣技能光翼共奏额外造成的震谐伤害次数提升至10次。",
        enabledNote: "光翼共奏震谐伤害次数：5次 → 10次",
        defaultValue: false,
        showWhen: { key: "resonanceMode", value: "震谐" },
        group: "震谐"
      },
      // ── 聚爆模态专属 ──
      {
        key: "jubaoTrackStacks",
        type: "slider",
        label: "聚爆轨迹层数",
        defaultValue: 1,
        min: 1,
        max: 30,
        suffix: "层",
        showWhen: { key: "resonanceMode", value: "聚爆" },
        group: "聚爆"
      },
      {
        key: "jubaoEffectStacks",
        type: "slider",
        label: "聚爆效应层数",
        defaultValue: 0,
        min: 0,
        max: 13,
        suffix: "层",
        showWhen: { key: "resonanceMode", value: "聚爆" },
        group: "聚爆"
      },
      {
        key: "xingchenJubaoEnabled",
        type: "checkbox",
        label: "星屑共振·聚爆",
        description: "共鸣技能光翼共奏引爆的【聚爆效应】，对【聚爆效应】主目标的伤害倍率额外提升200%，该倍率提升效果与聚爆轨迹的倍率提升效果相互叠加。",
        enabledNote: "聚爆效应主目标伤害倍率 +200%",
        defaultValue: false,
        showWhen: { key: "resonanceMode", value: "聚爆" },
        group: "聚爆"
      }
    ],
    groups: [
      { name: "震谐", bgClass: "bg-yellow-50", showWhen: { key: "resonanceMode", value: "震谐" } },
      { name: "聚爆", bgClass: "bg-orange-50", showWhen: { key: "resonanceMode", value: "聚爆" } }
    ],
    passiveSkillFilter: [
      { stateKey: "resonanceMode", stateValue: "震谐", excludeSkillNameContains: "聚爆" },
      { stateKey: "resonanceMode", stateValue: "聚爆", excludeSkillNameContains: "震谐" }
    ],
  },

  chainBonuses: [
    {
      level: 0,
      description: "无链度加成。",
    },
    {
      level: 1,
      description: "即刻响应状态下，重击·爱弥斯、重击·机兵暴击伤害提升300%，且蓄力期间可牵引周围的目标。\n爱弥斯满足以下条件超过4秒时，获得即刻响应·辉芒状态。\n·处于非战斗状态。\n·未处于重击·爱弥斯、重击·机兵、共鸣解放星辉破界而来·终结施放状态。\n即刻响应·辉芒拥有即刻响应的所有效果，且即刻响应·辉芒不会因星辉破界而来·于此释放状态结束而移除。\n处于即刻响应·辉芒状态且不处于星辉破界而来·于此释放状态，施放重击·爱弥斯·二段蓄力或重击·机兵·二段蓄力时，可获得100点【同步率】。\n处于共鸣模态·震谐/共鸣模态·聚爆时，爱弥斯自身施放的技能直接造成的伤害击败被附加震谐轨迹/聚爆轨迹状态的敌人时，获得轨迹封存·震谐/轨迹封存·聚爆状态，持续10秒。\n轨迹封存·震谐/轨迹封存·聚爆状态下保留击败目标被附加震谐轨迹/聚爆轨迹的最高层数。\n爱弥斯下一次自身施放的技能直接造成的伤害立即为命中目标附加对应层数的震谐轨迹/聚爆轨迹，最高可叠加至当前目标的震谐轨迹/聚爆轨迹层数上限，同时清除轨迹封存·震谐/轨迹封存·聚爆状态，1秒内无法再次获得轨迹封存·震谐/轨迹封存·聚爆。",
      effectSummary: "重击（爱弥斯/机兵）暴击伤害 +300%",
    },
    {
      level: 2,
      description: "共鸣技能光翼共奏·降临的伤害倍率提升100%。\n共鸣技能光翼共奏·登台的伤害倍率提升100%。\n处于共鸣模态·震谐，共鸣技能光翼共奏额外造成的震谐伤害命中目标时，使目标受到共鸣技能光翼共奏额外造成的震谐伤害倍率提升20%，持续1秒，最多叠加5层。\n处于共鸣模态·聚爆获得以下强化：\n·星屑共振状态对共鸣技能光翼共奏引爆的【聚爆效应】伤害倍率提升效果增强，对【聚爆效应】主目标的伤害倍率提升效果提升至400%。\n·聚爆轨迹对共鸣技能光翼共奏引爆的【聚爆效应】伤害倍率提升效果增强，每层对【聚爆效应】主目标的伤害倍率提升效果提升至15%。\n·处于战斗状态，队伍中登场角色附近的敌人被击败时，立即根据【聚爆效应】层数上限引爆【聚爆效应】。",
      effectSummary: "光翼共奏·登台/降临倍率+100%；震谐追加伤害逐次提升(×1.0→×1.8)；聚爆星屑共振主目标倍率提升至400%；聚爆轨迹每层提升15%",
    },
    {
      level: 3,
      description: "共鸣解放星辉破界而来·终结的伤害倍率提升100%。\n共鸣解放星辉破界而来·过载的伤害倍率提升40%。\n处于即刻响应状态，施放重击·爱弥斯、重击·机兵时，根据自身处于共鸣模态·震谐/共鸣模态·聚爆，为附近目标附加【震谐·偏移】/【聚爆效应】。\n固有技能星与星之间替换为以下效果：\n·处于共鸣模态·震谐时，队伍中的角色附加【震谐·偏移】或造成震谐伤害时，爱弥斯暴击伤害提升60%，共鸣解放星辉破界而来·终结伤害加深25%。角色编入队伍或切换模态时，重置该效果。\n·处于共鸣模态·聚爆时，队伍中的角色附加【聚爆效应】时，爱弥斯暴击伤害提升60%，共鸣解放星辉破界而来·终结伤害加深25%。角色编入队伍或切换模态时，重置该效果。",
      effectSummary: "共鸣解放·终结倍率+100%；共鸣解放·过载倍率+40%；星与星之间·震谐/聚爆达到最高层数（暴击伤害+60%，终结伤害加深+25%）",
    },
    {
      level: 4,
      description: "施放变奏技能以旋律穿越长空、变奏技能携星辉降临于此、共鸣技能合击·突刺、共鸣技能光翼共奏时，队伍中的角色全属性伤害加成提升20%，持续30秒。",
      effectSummary: "全属性伤害加成 +20%",
    },
    {
      level: 5,
      description: "爱弥斯自身技能直接造成的伤害击败目标时，【流溢辉光】重置为100%。\n爱弥斯受到致命伤害时，将失去意识并进入二维电子幽灵状态，持续5秒。\n进入二维电子幽灵状态时，为队伍中的角色提供爱弥斯360%攻击的护盾，持续5秒。退出二维电子幽灵状态时，爱弥斯将恢复意识并回复100%生命值与30点共鸣能量。该效果每10分钟可触发1次。\n爱弥斯恢复意识时，退出二维电子幽灵状态并移除该效果提供的护盾。",
      effectSummary: "（生存/辅助效果，不影响伤害计算）",
    },
    {
      level: 6,
      description: "目标受到爱弥斯的共鸣解放伤害提升40%。\n处于共鸣模态·震谐时，爱弥斯的震谐伤害可暴击，暴击固定为80%，暴击伤害固定为275%。\n处于共鸣模态·聚爆，并处于战斗状态，队伍中登场角色附近的敌人受到聚爆效应触发的伤害可暴击，暴击固定为80%，暴击伤害固定为275%。\n共鸣回路为寂静赋形为目标附加震谐轨迹、聚爆轨迹层数翻倍。\n处于共鸣模态·震谐/共鸣模态·聚爆，并处于战斗状态，队伍中登场角色附近的敌人震谐轨迹/聚爆轨迹层数上限提升至60层。爱弥斯施放共鸣技能光翼共奏期间，对范围内目标附加10层震谐轨迹/聚爆轨迹，持续30秒。",
      effectSummary: "共鸣解放受到伤害 ×1.4；震谐伤害/效应伤害可暴击（固定80%暴击率，275%暴击伤害，计算取暴击值）；轨迹层数上限×2",
    },
  ],

  damagePlugin: aimisiPlugin,
};
