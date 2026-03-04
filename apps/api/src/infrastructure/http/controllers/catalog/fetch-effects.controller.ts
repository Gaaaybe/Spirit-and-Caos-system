import { Controller, Get, Query } from '@nestjs/common';
import { FetchEffectsUseCase } from '@/domain/power-manager/application/use-cases/fetch-effects';
import { Public } from '@/infrastructure/auth/public';
import { EffectBasePresenter } from '../../presenters/effect-base.presenter';

@Controller('/effects')
export class FetchEffectsController {
  constructor(private fetchEffects: FetchEffectsUseCase) {}

  @Public()
  @Get()
  async handle(@Query('category') category?: string) {
    const result = await this.fetchEffects.execute({ category });

    return result.value!.effects.map(EffectBasePresenter.toHTTP);
  }
}
