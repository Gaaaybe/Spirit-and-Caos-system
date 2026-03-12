import { WatchedList } from '@/core/entities/watched-list';
import type { UniqueEntityId } from '@/core/entities/unique-entity-ts';

export class ItemPowerArrayIdList extends WatchedList<UniqueEntityId> {
  compareItems(a: UniqueEntityId, b: UniqueEntityId): boolean {
    return a.equals(b);
  }
}
