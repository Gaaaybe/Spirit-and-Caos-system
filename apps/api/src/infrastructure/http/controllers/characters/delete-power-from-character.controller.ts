import {
  BadRequestException,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { DeletePowerFromCharacterUseCase } from '@/domain/character-manager/application/use-cases/delete-power-from-character';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { CharacterPresenter } from '../../presenters/character.presenter';

@Controller('/characters/:characterId/powers/:powerId/remove')
export class DeletePowerFromCharacterController {
  constructor(private deletePowerFromCharacter: DeletePowerFromCharacterUseCase) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Param('powerId') powerId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.deletePowerFromCharacter.execute({
      characterId,
      userId: user.sub,
      powerId,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof NotAllowedError) {
        throw new ForbiddenException(error.message);
      }

      if (error instanceof DomainValidationError) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException('Failed to remove power');
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
