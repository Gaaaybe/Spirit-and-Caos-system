import { BadRequestException, Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { UpdateUnarmedMasteryUseCase } from '@/domain/character-manager/application/use-cases/update-unarmed-mastery';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CharacterPresenter } from '../../presenters/character.presenter';
import { PeculiaritiesRepository } from '@/domain/power-manager/application/repositories/peculiarities-repository';
import { ItemsRepository } from '@/domain/item-manager/application/repositories/items-repository';
import { CharactersRepository } from '@/domain/character-manager/application/repositories/characters-repository';

const updateUnarmedMasteryBodySchema = z.object({
  customName: z.string().optional(),
  degree: z.number().int().min(0).max(9),
  marginImprovements: z.number().int().min(0).max(10),
  multiplierImprovements: z.number().int().min(0).max(3),
  damageType: z.string().min(1),
});

type UpdateUnarmedMasteryBodySchema = z.infer<typeof updateUnarmedMasteryBodySchema>;

@Controller('/characters/:characterId/unarmed-mastery')
export class UpdateUnarmedMasteryController {
  constructor(
    private updateUnarmedMastery: UpdateUnarmedMasteryUseCase,
    private charactersRepository: CharactersRepository,
    private peculiaritiesRepository: PeculiaritiesRepository,
    private itemsRepository: ItemsRepository,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Param('characterId') characterId: string,
    @Body(new ZodValidationPipe(updateUnarmedMasteryBodySchema)) body: UpdateUnarmedMasteryBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.updateUnarmedMastery.execute({
      characterId,
      userId: user.sub,
      mastery: body,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    const character = await this.charactersRepository.findById(characterId);
    if (!character) {
      throw new BadRequestException('Personagem não encontrado após atualização.');
    }

    const peculiarities = await this.peculiaritiesRepository.findByUserId(character.userId.toString(), { page: 1 });
    const items = await this.itemsRepository.findByCharacterId(character.id.toString());

    return CharacterPresenter.toHTTP(character, peculiarities, items);
  }
}
