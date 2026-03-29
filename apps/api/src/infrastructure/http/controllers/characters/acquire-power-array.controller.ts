import { BadRequestException, Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { AcquirePowerArrayUseCase } from '@/domain/character-manager/application/use-cases/acquire-power-array';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CharacterPresenter } from '../../presenters/character.presenter';

const acquirePowerArrayBodySchema = z.object({
  powerArrayId: z.string().uuid(),
});

type AcquirePowerArrayBodySchema = z.infer<typeof acquirePowerArrayBodySchema>;

@Controller('/characters/:characterId/power-arrays')
export class AcquirePowerArrayController {
  constructor(private acquirePowerArray: AcquirePowerArrayUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Param('characterId') characterId: string,
    @Body(new ZodValidationPipe(acquirePowerArrayBodySchema)) body: AcquirePowerArrayBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.acquirePowerArray.execute({
      characterId,
      userId: user.sub,
      powerArrayId: body.powerArrayId,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
