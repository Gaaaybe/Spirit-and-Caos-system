import type { Character } from '../../enterprise/entities/character';

export abstract class CharactersRepository {
  abstract create(character: Character): Promise<void>;
  abstract save(character: Character): Promise<void>;
  abstract findById(id: string): Promise<Character | null>;
  abstract findByUserId(userId: string): Promise<Character[]>;
  abstract delete(character: Character): Promise<void>;
}
