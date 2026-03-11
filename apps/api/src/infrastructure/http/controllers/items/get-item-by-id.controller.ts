import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { GetItemByIdUseCase } from '@/domain/item-manager/application/use-cases/get-item-by-id';
import { ItemPresenter } from '../../presenters/item.presenter';

@Controller('/items/:itemId')
export class GetItemByIdController {
  constructor(private getItemById: GetItemByIdUseCase) {}

  @Get()
  async handle(@Param('itemId') itemId: string) {
    const result = await this.getItemById.execute({ itemId });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new NotFoundException(error.message);
      }
    }

    return ItemPresenter.toHTTP(result.value.item);
  }
}
