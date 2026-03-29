import { Controller, Get, Param } from '@nestjs/common';
import { FetchCharacterPowersUseCase } from '@/domain/power-manager/application/use-cases/fetch-character-powers';
import { PowerPresenter } from '../../presenters/power.presenter';

@Controller('/characters/:characterId/powers/full')
export class FetchCharacterPowersController {
  constructor(private fetchCharacterPowers: FetchCharacterPowersUseCase) {}

  @Get()
  async handle(@Param('characterId') characterId: string) {
    const result = await this.fetchCharacterPowers.execute({
      characterId,
    });

    return {
      powers: result.value?.powers.map(PowerPresenter.toHTTP),
    };
  }
}
