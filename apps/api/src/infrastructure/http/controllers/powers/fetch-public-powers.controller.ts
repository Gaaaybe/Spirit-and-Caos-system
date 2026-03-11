import { Controller, Get, Query } from '@nestjs/common';
import { FetchPowersUseCase } from '@/domain/power-manager/application/use-cases/fetch-public-powers';
import { Public } from '@/infrastructure/auth/public';
import { PowerPresenter } from '../../presenters/power.presenter';

@Controller('/powers')
export class FetchPublicPowersController {
  constructor(private fetchPublicPowers: FetchPowersUseCase) {}

  @Get()
  @Public()
  async handle(@Query('page') page: string) {
    const result = await this.fetchPublicPowers.execute({
      page: page ? Number(page) : 1,
    });

    return result.value!.powers.map(PowerPresenter.toHTTP);
  }
}
