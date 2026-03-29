import { CharacterResponse, SyncCharacterData } from '@/services/characters.types';
import { AttributeCard } from './Sidebar/AttributeCard';
import { VitalsCard } from './Sidebar/VitalsCard';
import { DefenseCard } from './Sidebar/DefenseCard';
import { ConditionsCard } from './Sidebar/ConditionsCard';
import { InspirationPdACard } from './Sidebar/InspirationPdACard';
import { PassiveStatsCard } from './Sidebar/PassiveStatsCard';

interface SidebarColumnProps {
  character: CharacterResponse;
  onSync: (data: SyncCharacterData) => Promise<void>;
}

export function SidebarColumn({ character, onSync }: SidebarColumnProps) {
  return (
    <div className="flex flex-col gap-6">
      <AttributeCard character={character} onSync={onSync} />
      <VitalsCard health={character.health} energy={character.energy} onSync={onSync} />
      <DefenseCard character={character} />
      <ConditionsCard conditions={character.conditions} />
      <InspirationPdACard inspiration={character.inspiration} pda={character.pda} onSync={onSync} />
      <PassiveStatsCard character={character} />
    </div>
  );
}
