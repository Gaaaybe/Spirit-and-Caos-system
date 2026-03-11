import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { GetPowerByIdUseCase } from '@/domain/power-manager/application/use-cases/get-power-by-id';
import { PowerPresenter } from '../../presenters/power.presenter';

@Controller('/powers/:powerId')
export class GetPowerByIdController {
  constructor(private getPowerById: GetPowerByIdUseCase) {}

  @Get()
  async handle(@Param('powerId') powerId: string) {
    const result = await this.getPowerById.execute({ powerId });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new NotFoundException(error.message);
      }
    }

    return PowerPresenter.toHTTP(result.value.power);
  }
}
