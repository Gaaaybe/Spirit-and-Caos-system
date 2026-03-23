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
import { AddRunicsUseCase } from '@/domain/character-manager/application/use-cases/add-runics';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CharacterPresenter } from '../../presenters/character.presenter';

const addRunicsBodySchema = z.object({
  amount: z.number().int().min(1),
});

type AddRunicsBodySchema = z.infer<typeof addRunicsBodySchema>;

@Controller('/characters/:characterId/runics/add')
export class AddRunicsController {
  constructor(private addRunics: AddRunicsUseCase) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Body(new ZodValidationPipe(addRunicsBodySchema)) body: AddRunicsBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.addRunics.execute({
      characterId,
      userId: user.sub,
      amount: body.amount,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        case DomainValidationError:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
