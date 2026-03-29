import { Controller, Get, Param } from '@nestjs/common';
import { FetchCharacterItemsUseCase } from '@/domain/item-manager/application/use-cases/fetch-character-items';
import { ItemPresenter } from '../../presenters/item.presenter';

@Controller('/characters/:characterId/items')
export class FetchCharacterItemsController {
  constructor(private fetchCharacterItems: FetchCharacterItemsUseCase) {}

  @Get()
  async handle(@Param('characterId') characterId: string) {
    const result = await this.fetchCharacterItems.execute({
      characterId,
    });

    return {
      items: result.value?.items.map(ItemPresenter.toHTTP),
    };
  }
}
