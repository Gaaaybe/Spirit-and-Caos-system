import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import { FetchAllCharactersUseCase } from '@/domain/character-manager/application/use-cases/fetch-all-characters';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { CharacterPresenter } from '../../presenters/character.presenter';

@Controller('/admin/characters')
export class FetchAllCharactersController {
  constructor(private fetchAllCharacters: FetchAllCharactersUseCase) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this.fetchAllCharacters.execute({ userId: user.sub });

    if (result.isLeft()) {
      throw new UnauthorizedException('User is not authorized to fetch all characters.');
    }

    return (result.value.characters).map((character) => CharacterPresenter.toHTTP(character));
  }
}
