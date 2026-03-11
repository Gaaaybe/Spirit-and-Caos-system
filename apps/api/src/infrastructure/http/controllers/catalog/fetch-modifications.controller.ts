import { Controller, Get, Query } from '@nestjs/common';
import { FetchModificationsUseCase } from '@/domain/power-manager/application/use-cases/fetch-modifications';
import { Public } from '@/infrastructure/auth/public';
import { ModificationBasePresenter } from '../../presenters/modification-base.presenter';

@Controller('/modifications')
export class FetchModificationsController {
  constructor(private fetchModifications: FetchModificationsUseCase) {}

  @Public()
  @Get()
  async handle(@Query('type') type?: 'extra' | 'falha', @Query('category') category?: string) {
    const result = await this.fetchModifications.execute({ type, category });

    return result.value!.modifications.map(ModificationBasePresenter.toHTTP);
  }
}
