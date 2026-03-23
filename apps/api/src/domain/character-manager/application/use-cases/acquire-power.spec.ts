import { AcquirePowerUseCase } from './acquire-power';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { InMemoryPowersLookupPort } from '../../../../../test/repositories/in-memory-powers-lookup-port';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { AcquirePowerService } from '../../enterprise/services/acquire-power';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let inMemoryPowersLookupPort: InMemoryPowersLookupPort;
let acquirePowerService: AcquirePowerService;
let sut: AcquirePowerUseCase;

describe('Acquire Power', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    inMemoryPowersLookupPort = new InMemoryPowersLookupPort();
    acquirePowerService = new AcquirePowerService();
    sut = new AcquirePowerUseCase(
      inMemoryCharactersRepository,
      inMemoryPowersLookupPort,
      acquirePowerService,
    );
  });

  it('should be able to acquire a power', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    character.pda.refund(character.pda.spentPda);
    
    inMemoryCharactersRepository.items.push(character);

    inMemoryPowersLookupPort.items.push({
      id: 'power-1',
      nome: 'Fireball',
      domainId: 'fire-domain',
      pdaCost: 10,
      slotCost: 2,
    });

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      powerId: 'power-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.powers.getItems()).toHaveLength(1);
      expect(result.value.character.powers.getItems()[0].powerId).toBe('instance-power-1-character-1');
      expect(result.value.character.pda.availablePda).toBe(character.pda.totalPda - 10);
    }
  });
});
