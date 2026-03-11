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
import { DeletePeculiarityUseCase } from '@/domain/power-manager/application/use-cases/delete-peculiarity';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';

@Controller('/peculiarities/:peculiarityId')
export class DeletePeculiarityController {
  constructor(private deletePeculiarity: DeletePeculiarityUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('peculiarityId') peculiarityId: string, @CurrentUser() user: UserPayload) {
    const result = await this.deletePeculiarity.execute({
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
  }
}
