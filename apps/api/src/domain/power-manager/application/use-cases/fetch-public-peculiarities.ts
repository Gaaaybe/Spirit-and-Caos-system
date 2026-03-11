import { Injectable } from '@nestjs/common';
import { type Either, right } from '@/core/either';
import type { Peculiarity } from '../../enterprise/entities/peculiarity';
import { PeculiaritiesRepository } from '../repositories/peculiarities-repository';

interface FetchPublicPeculiaritiesUseCaseRequest {
  page: number;
}

interface FetchPublicPeculiaritiesUseCaseResponseData {
  peculiarities: Peculiarity[];
}

type FetchPublicPeculiaritiesUseCaseResponse = Either<
  null,
  FetchPublicPeculiaritiesUseCaseResponseData
>;

@Injectable()
export class FetchPublicPeculiaritiesUseCase {
  constructor(private peculiaritiesRepository: PeculiaritiesRepository) {}

  async execute({
    page,
  }: FetchPublicPeculiaritiesUseCaseRequest): Promise<FetchPublicPeculiaritiesUseCaseResponse> {
    const peculiarities = await this.peculiaritiesRepository.findPublic({ page });
    return right({ peculiarities });
  }
}
