import { WatchedList } from '@/core/entities/watched-list';
import { CharacterPower } from '../character-power';

export class CharacterPowerList extends WatchedList<CharacterPower> {
  compareItems(a: CharacterPower, b: CharacterPower): boolean {
    return a.powerId === b.powerId;
  }
}
