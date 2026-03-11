import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { z } from 'zod';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { UpdatePeculiarityUseCase } from '@/domain/power-manager/application/use-cases/update-peculiarity';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { PeculiarityPresenter } from '../../presenters/peculiarity.presenter';

const updatePeculiarityBodySchema = z.object({
  nome: z.string().min(3).max(100).optional(),
  descricao: z.string().min(10).max(500).optional(),
  espiritual: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

type UpdatePeculiarityBodySchema = z.infer<typeof updatePeculiarityBodySchema>;

@Controller('/peculiarities/:peculiarityId')
export class UpdatePeculiarityController {
  constructor(private updatePeculiarity: UpdatePeculiarityUseCase) {}

  @Put()
  async handle(
    @Param('peculiarityId') peculiarityId: string,
    @Body(new ZodValidationPipe(updatePeculiarityBodySchema)) body: UpdatePeculiarityBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { nome, descricao, espiritual, isPublic } = body;

    const result = await this.updatePeculiarity.execute({
      peculiarityId,
      userId: user.sub,
      nome,
      descricao,
      espiritual,
      isPublic,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        default:
          throw new NotFoundException(error.message);
      }
    }

    return PeculiarityPresenter.toHTTP(result.value.peculiarity);
  }
}
