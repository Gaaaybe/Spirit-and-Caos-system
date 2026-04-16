import {
  BadRequestException,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Body,
} from '@nestjs/common';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { UsePowerUseCase } from '@/domain/character-manager/application/use-cases/use-power';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { CharacterPresenter } from '../../presenters/character.presenter';
import { PeculiaritiesRepository } from '@/domain/power-manager/application/repositories/peculiarities-repository';

@Controller('/characters/:characterId/powers/:powerId/use')
export class UsePowerController {
  constructor(
    private usePower: UsePowerUseCase,
    private peculiaritiesRepository: PeculiaritiesRepository,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Param('powerId') powerId: string,
    @CurrentUser() user: UserPayload,
    @Body('peCost') peCost?: number,
  ) {
    const result = await this.usePower.execute({
      characterId,
      userId: user.sub,
      powerId,
      peCost,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof NotAllowedError) {
        throw new ForbiddenException(error.message);
      }

      if (error instanceof DomainValidationError) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException('Falha ao usar poder');
    }

    const { character, peCost: debitedPeCost } = result.value;
    const peculiarities = await this.peculiaritiesRepository.findByUserId(
      character.userId.toString(),
      { page: 1 },
    );

    return {
      ...CharacterPresenter.toHTTP(character, peculiarities),
      peCost: debitedPeCost,
    };
  }
}
