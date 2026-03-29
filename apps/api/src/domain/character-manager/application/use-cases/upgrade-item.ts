import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { ItemsLookupPort } from '../repositories/items-lookup-port';
import { Character } from '../../enterprise/entities/character';
import { DomainValidationError } from '@/core/errors/domain-validation-error';

interface UpgradeItemUseCaseRequest {
  characterId: string;
  userId: string;
  itemId: string;
  materialId: string;
  runicsCost: number;
}

type UpgradeItemUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError | DomainValidationError,
  {
    character: Character;
  }
>;

@Injectable()
export class UpgradeItemUseCase {
  constructor(
    private charactersRepository: CharactersRepository,
    private itemsLookupPort: ItemsLookupPort,
  ) {}

  async execute({
    characterId,
    userId,
    itemId,
    materialId,
    runicsCost,
  }: UpgradeItemUseCaseRequest): Promise<UpgradeItemUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    const item = await this.itemsLookupPort.findById(itemId);

    if (!item) {
      return left(new ResourceNotFoundError());
    }

    if (item.characterId !== characterId) {
      return left(new DomainValidationError('Apenas itens vinculados à ficha podem ser aprimorados', 'itemId'));
    }

    const currentUpgradeValue = item.upgradeLevel?.value ?? item.upgradeLevelValue;
    const maxUpgradeLimit = item.upgradeLevel?.maxLevel ?? item.upgradeLevelMax;

    if (typeof currentUpgradeValue !== 'number' || typeof maxUpgradeLimit !== 'number') {
      return left(new DomainValidationError('Este item não suporta aprimoramentos', 'itemId'));
    }

    const materialInInventory = character.inventory.bag.find(i => i.itemId === materialId);
    
    if (!materialInInventory || materialInInventory.quantity < 1) {
      return left(new DomainValidationError('Material de aprimoramento não encontrado no inventário', 'materialId'));
    }

    const material = await this.itemsLookupPort.findById(materialId);

    if (!material || material.tipo !== 'UPGRADE_MATERIAL') {
       return left(new DomainValidationError('Item selecionado não é um material de aprimoramento válido', 'materialId'));
    }

    if (currentUpgradeValue >= maxUpgradeLimit) {
      return left(new DomainValidationError('O item já atingiu seu limite máximo de aprimoramento', 'itemId'));
    }

    if (currentUpgradeValue >= material.maxUpgradeLimit) {
      return left(new DomainValidationError(`O material fornecido suporta aprimoramentos apenas até o nível ${material.maxUpgradeLimit}. O item já está no nível ${currentUpgradeValue}.`, 'materialId'));
    }

    try {
       character.spendRunics(runicsCost);
    } catch (error) {
       if (error instanceof DomainValidationError) {
          return left(error);
       }
       throw error;
    }

    character.removeFromInventory(materialId, 1);

    await this.itemsLookupPort.upgradeItem(itemId);

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
