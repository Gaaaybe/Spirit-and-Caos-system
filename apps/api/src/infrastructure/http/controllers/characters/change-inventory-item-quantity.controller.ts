import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { ChangeInventoryItemQuantityUseCase } from '@/domain/character-manager/application/use-cases/change-inventory-item-quantity';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CharacterPresenter } from '../../presenters/character.presenter';

const changeQuantityBodySchema = z.object({
  quantity: z.number().int().min(0),
});

type ChangeQuantityBodySchema = z.infer<typeof changeQuantityBodySchema>;

@Controller('/characters/:characterId/items/:itemId/quantity')
export class ChangeInventoryItemQuantityController {
  constructor(private useCase: ChangeInventoryItemQuantityUseCase) {}

  @Patch()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Param('itemId') itemId: string,
    @Body(new ZodValidationPipe(changeQuantityBodySchema)) body: ChangeQuantityBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub;
    const { quantity } = body;

    const result = await this.useCase.execute({
      characterId,
      userId,
      itemId,
      quantity,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case DomainValidationError:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException('Unexpected error');
      }
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}

