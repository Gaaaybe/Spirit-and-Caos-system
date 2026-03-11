import {
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { CopyPublicItemUseCase } from '@/domain/item-manager/application/use-cases/copy-public-item';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ItemPresenter } from '../../presenters/item.presenter';

@Controller('/items/:itemId/copy')
export class CopyPublicItemController {
  constructor(private copyPublicItem: CopyPublicItemUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(@Param('itemId') itemId: string, @CurrentUser() user: UserPayload) {
    const result = await this.copyPublicItem.execute({ itemId, userId: user.sub });

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

    return ItemPresenter.toHTTP(result.value.item);
  }
}
