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
import { UnequipItemUseCase } from '@/domain/character-manager/application/use-cases/unequip-item';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CharacterPresenter } from '../../presenters/character.presenter';

const unequipItemBodySchema = z.object({
  slot: z.enum(['suit', 'accessory', 'hand', 'quick-access']),
  quantity: z.number().int().min(1).default(1),
});

type UnequipItemBodySchema = z.infer<typeof unequipItemBodySchema>;

import { ItemsRepository } from '@/domain/item-manager/application/repositories/items-repository';

@Controller('/characters/:characterId/items/:itemId/unequip')
export class UnequipItemController {
  constructor(
    private unequipItem: UnequipItemUseCase,
    private itemsRepository: ItemsRepository,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Param('itemId') itemId: string,
    @Body(new ZodValidationPipe(unequipItemBodySchema)) body: UnequipItemBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.unequipItem.execute({
      characterId,
      userId: user.sub,
      itemId,
      slot: body.slot,
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

    const items = await this.itemsRepository.findByCharacterId(characterId);

    return CharacterPresenter.toHTTP(result.value.character, [], items);
  }
}
