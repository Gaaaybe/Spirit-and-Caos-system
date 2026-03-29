import { DeletePowerFromCharacterUseCase } from './delete-power-from-character';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharacterPower } from '../../enterprise/entities/character-power';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: DeletePowerFromCharacterUseCase;

describe('Delete Power From Character', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new DeletePowerFromCharacterUseCase(inMemoryCharactersRepository);
  });

  it('should be able to delete a power from a character', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    const power = CharacterPower.create({
      powerId: 'power-1',
      finalPdaCost: 10,
      slotCost: 1,
      isEquipped: false,
    });
    
    character.powers.add(power);

    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      powerId: 'power-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.powers.getItems()).toHaveLength(0);
      expect(character.domainEvents).toHaveLength(1);
      expect(character.domainEvents[0].constructor.name).toBe('CharacterPowerDiscardedEvent');
    }
  });

  it('should unequip power before deleting if it is equipped', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    const power = CharacterPower.create({
      powerId: 'power-1',
      finalPdaCost: 10,
      slotCost: 1,
      isEquipped: true,
    });
    
    character.powers.add(power);
    character.slots.use(1);

    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      powerId: 'power-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.powers.getItems()).toHaveLength(0);
      expect(result.value.character.slots.usedSlots).toBe(0);
    }
  });

  it('should not be able to delete a power from another user character', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: 'other-user',
      powerId: 'power-1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
