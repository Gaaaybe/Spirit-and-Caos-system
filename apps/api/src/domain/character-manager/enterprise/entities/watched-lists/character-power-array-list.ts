import { WatchedList } from '@/core/entities/watched-list';
import { CharacterPowerArray } from '../character-power-array';

export class CharacterPowerArrayList extends WatchedList<CharacterPowerArray> {
  compareItems(a: CharacterPowerArray, b: CharacterPowerArray): boolean {
    return a.powerArrayId === b.powerArrayId;
  }
}
