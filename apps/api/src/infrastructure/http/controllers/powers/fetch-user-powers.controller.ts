import { Controller, Get, Query } from '@nestjs/common';
import { FetchUserPowersUseCase } from '@/domain/power-manager/application/use-cases/fetch-user-powers';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { PowerPresenter } from '../../presenters/power.presenter';

@Controller('/powers/me')
export class FetchUserPowersController {
  constructor(private fetchUserPowers: FetchUserPowersUseCase) {}

  @Get()
  async handle(@Query('page') page: string, @CurrentUser() user: UserPayload) {
    const result = await this.fetchUserPowers.execute({
      userId: user.sub,
      page: page ? Number(page) : 1,
    });

    return result.value!.powers.map(PowerPresenter.toHTTP);
  }
}
