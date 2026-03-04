// 基础枚举类型

export type Rarity = 1 | 2 | 3 | 4 | 5;

export type WeaponType = "迅刀" | "长刃" | "佩枪" | "臂铠" | "音感仪";

export type ElementType =
  | "气动伤害"
  | "热熔伤害"
  | "衍射伤害"
  | "冷凝伤害"
  | "湮灭伤害"
  | "导电伤害";

export type ScalingTemplate = "攻击" | "生命" | "防御" | "共鸣效率";

export type DamageType =
  | "普攻"
  | "重击"
  | "共鸣技能"
  | "共鸣解放"
  | "效应伤害"
  | "震谐伤害"
  | "治疗"
  | "无伤害";

export type SkillCategory =
  | "常态攻击"
  | "共鸣技能"
  | "共鸣回路"
  | "共鸣解放"
  | "变奏技能";

export type MultiplierZone =
  | "倍率提升"
  | "伤害加深"
  | "伤害加成"
  | "无视防御"
  | "无视抗性"
  | "次数";

export type EchoCost = 1 | 3 | 4;

export type EffectType =
  | "光噪效应"
  | "风蚀效应"
  | "虚湮效应"
  | "聚爆效应"
  | "霜渐效应"
  | "电磁效应";
