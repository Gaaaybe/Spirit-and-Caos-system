import { DeletePowerArrayFromCharacterUseCase } from './delete-power-array-from-character';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharacterPowerArray } from '../../enterprise/entities/character-power-array';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: DeletePowerArrayFromCharacterUseCase;

describe('Delete Power Array From Character', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new DeletePowerArrayFromCharacterUseCase(inMemoryCharactersRepository);
  });

  it('should be able to delete a power array from a character', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    const powerArray = CharacterPowerArray.create({
      powerArrayId: 'array-1',
      finalPdaCost: 10,
      slotCost: 1,
      isEquipped: false,
    });
    
    character.powerArrays.add(powerArray);

    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      powerArrayId: 'array-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.powerArrays.getItems()).toHaveLength(0);
      expect(character.domainEvents).toHaveLength(1);
      expect(character.domainEvents[0].constructor.name).toBe('CharacterPowerArrayDiscardedEvent');
    }
  });

  it('should unequip power array before deleting if it is equipped', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    const powerArray = CharacterPowerArray.create({
      powerArrayId: 'array-1',
      finalPdaCost: 10,
      slotCost: 1,
      isEquipped: true,
    });
    
    character.powerArrays.add(powerArray);
    character.slots.use(1);

    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      powerArrayId: 'array-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.powerArrays.getItems()).toHaveLength(0);
      expect(result.value.character.slots.usedSlots).toBe(0);
    }
  });

  it('should not be able to delete a power array from another user character', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: 'other-user',
      powerArrayId: 'array-1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
