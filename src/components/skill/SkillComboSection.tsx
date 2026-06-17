import { useState } from 'react';
import type { SkillEntry, SkillType, DamageCategory } from '../../types';
import { SKILL_TYPE_OPTIONS, DAMAGE_CAT_OPTIONS } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SkillEntryForm } from './SkillEntryForm';
import { Plus, FileText, X } from 'lucide-react';
import { evaluateExpr } from '../../utils/expression';
import { nanoid } from 'nanoid';

interface Props {
  skills: SkillEntry[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, changes: Partial<SkillEntry>) => void;
  onImport: (newSkills: SkillEntry[]) => void;
}

/** 解析批量导入文本，每行一个技能 */
function parseSkillText(text: string): SkillEntry[] {
  const lines = text.split(/\n/).filter(line => line.trim());
  const results: SkillEntry[] = [];

  // Build lookup sets for fast matching
  const typeLabelSet = new Set(SKILL_TYPE_OPTIONS.map(o => o.label));
  const catLabelSet = new Set(DAMAGE_CAT_OPTIONS.map(o => o.label));
  const typeMap = new Map(SKILL_TYPE_OPTIONS.map(o => [o.label, o.value]));
  const catMap = new Map(DAMAGE_CAT_OPTIONS.map(o => [o.label, o.value]));

  for (const line of lines) {
    let name = '';
    let multiplier = 0;
    let skillType: SkillType = 'normal_attack';
    let damageCategory: DamageCategory = 'basic';

    // Split name from rest: "一段：4.78 常态攻击 普攻伤害" → name="一段", rest="4.78 常态攻击 普攻伤害"
    const colonIdx = line.search(/[：:]/);
    if (colonIdx >= 0) {
      name = line.slice(0, colonIdx).trim();
      const rest = line.slice(colonIdx + 1).trim();

      // Find type/category labels at the end of rest
      const words = rest.split(/\s+/);
      let exprEnd = words.length;

      // Check last word as damage category
      if (catLabelSet.has(words[exprEnd - 1])) {
        damageCategory = catMap.get(words[exprEnd - 1])!;
        exprEnd--;
      }
      // Check second-to-last word as skill type
      if (exprEnd > 0 && typeLabelSet.has(words[exprEnd - 1])) {
        skillType = typeMap.get(words[exprEnd - 1])!;
        exprEnd--;
      }

      // Everything before type/cat is the multiplier expression
      const multStr = words.slice(0, exprEnd).join('');
      const val = evaluateExpr(multStr);
      if (val !== null) multiplier = Math.round(val * 100) / 100;
    } else {
      // No colon: try "名称 倍率" format
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        name = parts[0];
        const val = evaluateExpr(parts[parts.length - 1]);
        if (val !== null) multiplier = Math.round(val * 100) / 100;
      } else {
        name = line.trim();
      }
    }

    if (name) {
      results.push({
        id: nanoid(),
        name,
        multiplier,
        multiplierBonus: 0,
        skillType,
        damageCategory,
      });
    }
  }

  return results;
}

export function SkillComboSection({ skills, onAdd, onRemove, onUpdate, onImport }: Props) {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const handleImport = () => {
    const parsed = parseSkillText(importText);
    if (parsed.length === 0) return;
    onImport(parsed);
    setShowImport(false);
    setImportText('');
  };

  return (
    <Card title="技能组合" borderColor="green">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <Button variant="secondary" onClick={onAdd} className="flex-1 flex items-center justify-center gap-1 text-sm">
          <Plus size={14} />
          添加技能
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowImport(!showImport)}
          className={`flex items-center justify-center gap-1 text-sm px-3 ${
            showImport ? 'bg-blue-100 text-blue-600 border-blue-200' : ''
          }`}
        >
          <FileText size={14} />
          批量导入
        </Button>
      </div>

      {/* Batch import panel */}
      {showImport && (
        <div className="mb-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">批量导入技能</span>
            <button
              type="button"
              onClick={() => setShowImport(false)}
              className="p-0.5 rounded text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder={"每行一个技能，格式：\n技能名：倍率 技能类型 伤害类别\n\n例：\n一段：4.78 常态攻击 普攻伤害\n二段：3.94%+3.94%+5.25% 常态攻击 普攻伤害\n四段：2.52%*3+7.54% 常态攻击 普攻伤害"}
            rows={6}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              支持格式：名称: 倍率 (类型/类别) 或 名称 倍率
            </span>
            <Button variant="primary" onClick={handleImport} className="text-xs !py-1.5 !px-4">
              导入 {importText.trim().split('\n').filter(l => l.trim()).length} 个技能
            </Button>
          </div>
        </div>
      )}

      {/* Skill list */}
      {skills.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-4">暂无技能，点击上方按钮添加</p>
      ) : (
        <div className="space-y-1.5">
          {skills.map((skill, i) => (
            <SkillEntryForm
              key={skill.id}
              skill={skill}
              index={i}
              onChange={changes => onUpdate(skill.id, changes)}
              onRemove={() => onRemove(skill.id)}
              canRemove={skills.length > 1}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
