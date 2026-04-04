import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { z } from 'zod';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { CreatePowerArrayUseCase } from '@/domain/power-manager/application/use-cases/create-power-array';
import { InvalidVisibilityError } from '@/domain/power-manager/application/use-cases/errors/invalid-visibility-error';
import {
  Domain,
  DomainName,
} from '@/domain/power-manager/enterprise/entities/value-objects/domain';
import {
  type ActionType,
  type DurationType,
  PowerParameters,
  type RangeType,
} from '@/domain/power-manager/enterprise/entities/value-objects/power-parameters';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { PowerArrayPresenter } from '../../presenters/power-array.presenter';

const dominioSchema = z
  .object({
    name: z.enum([
      'natural',
      'sagrado',
      'sacrilegio',
      'psiquico',
      'cientifico',
      'peculiar',
      'arma-branca',
      'arma-fogo',
      'arma-tensao',
      'arma-explosiva',
      'arma-tecnologica',
    ]),
    areaConhecimento: z.string().min(1).optional(),
    peculiarId: z.string().min(1).optional(),
  })
  .refine((d) => d.name !== 'cientifico' || !!d.areaConhecimento, {
    message: 'Domínio Científico requer área de conhecimento',
    path: ['areaConhecimento'],
  })
  .refine((d) => d.name !== 'peculiar' || !!d.peculiarId, {
    message: 'Domínio Peculiar requer ID da peculiaridade',
    path: ['peculiarId'],
  });

const createPowerArrayBodySchema = z.object({
  nome: z.string().min(2).max(100),
  descricao: z.string().min(10).max(1000),
  dominio: dominioSchema,
  parametrosBase: z
    .object({
      acao: z.number().int().min(0).max(5),
      alcance: z.number().int().min(0).max(6),
      duracao: z.number().int().min(0).max(4),
    })
    .optional(),
  powerIds: z.array(z.string()).min(1),
  isPublic: z.boolean().default(false),
  notas: z.string().max(2000).optional(),
  icone: z.url('Ícone deve ser um link válido').optional(),
});

const DOMAIN_NAME_MAP: Record<string, DomainName> = {
  natural: DomainName.NATURAL,
  sagrado: DomainName.SAGRADO,
  sacrilegio: DomainName.SACRILEGIO,
  psiquico: DomainName.PSIQUICO,
  cientifico: DomainName.CIENTIFICO,
  peculiar: DomainName.PECULIAR,
  'arma-branca': DomainName.ARMA_BRANCA,
  'arma-fogo': DomainName.ARMA_FOGO,
  'arma-tensao': DomainName.ARMA_TENSAO,
  'arma-explosiva': DomainName.ARMA_EXPLOSIVA,
  'arma-tecnologica': DomainName.ARMA_TECNOLOGICA,
};

type CreatePowerArrayBody = z.infer<typeof createPowerArrayBodySchema>;

@Controller('/power-arrays')
export class CreatePowerArrayController {
  constructor(private createPowerArray: CreatePowerArrayUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(createPowerArrayBodySchema)) body: CreatePowerArrayBody,
  ) {
    const { nome, descricao, dominio, parametrosBase, powerIds, isPublic, notas, icone } = body;

    const dominioVO = Domain.create({
      name: DOMAIN_NAME_MAP[dominio.name],
      areaConhecimento: dominio.areaConhecimento,
      peculiarId: dominio.peculiarId,
    });

    const parametrosBaseVO = parametrosBase
      ? PowerParameters.create({
          acao: parametrosBase.acao as ActionType,
          alcance: parametrosBase.alcance as RangeType,
          duracao: parametrosBase.duracao as DurationType,
        })
      : undefined;

    try {
      const result = await this.createPowerArray.execute({
        nome,
        descricao,
        dominio: dominioVO,
        parametrosBase: parametrosBaseVO,
        powerIds,
        isPublic,
        notas,
        icone,
        userId: user.sub,
      });

      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) throw new NotFoundException(error.message);
        if (error instanceof InvalidVisibilityError) throw new BadRequestException(error.message);
        throw new BadRequestException();
      }

      return PowerArrayPresenter.toHTTP(result.value.powerArray);
    } catch (error) {
      if (error instanceof DomainValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
