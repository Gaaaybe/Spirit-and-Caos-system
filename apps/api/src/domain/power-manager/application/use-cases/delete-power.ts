import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { PowersRepository } from '../repositories/powers-repository';

interface DeletePowerUseCaseRequest {
  powerId: string;
  userId: string;
}

type DeletePowerUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>;

@Injectable()
export class DeletePowerUseCase {
  constructor(private powersRepository: PowersRepository) {}

  async execute({
    powerId,
    userId,
  }: DeletePowerUseCaseRequest): Promise<DeletePowerUseCaseResponse> {
    const existingPower = await this.powersRepository.findById(powerId);

    if (!existingPower) {
      return left(new ResourceNotFoundError());
    }

    if (!existingPower.canBeEditedBy(userId)) {
      return left(new NotAllowedError());
    }

    await this.powersRepository.delete(powerId);

    return right(null);
  }
}
