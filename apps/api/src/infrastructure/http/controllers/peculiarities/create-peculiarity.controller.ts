import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { z } from 'zod';
import { CreatePeculiarityUseCase } from '@/domain/power-manager/application/use-cases/create-peculiarity';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { PeculiarityPresenter } from '../../presenters/peculiarity.presenter';

const createPeculiarityBodySchema = z.object({
  nome: z.string().min(2).max(100),
  descricao: z.string().min(10).max(10000),
  espiritual: z.boolean(),
  isPublic: z.boolean().optional(),
  icone: z.url('Ícone deve ser um link válido').optional(),
});

type CreatePeculiarityBodySchema = z.infer<typeof createPeculiarityBodySchema>;

@Controller('/peculiarities')
export class CreatePeculiarityController {
  constructor(private createPeculiarity: CreatePeculiarityUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createPeculiarityBodySchema)) body: CreatePeculiarityBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { nome, descricao, espiritual, isPublic, icone } = body;

    const result = await this.createPeculiarity.execute({
      userId: user.sub,
      nome,
      descricao,
      espiritual,
      isPublic,
      icone,
    });

    return PeculiarityPresenter.toHTTP(result.value!.peculiarity);
  }
}
