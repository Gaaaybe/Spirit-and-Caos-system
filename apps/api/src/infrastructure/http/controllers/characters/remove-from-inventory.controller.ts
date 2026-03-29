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
import { RemoveFromInventoryUseCase } from '@/domain/character-manager/application/use-cases/remove-from-inventory';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CharacterPresenter } from '../../presenters/character.presenter';

const removeFromInventoryBodySchema = z.object({
  quantity: z.number().int().min(1).default(1),
});

type RemoveFromInventoryBodySchema = z.infer<typeof removeFromInventoryBodySchema>;

@Controller('/characters/:characterId/items/:itemId/remove')
export class RemoveFromInventoryController {
  constructor(private removeFromInventory: RemoveFromInventoryUseCase) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Param('itemId') itemId: string,
    @Body(new ZodValidationPipe(removeFromInventoryBodySchema)) body: RemoveFromInventoryBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.removeFromInventory.execute({
      characterId,
      userId: user.sub,
      itemId,
      quantity: body.quantity,
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
