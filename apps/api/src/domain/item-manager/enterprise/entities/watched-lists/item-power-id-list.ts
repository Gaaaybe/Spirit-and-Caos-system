import { WatchedList } from '@/core/entities/watched-list';
import type { UniqueEntityId } from '@/core/entities/unique-entity-ts';

export class ItemPowerIdList extends WatchedList<UniqueEntityId> {
  compareItems(a: UniqueEntityId, b: UniqueEntityId): boolean {
    return a.equals(b);
  }
}
