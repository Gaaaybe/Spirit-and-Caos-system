import { AcquirePowerArrayUseCase } from './acquire-power-array';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { InMemoryPowerArraysLookupPort } from '../../../../../test/repositories/in-memory-power-arrays-lookup-port';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { AcquirePowerArrayService } from '../../enterprise/services/acquire-power-array';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let inMemoryPowerArraysLookupPort: InMemoryPowerArraysLookupPort;
let acquirePowerArrayService: AcquirePowerArrayService;
let sut: AcquirePowerArrayUseCase;

describe('Acquire Power Array', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    inMemoryPowerArraysLookupPort = new InMemoryPowerArraysLookupPort();
    acquirePowerArrayService = new AcquirePowerArrayService();
    sut = new AcquirePowerArrayUseCase(
      inMemoryCharactersRepository,
      inMemoryPowerArraysLookupPort,
      acquirePowerArrayService,
    );
  });

  it('should be able to acquire a power array', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    character.pda.refund(character.pda.spentPda);
    character.setDomainMastery('combat-domain', 'INICIANTE');
    
    inMemoryCharactersRepository.items.push(character);

    inMemoryPowerArraysLookupPort.items.push({
      id: 'array-1',
      nome: 'Arsenal',
      domainId: 'combat-domain',
      pdaCost: 10,
      slotCost: 4,
    });

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      powerArrayId: 'array-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.powerArrays.getItems()).toHaveLength(1);
      expect(result.value.character.powerArrays.getItems()[0].powerArrayId).toBe('instance-array-1-character-1');
      expect(result.value.character.pda.availablePda).toBe(character.pda.totalPda - 10);
    }
  });
});
