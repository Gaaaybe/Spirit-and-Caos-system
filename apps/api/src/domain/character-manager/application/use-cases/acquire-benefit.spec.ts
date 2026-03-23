import { AcquireBenefitUseCase } from './acquire-benefit';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { BenefitsLookupPort, BenefitInfo } from '../repositories/benefits-lookup-port';
import { AcquireBenefitService } from '../../enterprise/services/acquire-benefit';
import { CalculateBenefitCostService } from '../../enterprise/services/calculate-benefit-cost';

class InMemoryBenefitsLookupPort extends BenefitsLookupPort {
  public items: BenefitInfo[] = [];

  async findByName(name: string): Promise<BenefitInfo | null> {
    const benefit = this.items.find((b) => b.nome === name);
    return benefit || null;
  }
}

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let inMemoryBenefitsLookupPort: InMemoryBenefitsLookupPort;
let acquireBenefitService: AcquireBenefitService;
let sut: AcquireBenefitUseCase;

describe('Acquire Benefit', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    inMemoryBenefitsLookupPort = new InMemoryBenefitsLookupPort();
    const calculateCostService = new CalculateBenefitCostService();
    acquireBenefitService = new AcquireBenefitService(calculateCostService);
    sut = new AcquireBenefitUseCase(
      inMemoryCharactersRepository,
      inMemoryBenefitsLookupPort,
      acquireBenefitService,
    );
  });

  it('should be able to acquire a benefit', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);

    inMemoryBenefitsLookupPort.items.push({
      nome: 'Agarrar aprimorado',
      tipo: 'combate',
      graus: 1,
      descricao: 'Teste',
    });

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      benefitName: 'Agarrar aprimorado',
      targetDegree: 1,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.benefits.getItems()).toHaveLength(1);
      expect(result.value.character.benefits.getItems()[0].name).toBe('Agarrar aprimorado');
      expect(result.value.costPaid).toBe(3);
    }
  });
});
