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
import { CopyPublicPeculiarityUseCase } from '@/domain/power-manager/application/use-cases/copy-public-peculiarity';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { PeculiarityPresenter } from '../../presenters/peculiarity.presenter';

@Controller('/peculiarities/:peculiarityId/copy')
export class CopyPublicPeculiarityController {
  constructor(private copyPublicPeculiarity: CopyPublicPeculiarityUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Param('peculiarityId') peculiarityId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.copyPublicPeculiarity.execute({
      peculiarityId,
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

    return PeculiarityPresenter.toHTTP(result.value.peculiarity);
  }
}
