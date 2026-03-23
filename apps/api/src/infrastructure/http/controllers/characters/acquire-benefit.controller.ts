import { BadRequestException, Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { AcquireBenefitUseCase } from '@/domain/character-manager/application/use-cases/acquire-benefit';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CharacterPresenter } from '../../presenters/character.presenter';

const acquireBenefitBodySchema = z.object({
  benefitName: z.string().min(1),
  targetDegree: z.number().int().min(1),
});

type AcquireBenefitBodySchema = z.infer<typeof acquireBenefitBodySchema>;

@Controller('/characters/:characterId/benefits')
export class AcquireBenefitController {
  constructor(private acquireBenefit: AcquireBenefitUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Param('characterId') characterId: string,
    @Body(new ZodValidationPipe(acquireBenefitBodySchema)) body: AcquireBenefitBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.acquireBenefit.execute({
      characterId,
      userId: user.sub,
      benefitName: body.benefitName,
      targetDegree: body.targetDegree,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
