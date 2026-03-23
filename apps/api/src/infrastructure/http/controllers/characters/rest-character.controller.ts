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
import { RestUseCase } from '@/domain/character-manager/application/use-cases/rest';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CharacterPresenter } from '../../presenters/character.presenter';

const restBodySchema = z.object({
  quality: z.enum(['RUIM', 'NORMAL', 'CONFORTAVEL', 'LUXUOSA']).default('NORMAL'),
  durationHours: z.number().int().min(1).default(8),
  hasCare: z.boolean().default(false),
});

type RestBodySchema = z.infer<typeof restBodySchema>;

@Controller('/characters/:characterId/rest')
export class RestCharacterController {
  constructor(private rest: RestUseCase) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Body(new ZodValidationPipe(restBodySchema)) body: RestBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.rest.execute({
      characterId,
      userId: user.sub,
      quality: body.quality,
      durationHours: body.durationHours,
      hasCare: body.hasCare,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof NotAllowedError) {
        throw new ForbiddenException(error.message);
      }

      throw new BadRequestException('Failed to rest character');
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
