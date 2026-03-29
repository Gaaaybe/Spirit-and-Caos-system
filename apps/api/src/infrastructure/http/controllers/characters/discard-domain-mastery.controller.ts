import { BadRequestException, Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { DiscardDomainMasteryUseCase } from '@/domain/character-manager/application/use-cases/discard-domain-mastery';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { CharacterPresenter } from '../../presenters/character.presenter';
import { PeculiaritiesRepository } from '@/domain/power-manager/application/repositories/peculiarities-repository';

@Controller('/characters/:characterId/domains/:domainId')
export class DiscardDomainMasteryController {
  constructor(
    private discardDomainMastery: DiscardDomainMasteryUseCase,
    private peculiaritiesRepository: PeculiaritiesRepository,
  ) {}

  @Delete()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Param('domainId') domainId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.discardDomainMastery.execute({
      characterId,
      userId: user.sub,
      domainId,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    const character = result.value.character;
    const peculiarities = await this.peculiaritiesRepository.findByUserId(character.userId.toString(), { page: 1 });

    return CharacterPresenter.toHTTP(character, peculiarities);
  }
}
