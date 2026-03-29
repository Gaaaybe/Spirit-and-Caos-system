import { Controller, Get, Param } from '@nestjs/common';
import { FetchCharacterPowerArraysUseCase } from '@/domain/power-manager/application/use-cases/fetch-character-power-arrays';
import { PowerArrayPresenter } from '../../presenters/power-array.presenter';

@Controller('/characters/:characterId/power-arrays/full')
export class FetchCharacterPowerArraysController {
  constructor(private fetchCharacterPowerArrays: FetchCharacterPowerArraysUseCase) {}

  @Get()
  async handle(@Param('characterId') characterId: string) {
    const result = await this.fetchCharacterPowerArrays.execute({
      characterId,
    });

    return {
      powerArrays: result.value?.powerArrays.map(PowerArrayPresenter.toHTTP),
    };
  }
}
