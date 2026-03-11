import { Controller, Get, Query } from '@nestjs/common';
import { FetchUserPeculiaritiesUseCase } from '@/domain/power-manager/application/use-cases/fetch-user-peculiarities';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { PeculiarityPresenter } from '../../presenters/peculiarity.presenter';

@Controller('/peculiarities')
export class FetchUserPeculiaritiesController {
  constructor(private fetchUserPeculiarities: FetchUserPeculiaritiesUseCase) {}

  @Get()
  async handle(@Query('page') page: string, @CurrentUser() user: UserPayload) {
    const result = await this.fetchUserPeculiarities.execute({
      userId: user.sub,
      page: page ? Number(page) : 1,
    });

    return result.value!.peculiarities.map(PeculiarityPresenter.toHTTP);
  }
}
