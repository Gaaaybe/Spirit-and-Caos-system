import { useState, useEffect } from 'react';
import { useCharacterSheet } from '../hooks/useCharacterSheet';
import { CharacterHeader } from './dashboard/CharacterHeader';
import { SidebarColumn } from './dashboard/SidebarColumn';
import { StatsColumn } from './dashboard/StatsColumn';
import { MainArea } from './dashboard/MainArea';
import { ConfirmDialog } from '@/shared/ui';

interface CharacterSheetDashboardProps {
  characterId: string;
}

export function CharacterSheetDashboard({ characterId }: CharacterSheetDashboardProps) {
  const {
    character,
    isLoading,
    isSyncing,
    sync,
    levelUp,
    acquireDomainMastery,
    discardDomainMastery,
    acquirePower,
    acquirePowerArray,
    equipPower,
    unequipPower,
    equipPowerArray,
    unequipPowerArray,
    removePower,
    removePowerArray,
    addItemToInventory,
    removeFromInventory,
    changeItemQuantity,
    equipItem,
    unequipItem,
    upgradeItem,
    addRunics,
    spendRunics,
    acquireBenefit,
    removeBenefit,
    updateUnarmedMastery,
    updateLocalCharacter,
    pendingAction,
    clearPendingAction,
  } = useCharacterSheet(characterId);
  const storageKey = `aetherium-tab-${characterId}`;
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(storageKey) || 'acoes';
  });

  useEffect(() => {
    localStorage.setItem(storageKey, activeTab);
  }, [activeTab, storageKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!character) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <CharacterHeader character={character} onSync={sync} onLevelUp={levelUp} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna 1: Sidebar Fixa (Estatísticas vitais) */}
        <div className="lg:col-span-3 space-y-6">
          <SidebarColumn character={character} onSync={sync} />
        </div>

        {/* Coluna 2: Detalhes de Atributos e Perícias */}
        <div className="lg:col-span-3 space-y-6">
          <StatsColumn character={character} onSync={sync} />
        </div>

        {/* Coluna 3: Área Principal de Conteúdo Dinâmico */}
        <div className="lg:col-span-6 space-y-6">
          <MainArea 
            character={character} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onSync={sync}
            isSyncing={isSyncing}
            onAcquireDomainMastery={acquireDomainMastery}
            onDiscardDomainMastery={discardDomainMastery}
            onAcquirePower={acquirePower}
            onAcquirePowerArray={acquirePowerArray}
            onEquipPower={equipPower}
            onUnequipPower={unequipPower}
            onEquipPowerArray={equipPowerArray}
            onUnequipPowerArray={unequipPowerArray}
            onRemovePower={removePower}
            onRemovePowerArray={removePowerArray}
            onEquipItem={equipItem}
            onUnequipItem={unequipItem}
            onAddItemToInventory={addItemToInventory}
            onRemoveFromInventory={removeFromInventory}
            onChangeItemQuantity={changeItemQuantity}
            onAddRunics={addRunics}
            onSpendRunics={spendRunics}
            onUpgradeItem={upgradeItem}
            onAcquireBenefit={acquireBenefit}
            onRemoveBenefit={removeBenefit}
            onUpdateUnarmedMastery={updateUnarmedMastery}
            onUpdateLocalCharacter={updateLocalCharacter}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!pendingAction}
        onClose={clearPendingAction}
        onConfirm={pendingAction?.onConfirm ?? (async () => {})}
        title={pendingAction?.title}
        message={pendingAction?.message ?? ''}
        confirmText={pendingAction?.confirmText}
        variant={pendingAction?.variant ?? 'warning'}
      />
    </div>
  );
}
