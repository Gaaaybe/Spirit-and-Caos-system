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
import { SpendRunicsUseCase } from '@/domain/character-manager/application/use-cases/spend-runics';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CharacterPresenter } from '../../presenters/character.presenter';

const spendRunicsBodySchema = z.object({
  amount: z.number().int().min(1),
});

type SpendRunicsBodySchema = z.infer<typeof spendRunicsBodySchema>;

@Controller('/characters/:characterId/runics/spend')
export class SpendRunicsController {
  constructor(private spendRunics: SpendRunicsUseCase) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Body(new ZodValidationPipe(spendRunicsBodySchema)) body: SpendRunicsBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.spendRunics.execute({
      characterId,
      userId: user.sub,
      amount: body.amount,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof NotAllowedError) {
        throw new ForbiddenException(error.message);
      }

      throw new BadRequestException(error.message);
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
