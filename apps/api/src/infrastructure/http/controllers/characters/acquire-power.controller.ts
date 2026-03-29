import { BadRequestException, Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { AcquirePowerUseCase } from '@/domain/character-manager/application/use-cases/acquire-power';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CharacterPresenter } from '../../presenters/character.presenter';

const acquirePowerBodySchema = z.object({
  powerId: z.string().uuid(),
});

type AcquirePowerBodySchema = z.infer<typeof acquirePowerBodySchema>;

@Controller('/characters/:characterId/powers')
export class AcquirePowerController {
  constructor(private acquirePower: AcquirePowerUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Param('characterId') characterId: string,
    @Body(new ZodValidationPipe(acquirePowerBodySchema)) body: AcquirePowerBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.acquirePower.execute({
      characterId,
      userId: user.sub,
      powerId: body.powerId,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
