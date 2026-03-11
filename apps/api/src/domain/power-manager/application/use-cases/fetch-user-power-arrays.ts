import { Injectable } from '@nestjs/common';
import { type Either, right } from '@/core/either';
import type { PowerArray } from '../../enterprise/entities/power-array';
import { PowerArraysRepository } from '../repositories/power-arrays-repository';

interface FetchUserPowerArraysUseCaseRequest {
  userId: string;
  page: number;
}

interface FetchUserPowerArraysUseCaseResponseData {
  powerArrays: PowerArray[];
}

type FetchUserPowerArraysUseCaseResponse = Either<null, FetchUserPowerArraysUseCaseResponseData>;

@Injectable()
export class FetchUserPowerArraysUseCase {
  constructor(private powerArraysRepository: PowerArraysRepository) {}

  async execute({
    userId,
    page,
  }: FetchUserPowerArraysUseCaseRequest): Promise<FetchUserPowerArraysUseCaseResponse> {
    const powerArrays = await this.powerArraysRepository.findByUserId(userId, { page });

    return right({
      powerArrays,
    });
  }
}
