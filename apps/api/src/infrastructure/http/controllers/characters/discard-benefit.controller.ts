import { BadRequestException, Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { DiscardBenefitUseCase } from '@/domain/character-manager/application/use-cases/discard-benefit';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { CharacterPresenter } from '../../presenters/character.presenter';

@Controller('/characters/:characterId/benefits/:benefitId')
export class DiscardBenefitController {
  constructor(private discardBenefit: DiscardBenefitUseCase) {}

  @Delete()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Param('benefitId') benefitId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.discardBenefit.execute({
      characterId,
      userId: user.sub,
      benefitId,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    return CharacterPresenter.toHTTP(result.value.character);
  }
}
