import { useState, useCallback, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import type {
  FormState,
  CharacterInput,
  WeaponInput,
  BonusInput,
  BonusEntry,
  EnemyInput,
  CritInput,
  SkillEntry,
  SkillType,
  DamageCategory,
  CalculationResult,
  ElementType,
  WeaponMainStat,
  CritMode,
  SkillAttributeBonus,
  SubstatWeightItem,
} from '../types';
import type { EchoSlot, EchoSubStatType, EchoCost, EchoSetBonusItem } from '../types/echo';
import { COST_MAIN_STATS, ECHO_MAINSTAT_VALUES } from '../types/echo';
import { calculateDamage, analyzeSubstatWeights } from '../utils/damageCalculator';

function createEchoSlot(cost: EchoCost): EchoSlot {
  const defaultMainStat = COST_MAIN_STATS[cost][0];
  return {
    cost,
    mainStatType: defaultMainStat,
    mainStatValue: ECHO_MAINSTAT_VALUES[cost]?.[defaultMainStat] ?? 0,
    subStats: Array.from({ length: 5 }, () => ({ type: 'atk_percent' as EchoSubStatType, value: 0 })),
  };
}

const createInitialState = (): FormState => ({
  character: {
    name: '', level: 90, baseAtk: 0, baseHp: 0, baseDef: 0,
    elementType: 'aero' as ElementType,
    damageScaling: 'atk',
    resonanceEfficiency: 100,
    elementalDamageBonus: 0,
    critRate: 0,
    critDamage: 150,
    skillBonuses: [
      { statType: 'none', value: 0 },
      { statType: 'none', value: 0 },
    ] as [SkillAttributeBonus, SkillAttributeBonus],
  },
  weapon: {
    name: '', baseAtk: 0, mainStatType: 'atk_percent' as WeaponMainStat, mainStatValue: 0,
    skillBonuses: [
      { statType: 'none', value: 0 },
      { statType: 'none', value: 0 },
    ] as [SkillAttributeBonus, SkillAttributeBonus],
  },
  bonuses: { entries: [] },
  enemy: { level: 100, elementalResistance: 10, damageReduction: 0, defenseIgnore: 0 },
  crit: { critMode: 'crit' as CritMode },
  skillCombo: [{
    id: nanoid(), name: '一段', multiplier: 100, multiplierBonus: 0,
    skillType: 'normal_attack' as SkillType,
    damageCategory: 'basic' as DamageCategory,
  }],
  echoConfig: {
    slots: [4, 3, 3, 1, 1].map(c => createEchoSlot(c as EchoCost)),
    setBonuses: [],
  },
});

export function useCalculator() {
  const [formState, setFormState] = useState<FormState>(createInitialState);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [substatWeights, setSubstatWeights] = useState<SubstatWeightItem[]>([]);

  const setCharacter = useCallback((patch: Partial<CharacterInput>) => {
    setFormState(prev => ({ ...prev, character: { ...prev.character, ...patch } }));
  }, []);

  const setWeapon = useCallback((patch: Partial<WeaponInput>) => {
    setFormState(prev => ({ ...prev, weapon: { ...prev.weapon, ...patch } }));
  }, []);

  const addBonus = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      bonuses: {
        entries: [...prev.bonuses.entries, {
          id: nanoid(), name: '', effectType: 'damage_amplification' as const,
          value: 0, targetType: 'global' as const, targetSkillIds: [],
        }],
      },
    }));
  }, []);

  const removeBonus = useCallback((id: string) => {
    setFormState(prev => ({
      ...prev,
      bonuses: { entries: prev.bonuses.entries.filter(b => b.id !== id) },
    }));
  }, []);

  const updateBonus = useCallback((id: string, patch: Partial<BonusEntry>) => {
    setFormState(prev => ({
      ...prev,
      bonuses: {
        entries: prev.bonuses.entries.map(b => b.id === id ? { ...b, ...patch } : b),
      },
    }));
  }, []);

  const setEnemy = useCallback((patch: Partial<EnemyInput>) => {
    setFormState(prev => ({ ...prev, enemy: { ...prev.enemy, ...patch } }));
  }, []);

  const setCrit = useCallback((patch: Partial<CritInput>) => {
    setFormState(prev => ({ ...prev, crit: { ...prev.crit, ...patch } }));
  }, []);

  const setEchoSlot = useCallback((index: number, slot: EchoSlot) => {
    setFormState(prev => ({
      ...prev,
      echoConfig: {
        ...prev.echoConfig,
        slots: prev.echoConfig.slots.map((s, i) => i === index ? slot : s),
      },
    }));
  }, []);

  const addEchoSlot = useCallback(() => {
    setFormState(prev => {
      if (prev.echoConfig.slots.length >= 5) return prev;
      return {
        ...prev,
        echoConfig: {
          ...prev.echoConfig,
          slots: [...prev.echoConfig.slots, createEchoSlot(4)],
        },
      };
    });
  }, []);

  const removeEchoSlot = useCallback((index: number) => {
    setFormState(prev => ({
      ...prev,
      echoConfig: {
        ...prev.echoConfig,
        slots: prev.echoConfig.slots.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const addSetBonus = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      echoConfig: {
        ...prev.echoConfig,
        setBonuses: [
          ...prev.echoConfig.setBonuses,
          { id: nanoid(), statType: 'elemental_dmg', value: 0 },
        ],
      },
    }));
  }, []);

  const removeSetBonus = useCallback((id: string) => {
    setFormState(prev => ({
      ...prev,
      echoConfig: {
        ...prev.echoConfig,
        setBonuses: prev.echoConfig.setBonuses.filter(b => b.id !== id),
      },
    }));
  }, []);

  const updateSetBonus = useCallback((id: string, patch: Partial<EchoSetBonusItem>) => {
    setFormState(prev => ({
      ...prev,
      echoConfig: {
        ...prev.echoConfig,
        setBonuses: prev.echoConfig.setBonuses.map(b =>
          b.id === id ? { ...b, ...patch } : b
        ),
      },
    }));
  }, []);

  const addSkill = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      skillCombo: [
        ...prev.skillCombo,
        {
          id: nanoid(), name: '', multiplier: 0, multiplierBonus: 0,
          skillType: 'normal_attack' as SkillType,
          damageCategory: 'basic' as DamageCategory,
        },
      ],
    }));
  }, []);

  const removeSkill = useCallback((id: string) => {
    setFormState(prev => ({
      ...prev,
      skillCombo: prev.skillCombo.filter(s => s.id !== id),
    }));
  }, []);

  const updateSkill = useCallback((id: string, changes: Partial<SkillEntry>) => {
    setFormState(prev => ({
      ...prev,
      skillCombo: prev.skillCombo.map(s => s.id === id ? { ...s, ...changes } : s),
    }));
  }, []);

  const replaceSkills = useCallback((newSkills: SkillEntry[]) => {
    setFormState(prev => ({
      ...prev,
      skillCombo: newSkills.length > 0 ? newSkills : [{
        id: nanoid(), name: '一段', multiplier: 100, multiplierBonus: 0,
        skillType: 'normal_attack' as SkillType,
        damageCategory: 'basic' as DamageCategory,
      }],
    }));
  }, []);

  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const doCalculate = useCallback((state: FormState) => {
    const validSkills = state.skillCombo.filter(s => s.name.trim() !== '' && s.multiplier > 0);
    if (validSkills.length === 0) {
      setResult(null);
      setSubstatWeights([]);
      return;
    }
    try {
      const input = {
        character: state.character,
        weapon: state.weapon,
        skillCombo: validSkills,
        bonuses: state.bonuses,
        enemy: state.enemy,
        crit: state.crit,
        echoConfig: state.echoConfig,
      };
      setResult(calculateDamage(input));
      setSubstatWeights(analyzeSubstatWeights(input));
    } catch (e) {
      console.error('Calculate failed:', e);
    }
  }, []);

  // Auto-calculate on formState change (debounced 400ms)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      doCalculate(formState);
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [formState, doCalculate]);

  const resetAll = useCallback(() => {
    setFormState(createInitialState());
    setResult(null);
    setSubstatWeights([]);
  }, []);

  const loadState = useCallback((state: FormState) => {
    // Migrate old save format
    if (state.bonuses && !Array.isArray((state.bonuses as BonusInput).entries)) {
      (state as Record<string, unknown>).bonuses = { entries: [] };
    }
    setFormState(state);
    setResult(null);
    setSubstatWeights([]);
  }, []);

  return {
    formState, result, substatWeights,
    setCharacter, setWeapon,
    addBonus, removeBonus, updateBonus,
    setEnemy, setCrit, setEchoSlot,
    addEchoSlot, removeEchoSlot,
    addSetBonus, removeSetBonus, updateSetBonus,
    addSkill, removeSkill, updateSkill, replaceSkills,
    loadState, resetAll,
  };
}
