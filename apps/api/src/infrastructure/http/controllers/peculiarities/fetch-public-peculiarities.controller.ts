import { Controller, Get, Query } from '@nestjs/common';
import { FetchPublicPeculiaritiesUseCase } from '@/domain/power-manager/application/use-cases/fetch-public-peculiarities';
import { Public } from '@/infrastructure/auth/public';
import { PeculiarityPresenter } from '../../presenters/peculiarity.presenter';

@Controller('/peculiarities/public')
export class FetchPublicPeculiaritiesController {
  constructor(private fetchPublicPeculiarities: FetchPublicPeculiaritiesUseCase) {}

  @Get()
  @Public()
  async handle(@Query('page') page: string) {
    const result = await this.fetchPublicPeculiarities.execute({
      page: page ? Number(page) : 1,
    });

    return result.value!.peculiarities.map(PeculiarityPresenter.toHTTP);
  }
}
