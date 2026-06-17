import { useState } from 'react';
import { Card } from '../ui/Card';
import { FormSelect } from '../ui/FormSelect';
import { X, Plus } from 'lucide-react';
import type {
  EchoConfig, EchoSlot, EchoCost, EchoMainStat, EchoSubStatType, EchoSetBonusItem, EchoSetBonusStatType,
} from '../../types/echo';
import {
  COST_MAIN_STATS, COST_SECONDARY,
  ECHO_MAINSTAT_LABELS, ECHO_SUBSTAT_LABELS, SUBSTAT_VALUES,
  ECHO_MAINSTAT_VALUES,
} from '../../types/echo';

interface Props {
  echoConfig: EchoConfig;
  onSlotChange: (index: number, slot: EchoSlot) => void;
  onAddSlot: () => void;
  onRemoveSlot: (index: number) => void;
  onAddSetBonus: () => void;
  onRemoveSetBonus: (id: string) => void;
  onUpdateSetBonus: (id: string, patch: Partial<EchoSetBonusItem>) => void;
}

const COST_OPTIONS = [
  { value: '1', label: '1' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
];

const SUBSTAT_TYPE_OPTIONS = (Object.keys(ECHO_SUBSTAT_LABELS) as EchoSubStatType[]).map(t => ({
  value: t,
  label: ECHO_SUBSTAT_LABELS[t],
}));

const SET_BONUS_TYPE_OPTIONS: { value: EchoSetBonusStatType; label: string }[] = [
  ...SUBSTAT_TYPE_OPTIONS,
  { value: 'elemental_dmg', label: '属性伤害加成' },
];

function getDefaultMainStatValue(cost: EchoCost, type: EchoMainStat): number {
  return ECHO_MAINSTAT_VALUES[cost]?.[type] ?? 0;
}

export function EchoSection({ echoConfig, onSlotChange, onAddSlot, onRemoveSlot, onAddSetBonus, onRemoveSetBonus, onUpdateSetBonus }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const slots = echoConfig.slots;

  const totalCost = slots.reduce((sum, s) => sum + s.cost, 0);
  const maxSlots = 5;

  // Keep selectedIdx in bounds when slots are removed
  const safeIdx = Math.min(selectedIdx, Math.max(0, slots.length - 1));
  const selectedSlot = slots[safeIdx];

  const handleRemoveSlot = (idx: number) => {
    if (safeIdx >= slots.length - 1 && slots.length > 1) {
      setSelectedIdx(slots.length - 2);
    }
    onRemoveSlot(idx);
  };

  const handleCostChange = (costStr: string) => {
    const cost = Number(costStr) as EchoCost;
    const available = COST_MAIN_STATS[cost];
    let mainStatType = selectedSlot.mainStatType;
    if (!available.includes(mainStatType)) {
      mainStatType = available[0];
    }
    const mainStatValue = getDefaultMainStatValue(cost, mainStatType);
    onSlotChange(safeIdx, {
      ...selectedSlot,
      cost,
      mainStatType,
      mainStatValue,
      subStats: selectedSlot.subStats,
    });
  };

  const handleMainStatChange = (value: string) => {
    const ms = value as EchoMainStat;
    const mainStatValue = getDefaultMainStatValue(selectedSlot.cost, ms);
    onSlotChange(safeIdx, { ...selectedSlot, mainStatType: ms, mainStatValue });
  };

  const handleMainStatValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSlotChange(safeIdx, { ...selectedSlot, mainStatValue: Number(e.target.value) });
  };

  const handleSubstatTypeChange = (subIdx: number, typeStr: string) => {
    const type = typeStr as EchoSubStatType;
    const values = SUBSTAT_VALUES[type];
    const newValue = values.length > 0 ? values[0] : 0;
    const subStats = selectedSlot.subStats.map((s, i) =>
      i === subIdx ? { ...s, type, value: newValue } : s
    );
    onSlotChange(safeIdx, { ...selectedSlot, subStats });
  };

  const handleSubstatValueChange = (subIdx: number, valueStr: string) => {
    const value = Number(valueStr);
    const subStats = selectedSlot.subStats.map((s, i) =>
      i === subIdx ? { ...s, value } : s
    );
    onSlotChange(safeIdx, { ...selectedSlot, subStats });
  };

  const mainStatOptions = selectedSlot
    ? COST_MAIN_STATS[selectedSlot.cost].map(t => ({
        value: t,
        label: ECHO_MAINSTAT_LABELS[t],
      }))
    : [];

  const secondary = selectedSlot ? COST_SECONDARY[selectedSlot.cost] : { type: '', label: '', value: 0 };

  return (
    <Card title="声骸配置" borderColor="green">
      {/* Remaining cost display + add slot */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">
          使用 cost: <span className={`font-semibold ${totalCost > 12 ? 'text-red-500' : 'text-gray-700'}`}>{totalCost}/12</span>
        </span>
        <button
          type="button"
          disabled={slots.length >= maxSlots}
          onClick={onAddSlot}
          className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all duration-200 ${
            slots.length >= maxSlots
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          <Plus size={12} />
          添加声骸
        </button>
      </div>

      {/* Slot selector bar */}
      {slots.length > 0 ? (
        <div className="grid grid-cols-5 gap-2 mb-4">
          {slots.map((slot, i) => (
            <div key={i} className="relative">
              <button
                type="button"
                onClick={() => setSelectedIdx(i)}
                className={`w-full rounded-lg border-2 p-2 text-center transition-all duration-200 hover:scale-105 ${
                  i === safeIdx
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-bold text-gray-400">COST</div>
                <div className="text-lg font-bold text-gray-800">{slot.cost}</div>
                <div className="text-xs text-gray-500 truncate">
                  {ECHO_MAINSTAT_LABELS[slot.mainStatType]}
                </div>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemoveSlot(i); }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-400 text-white
                  hover:bg-red-600 flex items-center justify-center transition-colors text-xs leading-none"
                title="移除此声骸"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {/* Fill remaining grid cells with placeholder */}
          {Array.from({ length: maxSlots - slots.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="rounded-lg border-2 border-dashed border-gray-200 p-2 text-center bg-gray-50 flex flex-col items-center justify-center min-h-[70px]"
            >
              <span className="text-xs text-gray-300">空</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-4 p-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-center text-sm text-gray-400">
          尚未装配声骸，点击"添加声骸"按钮添加
        </div>
      )}

      {/* Selected slot config */}
      {slots.length > 0 && selectedSlot && (
      <div className="space-y-3 border-t border-gray-100 pt-3">
        <h4 className="text-sm font-semibold text-gray-700">槽位 {safeIdx + 1} 配置</h4>

        <div className="grid grid-cols-2 gap-3">
          <FormSelect
            label="COST"
            value={String(selectedSlot.cost)}
            options={COST_OPTIONS}
            onChange={handleCostChange}
          />
          <FormSelect
            label="主属性"
            value={selectedSlot.mainStatType}
            options={mainStatOptions}
            onChange={handleMainStatChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-600">主属性数值</span>
            <input
              type="number"
              value={selectedSlot.mainStatValue || ''}
              onChange={handleMainStatValueChange}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-600">固定副属性</span>
            <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-500 text-sm flex items-center h-[42px]">
              {secondary.label} {secondary.value}
            </div>
          </label>
        </div>

        {/* Sub stats */}
        <div>
          <span className="text-sm font-medium text-gray-600 block mb-2">副词条</span>
          <div className="space-y-2">
            {selectedSlot.subStats.map((sub, subIdx) => {
              const valueOptions = SUBSTAT_VALUES[sub.type].map(v => ({
                value: String(v),
                label: String(v),
              }));
              // 排除同一槽位已选择的其他副词条类型
              const usedTypes = new Set(
                selectedSlot.subStats
                  .filter((_, i) => i !== subIdx)
                  .map(s => s.type)
              );
              const filteredOptions = SUBSTAT_TYPE_OPTIONS.filter(o => !usedTypes.has(o.value) || o.value === sub.type);
              return (
                <div key={subIdx} className="grid grid-cols-2 gap-2 items-end">
                  <FormSelect
                    label={`#${subIdx + 1}`}
                    value={sub.type}
                    options={filteredOptions}
                    onChange={v => handleSubstatTypeChange(subIdx, v)}
                  />
                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-600">&nbsp;</span>
                    <select
                      value={String(sub.value)}
                      onChange={e => handleSubstatValueChange(subIdx, e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200"
                    >
                      <option value="0">未设置</option>
                      {valueOptions.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Set bonuses section */}
      <div className="border-t border-gray-100 pt-3 mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">套装效果</span>
          <button
            type="button"
            onClick={onAddSetBonus}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 flex items-center gap-1"
          >
            <Plus size={12} />
            添加
          </button>
        </div>
        {echoConfig.setBonuses.length === 0 ? (
          <p className="text-xs text-gray-400">暂无套装效果，点击上方添加</p>
        ) : (
          <div className="space-y-2">
            {echoConfig.setBonuses.map((bonus) => (
              <div key={bonus.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                <FormSelect
                  label="类型"
                  value={bonus.statType}
                  options={SET_BONUS_TYPE_OPTIONS}
                  onChange={v => onUpdateSetBonus(bonus.id, { statType: v as EchoSetBonusStatType })}
                />
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-600">数值</span>
                  <input
                    type="number"
                    value={bonus.value || ''}
                    onChange={e => onUpdateSetBonus(bonus.id, { value: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-all duration-200
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onRemoveSetBonus(bonus.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
