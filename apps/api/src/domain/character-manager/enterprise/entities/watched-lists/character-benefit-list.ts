import { WatchedList } from '@/core/entities/watched-list';
import { CharacterBenefit } from '../character-benefit';

export class CharacterBenefitList extends WatchedList<CharacterBenefit> {
  compareItems(a: CharacterBenefit, b: CharacterBenefit): boolean {
    return a.name === b.name;
  }
}
