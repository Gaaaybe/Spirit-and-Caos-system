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
import { CopyPublicPowerArrayUseCase } from '@/domain/power-manager/application/use-cases/copy-public-power-array';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { PowerArrayPresenter } from '../../presenters/power-array.presenter';

@Controller('/power-arrays/:powerArrayId/copy')
export class CopyPublicPowerArrayController {
  constructor(private copyPublicPowerArray: CopyPublicPowerArrayUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Param('powerArrayId') powerArrayId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.copyPublicPowerArray.execute({
      powerArrayId,
      userId: user.sub,
    });

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

    return PowerArrayPresenter.toHTTP(result.value.powerArray);
  }
}
