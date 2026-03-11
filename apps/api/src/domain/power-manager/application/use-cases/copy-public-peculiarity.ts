import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { Peculiarity } from '../../enterprise/entities/peculiarity';
import { PeculiaritiesRepository } from '../repositories/peculiarities-repository';

interface CopyPublicPeculiarityUseCaseRequest {
  peculiarityId: string;
  userId: string;
}

interface CopyPublicPeculiarityUseCaseResponseData {
  peculiarity: Peculiarity;
}

type CopyPublicPeculiarityUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  CopyPublicPeculiarityUseCaseResponseData
>;

@Injectable()
export class CopyPublicPeculiarityUseCase {
  constructor(private peculiaritiesRepository: PeculiaritiesRepository) {}

  async execute({
    peculiarityId,
    userId,
  }: CopyPublicPeculiarityUseCaseRequest): Promise<CopyPublicPeculiarityUseCaseResponse> {
    const original = await this.peculiaritiesRepository.findById(peculiarityId);

    if (!original) {
      return left(new ResourceNotFoundError());
    }

    if (!original.canBeAccessedBy()) {
      return left(new NotAllowedError());
    }

    const copy = Peculiarity.create({
      userId,
      nome: original.nome,
      descricao: original.descricao,
      espiritual: original.espiritual,
      isPublic: false,
    });

    await this.peculiaritiesRepository.create(copy);

    return right({ peculiarity: copy });
  }
}
