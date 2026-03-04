import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { GetPeculiarityByIdUseCase } from '@/domain/power-manager/application/use-cases/get-peculiarity-by-id';
import { PeculiarityPresenter } from '../../presenters/peculiarity.presenter';

@Controller('/peculiarities/:peculiarityId')
export class GetPeculiarityByIdController {
  constructor(private getPeculiarityById: GetPeculiarityByIdUseCase) {}

  @Get()
  async handle(@Param('peculiarityId') peculiarityId: string) {
    const result = await this.getPeculiarityById.execute({ peculiarityId });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new NotFoundException(error.message);
      }
    }

    return PeculiarityPresenter.toHTTP(result.value.peculiarity);
  }
}
