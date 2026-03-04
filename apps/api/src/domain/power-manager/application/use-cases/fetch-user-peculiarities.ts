import { Injectable } from '@nestjs/common';
import { type Either, right } from '@/core/either';
import type { Peculiarity } from '../../enterprise/entities/peculiarity';
import { PeculiaritiesRepository } from '../repositories/peculiarities-repository';

interface FetchUserPeculiaritiesUseCaseRequest {
  userId: string;
  page: number;
}

interface FetchUserPeculiaritiesUseCaseResponseData {
  peculiarities: Peculiarity[];
}

type FetchUserPeculiaritiesUseCaseResponse = Either<
  null,
  FetchUserPeculiaritiesUseCaseResponseData
>;

@Injectable()
export class FetchUserPeculiaritiesUseCase {
  constructor(private peculiaritiesRepository: PeculiaritiesRepository) {}

  async execute({
    userId,
    page,
  }: FetchUserPeculiaritiesUseCaseRequest): Promise<FetchUserPeculiaritiesUseCaseResponse> {
    const peculiarities = await this.peculiaritiesRepository.findByUserId(userId, { page });

    return right({
      peculiarities,
    });
  }
}
