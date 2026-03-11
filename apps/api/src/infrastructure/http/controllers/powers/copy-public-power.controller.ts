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
import { CopyPublicPowerUseCase } from '@/domain/power-manager/application/use-cases/copy-public-power';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { PowerPresenter } from '../../presenters/power.presenter';

@Controller('/powers/:powerId/copy')
export class CopyPublicPowerController {
  constructor(private copyPublicPower: CopyPublicPowerUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(@Param('powerId') powerId: string, @CurrentUser() user: UserPayload) {
    const result = await this.copyPublicPower.execute({ powerId, userId: user.sub });

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

    return PowerPresenter.toHTTP(result.value.power);
  }
}
