import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { GetCharacterByIdUseCase } from '@/domain/character-manager/application/use-cases/get-character-by-id';
import { CharacterPresenter } from '../../presenters/character.presenter';

@Controller('/characters/:characterId')
export class GetCharacterByIdController {
  constructor(private getCharacterById: GetCharacterByIdUseCase) {}

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

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
