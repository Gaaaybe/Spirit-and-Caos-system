import { Controller, Get, Query } from '@nestjs/common';
import { FetchUserPowerArraysUseCase } from '@/domain/power-manager/application/use-cases/fetch-user-power-arrays';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { PowerArrayPresenter } from '../../presenters/power-array.presenter';

@Controller('/power-arrays/me')
export class FetchUserPowerArraysController {
  constructor(private fetchUserPowerArrays: FetchUserPowerArraysUseCase) {}

  @Get()
  async handle(@Query('page') page: string, @CurrentUser() user: UserPayload) {
    const result = await this.fetchUserPowerArrays.execute({
      userId: user.sub,
      page: page ? Number(page) : 1,
    });

    return result.value!.powerArrays.map(PowerArrayPresenter.toHTTP);
  }
}
