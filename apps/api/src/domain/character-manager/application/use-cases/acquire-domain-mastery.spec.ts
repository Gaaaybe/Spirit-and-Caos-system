import { AcquireDomainMasteryUseCase } from './acquire-domain-mastery';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainsLookupPort } from '../repositories/domains-lookup-port';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { SpiritualPrinciple } from '../../enterprise/entities/value-objects/spiritual-principle';
import { DomainValidationError } from '@/core/errors/domain-validation-error';

class InMemoryDomainsLookupPort implements DomainsLookupPort {
  public items: any[] = [];

  async findById(id: string): Promise<any | null> {
    const domain = this.items.find((domain) => domain.id.toString() === id);

    if (!domain) {
      return null;
    }

    return domain;
  }
}

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let inMemoryDomainsLookupPort: InMemoryDomainsLookupPort;
let sut: AcquireDomainMasteryUseCase;

describe('Acquire Domain Mastery', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    inMemoryDomainsLookupPort = new InMemoryDomainsLookupPort();
    sut = new AcquireDomainMasteryUseCase(
      inMemoryCharactersRepository,
      inMemoryDomainsLookupPort,
    );
  });

  it('should be able to acquire domain mastery', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);

    inMemoryDomainsLookupPort.items.push({ id: new UniqueEntityId('domain-1') });

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      domainId: 'domain-1',
      masteryLevel: 'MESTRE',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.domainMasteries).toHaveLength(1);
      expect(result.value.character.domainMasteries[0].domainId).toBe('domain-1');
      expect(result.value.character.domainMasteries[0].masteryLevel).toBe('MESTRE');
    }
  });

  it('should not be able to acquire mastery for a non-existing domain', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      domainId: 'non-existing-domain',
      masteryLevel: 'MESTRE',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to acquire mastery for a spiritual domain without spiritual awakening', async () => {
    const character = makeCharacter(
      {
        spiritualPrinciple: SpiritualPrinciple.create({
          isUnlocked: false,
        }),
      },
      new UniqueEntityId('character-1'),
    );
    inMemoryCharactersRepository.items.push(character);

    inMemoryDomainsLookupPort.items.push({
      id: new UniqueEntityId('spiritual-domain'),
      nome: 'Domínio Espiritual',
      espiritual: true,
    });

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      domainId: 'spiritual-domain',
      masteryLevel: 'INICIANTE',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DomainValidationError);
  });
});
