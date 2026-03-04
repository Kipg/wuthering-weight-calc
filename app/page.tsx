"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { CHARACTERS, WEAPONS, ECHO_DATA, ECHO_SETS } from "@/data";
import { calculateCombatStats, calculateDamage, calculateRotationDamage } from "@/lib/damageCalculator";
import { Character, Weapon, Echo, CharacterSkill, DamageType, SkillCategory } from "@/types";
import { getCharacterImagePath, getWeaponImagePath, getEchoImagePath } from "@/lib/imageHelper";
import { getAllEchoSetNames } from "@/lib/echoSetHelper";
import { analyzeSubStatWeights, formatSubStatValue, SubStatWeightResult } from "@/lib/substatWeightAnalyzer";
import { ConditionalUIRenderer } from "./components/ConditionalUIRenderer";
import { PieChart, Legend } from "./components/PieChart";
import { CharacterCard } from "./components/CharacterCard";
import { WeaponCard } from "./components/WeaponCard";
import { EchoCard } from "./components/EchoCard";

export default function Home() {
  // 状态管理
  const [showInfo, setShowInfo] = useState(false);
  const [showCharSelect, setShowCharSelect] = useState(false);
  const [showWeaponSelect, setShowWeaponSelect] = useState(false);
  const [charSearch, setCharSearch] = useState("");
  const [weaponSearch, setWeaponSearch] = useState("");
  
  const [selectedCharName, setSelectedCharName] = useState("卡提希娅");
  const [charLevel, setCharLevel] = useState(90);
  const [selectedWeaponName, setSelectedWeaponName] = useState("不屈命定之冠");
  const [weaponLevel, setWeaponLevel] = useState(90);
  const [weaponResonance, setWeaponResonance] = useState(1);
  
  const [skillRotation, setSkillRotation] = useState<Array<{
    skillName: string; 
    count: number; 
    critMode: "期望"|"暴击"|"不暴击";
    type?: "skill" | "zhenxieInterference"; // skill为普通技能，zhenxieInterference为震谐干涉标记
  }>>([]);
  const [showRotationConfig, setShowRotationConfig] = useState(false);
  const [viewMode, setViewMode] = useState<"技能名字"|"伤害类型"|"技能类型">("技能名字");
  const [damageViewMode, setDamageViewMode] = useState<"期望"|"暴击"|"不暴击">("期望");
  const [expandedSkillDetails, setExpandedSkillDetails] = useState<Set<string>>(new Set());
  const [showSkillDetailList, setShowSkillDetailList] = useState(true);
  // 乘区展开状态
  const [expandedMultiplier, setExpandedMultiplier] = useState<string | null>(null);
  
  // 角色效应层数状态（如风蚀效应等，key 从角色 effectStacks 字段同步）
  const [effectStacks, setEffectStacks] = useState<Record<string, number>>({});

  // 怪物配置（等级、元素抗性）
  const [targetLevel, setTargetLevel] = useState(100);
  const [enemyResistance, setEnemyResistance] = useState(10); // 百分比整数，如 10 = 10%

  // 额外加成（手动添加到各乘区）
  const [extraBonuses, setExtraBonuses] = useState<Array<{
    id: number;
    zone: "倍率提升" | "伤害加深" | "伤害加成" | "无视防御" | "无视抗性";
    value: number; // 百分比，如 30 = 30%
    label: string;
    filterMode: "all" | "byCategory" | "byName";
    filterValues: string[];
  }>>([]);
  const [extraBonusCounter, setExtraBonusCounter] = useState(1);

  // 角色专属特殊状态（从角色文件的 specialConfig 动态读取 key/defaultValue，统一存放）
  const [characterSpecialStates, setCharacterSpecialStates] = useState<Record<string, string | number | boolean>>({});
  
  // 技能等级状态（按技能类别存储，1-10级）
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({
    "常态攻击": 10,
    "共鸣技能": 10,
    "共鸣回路": 10,
    "共鸣解放": 10,
    "变奏技能": 10
  });
  
  // 声骸套装开关状态
  const [echoSetEnabled, setEchoSetEnabled] = useState<Record<string, { piece2?: boolean; piece3?: boolean; piece5?: boolean }>>({});
  
  // 配置管理相关状态
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configAction, setConfigAction] = useState<'save' | 'load'>('save');
  const [configName, setConfigName] = useState('');
  const [savedConfigs, setSavedConfigs] = useState<Array<{name: string; timestamp: number}>>([]);
  
  // 副词条权重分析状态
  const [showSubStatWeight, setShowSubStatWeight] = useState(false);
  const [subStatWeightMode, setSubStatWeightMode] = useState<'empty' | 'current'>('empty'); // empty: 空白 current: 当前声骸
  const [subStatWeights, setSubStatWeights] = useState<SubStatWeightResult[]>([]);
  
  // 声骸状态
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [selectedEchoIndex, setSelectedEchoIndex] = useState<number | null>(null);
  const [showEchoSelect, setShowEchoSelect] = useState(false);
  const [echoFilterCost, setEchoFilterCost] = useState<number | null>(null);
  const [echoFilterSet, setEchoFilterSet] = useState<string>("");
  
  // 队友配置状态（允许undefined以支持删除队友）
  const [teammates, setTeammates] = useState<Array<{characterName: string; enabledOutro: boolean; enabledPassives: boolean[]} | undefined>>([]);
  const [selectedTeammateIndex, setSelectedTeammateIndex] = useState<number | null>(null);
  const [showTeammateSelect, setShowTeammateSelect] = useState(false);
  const [teammateSearch, setTeammateSearch] = useState("");
  
  // 角色和武器数据状态（包括技能开关）
  const [character, setCharacter] = useState<Character | null>(null);
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  
  // 当角色或等级变化时更新
  useMemo(() => {
    const char = CHARACTERS[selectedCharName as keyof typeof CHARACTERS];
    if (!char) {
      setCharacter(null);
      return;
    }
    // 深拷贝以便修改开关和技能等级
    const newChar = {
      ...char,
      baseStats: {
        ...char.baseStats,
        level: charLevel
      },
      passiveSkills: char.passiveSkills.map(skill => ({ ...skill })),
      skills: char.skills.map(skill => ({
        ...skill,
        skillLevel: skillLevels[skill.skillCategory] || skill.skillLevel
      }))
    };
    setCharacter(newChar);
    
    // 同步角色的effectStacks到页面状态
    if (newChar.effectStacks) {
      setEffectStacks(prev => {
        const newStacks: Record<string, number> = {};
        Object.keys(newChar.effectStacks!).forEach(key => {
          newStacks[key] = prev[key] !== undefined ? prev[key] : 0;
        });
        return newStacks;
      });
    }

    // 同步角色的 specialConfig 默认值到 characterSpecialStates
    if (newChar.specialConfig) {
      setCharacterSpecialStates(prev => {
        const next: Record<string, string | number | boolean> = {};
        newChar.specialConfig!.controls.forEach(ctrl => {
          // 切换角色时保留同名 key 的旧值，防止切回同角色丢失状态
          next[ctrl.key] = prev[ctrl.key] !== undefined ? prev[ctrl.key] : ctrl.defaultValue;
        });
        return next;
      });
    } else {
      setCharacterSpecialStates({});
    }
  }, [selectedCharName, charLevel, skillLevels]);
  
  // 当武器或等级/谐振变化时更新
  useMemo(() => {
    const weap = WEAPONS[selectedWeaponName as keyof typeof WEAPONS];
    if (!weap) {
      setWeapon(null);
      return;
    }
    // 深拷贝以便修改开关
    setWeapon({
      ...weap,
      baseStats: {
        ...weap.baseStats,
        weaponLevel: weaponLevel,
        resonanceLevel: weaponResonance
      },
      skill: {
        ...weap.skill,
        effects: weap.skill.effects.map((effect: any) => ({ ...effect }))
      }
    });
  }, [selectedWeaponName, weaponLevel, weaponResonance]);

  // 计算所有声骸套装数量（不管是否启用）
  const echoSetCounts = useMemo(() => {
    const setCounts: Record<string, number> = {};
    echoes.forEach(echo => {
      if (echo.selectedSet) {
        setCounts[echo.selectedSet] = (setCounts[echo.selectedSet] || 0) + 1;
      }
    });
    return setCounts;
  }, [echoes]);

  // 计算当前激活的声骸套装（用于实际战斗计算）
  const activeEchoSets = useMemo(() => {
    const activeSets: Record<string, number> = {};
    Object.entries(echoSetCounts).forEach(([setName, count]) => {
      // 只要有任意件套效果启用，就加入activeSets
      const enabled = echoSetEnabled[setName];
      const hasAnyEnabled = !enabled || 
        enabled.piece2 !== false || 
        enabled.piece3 !== false || 
        enabled.piece5 !== false;
      if (hasAnyEnabled) {
        activeSets[setName] = count;
      }
    });
    return activeSets;
  }, [echoSetCounts, echoSetEnabled]);

  // 计算队友配置（转换为完整的Character对象）
  const teammateConfigs = useMemo(() => {
    return teammates
      .filter(tm => tm != null) // 过滤掉undefined和null
      .map(tm => {
        const char = CHARACTERS[tm.characterName as keyof typeof CHARACTERS];
        if (!char) return null;
        return {
          characterName: tm.characterName,
          character: char,
          enabledOutro: tm.enabledOutro,
          enabledPassives: tm.enabledPassives
        };
      })
      .filter(Boolean) as any[];
  }, [teammates]);

  // 计算战斗面板
  const combatStats = useMemo(() => {
    if (!character || !weapon) return null;
    return calculateCombatStats({
      character,
      weapon,
      echoes,
      activeEchoSets,
      echoSetEnabled,
      targetLevel,
      enemyResistance: enemyResistance / 100,
      selectedSkill: character.skills[0],
      critMode: "期望",
      effectStacks,
      teammates: teammateConfigs,
    });
  }, [character, weapon, echoes, activeEchoSets, echoSetEnabled, effectStacks, teammateConfigs, targetLevel, enemyResistance]);

  // 计算技能轮换伤害
  const rotationDamage = useMemo(() => {
    if (!character || !weapon || skillRotation.length === 0) return null;
    
    // 构建技能流程，并跟踪震谐干涉标记状态
    let hasZhenxieInterferenceActive = false;
    const rotation = skillRotation.map(item => {
      // 如果是震谐干涉标记，设置标记为激活状态
      if (item.type === "zhenxieInterference") {
        hasZhenxieInterferenceActive = true;
        return null; // 震谐干涉标记本身不产生伤害
      }
      
      const skill = character.skills.find((s: CharacterSkill) => s.name === item.skillName);
      // 使用全局伤害模式覆盖，并传递当前的震谐干涉标记状态
      return skill ? { 
        ...item, 
        critMode: damageViewMode, 
        skill,
        hasZhenxieInterference: hasZhenxieInterferenceActive 
      } : null;
    }).filter(Boolean) as Array<{ 
      skillName: string; 
      count: number; 
      critMode: "期望"|"暴击"|"不暴击"; 
      skill: CharacterSkill;
      hasZhenxieInterference: boolean;
    }>;

    if (rotation.length === 0) return null;

    const results = rotation.map(item => {
      const dmg = calculateDamage({
        character,
        weapon,
        echoes,
        activeEchoSets,
        echoSetEnabled,
        targetLevel,
        enemyResistance: enemyResistance / 100,
        selectedSkill: item.skill,
        critMode: item.critMode,
        effectStacks,
        teammates: teammateConfigs,
        extraBonuses: extraBonuses.map(b => ({ ...b, value: b.value / 100 })),
        aimisiConfig: character.baseStats.name === "爱弥斯" ? {
          resonanceMode: (characterSpecialStates["resonanceMode"] as "震谐" | "聚爆") ?? "震谐",
          zhenxieTrackStacks: (characterSpecialStates["zhenxieTrackStacks"] as number) ?? 0,
          xingchenZhenxieEnabled: (characterSpecialStates["xingchenZhenxieEnabled"] as boolean) ?? false,
          hasZhenxieInterference: item.hasZhenxieInterference, // 使用技能流程中的震谐干涉标记状态
          jubaoTrackStacks: (characterSpecialStates["jubaoTrackStacks"] as number) ?? 1,
          jubaoEffectStacks: (characterSpecialStates["jubaoEffectStacks"] as number) ?? 0,
          xingchenJubaoEnabled: (characterSpecialStates["xingchenJubaoEnabled"] as boolean) ?? false
        } : undefined
      });
      return {
        skillName: item.skillName,
        count: item.count,
        critMode: item.critMode,
        skill: item.skill,
        singleDamage: dmg.finalDamage,
        totalDamage: dmg.finalDamage * item.count,
        damageDetail: dmg
      };
    });

    const totalDamage = results.reduce((sum, r) => sum + r.totalDamage, 0);

    return {
      results,
      totalDamage
    };
  }, [character, weapon, echoes, skillRotation, activeEchoSets, echoSetEnabled, damageViewMode, effectStacks, teammateConfigs, targetLevel, enemyResistance, extraBonuses, characterSpecialStates]);

  // 饼图数据
  const pieChartData = useMemo(() => {
    if (!rotationDamage) return [];
    
    if (viewMode === "技能名字") {
      const grouped = new Map<string, number>();
      rotationDamage.results.forEach(r => {
        const current = grouped.get(r.skillName) || 0;
        grouped.set(r.skillName, current + r.totalDamage);
      });
      
      const colorPalette = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#a855f7"];
      let colorIndex = 0;
      
      return Array.from(grouped.entries()).map(([name, value]) => ({
        name,
        value,
        color: colorPalette[colorIndex++ % colorPalette.length]
      }));
    } else if (viewMode === "伤害类型") {
      const grouped = new Map<DamageType, number>();
      rotationDamage.results.forEach(r => {
        const current = grouped.get(r.skill.damageType) || 0;
        grouped.set(r.skill.damageType, current + r.totalDamage);
      });
      
      const colors: Record<string, string> = {
        "普攻": "#3b82f6",
        "重击": "#8b5cf6",
        "共鸣技能": "#ec4899",
        "共鸣解放": "#f59e0b",
        "效应伤害": "#FF6347",
        "震谐伤害": "#FFD700",
        "治疗": "#22c55e",
        "无伤害": "#6b7280"
      };
      
      return Array.from(grouped.entries()).map(([type, value]) => ({
        name: type,
        value,
        color: colors[type] || "#6b7280"
      }));
    } else {
      // 技能类型（skillCategory）
      const grouped = new Map<SkillCategory, number>();
      rotationDamage.results.forEach(r => {
        const current = grouped.get(r.skill.skillCategory) || 0;
        grouped.set(r.skill.skillCategory, current + r.totalDamage);
      });
      
      const colors: Record<string, string> = {
        "常态攻击": "#3b82f6",
        "共鸣技能": "#8b5cf6",
        "共鸣回路": "#ec4899",
        "共鸣解放": "#f59e0b",
        "变奏技能": "#10b981"
      };
      
      return Array.from(grouped.entries()).map(([category, value]) => ({
        name: category,
        value,
        color: colors[category] || "#6b7280"
      }));
    }
  }, [rotationDamage, viewMode]);

  // 加载已保存的配置列表
  useEffect(() => {
    try {
      const configsJson = localStorage.getItem('wuthering-waves-configs');
      if (configsJson) {
        const configs = JSON.parse(configsJson);
        setSavedConfigs(configs);
      }
    } catch (error) {
      console.error('加载配置列表失败', error);
    }
  }, []);

  // 保存配置到localStorage
  const saveConfiguration = (name: string) => {
    if (!name.trim()) {
      alert('请输入配置名称！');
      return;
    }
    
    const config = {
      selectedCharName,
      charLevel,
      selectedWeaponName,
      weaponLevel,
      weaponResonance,
      echoes,
      skillRotation,
      effectStacks,
      echoSetEnabled,
      skillLevels,
      timestamp: Date.now()
    };
    
    try {
      // 保存配置到对应的key
      localStorage.setItem(`wuthering-config-${name}`, JSON.stringify(config));
      
      // 更新配置列表
      const configsJson = localStorage.getItem('wuthering-waves-configs');
      let configs = configsJson ? JSON.parse(configsJson) : [];
      
      // 如果配置名已存在，更新时间戳；否则添加新配置
      const existingIndex = configs.findIndex((c: any) => c.name === name);
      if (existingIndex >= 0) {
        configs[existingIndex].timestamp = Date.now();
      } else {
        configs.push({ name, timestamp: Date.now() });
      }
      
      localStorage.setItem('wuthering-waves-configs', JSON.stringify(configs));
      setSavedConfigs(configs);
      
      alert(`配置 "${name}" 已保存！`);
      setShowConfigModal(false);
      setConfigName('');
    } catch (error) {
      alert('保存配置失败！');
      console.error(error);
    }
  };

  // 从localStorage加载配置
  const loadConfiguration = (name: string) => {
    try {
      const savedConfig = localStorage.getItem(`wuthering-config-${name}`);
      if (!savedConfig) {
        alert('配置不存在！');
        return;
      }
      const config = JSON.parse(savedConfig);
      setSelectedCharName(config.selectedCharName);
      setCharLevel(config.charLevel);
      setSelectedWeaponName(config.selectedWeaponName);
      setWeaponLevel(config.weaponLevel);
      setWeaponResonance(config.weaponResonance);
      setEchoes(config.echoes || []);
      setSkillRotation(config.skillRotation || []);
      setEffectStacks(config.effectStacks || {});
      setEchoSetEnabled(config.echoSetEnabled || {});
      setSkillLevels(config.skillLevels || {
        "常态攻击": 10,
        "共鸣技能": 10,
        "共鸣回路": 10,
        "共鸣解放": 10,
        "变奏技能": 10
      });
      alert(`配置 "${name}" 已加载！`);
      setShowConfigModal(false);
    } catch (error) {
      alert('加载配置失败！');
      console.error(error);
    }
  };
  
  // 删除配置
  const deleteConfiguration = (name: string) => {
    if (!confirm(`确定要删除配置 "${name}" 吗？`)) {
      return;
    }
    
    try {
      localStorage.removeItem(`wuthering-config-${name}`);
      
      const configsJson = localStorage.getItem('wuthering-waves-configs');
      if (configsJson) {
        const configs = JSON.parse(configsJson);
        const newConfigs = configs.filter((c: any) => c.name !== name);
        localStorage.setItem('wuthering-waves-configs', JSON.stringify(newConfigs));
        setSavedConfigs(newConfigs);
      }
      
      alert(`配置 "${name}" 已删除！`);
    } catch (error) {
      alert('删除配置失败！');
      console.error(error);
    }
  };

  if (!character || !weapon || !combatStats) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white">      <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/30 via-transparent to-blue-100/20 pointer-events-none"></div>
      {/* 左上角 Logo */}
      <div className="absolute top-4 left-4 z-10">
        <Image
          src="/xixi.gif"
          alt="xixi"
          width={80}
          height={80}
          className="rounded-lg"
          priority
        />
      </div>

      {/* 标题 - 在 logo 右侧 */}
      <div className="absolute top-8 left-28 z-10">
        <h1 className="text-4xl font-bold text-gray-800 drop-shadow-sm">
          鸣潮小工具
        </h1>
      </div>

      {/* 保存/加载配置按钮 - 在右上角 */}
      <div className="absolute top-8 right-8 z-50 flex gap-2">
        <button
          onClick={() => {
            setConfigAction('save');
            setShowConfigModal(true);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          保存配置
        </button>
        <button
          onClick={() => {
            setConfigAction('load');
            setShowConfigModal(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          加载配置
        </button>
      </div>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 pt-28 pb-12 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* 角色和武器信息卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 角色卡片 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">角色信息</h2>
                <button
                  onClick={() => setShowCharSelect(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  选择角色
                </button>
              </div>
              <div className="flex gap-4">
                <CharacterCard
                  name={character.baseStats.name}
                  imageKey={character.baseStats.imageKey || ''}
                  rarity={character.baseStats.rarity}
                  elementType={character.baseStats.elementType}
                  variant="display"
                />
                <div className="flex-1 space-y-5 text-gray-700">
                  <p><span className="font-semibold">名称：</span>{character.baseStats.name}</p>
                  <p><span className="font-semibold">稀有度：</span>{character.baseStats.rarity}星</p>
                  <p><span className="font-semibold">元素：</span>{character.baseStats.elementType}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">等级：</span>
                    <select
                      value={charLevel}
                      onChange={(e) => setCharLevel(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                    >
                      {character.baseStats.levelList.map((lv: number) => (
                        <option key={lv} value={lv}>{lv}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* 技能等级调整 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">技能等级</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["常态攻击", "共鸣技能", "共鸣回路", "共鸣解放", "变奏技能"].map(category => (
                    <div key={category} className="flex items-center gap-2">
                      <label className="flex-1 text-sm font-medium text-gray-700">{category}：</label>
                      <select
                        value={skillLevels[category]}
                        onChange={(e) => {
                          const newLevel = Number(e.target.value);
                          setSkillLevels({
                            ...skillLevels,
                            [category]: newLevel
                          });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded bg-white text-sm w-16"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 角色效应层数 */}
              {character.effectStacks && Object.keys(character.effectStacks).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">效应层数</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(character.effectStacks).filter(([_, value]) => value !== undefined).map(([effectType, _]) => (
                      <div key={effectType} className="flex items-center gap-2">
                        <label className="flex-1 text-sm font-medium text-gray-700">{effectType}：</label>
                        <select
                          value={effectStacks[effectType] || 0}
                          onChange={(e) => setEffectStacks({
                            ...effectStacks,
                            [effectType]: Number(e.target.value)
                          })}
                          className="px-2 py-1 border border-gray-300 rounded bg-white text-sm w-20"
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <option key={num} value={num}>{num}层</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 角色特殊配置（从 character.specialConfig 动态读取） */}
              {character.specialConfig && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {character.specialConfig.sectionTitle && (
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{character.specialConfig.sectionTitle}</h3>
                  )}
                  {/* radio 控件（未分组） */}
                  {character.specialConfig.controls
                    .filter(ctrl => ctrl.type === "radio" && !ctrl.group)
                    .map(ctrl => (
                      <div key={ctrl.key} className="flex gap-2 mb-4">
                        {ctrl.options?.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setCharacterSpecialStates(prev => ({ ...prev, [ctrl.key]: opt.value }))}
                            className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-medium ${
                              characterSpecialStates[ctrl.key] === opt.value
                                ? (opt.activeClass ?? "bg-blue-500 text-white shadow-lg")
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    ))
                  }
                  {/* 分组控件 */}
                  {character.specialConfig.groups?.map(grp => {
                    const visible = !grp.showWhen ||
                      characterSpecialStates[grp.showWhen.key] === grp.showWhen.value;
                    if (!visible) return null;
                    const groupControls = character.specialConfig!.controls.filter(
                      ctrl => ctrl.group === grp.name
                    );
                    return (
                      <div key={grp.name} className={`space-y-3 ${grp.bgClass} p-3 rounded-lg`}>
                        {groupControls.map(ctrl => {
                          if (ctrl.type === "slider") {
                            const val = (characterSpecialStates[ctrl.key] as number) ?? (ctrl.defaultValue as number);
                            return (
                              <div key={ctrl.key} className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">{ctrl.label}：</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="range"
                                    min={ctrl.min}
                                    max={ctrl.max}
                                    value={val}
                                    onChange={(e) => setCharacterSpecialStates(prev => ({ ...prev, [ctrl.key]: Number(e.target.value) }))}
                                    className="w-32"
                                  />
                                  <span className="text-sm font-bold text-gray-800 min-w-[50px]">{val}{ctrl.suffix}</span>
                                </div>
                              </div>
                            );
                          }
                          if (ctrl.type === "checkbox") {
                            const checked = (characterSpecialStates[ctrl.key] as boolean) ?? (ctrl.defaultValue as boolean);
                            return (
                              <div key={ctrl.key} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium text-gray-700">{ctrl.label}：</label>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => setCharacterSpecialStates(prev => ({ ...prev, [ctrl.key]: e.target.checked }))}
                                    className="w-4 h-4 rounded"
                                  />
                                </div>
                                {ctrl.description && (
                                  <p className="text-xs text-gray-600 leading-relaxed">{ctrl.description}</p>
                                )}
                                {checked && ctrl.enabledNote && (
                                  <div className="mt-2 p-2 bg-white/60 rounded text-xs border border-gray-300">
                                    <span className="font-semibold">✓ 已启用：</span>
                                    <span> {ctrl.enabledNote}</span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
                  
              {/* 角色固有技能 */}
              {character.passiveSkills && character.passiveSkills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800">固有技能</h3>
                  {character.passiveSkills
                    .filter((skill: any) => {
                      // 根据 specialConfig.passiveSkillFilter 泛化过滤固有技能
                      if (character.specialConfig?.passiveSkillFilter) {
                        for (const rule of character.specialConfig.passiveSkillFilter) {
                          if (
                            characterSpecialStates[rule.stateKey] === rule.stateValue &&
                            skill.name.includes(rule.excludeSkillNameContains)
                          ) return false;
                        }
                      }
                      return true;
                    })
                    .map((skill: any) => {
                      // 找到技能在原始数组中的索引
                      const originalIdx = character.passiveSkills.findIndex((s: any) => s.name === skill.name);
                      return (
                    <div key={skill.name} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{skill.name}</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-sm text-gray-600">启用</span>
                          <input 
                            type="checkbox" 
                            checked={skill.enabled}
                            onChange={(e) => {
                              if (character) {
                                const newChar = { ...character };
                                newChar.passiveSkills[originalIdx] = { ...skill, enabled: e.target.checked };
                                setCharacter(newChar);
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </label>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{skill.description}</p>
                      
                      {/* ConditionalUI组件 - 显示条件控制UI（如层数slider） */}
                      {skill.conditionalUI && skill.enabled && (
                        <ConditionalUIRenderer
                          skill={skill}
                          value={effectStacks[skill.conditionalUI.stateKey] || 0}
                          onChange={(value) => {
                            setEffectStacks({ ...effectStacks, [skill.conditionalUI!.stateKey]: value });
                          }}
                        />
                      )}
                      
                      {/* 只在技能启用时显示效果 */}
                      {skill.enabled && skill.effects && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <span className="font-medium text-blue-800">效果：</span>
                          <div className="mt-1 space-y-1">
                            {skill.effects.statBonus && (
                              <div className="text-blue-700">
                                {Object.entries(skill.effects.statBonus).map(([key, value]) => (
                                  <span key={key} className="block">{key}: +{(value as number * 100).toFixed(0)}%</span>
                                ))}
                              </div>
                            )}
                            {skill.effects.conditional && skill.conditionalUI && (
                              <div className="text-blue-700">
                                条件: {skill.effects.conditional.condition}
                                <span className="block mt-1">
                                  当前层数: {effectStacks[skill.conditionalUI.stateKey] || 0}层
                                </span>
                                <span className="block mt-1">
                                  当前效果: +{(skill.effects.conditional.values[effectStacks[skill.conditionalUI.stateKey] || 0] * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                    })}
                </div>
              )}
            </div>

            {/* 武器卡片 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">武器信息</h2>
                <button
                  onClick={() => setShowWeaponSelect(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  选择武器
                </button>
              </div>
              <div className="flex gap-4">
                <WeaponCard
                  name={weapon.baseStats.name}
                  imageKey={weapon.baseStats.imageKey || ''}
                  rarity={weapon.baseStats.rarity}
                  weaponType={weapon.baseStats.weaponType}
                  variant="display"
                />
                <div className="flex-1 space-y-2 text-gray-700">
                  <p><span className="font-semibold">名称：</span>{weapon.baseStats.name}</p>
                  <p><span className="font-semibold">稀有度：</span>{weapon.baseStats.rarity}星</p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">等级：</span>
                    <select
                      value={weaponLevel}
                      onChange={(e) => setWeaponLevel(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                    >
                      {weapon.baseStats.levelList.map((lv: number) => (
                        <option key={lv} value={lv}>{lv}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">谐振：</span>
                    <select
                      value={weaponResonance}
                      onChange={(e) => setWeaponResonance(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(r => (
                        <option key={r} value={r}>{r}级</option>
                      ))}
                    </select>
                  </div>
                  {/* 武器属性 */}
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <p className="text-sm">
                      <span className="font-semibold">基础攻击：</span>
                      <span className="text-blue-600">{(() => {
                        const levelIndex = weapon.baseStats.levelList.indexOf(weaponLevel);
                        return Math.round(weapon.baseStats.baseATKList[levelIndex]);
                      })()}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">{weapon.baseStats.secondaryStatType}：</span>
                      <span className="text-blue-600">
                        {(() => {
                          const levelIndex = weapon.baseStats.levelList.indexOf(weaponLevel);
                          const value = weapon.baseStats.secondaryStatList[levelIndex];
                          return (value * 100).toFixed(1) + '%';
                        })()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 武器技能 */}
              {weapon.skill && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">武器技能</h3>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{weapon.skill.name}</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-sm text-gray-600">启用</span>
                        <input 
                          type="checkbox" 
                          checked={weapon.skill.enabled}
                          onChange={(e) => {
                            if (weapon) {
                              const newWeapon = { ...weapon };
                              newWeapon.skill = { ...weapon.skill, enabled: e.target.checked };
                              setWeapon(newWeapon);
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </label>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">{weapon.skill.description}</p>
                    
                    {/* 只在技能启用时显示效果 */}
                    {weapon.skill.enabled && (
                      <div className="bg-blue-50 p-3 rounded space-y-2">
                        <div className="text-sm font-medium text-blue-800">当前技能加成（谐振{weaponResonance}级）:</div>
                        
                        {/* 显示当前角色效应层数 */}
                        {character && character.effectStacks && Object.keys(character.effectStacks).length > 0 && (
                          <div className="text-xs text-gray-600 mb-2 pb-2 border-b border-blue-200">
                            角色效应状态: {Object.entries(character.effectStacks).map(([type, _]) => 
                              `${type}${effectStacks[type] || 0}层`
                            ).join(', ')}
                          </div>
                        )}
                        
                        {weapon.skill.effects && weapon.skill.effects.map((effect: any, idx: number) => {
                          const baseValue = effect.valuesByResonance[weaponResonance - 1];
                          const effectiveStacks = effect.stacks ?? 1;
                          const value = baseValue * effectiveStacks;
                          let displayText = "";
                          let conditionMet = true;
                          
                          // 检查效应条件
                          if (effect.effectCondition) {
                            const reqStacks = effectStacks[effect.effectCondition.effectType] || 0;
                            conditionMet = reqStacks >= effect.effectCondition.minStacks;
                          }
                          
                          // 检查伤害类型限制
                          let damageTypeRestriction = "";
                          if (effect.affectedDamageTypes && effect.affectedDamageTypes.length > 0) {
                            damageTypeRestriction = ` [仅对${effect.affectedDamageTypes.join('、')}生效]`;
                          }
                          
                          if (effect.name.includes("生命")) {
                            displayText = `生命提升: +${(value * 100).toFixed(0)}%`;
                          } else if (effect.name.includes("攻击")) {
                            displayText = `攻击提升: +${(value * 100).toFixed(0)}%`;
                          } else if (effect.name.includes("全属性伤害")) {
                            displayText = `全属性伤害提升: +${(value * 100).toFixed(0)}%`;
                          } else if (effect.name.includes("无视防御") || effect.effect_Type === "无视防御") {
                            displayText = `无视防御: ${(value * 100).toFixed(0)}%`;
                          } else if ((effect.name.includes("无视") && effect.name.includes("抗性")) || effect.effect_Type === "无视抗性") {
                            displayText = `${effect.name}: ${(value * 100).toFixed(0)}%`;
                          } else if (effect.name.includes("伤害加深") || effect.effect_Type === "伤害加深") {
                            displayText = `伤害加深: +${(value * 100).toFixed(0)}%`;
                            if (effect.effectCondition) {
                              displayText += ` (需${effect.effectCondition.effectType}≥${effect.effectCondition.minStacks}层)`;
                            }
                          } else {
                            displayText = `${effect.name}: +${(value * 100).toFixed(1)}%`;
                          }
                          
                          const isEffectEnabled = effect.enabled !== false;
                          
                          return (
                            <div key={idx} className={`rounded p-2 border ${isEffectEnabled && conditionMet ? 'border-blue-200 bg-white' : 'border-gray-200 bg-gray-50'}`}>
                              {/* 效果名称 + 独立开关 */}
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-medium ${isEffectEnabled && conditionMet ? 'text-blue-800' : 'text-gray-400'}`}>
                                  {effect.name}
                                </span>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <span className="text-xs text-gray-500">启用</span>
                                  <input
                                    type="checkbox"
                                    checked={isEffectEnabled}
                                    onChange={(e) => {
                                      const newEffects = weapon.skill.effects.map((ef: any, i: number) =>
                                        i === idx ? { ...ef, enabled: e.target.checked } : ef
                                      );
                                      setWeapon({ ...weapon, skill: { ...weapon.skill, effects: newEffects } });
                                    }}
                                    className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                </label>
                              </div>
                              {/* 层数控件（仅当 maxStacks > 1 时显示） */}
                              {effect.maxStacks && effect.maxStacks > 1 && (
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-gray-500 whitespace-nowrap">层数:</span>
                                  <input
                                    type="range"
                                    min={1}
                                    max={effect.maxStacks}
                                    value={effectiveStacks}
                                    onChange={(e) => {
                                      const newEffects = weapon.skill.effects.map((ef: any, i: number) =>
                                        i === idx ? { ...ef, stacks: Number(e.target.value) } : ef
                                      );
                                      setWeapon({ ...weapon, skill: { ...weapon.skill, effects: newEffects } });
                                    }}
                                    className="flex-1 h-1.5 accent-blue-500"
                                  />
                                  <span className="text-xs font-bold text-blue-700 w-8 text-right">{effectiveStacks}/{effect.maxStacks}</span>
                                </div>
                              )}
                              {/* 数值展示 */}
                              <div className={`text-sm ${isEffectEnabled && conditionMet ? 'text-blue-700' : 'text-gray-400'}`}>
                                • {displayText}{damageTypeRestriction}
                                {!conditionMet && effect.effectCondition && (
                                  <span className="ml-2 text-xs text-red-500">(条件未满足)</span>
                                )}
                                {!isEffectEnabled && (
                                  <span className="ml-2 text-xs text-gray-400">(已禁用)</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 声骸配置 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">声骸配置</h2>
            
            {/* 套装统计和效果显示 */}
            <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-blue-600">套装效果</span>
              </h3>
              
              {Object.keys(echoSetCounts).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg mb-2">暂无装备套装</p>
                  <p className="text-gray-500 text-sm">请先在下方配置声骸</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(echoSetCounts).map(([setName, count]) => {
                    const setData = ECHO_SETS[setName];
                    if (!setData) return null;
                    
                    // 确保是对象格式，兼容旧的布尔值格式
                    const enabledState = (echoSetEnabled[setName] && typeof echoSetEnabled[setName] === 'object') 
                      ? echoSetEnabled[setName] 
                      : {};
                    
                    // 计算所有可能的套装效果
                    const allEffects = [];
                    if (setData.piece2) {
                      const enabled = enabledState.piece2 !== false; // 默认启用
                      allEffects.push({ level: 2, desc: setData.piece2, active: count >= 2, enabled });
                    }
                    if (setData.piece3) {
                      const enabled = enabledState.piece3 !== false; // 默认启用
                      allEffects.push({ level: 3, desc: setData.piece3, active: count >= 3, enabled });
                    }
                    if (setData.piece5) {
                      const enabled = enabledState.piece5 !== false; // 默认启用
                      allEffects.push({ level: 5, desc: setData.piece5, active: count >= 5, enabled });
                    }
                    
                    const hasAnyEnabled = allEffects.some(e => e.enabled);
                    
                    return (
                      <div 
                        key={setName} 
                        className={`bg-white p-4 rounded-lg border-2 transition-all ${
                          hasAnyEnabled ? 'border-blue-400 shadow-md' : 'border-gray-300 opacity-60'
                        }`}
                      >
                        {/* 套装标题 */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-bold text-gray-800 text-lg">{setName}</span>
                          <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                            count >= 5 ? 'bg-purple-100 text-purple-700' :
                            count >= 3 ? 'bg-blue-100 text-blue-700' :
                            count >= 2 ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            已装备 {count} 件
                          </span>
                        </div>
                        
                        {/* 套装效果列表 */}
                        <div className="space-y-2 pl-2">
                          {allEffects.map(effect => {
                            const isActivated = effect.active && effect.enabled;
                            const canActivate = effect.active && !effect.enabled;
                            
                            return (
                              <div 
                                key={effect.level} 
                                className={`flex items-start gap-2 p-2 rounded transition-all duration-300 ${
                                  isActivated ? 'bg-green-50 border-l-4 border-green-500' :
                                  canActivate ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                                  effect.active ? 'bg-gray-50 border-l-4 border-gray-300' :
                                  'bg-gray-50 border-l-4 border-gray-200'
                                }`}
                              >
                                <span className={`font-bold text-sm min-w-[60px] ${
                                  isActivated ? 'text-green-700' :
                                  canActivate ? 'text-yellow-700' :
                                  effect.active ? 'text-gray-600' :
                                  'text-gray-400'
                                }`}>
                                  {effect.level}件套:
                                </span>
                                <div className="flex-1">
                                  <p className={`text-sm leading-relaxed ${
                                    isActivated ? 'text-green-800 font-medium' :
                                    canActivate ? 'text-yellow-800' :
                                    effect.active ? 'text-gray-700' :
                                    'text-gray-400'
                                  }`}>
                                    {effect.desc}
                                  </p>
                                  {isActivated && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded-full">
                                      ✓ 生效中
                                    </span>
                                  )}
                                  {canActivate && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-600 text-white text-xs font-semibold rounded-full">
                                      ! 已禁用
                                    </span>
                                  )}
                                  {!effect.active && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-400 text-white text-xs rounded-full">
                                      未激活 (需{effect.level}件)
                                    </span>
                                  )}
                                </div>
                                {/* 独立开关 */}
                                <label className="flex items-center gap-2 cursor-pointer group ml-2">
                                  <span className={`text-xs font-medium transition-colors duration-200 ${
                                    effect.enabled ? 'text-blue-600' : 'text-gray-500'
                                  }`}>
                                    {effect.enabled ? '启用' : '禁用'}
                                  </span>
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      checked={effect.enabled}
                                      onChange={(e) => {
                                        const newEnabledState = { ...echoSetEnabled };
                                        // 确保是对象格式，兼容旧的布尔值格式
                                        if (!newEnabledState[setName] || typeof newEnabledState[setName] !== 'object') {
                                          newEnabledState[setName] = {};
                                        }
                                        if (effect.level === 2) {
                                          newEnabledState[setName].piece2 = e.target.checked;
                                        } else if (effect.level === 3) {
                                          newEnabledState[setName].piece3 = e.target.checked;
                                        } else if (effect.level === 5) {
                                          newEnabledState[setName].piece5 = e.target.checked;
                                        }
                                        setEchoSetEnabled(newEnabledState);
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-3 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all duration-300 peer-checked:bg-blue-600"></div>
                                  </div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* 5个声骸槽位横向显示 */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {[0, 1, 2, 3, 4].map(slotIndex => {
                const echo = echoes[slotIndex];
                const isSelected = selectedEchoIndex === slotIndex;
                
                return (
                  <div
                    key={slotIndex}
                    onClick={() => {
                      if (echo) {
                        // 如果点击已选中的声骸，则收回配置栏
                        if (isSelected) {
                          setSelectedEchoIndex(null);
                        } else {
                          setSelectedEchoIndex(slotIndex);
                        }
                      } else {
                        // 空槽位直接打开选择页面
                        setSelectedEchoIndex(slotIndex);
                        setShowEchoSelect(true);
                        setEchoFilterCost(null);
                        setEchoFilterSet("");
                      }
                    }}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-4 ring-green-400 rounded-lg' : 'hover:ring-2 hover:ring-blue-300 rounded-lg'
                    }`}
                  >
                    <div className={`bg-gray-100 rounded-lg p-1 border-2 ${
                      isSelected ? 'border-green-500' : 'border-gray-300'
                    }`}>
                      {echo ? (
                        <>
                          {/* 声骸图片 */}
                          <div className="w-full aspect-square bg-white rounded mb-2 flex items-center justify-center overflow-hidden">
                            <Image
                              src={getEchoImagePath(echo.imageKey)}
                              alt={echo.name}
                              width={200}
                              height={200}
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                          {/* 声骸信息 */}
                          <div className="text-center">
                            <p className="text-sm font-semibold text-gray-800 truncate">{echo.name}</p>
                            <p className="text-xs text-gray-600">COST {echo.cost}</p>
                            {echo.selectedSet && (
                              <p className="text-xs text-blue-600 truncate">{echo.selectedSet}</p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* 空槽位 */}
                          <div className="w-full aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center">
                            <span className="text-4xl text-gray-400">+</span>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500">空槽位</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* 选中声骸的详细配置 */}
            {selectedEchoIndex !== null && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  {echoes[selectedEchoIndex] ? (
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => {
                          setShowEchoSelect(true);
                          setEchoFilterCost(null);
                          setEchoFilterSet("");
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        更换声骸
                      </button>
                      <button
                        onClick={() => {
                          const newEchoes = [...echoes];
                          newEchoes.splice(selectedEchoIndex, 1);
                          setEchoes(newEchoes);
                          setSelectedEchoIndex(null);
                        }}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-300 transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        删除此声骸
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-800">
                        声骸槽位 {selectedEchoIndex + 1} 配置
                      </h3>
                      <button
                        onClick={() => {
                          setShowEchoSelect(true);
                          setEchoFilterCost(null);
                          setEchoFilterSet("");
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded"
                      >
                        选择声骸
                      </button>
                    </>
                  )}
                </div>
                
                {echoes[selectedEchoIndex] && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">声骸名称</label>
                        <p className="text-base text-gray-800 py-2">{echoes[selectedEchoIndex].name}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">COST</label>
                        <p className="text-base text-gray-800 py-2">COST {echoes[selectedEchoIndex].cost}</p>
                      </div>
                    </div>
                  
                  {/* 套装选择和等级选择放在同一行 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">声骸套装</label>
                      <select
                        value={echoes[selectedEchoIndex].selectedSet || ""}
                        onChange={(e) => {
                          const newEchoes = [...echoes];
                          newEchoes[selectedEchoIndex].selectedSet = e.target.value;
                          setEchoes(newEchoes);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                      >
                        {echoes[selectedEchoIndex].possibleSets.map(setName => (
                          <option key={setName} value={setName}>{setName}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">等级</label>
                      <select
                        value={echoes[selectedEchoIndex].echoLevel}
                        onChange={(e) => {
                          const newEchoes = [...echoes];
                          const newLevel = Number(e.target.value) as 5 | 10 | 15 | 20 | 25;
                          const maxSubStats = Math.floor(newLevel / 5);
                          // 如果副词条超过新等级允许的数量，截断
                          if (newEchoes[selectedEchoIndex].subStats.length > maxSubStats) {
                            newEchoes[selectedEchoIndex].subStats = newEchoes[selectedEchoIndex].subStats.slice(0, maxSubStats);
                          }
                          newEchoes[selectedEchoIndex].echoLevel = newLevel;
                          setEchoes(newEchoes);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                      >
                        <option value={5}>5级</option>
                        <option value={10}>10级</option>
                        <option value={15}>15级</option>
                        <option value={20}>20级</option>
                        <option value={25}>25级</option>
                      </select>
                    </div>
                  </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">主属性类型</label>
                        <select
                          value={echoes[selectedEchoIndex].mainStatType}
                          onChange={(e) => {
                            const newEchoes = [...echoes];
                            newEchoes[selectedEchoIndex].mainStatType = e.target.value as any;
                            setEchoes(newEchoes);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                        >
                          {(() => {
                            const { COST_MAIN_STATS } = require("@/types");
                            return COST_MAIN_STATS[echoes[selectedEchoIndex].cost].map((stat: string) => (
                              <option key={stat} value={stat}>{stat}</option>
                            ));
                          })()}
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">主属性数值</label>
                        <input
                          type="number"
                          step="0.1"
                          value={echoes[selectedEchoIndex].mainStatValue}
                          onChange={(e) => {
                            const newEchoes = [...echoes];
                            newEchoes[selectedEchoIndex].mainStatValue = Number(e.target.value);
                            setEchoes(newEchoes);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">副属性类型</label>
                        <p className="text-base text-gray-800 py-2">{echoes[selectedEchoIndex].secondaryStatType}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">副属性数值</label>
                        <input
                          type="number"
                          step="1"
                          value={echoes[selectedEchoIndex].secondaryStatValue}
                          onChange={(e) => {
                            const newEchoes = [...echoes];
                            newEchoes[selectedEchoIndex].secondaryStatValue = Number(e.target.value);
                            setEchoes(newEchoes);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        副词条（等级{echoes[selectedEchoIndex].echoLevel}可配置{Math.floor(echoes[selectedEchoIndex].echoLevel / 5)}个）
                      </label>
                      <div className="space-y-2">
                        {Array.from({ length: Math.floor(echoes[selectedEchoIndex].echoLevel / 5) }).map((_, subIdx) => {
                          const currentSubStat = echoes[selectedEchoIndex].subStats[subIdx];
                          const { SUB_STAT_VALUES } = require("@/types");
                          
                          return (
                            <div key={subIdx} className="grid grid-cols-2 gap-2 bg-white p-3 rounded border">
                              <div>
                                <label className="text-xs text-gray-600 mb-1 block">类型</label>
                                <select
                                  value={currentSubStat?.type || ""}
                                  onChange={(e) => {
                                    const newEchoes = [...echoes];
                                    const newSubStats = [...newEchoes[selectedEchoIndex].subStats];
                                    
                                    if (newSubStats[subIdx]) {
                                      newSubStats[subIdx] = { ...newSubStats[subIdx], type: e.target.value as any };
                                    } else {
                                      newSubStats[subIdx] = { type: e.target.value as any, value: SUB_STAT_VALUES[e.target.value]?.[0] || 0 };
                                    }
                                    newEchoes[selectedEchoIndex].subStats = newSubStats;
                                    setEchoes(newEchoes);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                >
                                  <option value="">选择类型</option>
                                  {Object.keys(SUB_STAT_VALUES).filter(stat => {
                                    // 过滤掉已经选择的副词条类型
                                    const usedTypes = echoes[selectedEchoIndex].subStats
                                      .filter((_, i) => i !== subIdx)
                                      .map(s => s.type);
                                    return !usedTypes.includes(stat as any);
                                  }).map(stat => (
                                    <option key={stat} value={stat}>{stat}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label className="text-xs text-gray-600 mb-1 block">数值</label>
                                <select
                                  value={currentSubStat?.value || ""}
                                  onChange={(e) => {
                                    const newEchoes = [...echoes];
                                    const newSubStats = [...newEchoes[selectedEchoIndex].subStats];
                                    if (newSubStats[subIdx]) {
                                      newSubStats[subIdx] = { ...newSubStats[subIdx], value: Number(e.target.value) };
                                    }
                                    newEchoes[selectedEchoIndex].subStats = newSubStats;
                                    setEchoes(newEchoes);
                                  }}
                                  disabled={!currentSubStat?.type}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                                >
                                  <option value="">选择数值</option>
                                  {currentSubStat?.type && SUB_STAT_VALUES[currentSubStat.type]?.map((val: number) => (
                                    <option key={val} value={val}>{val}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          );
                        })}
                        
                        {Math.floor(echoes[selectedEchoIndex].echoLevel / 5) === 0 && (
                          <p className="text-sm text-gray-500">当前等级不可配置副词条</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
          </div>
          
          {/* 声骸选择Modal */}
          {showEchoSelect && selectedEchoIndex !== null && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowEchoSelect(false)}>
              <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">选择声骸</h2>
                  <button
                    onClick={() => setShowEchoSelect(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    x  
                  </button>
                </div>
                
                {/* 筛选器 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">COST筛选</label>
                    <select
                      value={echoFilterCost || ""}
                      onChange={(e) => setEchoFilterCost(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">全部</option>
                      <option value={1}>COST 1</option>
                      <option value={3}>COST 3</option>
                      <option value={4}>COST 4</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">套装筛选</label>
                    <select
                      value={echoFilterSet}
                      onChange={(e) => setEchoFilterSet(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">全部</option>
                      {getAllEchoSetNames().map(setName => (
                        <option key={setName} value={setName}>{setName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* 声骸列表 */}
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(ECHO_DATA as Record<string, any>)
                    .filter(([_, echoData]) => {
                      if (echoFilterCost !== null && echoData.cost !== echoFilterCost) return false;
                      if (echoFilterSet && !echoData.possibleSets.some((set: string) => set.includes(echoFilterSet))) return false;
                      return true;
                    })
                    .map(([key, echoData]) => (
                      <EchoCard
                        key={key}
                        name={echoData.name}
                        imageKey={key}
                        cost={echoData.cost}
                        possibleSets={echoData.possibleSets}
                        onClick={() => {
                          const newEchoes = [...echoes];
                          const { COST_MAIN_STATS, COST_SECONDARY_STATS } = require("@/types");
                          newEchoes[selectedEchoIndex] = {
                            name: echoData.name,
                            imageKey: key,
                            cost: echoData.cost,
                            possibleSets: echoData.possibleSets,
                            selectedSet: echoData.possibleSets[0],
                            mainStatType: COST_MAIN_STATS[echoData.cost][0],
                            mainStatValue: 20,
                            secondaryStatType: echoData.secondaryStatType,
                            secondaryStatValue: 100,
                            subStats: [],
                            echoLevel: 25
                          };
                          setEchoes(newEchoes);
                          setShowEchoSelect(false);
                        }}
                      />
                    ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* 队友配置 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-200 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">队友配置</h2>
            
            {/* 2个队友槽位横向显示 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[0, 1].map(slotIndex => {
                const teammate = teammates[slotIndex];
                const isSelected = selectedTeammateIndex === slotIndex;
                
                return (
                  <div
                    key={slotIndex}
                    onClick={() => {
                      if (teammate) {
                        // 如果点击已选中的队友，则收回配置栏
                        if (isSelected) {
                          setSelectedTeammateIndex(null);
                        } else {
                          setSelectedTeammateIndex(slotIndex);
                        }
                      } else {
                        // 空槽位直接打开选择页面
                        setSelectedTeammateIndex(slotIndex);
                        setShowTeammateSelect(true);
                      }
                    }}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-4 ring-purple-400 rounded-lg' : 'hover:ring-2 hover:ring-purple-300 rounded-lg'
                    }`}
                  >
                    <div className={`bg-gray-100 rounded-lg p-1 border-2 ${
                      isSelected ? 'border-purple-500' : 'border-gray-300'
                    }`}>
                      {teammate ? (
                        <>
                          {/* 队友角色信息 */}
                          <div className="w-full aspect-square bg-white rounded mb-2 flex items-center justify-center overflow-hidden">
                            <Image
                              src={getCharacterImagePath((CHARACTERS as any)[teammate.characterName]?.baseStats.imageKey)}
                              alt={teammate.characterName}
                              width={200}
                              height={200}
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-gray-800 truncate">{teammate.characterName}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* 空槽位 */}
                          <div className="w-full aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center">
                            <span className="text-4xl text-gray-400">+</span>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500">空槽位</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* 选中队友的详细配置 */}
            {selectedTeammateIndex !== null && teammates[selectedTeammateIndex] && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => {
                        setShowTeammateSelect(true);
                      }}
                      className="px-3 py-1 text-sm bg-purple-500 text-white hover:bg-purple-600 rounded transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      更换队友
                    </button>
                    <button
                      onClick={() => {
                        const newTeammates = [...teammates];
                        // 使用undefined替换而不是splice，保持数组索引不变
                        newTeammates[selectedTeammateIndex] = undefined;
                        setTeammates(newTeammates);
                        setSelectedTeammateIndex(null);
                      }}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-300 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      删除队友
                    </button>
                  </div>
                </div>
                
                {(() => {
                  const teammate = teammates[selectedTeammateIndex];
                  if (!teammate) return null;
                  
                  const teammateChar = CHARACTERS[teammate.characterName as keyof typeof CHARACTERS];
                  if (!teammateChar) return null;
                  
                  return (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">角色信息</h4>
                        <p className="text-sm text-gray-600">名称: {teammateChar.baseStats.name}</p>
                        <p className="text-sm text-gray-600">稀有度: {teammateChar.baseStats.rarity}星</p>
                        <p className="text-sm text-gray-600">武器类型: {teammateChar.baseStats.weaponType}</p>
                        <p className="text-sm text-gray-600">元素类型: {teammateChar.baseStats.elementType}</p>
                      </div>
                      
                      {/* 延奏技能 */}
                      {(teammateChar.outroSkill || ((teammateChar as any).outroSkills?.length > 0)) && (
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-700">延奏技能</h4>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={teammate.enabledOutro}
                                onChange={(e) => {
                                  const newTeammates = [...teammates];
                                  if (newTeammates[selectedTeammateIndex]) {
                                    newTeammates[selectedTeammateIndex].enabledOutro = e.target.checked;
                                    setTeammates(newTeammates);
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-600">启用</span>
                            </label>
                          </div>
                          {[...(((teammateChar as any).outroSkills) || []), ...(teammateChar.outroSkill ? [teammateChar.outroSkill] : [])].map((outro: any) => (
                            <div key={outro.name} className="bg-white p-3 rounded mb-2">
                              <p className="text-sm font-medium text-gray-800">{outro.name}</p>
                              <p className="text-xs text-gray-600 mt-1">{outro.description}</p>
                              {/* 延奏技能效果可视化（statBonus） */}
                              {teammate.enabledOutro && outro.effects?.statBonus && (
                                <div className="mt-2 p-2 bg-purple-50 rounded text-xs">
                                  <span className="font-medium text-purple-800">效果：</span>
                                  <div className="mt-1 space-y-0.5">
                                    {Object.entries(outro.effects.statBonus).map(([key, val]) => (
                                      <div key={key} className="text-purple-700">{key}: +{((val as number) * 100).toFixed(0)}%</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* 莫宁干涉标记：固定 40% */}
                              {outro.name === "干涉标记" && teammate.enabledOutro && (
                                <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-700 border border-purple-200">
                                  固定伤害加成 <span className="font-bold">+40%</span>（默认260%共鸣效率以上时已达上限）
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          
          {/* 队友选择弹窗 */}
          {showTeammateSelect && selectedTeammateIndex !== null && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTeammateSelect(false)}>
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">选择队友</h3>
                  <button onClick={() => setShowTeammateSelect(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                <input
                  type="text"
                  placeholder="搜索角色..."
                  value={teammateSearch}
                  onChange={(e) => setTeammateSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                />
                <div className="grid grid-cols-3 gap-4">
                  {Object.keys(CHARACTERS)
                    .filter(name => name !== selectedCharName) // 排除当前角色
                    .filter(name => name.includes(teammateSearch))
                    .map(name => (
                      <CharacterCard
                        key={name}
                        name={name}
                        imageKey={(CHARACTERS as any)[name].baseStats.imageKey}
                        rarity={(CHARACTERS as any)[name].baseStats.rarity}
                        elementType={(CHARACTERS as any)[name].baseStats.elementType}
                        variant="select"
                        onClick={() => {
                          const newTeammates = [...teammates];
                          const char = CHARACTERS[name as keyof typeof CHARACTERS];
                          newTeammates[selectedTeammateIndex] = {
                            characterName: name,
                            enabledOutro: false,
                            enabledPassives: char.passiveSkills.map(() => false)
                          };
                          setTeammates(newTeammates);
                          setShowTeammateSelect(false);
                        }}
                      />
                    ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* 战斗面板 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">战斗面板</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-700">
              <div>
                <p className="text-sm text-gray-500">攻击力</p>
                <p className="text-xl font-bold">{combatStats.totalATK.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">生命值</p>
                <p className="text-xl font-bold">{combatStats.totalHP.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">防御力</p>
                <p className="text-xl font-bold">{combatStats.totalDEF.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">治疗加成</p>
                <p className="text-xl font-bold">{(combatStats.healBonus * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">暴击率</p>
                <p className="text-xl font-bold text-orange-600">{(combatStats.critRate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">暴击伤害</p>
                <p className="text-xl font-bold text-orange-600">{(combatStats.critDMG * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">共鸣效率</p>
                <p className="text-xl font-bold">{(combatStats.energyRegen * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">元素伤害</p>
                <p className="text-xl font-bold text-blue-600">{(combatStats.elementDMG * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">普攻加成</p>
                <p className="text-xl font-bold">{(combatStats.normalATKBonus * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">重击加成</p>
                <p className="text-xl font-bold">{(combatStats.heavyATKBonus * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">共鸣技能</p>
                <p className="text-xl font-bold">{(combatStats.skillBonus * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">共鸣解放</p>
                <p className="text-xl font-bold">{(combatStats.liberationBonus * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* 怪物信息配置 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">怪物信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">怪物等级</label>
                <input
                  type="number"
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                  min={1}
                  max={130}
                  step={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  元素抗性 %
                  <span className="ml-2 text-xs text-gray-500">（参考：默认全抗性10%，深塔50%额外，全息70%额外）</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={enemyResistance}
                    onChange={(e) => setEnemyResistance(Number(e.target.value))}
                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                    min={-100}
                    max={100}
                    step={1}
                  />
                  <span className="text-sm text-gray-500">%</span>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setEnemyResistance(10)} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">默认 10%</button>
                    <button onClick={() => setEnemyResistance(60)} className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200">深塔 60%</button>
                    <button onClick={() => setEnemyResistance(80)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">全息 80%</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
              当前防御乘区：{character && ((1 - (792 + 8 * targetLevel) / ((792 + 8 * targetLevel) + 800 + 8 * character.baseStats.level)) * 100).toFixed(2)}%　
              当前抗性乘区：{(100 - enemyResistance).toFixed(0)}%
            </div>
          </div>

          {/* 额外加成配置 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-amber-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">额外加成</h2>
              <button
                onClick={() => {
                  setExtraBonuses([...extraBonuses, {
                    id: extraBonusCounter,
                    zone: "伤害加成",
                    value: 0,
                    label: "",
                    filterMode: "all",
                    filterValues: []
                  }]);
                  setExtraBonusCounter(extraBonusCounter + 1);
                }}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
              >
                + 添加加成
              </button>
            </div>
            {extraBonuses.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">暂无额外加成，点击"添加加成"按钮增加</p>
            ) : (
              <div className="space-y-3">
                {extraBonuses.map((bonus) => (
                  <div key={bonus.id} className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-2">
                    {/* 第一行：核心配置 */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* 乘区 */}
                      <select
                        value={bonus.zone}
                        onChange={(e) => setExtraBonuses(extraBonuses.map(b =>
                          b.id === bonus.id ? { ...b, zone: e.target.value as any } : b
                        ))}
                        className="px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                      >
                        <option value="倍率提升">倍率提升</option>
                        <option value="伤害加深">伤害加深</option>
                        <option value="伤害加成">伤害加成</option>
                        <option value="无视防御">无视防御</option>
                        <option value="无视抗性">无视抗性</option>
                      </select>
                      {/* 数值 */}
                      <input
                        type="number"
                        value={bonus.value}
                        onChange={(e) => setExtraBonuses(extraBonuses.map(b =>
                          b.id === bonus.id ? { ...b, value: Number(e.target.value) } : b
                        ))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                        step={0.1}
                      />
                      <span className="text-sm text-gray-500">%</span>
                      {/* 生效范围模式 */}
                      <select
                        value={bonus.filterMode ?? "all"}
                        onChange={(e) => setExtraBonuses(extraBonuses.map(b =>
                          b.id === bonus.id ? { ...b, filterMode: e.target.value as any, filterValues: [] } : b
                        ))}
                        className="px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                      >
                        <option value="all">全部技能</option>
                        <option value="byCategory">按技能类型</option>
                        <option value="byName">按技能名称</option>
                      </select>
                      {/* 备注 */}
                      <input
                        type="text"
                        value={bonus.label}
                        onChange={(e) => setExtraBonuses(extraBonuses.map(b =>
                          b.id === bonus.id ? { ...b, label: e.target.value } : b
                        ))}
                        placeholder="备注（可选）"
                        className="flex-1 min-w-20 px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                      />
                      <button
                        onClick={() => setExtraBonuses(extraBonuses.filter(b => b.id !== bonus.id))}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm border border-red-300 shrink-0"
                      >
                        删除
                      </button>
                    </div>
                    {/* 第二行：生效范围选择（byCategory / byName 时展开） */}
                    {bonus.filterMode === "byCategory" && (
                      <div className="flex flex-wrap gap-2 pt-1 pl-1">
                        <span className="text-xs text-gray-500 self-center">生效技能类型：</span>
                        {(["常态攻击", "共鸣技能", "共鸣回路", "共鸣解放", "变奏技能"] as const).map(cat => {
                          const checked = bonus.filterValues.includes(cat);
                          return (
                            <label key={cat} className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-xs border transition-colors ${
                              checked ? "bg-amber-300 border-amber-400 text-amber-900" : "bg-white border-gray-300 text-gray-600"
                            }`}>
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={checked}
                                onChange={() => {
                                  const newVals = checked
                                    ? bonus.filterValues.filter(v => v !== cat)
                                    : [...bonus.filterValues, cat];
                                  setExtraBonuses(extraBonuses.map(b =>
                                    b.id === bonus.id ? { ...b, filterValues: newVals } : b
                                  ));
                                }}
                              />
                              {cat}
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {bonus.filterMode === "byName" && character && (
                      <div className="flex flex-wrap gap-2 pt-1 pl-1">
                        <span className="text-xs text-gray-500 self-center">生效技能：</span>
                        {character.skills.map(skill => {
                          const checked = bonus.filterValues.includes(skill.name);
                          return (
                            <label key={skill.name} className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-xs border transition-colors ${
                              checked ? "bg-amber-300 border-amber-400 text-amber-900" : "bg-white border-gray-300 text-gray-600"
                            }`}>
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={checked}
                                onChange={() => {
                                  const newVals = checked
                                    ? bonus.filterValues.filter(v => v !== skill.name)
                                    : [...bonus.filterValues, skill.name];
                                  setExtraBonuses(extraBonuses.map(b =>
                                    b.id === bonus.id ? { ...b, filterValues: newVals } : b
                                  ));
                                }}
                              />
                              {skill.name}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 公式说明（可折叠，带动画） */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-lg overflow-hidden">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-full flex justify-between items-center text-gray-800 hover:text-blue-600 transition-all duration-300"
            >
              <h2 className="text-2xl font-bold">鸣潮文字公式</h2>
              <span className="text-2xl transform transition-transform duration-300" style={{ transform: showInfo ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </button>
            
            <div
              className="transition-all duration-300 ease-in-out"
              style={{
                maxHeight: showInfo ? '500px' : '0',
                opacity: showInfo ? 1 : 0,
                overflow: 'hidden'
              }}
            >
              <div className="mt-4 space-y-3 text-gray-700">
                <p className="text-lg font-semibold text-blue-600">
                  谨记鸣潮文字公式：
                </p>
                <p className="leading-relaxed">
                  增加倍率是加算，提升倍率是乘算，<br />
                  描述一样加一起，描述不同互相乘，<br />
                  造成伤害提升是增伤，受到伤害提升是乘区。
                </p>
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-sm font-semibold text-gray-700 mb-3">最终伤害公式：</p>
                  <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-4 rounded-lg">
                    <span className="font-semibold text-gray-700">最终伤害 =</span>
                    
                    {[
                      { key: 'base', label: '基础乘区', desc: '根据角色缩放模板（政击/生命/防御）计算' },
                      { key: 'skill', label: '技能倍率', desc: '技能等级对应的倍率数值' },
                      { key: 'boost', label: '倍率提升', desc: '来自固有技能、武器技能的倍率提升' },
                      { key: 'crit', label: '暴击', desc: '暴击率 × 暴击伤害 + (1 - 暴击率)' },
                      { key: 'deepen', label: '伤害加深', desc: '来自武器、固有技能的伤害加深' },
                      { key: 'bonus', label: '伤害加成', desc: '元素伤害 + 普攻/重击/技能/解放加成' },
                      { key: 'defense', label: '防御', desc: '1 - 有效防御/(有效防御 + 800 + 8×角色等级)，有效防御 = (792+8×怪物等级)×(1-无视防御)' },
                      { key: 'resistance', label: '抗性', desc: '1 - (怪物抗性 - 抗性削减)' },
                      { key: 'hits', label: '次数', desc: '技能命中次数乘区' }
                    ].map((multiplier, index) => (
                      <div key={multiplier.key} className="relative">
                        {index > 0 && <span className="text-gray-500 mx-1">×</span>}
                        <button
                          onClick={() => setExpandedMultiplier(expandedMultiplier === multiplier.key ? null : multiplier.key)}
                          className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          {multiplier.label}
                        </button>
                        
                        {/* 乘区详情弹窗 */}
                        <div 
                          className={`absolute bottom-full left-0 mb-2 z-50 bg-white border-2 border-blue-300 rounded-lg shadow-xl p-3 min-w-[250px] transition-all duration-300 origin-bottom ${
                            expandedMultiplier === multiplier.key 
                              ? 'opacity-100 scale-100 pointer-events-auto' 
                              : 'opacity-0 scale-95 pointer-events-none'
                          }`}
                        >
                          <div className="text-sm">
                            <p className="font-semibold text-gray-800 mb-2">{multiplier.label}</p>
                            <p className="text-gray-600 leading-relaxed">{multiplier.desc}</p>
                          </div>
                          <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-r-2 border-b-2 border-blue-300 transform rotate-45"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 技能流程配置 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">技能流程配置</h2>
              <button
                onClick={() => setShowRotationConfig(!showRotationConfig)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
              >
                {showRotationConfig ? "收起" : "展开"}
              </button>
            </div>
            
            <div className={`grid transition-all duration-300 ease-in-out ${showRotationConfig ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {character.skills.map((skill: CharacterSkill, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSkillRotation([...skillRotation, { skillName: skill.name, count: 1, critMode: "期望", type: "skill" }]);
                      }}
                      className="px-3 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
                    >
                      + {skill.name}
                    </button>
                  ))}
                  
                  {/* 从 specialConfig.rotationButtons 泛化读取额外按钮 */}
                  {character.specialConfig?.rotationButtons?.map((btn, bi) => {
                    const show = characterSpecialStates[btn.showWhen.key] === btn.showWhen.value;
                    if (!show) return null;
                    return (
                      <button
                        key={bi}
                        onClick={() => {
                          setSkillRotation([...skillRotation, { skillName: btn.skillName, count: 1, critMode: "期望", type: btn.type }]);
                        }}
                        className={btn.buttonClass ?? "px-3 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-all duration-200 hover:scale-105 active:scale-95 text-sm"}
                      >
                        {btn.buttonLabel}
                      </button>
                    );
                  })}
                </div>
                
                {skillRotation.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-700">当前流程：</h3>
                      <button
                        onClick={() => setSkillRotation([])}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        清空
                      </button>
                    </div>
                    {skillRotation.map((item, idx) => (
                      <div key={idx} className={`flex items-center gap-3 p-3 rounded ${
                        item.type === "zhenxieInterference" ? "bg-yellow-50 border-2 border-yellow-300" : "bg-gray-50"
                      }`}>
                        <span className={`text-sm font-medium flex-1 ${
                          item.type === "zhenxieInterference" ? "text-yellow-800 font-bold" : "text-gray-700"
                        }`}>
                          {idx + 1}. {item.skillName}
                          {item.type === "zhenxieInterference" && " ⚡"}
                        </span>
                        
                        {/* 震谐干涉标记不显示暴击模式选择 */}
                        {item.type !== "zhenxieInterference" && (
                          <select
                            value={item.critMode}
                            onChange={(e) => {
                              const newRotation = [...skillRotation];
                              newRotation[idx].critMode = e.target.value as any;
                              setSkillRotation(newRotation);
                            }}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="期望">期望</option>
                            <option value="暴击">暴击</option>
                            <option value="不暴击">不暴击</option>
                          </select>
                        )}
                        
                        <button
                          onClick={() => {
                            setSkillRotation(skillRotation.filter((_, i) => i !== idx));
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>

          {/* 伤害分布 */}
          {rotationDamage && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">伤害分布</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("技能名字")}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm ${
                      viewMode === "技能名字" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    技能名字
                  </button>
                  <button
                    onClick={() => setViewMode("伤害类型")}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm ${
                      viewMode === "伤害类型" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    伤害类型
                  </button>
                  <button
                    onClick={() => setViewMode("技能类型")}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm ${
                      viewMode === "技能类型" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    技能类型
                  </button>
                </div>
              </div>
              
              {/* 伤害计算模式切换 */}
              <div className="flex gap-2 mb-4 justify-center">
                <button
                  onClick={() => setDamageViewMode("期望")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm ${
                    damageViewMode === "期望" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  期望伤害
                </button>
                <button
                  onClick={() => setDamageViewMode("暴击")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm ${
                    damageViewMode === "暴击" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  暴击伤害
                </button>
                <button
                  onClick={() => setDamageViewMode("不暴击")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm ${
                    damageViewMode === "不暴击" ? "bg-gray-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  不暴击伤害
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-center">
                  <PieChart data={pieChartData} size={250} />
                </div>
                <div>
                  <Legend data={pieChartData} />
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-sm text-gray-600">总伤害：<span className="text-xl font-bold text-blue-600">{rotationDamage.totalDamage.toFixed(0)}</span></p>
                  </div>
                </div>
              </div>
              
              {/* 技能详细列表 */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700">技能详情：</h3>
                  <button
                    onClick={() => setShowSkillDetailList(prev => !prev)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
                  >
                    {showSkillDetailList ? "隐藏" : "展开"}
                  </button>
                </div>
                <div className={`grid transition-all duration-300 ease-in-out ${showSkillDetailList ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden space-y-2">
                {rotationDamage.results.map((result, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{result.skillName}</p>
                        <p className="text-sm text-gray-600">
                          <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs mr-1">{result.skill.skillCategory}</span>
                          <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs mr-2">{result.skill.damageType}</span>
                          释放{result.count}次 · {result.critMode} · 
                          单次: <span className="font-semibold">{result.singleDamage.toFixed(0)}</span> · 
                          总计: <span className="font-semibold text-blue-600">{result.totalDamage.toFixed(0)}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setExpandedSkillDetails(prev => { const next = new Set(prev); next.has(result.skillName) ? next.delete(result.skillName) : next.add(result.skillName); return next; })}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
                      >
                        {expandedSkillDetails.has(result.skillName) ? "收起" : "查看"}
                      </button>
                    </div>
                    
                    <div className={`grid transition-all duration-300 ease-in-out ${expandedSkillDetails.has(result.skillName) && result.damageDetail ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                    {result.damageDetail && (
                      <div className="mt-3 p-3 bg-white rounded space-y-2 text-sm border border-gray-200">
                        {/* 检查是否为震谐伤害或效应伤害 - 使用特殊显示 */}
                        {(result.skill.damageType === "震谐伤害" || result.skill.damageType === "效应伤害") ? (
                          <>
                            {/* 特殊伤害类型的说明 */}
                            <div className="p-3 bg-yellow-50 rounded border border-yellow-300">
                              <p className="font-semibold text-yellow-800 mb-2">
                                {result.skill.damageType === "震谐伤害" ? "震谐伤害计算" : "效应伤害计算"}
                              </p>
                              {result.skill.damageType === "震谐伤害" && (
                                <div className="text-xs text-gray-700 space-y-1">
                                  {result.skill.name === "震谐响应·星爆伤害" ? (
                                    <p>震谐伤害 = 偏斜基础值(10027) × 技能倍率</p>
                                  ) : (
                                    <>
                                      <p>震谐伤害 = 偏斜基础值(10027) × (震谐轨迹层数×4%+1) × 技能倍率 × 次数</p>
                                      <p className="text-gray-600">次数: {(characterSpecialStates["xingchenZhenxieEnabled"] as boolean) ? "10次(星屑共振·震谐)" : "5次"}</p>
                                    </>
                                  )}
                                </div>
                              )}
                              {result.skill.damageType === "效应伤害" && (
                                <div className="text-xs text-gray-700 space-y-1">
                                  <p>效应伤害 = 效应基础值(3674) × 聚爆倍率 × (聚爆轨迹层数×10%+1) × 星屑共振倍率</p>
                                  <p className="text-gray-600">星屑共振倍率: {(characterSpecialStates["xingchenJubaoEnabled"] as boolean) ? "2(星屑共振·聚爆)" : "1"}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* 最终伤害 */}
                            <div className="pt-2 border-t-2 border-blue-300 font-semibold text-blue-600">
                              <p className="mb-1">最终伤害：</p>
                              <p className="text-2xl">
                                {result.singleDamage.toFixed(0)}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* 正常伤害类型的详细计算 */}
                            {/* 基础乘区 */}
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="font-semibold text-gray-700 mb-1">基础乘区: <span className="font-mono">{result.damageDetail.baseDamage.toFixed(2)}</span></p>
                              <p className="text-xs text-gray-600">根据技能缩放模板（{result.skill.scalingTemplate ?? "攻击"}）计算</p>
                            </div>
                            
                            {/* 技能倍率 */}
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="font-semibold text-gray-700">技能倍率: <span className="font-mono">{(result.damageDetail.skillMultiplier ?? 0).toFixed(4)}</span></p>
                            </div>
                            
                            {/* 倍率提升 */}
                            <div className="p-2 bg-blue-50 rounded">
                              <p className="font-semibold text-gray-700">倍率提升: <span className="font-mono">+{(result.damageDetail.multiplierBoost * 100).toFixed(2)}%</span> <span className="text-xs text-gray-500">(即乘以 {(1 + result.damageDetail.multiplierBoost).toFixed(4)})</span></p>
                              {result.damageDetail.details?.multiplierBoostSources && result.damageDetail.details.multiplierBoostSources.length > 0 && (
                                <ul className="mt-1 space-y-0.5 text-xs text-gray-600">
                                  {result.damageDetail.details.multiplierBoostSources.map((source, i) => (
                                    <li key={i}>• {source}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            
                            {/* 暴击倍率 */}
                            <div className="p-2 bg-orange-50 rounded">
                              <p className="font-semibold text-gray-700">暴击倍率: <span className="font-mono">{result.damageDetail.critMultiplier.toFixed(4)}</span></p>
                              <p className="text-xs text-gray-600">模式: {result.critMode}</p>
                            </div>
                            
                            {/* 伤害加深 */}
                            <div className="p-2 bg-red-50 rounded">
                              <p className="font-semibold text-gray-700">伤害加深: <span className="font-mono">+{(result.damageDetail.damageDeepen * 100).toFixed(2)}%</span> <span className="text-xs text-gray-500">(即乘以 {(1 + result.damageDetail.damageDeepen).toFixed(4)})</span></p>
                              {result.damageDetail.details?.damageDeepenSources && result.damageDetail.details.damageDeepenSources.length > 0 && (
                                <ul className="mt-1 space-y-0.5 text-xs text-gray-600">
                                  {result.damageDetail.details.damageDeepenSources.map((source, i) => (
                                    <li key={i}>• {source}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            
                            {/* 伤害加成 */}
                            <div className="p-2 bg-green-50 rounded">
                              <p className="font-semibold text-gray-700">伤害加成: <span className="font-mono">{result.damageDetail.damageBonus.toFixed(4)}</span></p>
                              {result.damageDetail.details?.damageBonusSources && result.damageDetail.details.damageBonusSources.length > 0 && (
                                <ul className="mt-1 space-y-0.5 text-xs text-gray-600">
                                  {result.damageDetail.details.damageBonusSources.map((source, i) => (
                                    <li key={i}>• {source}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            
                            {/* 防御乘区 */}
                            <div className="p-2 bg-purple-50 rounded">
                              <p className="font-semibold text-gray-700">防御乘区: <span className="font-mono">{result.damageDetail.defenseMultiplier.toFixed(4)}</span></p>
                              {result.damageDetail.details?.defenseIgnoreSources && result.damageDetail.details.defenseIgnoreSources.length > 0 && (
                                <ul className="mt-1 space-y-0.5 text-xs text-gray-600">
                                  {result.damageDetail.details.defenseIgnoreSources.map((source, i) => (
                                    <li key={i}>• {source}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            
                            {/* 抗性乘区 */}
                            <div className="p-2 bg-yellow-50 rounded">
                              <p className="font-semibold text-gray-700">抗性乘区: <span className="font-mono">{result.damageDetail.resistanceMultiplier.toFixed(4)}</span></p>
                              <p className="text-xs text-gray-600">基础抗性: {enemyResistance}%</p>
                              {result.damageDetail.details?.resistanceReductionSources && result.damageDetail.details.resistanceReductionSources.length > 0 && (
                                <ul className="mt-1 space-y-0.5 text-xs text-gray-600">
                                  {result.damageDetail.details.resistanceReductionSources.map((source, i) => (
                                    <li key={i}>• {source}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            
                            {/* 最终公式 */}
                            <div className="pt-2 border-t-2 border-blue-300 font-semibold text-blue-600">
                              <p className="mb-1">最终伤害计算：</p>
                              <p className="text-xs leading-relaxed break-all">
                                {result.damageDetail.baseDamage.toFixed(2)} × 
                                {(result.damageDetail.skillMultiplier ?? 0).toFixed(3)} × 
                                {(1 + result.damageDetail.multiplierBoost).toFixed(3)} × 
                                {result.damageDetail.critMultiplier.toFixed(3)} × 
                                {(1 + result.damageDetail.damageDeepen).toFixed(3)} × 
                                {result.damageDetail.damageBonus.toFixed(3)} × 
                                {result.damageDetail.defenseMultiplier.toFixed(3)} × 
                                {result.damageDetail.resistanceMultiplier.toFixed(3)}
                              </p>
                              <p className="mt-2 text-lg">
                                = <span className="text-2xl">{result.singleDamage.toFixed(0)}</span>
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    </div>
                    </div>
                  </div>
                ))}
                </div>
                </div>
              </div>
            </div>
          )}

          {/* 副词条权重分析 */}
          {rotationDamage && character && weapon && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">副词条权重分析</h2>
                <button
                  onClick={() => setShowSubStatWeight(!showSubStatWeight)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {showSubStatWeight ? "收起" : "展开"}
                </button>
              </div>
              
              <div className={`grid transition-all duration-300 ease-in-out ${showSubStatWeight ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                <div className="space-y-4">
                  {/* 提示：需要配置技能流程 */}
                  {skillRotation.length === 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
                      <p className="text-yellow-800 font-semibold">⚠️ 请先配置技能流程</p>
                      <p className="text-yellow-700 text-sm mt-1">副词条权重分析基于您配置的输出流程总伤害进行计算，请先在上方"配置技能流程"中添加技能。</p>
                    </div>
                  )}
                  
                  {/* 模式切换 */}
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSubStatWeightMode('empty');
                        if (skillRotation.length === 0) {
                          alert('请先配置技能流程！');
                          return;
                        }
                        // 立即重新计算
                        const rotation = skillRotation
                          .filter(item => item.type !== "zhenxieInterference") // 过滤掉震谐干涉标记
                          .map(item => {
                            const skill = character.skills.find((s: CharacterSkill) => s.name === item.skillName);
                            return skill ? { skill, count: item.count, critMode: damageViewMode } : null;
                          }).filter(Boolean) as Array<{ skill: CharacterSkill; count: number; critMode: "期望"|"暴击"|"不暴击" }>;
                        
                        const baseInput = {
                          character,
                          weapon,
                          targetLevel,
                          enemyResistance: enemyResistance / 100,
                          echoSetEnabled,
                          effectStacks
                        };
                        const weights = analyzeSubStatWeights(baseInput, rotation, false, []);
                        setSubStatWeights(weights);
                      }}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm ${
                        subStatWeightMode === 'empty' ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      空白面板（不计入现有声骸）
                    </button>
                    <button
                      onClick={() => {
                        setSubStatWeightMode('current');
                        if (skillRotation.length === 0) {
                          alert('请先配置技能流程！');
                          return;
                        }
                        // 立即重新计算
                        const rotation = skillRotation
                          .filter(item => item.type !== "zhenxieInterference") // 过滤掉震谐干涉标记
                          .map(item => {
                            const skill = character.skills.find((s: CharacterSkill) => s.name === item.skillName);
                            return skill ? { skill, count: item.count, critMode: damageViewMode } : null;
                          }).filter(Boolean) as Array<{ skill: CharacterSkill; count: number; critMode: "期望"|"暴击"|"不暴击" }>;
                        
                        const baseInput = {
                          character,
                          weapon,
                          targetLevel,
                          enemyResistance: enemyResistance / 100,
                          echoSetEnabled,
                          effectStacks
                        };
                        const weights = analyzeSubStatWeights(baseInput, rotation, true, echoes);
                        setSubStatWeights(weights);
                      }}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm ${
                        subStatWeightMode === 'current' ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      当前面板（计入现有声骸）
                    </button>
                  </div>
                  
                  {/* 说明文字 */}
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-700">
                    <p className="font-semibold mb-1">说明：</p>
                    <p>• 空白面板模式：适合刚获得角色，帮助判断优先堆哪个副词条</p>
                    <p>• 当前面板模式：基于现有声骸，帮助判断如何优化声骸提升伤害</p>
                    <p className="mt-2">计算方法：在当前面板基础上添加该副词条的平均值，计算整个输出流程的总伤害提升百分比</p>
                  </div>
                  
                  {/* 计算按钮 */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        if (skillRotation.length === 0) {
                          alert('请先配置技能流程！');
                          return;
                        }
                        
                        const rotation = skillRotation
                          .filter(item => item.type !== "zhenxieInterference") // 过滤掉震谐干涉标记
                          .map(item => {
                            const skill = character.skills.find((s: CharacterSkill) => s.name === item.skillName);
                            return skill ? { skill, count: item.count, critMode: damageViewMode } : null;
                          }).filter(Boolean) as Array<{ skill: CharacterSkill; count: number; critMode: "期望"|"暴击"|"不暴击" }>;
                        
                        const baseInput = {
                          character,
                          weapon,
                          targetLevel,
                          enemyResistance: enemyResistance / 100,
                          echoSetEnabled,
                          effectStacks
                        };
                        const weights = analyzeSubStatWeights(
                          baseInput,
                          rotation,
                          subStatWeightMode === 'current',
                          echoes
                        );
                        setSubStatWeights(weights);
                      }}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 hover:scale-105 active:scale-95 font-semibold"
                    >
                      开始分析
                    </button>
                  </div>
                  
                  {/* 权重结果表格 */}
                  {subStatWeights.length > 0 && (() => {
                    const maxDamageIncrease = Math.max(...subStatWeights.map(w => w.damageIncrease), 1e-9);
                    return (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            <th className="px-4 py-3 text-left font-semibold">排名</th>
                            <th className="px-4 py-3 text-left font-semibold">副词条</th>
                            <th className="px-4 py-3 text-left font-semibold">平均值</th>
                            <th className="px-4 py-3 text-left font-semibold">伤害提升</th>
                            <th className="px-4 py-3 text-left font-semibold">归一化权重</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subStatWeights.map((weight, index) => {
                            const normalized = weight.damageIncrease / maxDamageIncrease;
                            const barWidth = Math.max(0, Math.min(100, normalized * 100));
                            return (
                            <tr 
                              key={weight.statType} 
                              className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                                index < 3 ? 'bg-yellow-50' : ''
                              }`}
                            >
                              <td className="px-4 py-3 font-semibold text-gray-700">
                                {index === 0 && '🥇'}
                                {index === 1 && '🥈'}
                                {index === 2 && '🥉'}
                                {index > 2 && `${index + 1}`}
                              </td>
                              <td className="px-4 py-3 font-medium text-gray-800">{weight.statType}</td>
                              <td className="px-4 py-3 text-gray-700">
                                {formatSubStatValue(weight.statType, weight.averageValue)}
                              </td>
                              <td className="px-4 py-3 font-semibold">
                                <span className={`${
                                  weight.damageIncrease > 0.05 ? 'text-green-600' :
                                  weight.damageIncrease > 0.02 ? 'text-blue-600' :
                                  'text-gray-600'
                                }`}>
                                  +{weight.damageIncreasePercent}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2 min-w-[120px]">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all"
                                      style={{ width: `${barWidth}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700 w-10 text-right">
                                    {normalized.toFixed(2)}
                                  </span>
                                </div>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    );
                  })()}
                </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 角色选择弹窗 */}
      {showCharSelect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCharSelect(false)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">选择角色</h3>
              <button onClick={() => setShowCharSelect(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <input
              type="text"
              placeholder="搜索角色..."
              value={charSearch}
              onChange={(e) => setCharSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="grid grid-cols-3 gap-4">
              {Object.keys(CHARACTERS).filter(name => name.includes(charSearch)).map(name => (
                <CharacterCard
                  key={name}
                  name={name}
                  imageKey={(CHARACTERS as any)[name].baseStats.imageKey}
                  rarity={(CHARACTERS as any)[name].baseStats.rarity}
                  elementType={(CHARACTERS as any)[name].baseStats.elementType}
                  variant="select"
                  onClick={() => {
                    setSkillRotation([]);
                    setSelectedCharName(name);
                    setShowCharSelect(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 配置管理弹窗 */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowConfigModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                {configAction === 'save' ? '保存配置' : '加载配置'}
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            {configAction === 'save' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">配置名称</label>
                  <input
                    type="text"
                    placeholder="输入配置名称..."
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveConfiguration(configName);
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => saveConfiguration(configName)}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  保存
                </button>
                
                {savedConfigs.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">已保存的配置：</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {savedConfigs.map((config) => (
                        <div key={config.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-800">{config.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(config.timestamp).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {savedConfigs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无保存的配置</p>
                ) : (
                  savedConfigs.map((config) => (
                    <div key={config.name} className="flex items-center gap-2 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-all duration-200 hover:scale-102">
                      <button
                        onClick={() => loadConfiguration(config.name)}
                        className="flex-1 text-left"
                      >
                        <p className="font-medium text-gray-800">{config.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(config.timestamp).toLocaleString('zh-CN')}
                        </p>
                      </button>
                      <button
                        onClick={() => deleteConfiguration(config.name)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        删除
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 武器选择弹窗 */}
      {showWeaponSelect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowWeaponSelect(false)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">选择武器</h3>
              <button onClick={() => setShowWeaponSelect(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <input
              type="text"
              placeholder="搜索武器..."
              value={weaponSearch}
              onChange={(e) => setWeaponSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="grid grid-cols-3 gap-4">
              {Object.keys(WEAPONS).filter(name => name.includes(weaponSearch)).map(name => (
                <WeaponCard
                  key={name}
                  name={name}
                  imageKey={(WEAPONS as any)[name].baseStats.imageKey}
                  rarity={(WEAPONS as any)[name].baseStats.rarity}
                  weaponType={(WEAPONS as any)[name].baseStats.weaponType}
                  variant="select"
                  onClick={() => {
                    setSelectedWeaponName(name);
                    setShowWeaponSelect(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
