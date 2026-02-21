// 角色技能条件UI渲染组件
// 根据角色数据中的conditionalUI配置动态渲染输入控件

import React from "react";
import { CharacterPassiveSkill } from "@/types";

interface ConditionalUIRendererProps {
  skill: CharacterPassiveSkill;
  value: number;
  onChange: (value: number) => void;
}

export function ConditionalUIRenderer({ skill, value, onChange }: ConditionalUIRendererProps) {
  if (!skill.conditionalUI || !skill.enabled) return null;

  const { type, label, options, min, max, suffix } = skill.conditionalUI;

  return (
    <div className="mt-3 p-2 bg-yellow-50 rounded">
      <label className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">{label}：</span>
        {type === "select" && options && (
          <select
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded bg-white text-sm"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
                {suffix || ""}
              </option>
            ))}
          </select>
        )}
        {type === "number" && (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            className="px-3 py-1 border border-gray-300 rounded bg-white text-sm w-20"
          />
        )}
        {type === "slider" && (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="range"
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              min={min}
              max={max}
              className="flex-1"
            />
            <span className="text-sm w-12 text-right">
              {value}
              {suffix || ""}
            </span>
          </div>
        )}
      </label>
    </div>
  );
}
