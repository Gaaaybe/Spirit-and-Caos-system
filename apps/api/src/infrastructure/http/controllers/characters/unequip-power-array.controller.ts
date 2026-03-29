import {
  BadRequestException,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { UnequipPowerArrayUseCase } from '@/domain/character-manager/application/use-cases/unequip-power-array';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { CharacterPresenter } from '../../presenters/character.presenter';

@Controller('/characters/:characterId/power-arrays/:powerArrayId/unequip')
export class UnequipPowerArrayController {
  constructor(private unequipPowerArray: UnequipPowerArrayUseCase) {}

  @Patch()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Param('powerArrayId') powerArrayId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.unequipPowerArray.execute({
      characterId,
      userId: user.sub,
      powerArrayId,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof NotAllowedError) {
        throw new ForbiddenException(error.message);
      }

      if (error instanceof DomainValidationError && error.message.includes('não encontrado')) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof DomainValidationError) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException('Failed to unequip power array');
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
