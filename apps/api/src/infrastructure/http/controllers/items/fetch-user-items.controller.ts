import { Controller, Get, Query } from '@nestjs/common';
import { FetchUserItemsUseCase } from '@/domain/item-manager/application/use-cases/fetch-user-items';
import { ItemType } from '@/domain/item-manager/enterprise/entities/item';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ItemPresenter } from '../../presenters/item.presenter';

const VALID_TYPES = Object.values(ItemType) as string[];

@Controller('/items/me')
export class FetchUserItemsController {
  constructor(private fetchUserItems: FetchUserItemsUseCase) {}

  @Get()
  async handle(
    @Query('page') page: string,
    @Query('tipo') tipo: string,
    @CurrentUser() user: UserPayload,
  ) {
    const tipoFilter = VALID_TYPES.includes(tipo) ? (tipo as ItemType) : undefined;

    const result = await this.fetchUserItems.execute({
      userId: user.sub,
      page: page ? Number(page) : 1,
      tipo: tipoFilter,
    });

    return result.value!.items.map(ItemPresenter.toHTTP);
  }
}
