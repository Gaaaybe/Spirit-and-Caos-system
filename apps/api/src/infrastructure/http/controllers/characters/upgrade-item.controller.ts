import { BadRequestException, Body, Controller, ForbiddenException, HttpCode, NotFoundException, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { UpgradeItemUseCase } from '@/domain/character-manager/application/use-cases/upgrade-item';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CharacterPresenter } from '../../presenters/character.presenter';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { DomainValidationError } from '@/core/errors/domain-validation-error';

const upgradeItemBodySchema = z.object({
  materialId: z.string().uuid(),
  runicsCost: z.number().int().min(0),
});

type UpgradeItemBodySchema = z.infer<typeof upgradeItemBodySchema>;

@Controller('/characters/:characterId/items/:itemId/upgrade')
export class UpgradeItemController {
  constructor(private upgradeItem: UpgradeItemUseCase) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Param('itemId') itemId: string,
    @Body(new ZodValidationPipe(upgradeItemBodySchema)) body: UpgradeItemBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.upgradeItem.execute({
      characterId,
      userId: user.sub,
      itemId,
      materialId: body.materialId,
      runicsCost: body.runicsCost,
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

      throw new BadRequestException('Failed to upgrade item');
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
