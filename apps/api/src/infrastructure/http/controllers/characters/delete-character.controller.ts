import {
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { DeleteCharacterUseCase } from '@/domain/character-manager/application/use-cases/delete-character';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';

@Controller('/characters/:characterId')
export class DeleteCharacterController {
  constructor(private deleteCharacter: DeleteCharacterUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('characterId') characterId: string, @CurrentUser() user: UserPayload) {
    const result = await this.deleteCharacter.execute({ characterId, userId: user.sub });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof NotAllowedError) {
        throw new ForbiddenException(error.message);
      }

      throw new NotFoundException('Character not found');
    }
  }
}
