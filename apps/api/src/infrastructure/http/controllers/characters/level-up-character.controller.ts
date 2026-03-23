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
import { LevelUpCharacterUseCase } from '@/domain/character-manager/application/use-cases/level-up-character';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { CharacterPresenter } from '../../presenters/character.presenter';

@Controller('/characters/:characterId/level-up')
export class LevelUpCharacterController {
  constructor(private levelUpCharacter: LevelUpCharacterUseCase) {}

  @Post()
  @HttpCode(200)
  async handle(@Param('characterId') characterId: string, @CurrentUser() user: UserPayload) {
    const result = await this.levelUpCharacter.execute({
      characterId,
      userId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof NotAllowedError) {
        throw new ForbiddenException(error.message);
      }

      throw new BadRequestException('Failed to level up character');
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
