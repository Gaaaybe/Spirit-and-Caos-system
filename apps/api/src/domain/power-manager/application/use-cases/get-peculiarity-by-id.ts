import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import type { Peculiarity } from '../../enterprise/entities/peculiarity';
import { PeculiaritiesRepository } from '../repositories/peculiarities-repository';

interface GetPeculiarityByIdUseCaseRequest {
  peculiarityId: string;
}

interface GetPeculiarityByIdUseCaseResponseData {
  peculiarity: Peculiarity;
}

type GetPeculiarityByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  GetPeculiarityByIdUseCaseResponseData
>;

@Injectable()
export class GetPeculiarityByIdUseCase {
  constructor(private peculiaritiesRepository: PeculiaritiesRepository) {}

  async execute({
    peculiarityId,
  }: GetPeculiarityByIdUseCaseRequest): Promise<GetPeculiarityByIdUseCaseResponse> {
    const peculiarity = await this.peculiaritiesRepository.findById(peculiarityId);

    if (!peculiarity) {
      return left(new ResourceNotFoundError());
    }

    return right({
      peculiarity,
    });
  }
}
