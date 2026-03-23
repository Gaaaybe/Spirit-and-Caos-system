import {
  BadRequestException,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { DeletePowerArrayFromCharacterUseCase } from '@/domain/character-manager/application/use-cases/delete-power-array-from-character';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { CharacterPresenter } from '../../presenters/character.presenter';

@Controller('/characters/:characterId/power-arrays/:powerArrayId/remove')
export class DeletePowerArrayFromCharacterController {
  constructor(private deletePowerArrayFromCharacter: DeletePowerArrayFromCharacterUseCase) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Param('powerArrayId') powerArrayId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.deletePowerArrayFromCharacter.execute({
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

      throw new BadRequestException('Failed to remove power array');
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
