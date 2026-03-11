import { Controller, Get, Query } from '@nestjs/common';
import { FetchPowerArraysUseCase } from '@/domain/power-manager/application/use-cases/fetch-public-power-arrays';
import { Public } from '@/infrastructure/auth/public';
import { PowerArrayPresenter } from '../../presenters/power-array.presenter';

@Controller('/power-arrays')
export class FetchPublicPowerArraysController {
  constructor(private fetchPublicPowerArrays: FetchPowerArraysUseCase) {}

  @Get()
  @Public()
  async handle(@Query('page') page: string) {
    const result = await this.fetchPublicPowerArrays.execute({
      page: page ? Number(page) : 1,
    });

    return result.value!.powerArrays.map(PowerArrayPresenter.toHTTP);
  }
}
