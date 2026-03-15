import {
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { DeletePowerUseCase } from '@/domain/power-manager/application/use-cases/delete-power';
import { DependencyConflictError } from '@/domain/power-manager/application/use-cases/errors/dependency-conflict-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';

@Controller('/powers/:powerId')
export class DeletePowerController {
  constructor(private deletePower: DeletePowerUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('powerId') powerId: string, @CurrentUser() user: UserPayload) {
    const result = await this.deletePower.execute({ powerId, userId: user.sub });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        case DependencyConflictError:
          throw new ConflictException(error.message);
        default:
          throw new NotFoundException(error.message);
      }
    }
  }
}
