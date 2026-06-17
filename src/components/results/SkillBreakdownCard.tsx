import { useState } from 'react';
import type { SkillDamageResult } from '../../types';
import { SKILL_TYPE_LABELS, SKILL_TYPE_COLORS, DAMAGE_CAT_LABELS, DAMAGE_CAT_COLORS } from '../../types';
import { Card } from '../ui/Card';
import { CalculationSteps } from './CalculationSteps';
import { ChevronDown } from 'lucide-react';

interface Props {
  skill: SkillDamageResult;
}

export function SkillBreakdownCard({ skill }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const stColor = SKILL_TYPE_COLORS[skill.skillType];
  const dcColor = DAMAGE_CAT_COLORS[skill.damageCategory];

  return (
    <Card borderColor="cyan">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-800">{skill.skillName}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: stColor + '20', color: stColor }}
          >
            {SKILL_TYPE_LABELS[skill.skillType]}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: dcColor + '20', color: dcColor }}
          >
            {DAMAGE_CAT_LABELS[skill.damageCategory]}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-blue-600">
            {skill.finalDamage.toLocaleString('zh-CN')}
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronDown
              size={18}
              className="text-gray-400 transition-transform duration-300"
              style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
        </div>
      </div>

      {/* Collapsible calculation steps */}
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="pt-2">
            <CalculationSteps steps={skill.steps} />
          </div>
        </div>
      </div>
    </Card>
  );
}
