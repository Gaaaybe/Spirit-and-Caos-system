import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { z } from 'zod';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { InvalidVisibilityError } from '@/domain/power-manager/application/use-cases/errors/invalid-visibility-error';
import { UpdatePowerArrayUseCase } from '@/domain/power-manager/application/use-cases/update-power-array';
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

const updatePowerArrayBodySchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  descricao: z.string().min(10).max(1000).optional(),
  dominio: z
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
    })
    .optional(),
  parametrosBase: z
    .object({
      acao: z.number().int().min(0).max(5),
      alcance: z.number().int().min(0).max(6),
      duracao: z.number().int().min(0).max(4),
    })
    .optional(),
  powerIds: z.array(z.string()).min(1).optional(),
  isPublic: z.boolean().optional(),
  notas: z.string().max(2000).optional(),
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

type UpdatePowerArrayBody = z.infer<typeof updatePowerArrayBodySchema>;

@Controller('/power-arrays')
export class UpdatePowerArrayController {
  constructor(private updatePowerArray: UpdatePowerArrayUseCase) {}

  @Put(':powerArrayId')
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('powerArrayId') powerArrayId: string,
    @Body(new ZodValidationPipe(updatePowerArrayBodySchema)) body: UpdatePowerArrayBody,
  ) {
    const { nome, descricao, dominio, parametrosBase, powerIds, isPublic, notas } = body;

    const dominioVO = dominio
      ? Domain.create({
          name: DOMAIN_NAME_MAP[dominio.name],
          areaConhecimento: dominio.areaConhecimento,
          peculiarId: dominio.peculiarId,
        })
      : undefined;

    const parametrosBaseVO = parametrosBase
      ? PowerParameters.create({
          acao: parametrosBase.acao as ActionType,
          alcance: parametrosBase.alcance as RangeType,
          duracao: parametrosBase.duracao as DurationType,
        })
      : undefined;

    const result = await this.updatePowerArray.execute({
      powerArrayId,
      userId: user.sub,
      nome,
      descricao,
      dominio: dominioVO,
      parametrosBase: parametrosBaseVO,
      powerIds,
      isPublic,
      notas,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof ResourceNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof NotAllowedError) throw new ForbiddenException(error.message);
      if (error instanceof InvalidVisibilityError) throw new BadRequestException(error.message);
      throw new BadRequestException();
    }

    return PowerArrayPresenter.toHTTP(result.value.powerArray);
  }
}
