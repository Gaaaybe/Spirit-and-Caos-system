import { Controller, Get, Query } from '@nestjs/common';
import { FetchPublicItemsUseCase } from '@/domain/item-manager/application/use-cases/fetch-public-items';
import { ItemType } from '@/domain/item-manager/enterprise/entities/item';
import { Public } from '@/infrastructure/auth/public';
import { ItemPresenter } from '../../presenters/item.presenter';

const VALID_TYPES = Object.values(ItemType) as string[];

@Controller('/items')
export class FetchPublicItemsController {
  constructor(private fetchPublicItems: FetchPublicItemsUseCase) {}

  @Get()
  @Public()
  async handle(@Query('page') page: string, @Query('tipo') tipo: string) {
    const tipoFilter = VALID_TYPES.includes(tipo) ? (tipo as ItemType) : undefined;

    const result = await this.fetchPublicItems.execute({
      page: page ? Number(page) : 1,
      tipo: tipoFilter,
    });

    return result.value!.items.map(ItemPresenter.toHTTP);
  }
}
