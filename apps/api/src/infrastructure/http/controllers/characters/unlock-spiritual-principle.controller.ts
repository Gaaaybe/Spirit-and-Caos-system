import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { UnlockSpiritualPrincipleUseCase } from '@/domain/character-manager/application/use-cases/unlock-spiritual-principle';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CharacterPresenter } from '../../presenters/character.presenter';

const unlockSpiritualPrincipleBodySchema = z.object({
  stage: z.enum(['DIVINE']),
});

type UnlockSpiritualPrincipleBodySchema = z.infer<typeof unlockSpiritualPrincipleBodySchema>;

@Controller('/characters/:characterId/spiritual-awakening')
export class UnlockSpiritualPrincipleController {
  constructor(private unlockSpiritualPrinciple: UnlockSpiritualPrincipleUseCase) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Body(new ZodValidationPipe(unlockSpiritualPrincipleBodySchema)) body: UnlockSpiritualPrincipleBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.unlockSpiritualPrinciple.execute({
      characterId,
      userId: user.sub,
      stage: body.stage,
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

      throw new BadRequestException('Failed to unlock spiritual principle');
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
