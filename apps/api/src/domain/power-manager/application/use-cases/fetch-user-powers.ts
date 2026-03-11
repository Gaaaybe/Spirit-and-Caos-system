import { Injectable } from '@nestjs/common';
import { type Either, right } from '@/core/either';
import type { Power } from '../../enterprise/entities/power';
import { PowersRepository } from '../repositories/powers-repository';

interface FetchUserPowersUseCaseRequest {
  userId: string;
  page: number;
}

interface FetchUserPowersUseCaseResponseData {
  powers: Power[];
}

type FetchUserPowersUseCaseResponse = Either<null, FetchUserPowersUseCaseResponseData>;

@Injectable()
export class FetchUserPowersUseCase {
  constructor(private powersRepository: PowersRepository) {}

  async execute({
    userId,
    page,
  }: FetchUserPowersUseCaseRequest): Promise<FetchUserPowersUseCaseResponse> {
    const powers = await this.powersRepository.findByUserId(userId, { page });

    return right({
      powers,
    });
  }
}
