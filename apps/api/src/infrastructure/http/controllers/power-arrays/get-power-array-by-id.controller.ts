import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { GetPowerArrayByIdUseCase } from '@/domain/power-manager/application/use-cases/get-power-array-by-id';
import { PowerArrayPresenter } from '../../presenters/power-array.presenter';

@Controller('/power-arrays')
export class GetPowerArrayByIdController {
  constructor(private getPowerArrayById: GetPowerArrayByIdUseCase) {}

  @Get(':powerArrayId')
  async handle(@Param('powerArrayId') powerArrayId: string) {
    const result = await this.getPowerArrayById.execute({ powerArrayId });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new NotFoundException(error.message);
      }
    }

    return PowerArrayPresenter.toHTTP(result.value.powerArray);
  }
}
