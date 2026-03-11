import {
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { DeleteItemUseCase } from '@/domain/item-manager/application/use-cases/delete-item';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';

@Controller('/items/:itemId')
export class DeleteItemController {
  constructor(private deleteItem: DeleteItemUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('itemId') itemId: string, @CurrentUser() user: UserPayload) {
    const result = await this.deleteItem.execute({ itemId, userId: user.sub });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        default:
          throw new NotFoundException(error.message);
      }
    }
  }
}
