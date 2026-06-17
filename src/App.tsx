import { useState } from 'react';
import { Header } from './components/Header';
import { SaveLoadPanel } from './components/SaveLoadPanel';
import { TabBar, type TabKey } from './components/TabBar';
import { CharacterSection } from './components/character/CharacterSection';
import { WeaponSection } from './components/weapon/WeaponSection';
import { CritSection } from './components/crit/CritSection';
import { EnemySection } from './components/enemy/EnemySection';
import { EchoSection } from './components/echo/EchoSection';
import { SkillComboSection } from './components/skill/SkillComboSection';
import { BonusSection } from './components/bonus/BonusSection';
import { ResultsPanel } from './components/results/ResultsPanel';
import { SubstatWeightPanel } from './components/results/SubstatWeightPanel';
import { useCalculator } from './hooks/useCalculator';

export default function App() {
  const {
    formState, result, substatWeights,
    setCharacter, setWeapon,
    addBonus, removeBonus, updateBonus,
    setEnemy, setCrit, setEchoSlot,
    addEchoSlot, removeEchoSlot,
    addSetBonus, removeSetBonus, updateSetBonus,
    addSkill, removeSkill, updateSkill, replaceSkills,
    loadState, resetAll,
  } = useCalculator();

  const [activeTab, setActiveTab] = useState<TabKey>('char-weapon');

  const hasResult = result !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white text-gray-800">
      <Header>
        <SaveLoadPanel formState={formState} onLoad={loadState} />
      </Header>

      {/* Tab bar + reset */}
      <div className="max-w-7xl mx-auto px-4 pt-4 flex items-start gap-3">
        <TabBar active={activeTab} onChange={setActiveTab} hasResult={hasResult} />
        <button
          type="button"
          onClick={resetAll}
          className="px-3 py-2 rounded-lg text-sm font-medium text-gray-400 bg-white/60 border border-gray-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all duration-200 shrink-0"
        >
          重置
        </button>
      </div>

      {/* Tab content */}
      <main className="max-w-7xl mx-auto p-4">
        {activeTab === 'char-weapon' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CharacterSection character={formState.character} onChange={setCharacter} />
            <div className="space-y-4">
              <WeaponSection weapon={formState.weapon} onChange={setWeapon} />
              <EnemySection enemy={formState.enemy} onChange={setEnemy} />
            </div>
          </div>
        )}

        {activeTab === 'echo' && (
          <div className="max-w-2xl mx-auto">
            <EchoSection
              echoConfig={formState.echoConfig}
              onSlotChange={setEchoSlot}
              onAddSlot={addEchoSlot}
              onRemoveSlot={removeEchoSlot}
              onAddSetBonus={addSetBonus}
              onRemoveSetBonus={removeSetBonus}
              onUpdateSetBonus={updateSetBonus}
            />
          </div>
        )}

        {activeTab === 'skill' && (
          <div className="max-w-2xl mx-auto">
            <SkillComboSection
              skills={formState.skillCombo}
              onAdd={addSkill}
              onRemove={removeSkill}
              onUpdate={updateSkill}
              onImport={replaceSkills}
            />
          </div>
        )}

        {activeTab === 'buff' && (
          <div className="max-w-2xl mx-auto">
            <BonusSection
              entries={formState.bonuses.entries}
              skills={formState.skillCombo}
              onAdd={addBonus}
              onRemove={removeBonus}
              onUpdate={updateBonus}
            />
          </div>
        )}

        {activeTab === 'result' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <CritSection crit={formState.crit} onChange={setCrit} />
            <ResultsPanel result={result} substatWeights={[]} />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="max-w-3xl mx-auto">
            {hasResult ? (
              <SubstatWeightPanel weights={substatWeights} />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                请先配置参数并点击"计算伤害"
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
