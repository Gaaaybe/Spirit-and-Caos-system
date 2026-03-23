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
import { AddItemToInventoryUseCase } from '@/domain/character-manager/application/use-cases/add-item-to-inventory';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CharacterPresenter } from '../../presenters/character.presenter';

const addItemToInventoryBodySchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
});

type AddItemToInventoryBodySchema = z.infer<typeof addItemToInventoryBodySchema>;

@Controller('/characters/:characterId/items')
export class AddItemToInventoryController {
  constructor(private addItemToInventory: AddItemToInventoryUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Param('characterId') characterId: string,
    @Body(new ZodValidationPipe(addItemToInventoryBodySchema)) body: AddItemToInventoryBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.addItemToInventory.execute({
      characterId,
      userId: user.sub,
      itemId: body.itemId,
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
