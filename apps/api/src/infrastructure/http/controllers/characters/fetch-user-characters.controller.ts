import { Controller, Get } from '@nestjs/common';
import { FetchUserCharactersUseCase } from '@/domain/character-manager/application/use-cases/fetch-user-characters';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { CharacterPresenter } from '../../presenters/character.presenter';

@Controller('/characters/me')
export class FetchUserCharactersController {
  constructor(private fetchUserCharacters: FetchUserCharactersUseCase) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this.fetchUserCharacters.execute({ userId: user.sub });
    return (result.value?.characters ?? []).map((character) => CharacterPresenter.toHTTP(character));
  }
}
