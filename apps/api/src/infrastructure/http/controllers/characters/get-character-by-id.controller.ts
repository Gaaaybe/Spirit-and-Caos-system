import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { GetCharacterByIdUseCase } from '@/domain/character-manager/application/use-cases/get-character-by-id';
import { CharacterPresenter } from '../../presenters/character.presenter';
import { PeculiaritiesRepository } from '@/domain/power-manager/application/repositories/peculiarities-repository';
import { ItemsRepository } from '@/domain/item-manager/application/repositories/items-repository';

@Controller('/characters/:characterId')
export class GetCharacterByIdController {
  constructor(
    private getCharacterById: GetCharacterByIdUseCase,
    private peculiaritiesRepository: PeculiaritiesRepository,
    private itemsRepository: ItemsRepository,
  ) {}

  @Get()
  async handle(@Param('characterId') characterId: string) {
    const result = await this.getCharacterById.execute({ characterId });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw new NotFoundException('Character not found');
    }

    const character = result.value.character;
    const [peculiarities, items] = await Promise.all([
      this.peculiaritiesRepository.findByUserId(character.userId.toString(), { page: 1 }),
      this.itemsRepository.findByCharacterId(characterId),
    ]);

    return CharacterPresenter.toHTTP(character, peculiarities, items);
  }
}
