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
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { EvolveSpiritualPrincipleUseCase } from '@/domain/character-manager/application/use-cases/evolve-spiritual-principle';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { CharacterPresenter } from '../../presenters/character.presenter';

@Controller('/characters/:characterId/spiritual-evolution')
export class EvolveSpiritualPrincipleController {
  constructor(private evolveSpiritualPrinciple: EvolveSpiritualPrincipleUseCase) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.evolveSpiritualPrinciple.execute({
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

      if (error instanceof DomainValidationError) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException('Failed to evolve spiritual principle');
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
