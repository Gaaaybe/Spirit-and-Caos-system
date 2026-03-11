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
import { DeletePowerArrayUseCase } from '@/domain/power-manager/application/use-cases/delete-power-array';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';

@Controller('/power-arrays')
export class DeletePowerArrayController {
  constructor(private deletePowerArray: DeletePowerArrayUseCase) {}

  @Delete(':powerArrayId')
  @HttpCode(204)
  async handle(@CurrentUser() user: UserPayload, @Param('powerArrayId') powerArrayId: string) {
    const result = await this.deletePowerArray.execute({
      powerArrayId,
      userId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof ResourceNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof NotAllowedError) throw new ForbiddenException(error.message);
    }
  }
}
