// 技能相关类型

import { DamageType, SkillCategory, EffectType } from "./bases";

export interface CharacterSkill {
  name: string;
  skillLevel: number; // 1-10
  scalingTemplate?: import("./bases").ScalingTemplate; // 技能缩放模板，默认"攻击"
  damageType: DamageType;
  skillCategory: SkillCategory;
  multiplierList: number[]; // 对应技能等级的倍率
  flatValueList?: number[]; // 治疗技能的扁平值
}

export interface CharacterPassiveSkill {
  name: string;
  description: string;
  enabled: boolean;
  effects: {
    statBonus?: Record<string, number>;
    conditional?: {
      condition: string;
      values: number[];
    };
  };
  affectedSkillTypes?: SkillCategory[];
  affectedSkillNames?: string[];
  conditionalUI?: {
    type: "select" | "number" | "slider";
    label: string;
    stateKey: string;
    options?: number[];
    min?: number;
    max?: number;
    suffix?: string;
  };
}

export interface CharacterOutroSkill {
  name: string;
  description: string;
  effects: {
    statBonus?: Record<string, number>;
  };
  affectedSkillTypes?: SkillCategory[];
  affectedSkillNames?: string[];
}

export interface CharacterSpecialControl {
  key: string;
  type: "radio" | "slider" | "checkbox";
  label: string;
  description?: string;
  enabledNote?: string;
  defaultValue: string | number | boolean;
  options?: Array<{
    value: string;
    label: string;
    activeClass?: string;
  }>;
  min?: number;
  max?: number;
  suffix?: string;
  showWhen?: { key: string; value: string | number | boolean };
  group?: string;
}

export interface CharacterSpecialGroup {
  name: string;
  bgClass: string;
  showWhen?: { key: string; value: string | number | boolean };
}

export interface CharacterSpecialConfig {
  sectionTitle?: string;
  controls: CharacterSpecialControl[];
  groups?: CharacterSpecialGroup[];
  passiveSkillFilter?: Array<{
    stateKey: string;
    stateValue: string | number | boolean;
    excludeSkillNameContains: string;
  }>;
  rotationButtons?: Array<{
    showWhen: { key: string; value: string | number | boolean };
    buttonLabel: string;
    skillName: string;
    type: "skill" | "zhenxieInterference";
    buttonClass?: string;
  }>;
}
