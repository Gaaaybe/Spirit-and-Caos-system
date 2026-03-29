import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { SyncCharacterUseCase } from '@/domain/character-manager/application/use-cases/sync-character';
import { NotAllowedError } from '@/domain/character-manager/application/use-cases/errors/not-allowed-error';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CharacterPresenter } from '../../presenters/character.presenter';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { PeculiaritiesRepository } from '@/domain/power-manager/application/repositories/peculiarities-repository';

const syncCharacterBodySchema = z.object({
  narrative: z
    .object({
      identity: z.string().min(1),
      origin: z.string().min(1),
      motivations: z.array(z.string().min(1)),
      complications: z.array(z.string().min(1)),
    })
    .optional(),
  symbol: z.string().trim().min(1).nullable().optional(),
  art: z.string().trim().min(1).nullable().optional(),
  inspiration: z.number().int().min(0).max(3).optional(),
  level: z.number().int().min(1).max(250).optional(),
  extraPda: z.number().int().min(0).optional(),
  pvChange: z.number().int().optional(),
  peChange: z.number().int().optional(),
  tempPvChange: z.number().int().min(0).optional(),
  tempPeChange: z.number().int().min(0).optional(),
  attributes: z
    .object({
      strength: z.object({ baseValue: z.number().int().min(0), extraBonus: z.number().int().min(0).optional() }),
      dexterity: z.object({ baseValue: z.number().int().min(0), extraBonus: z.number().int().min(0).optional() }),
      constitution: z.object({ baseValue: z.number().int().min(0), extraBonus: z.number().int().min(0).optional() }),
      intelligence: z.object({ baseValue: z.number().int().min(0), extraBonus: z.number().int().min(0).optional() }),
      wisdom: z.object({ baseValue: z.number().int().min(0), extraBonus: z.number().int().min(0).optional() }),
      charisma: z.object({ baseValue: z.number().int().min(0), extraBonus: z.number().int().min(0).optional() }),
      keyPhysical: z.enum(['strength', 'dexterity', 'constitution']),
      keyMental: z.enum(['intelligence', 'wisdom', 'charisma']),
    })
    .optional(),
  skills: z
    .array(
      z.object({
        name: z.string().min(1),
        state: z.enum(['EFFICIENT', 'NEUTRAL', 'INEFFICIENT']),
        trainingBonus: z.number().int().min(0).optional(),
        extraBonus: z.number().int().optional(),
      }),
    )
    .optional(),
  conditions: z.array(z.string().min(1)).optional(),
});

type SyncCharacterBodySchema = z.infer<typeof syncCharacterBodySchema>;

@Controller('/characters/:characterId/sync')
export class SyncCharacterController {
  constructor(
    private syncCharacter: SyncCharacterUseCase,
    private peculiaritiesRepository: PeculiaritiesRepository,
  ) {}

  @Patch()
  async handle(
    @Param('characterId') characterId: string,
    @Body(new ZodValidationPipe(syncCharacterBodySchema)) body: SyncCharacterBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.syncCharacter.execute({
      characterId,
      userId: user.sub,
      narrative: body.narrative,
      symbol: body.symbol,
      art: body.art,
      inspiration: body.inspiration,
      level: body.level,
      extraPda: body.extraPda,
      pvChange: body.pvChange,
      peChange: body.peChange,
      tempPvChange: body.tempPvChange,
      tempPeChange: body.tempPeChange,
      attributes: body.attributes as any,
      skills: body.skills as any,
      conditions: body.conditions as any,
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

      throw new BadRequestException('Sync failed');
    }

    const character = result.value.character;
    const peculiarities = await this.peculiaritiesRepository.findByUserId(character.userId.toString(), { page: 1 });

    return CharacterPresenter.toHTTP(character, peculiarities);
  }
}
