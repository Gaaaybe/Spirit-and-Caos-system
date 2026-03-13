import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { z } from 'zod';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { CreatePowerUseCase } from '@/domain/power-manager/application/use-cases/create-power';
import { InvalidVisibilityError } from '@/domain/power-manager/application/use-cases/errors/invalid-visibility-error';
import { AppliedEffect } from '@/domain/power-manager/enterprise/entities/applied-effect';
import {
  AlternativeCost,
  AlternativeCostType,
} from '@/domain/power-manager/enterprise/entities/value-objects/alternative-cost';
import {
  AppliedModification,
  ModificationScope,
} from '@/domain/power-manager/enterprise/entities/value-objects/applied-modification';
import {
  Domain,
  DomainName,
} from '@/domain/power-manager/enterprise/entities/value-objects/domain';
import { PowerCost } from '@/domain/power-manager/enterprise/entities/value-objects/power-cost';
import {
  type ActionType,
  type DurationType,
  PowerParameters,
  type RangeType,
} from '@/domain/power-manager/enterprise/entities/value-objects/power-parameters';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { PowerPresenter } from '../../presenters/power.presenter';

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

const appliedModificationSchema = z.object({
  modificationBaseId: z.string().min(1, 'ID da modificação base é obrigatório'),
  scope: z.enum(['global', 'local']),
  grau: z.number().int().min(1).optional(),
  parametros: z.record(z.string(), z.unknown()).optional(),
  nota: z.string().max(500).optional(),
});

const appliedEffectSchema = z.object({
  effectBaseId: z.string().min(1, 'ID do efeito base é obrigatório'),
  grau: z.number().int().min(1).max(30),
  configuracaoId: z.string().min(1).optional(),
  inputValue: z.union([z.string(), z.number()]).optional(),
  modifications: z.array(appliedModificationSchema).default([]),
  nota: z.string().max(500).optional(),
});

const custoAlternativoSchema = z.object({
  tipo: z.enum(['pe', 'pv', 'atributo', 'item', 'material']),
  quantidade: z.number().positive(),
  descricao: z.string().optional(),
  atributo: z.string().optional(),
  itemId: z.string().optional(),
});

const createPowerBodySchema = z.object({
  nome: z.string().min(2).max(100),
  descricao: z.string().min(10).max(1000),
  dominio: dominioSchema,
  parametros: z.object({
    acao: z.number().int().min(0).max(5),
    alcance: z.number().int().min(0).max(6),
    duracao: z.number().int().min(0).max(4),
  }),
  effects: z.array(appliedEffectSchema).min(1).max(20),
  globalModifications: z.array(appliedModificationSchema).default([]),
  custoAlternativo: custoAlternativoSchema.optional(),
  isPublic: z.boolean().default(false),
  notas: z.string().max(2000).optional(),
  icone: z.url('Ícone deve ser um link válido').optional(),
});

type CreatePowerBodySchema = z.infer<typeof createPowerBodySchema>;

@Controller('/powers')
export class CreatePowerController {
  constructor(private createPower: CreatePowerUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createPowerBodySchema)) body: CreatePowerBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const {
      nome,
      descricao,
      dominio,
      parametros,
      effects,
      globalModifications,
      custoAlternativo,
      isPublic,
      notas,
      icone,
    } = body;

    const dominioVO = Domain.create({
      name: dominio.name as DomainName,
      areaConhecimento: dominio.areaConhecimento,
      peculiarId: dominio.peculiarId,
    });

    const parametrosVO = PowerParameters.create({
      acao: parametros.acao as ActionType,
      alcance: parametros.alcance as RangeType,
      duracao: parametros.duracao as DurationType,
    });

    const buildModifications = (mods: typeof globalModifications) =>
      mods.map((mod) =>
        AppliedModification.create({
          modificationBaseId: mod.modificationBaseId,
          scope: mod.scope as ModificationScope,
          grau: mod.grau,
          parametros: mod.parametros,
          nota: mod.nota,
        }),
      );

    const effectsVO = effects.map((effect) =>
      AppliedEffect.create({
        effectBaseId: effect.effectBaseId,
        grau: effect.grau,
        configuracaoId: effect.configuracaoId,
        inputValue: effect.inputValue,
        modifications: buildModifications(effect.modifications),
        custo: PowerCost.createZero(),
        nota: effect.nota,
      }),
    );

    const globalModificationsVO = buildModifications(globalModifications);

    const custoAlternativoVO = custoAlternativo
      ? AlternativeCost.create({
          tipo: custoAlternativo.tipo as AlternativeCostType,
          quantidade: custoAlternativo.quantidade,
          descricao: custoAlternativo.descricao,
          atributo: custoAlternativo.atributo,
          itemId: custoAlternativo.itemId,
        })
      : undefined;

    const result = await this.createPower.execute({
      userId: user.sub,
      nome,
      descricao,
      dominio: dominioVO,
      parametros: parametrosVO,
      effects: effectsVO,
      globalModifications: globalModificationsVO,
      custoAlternativo: custoAlternativoVO,
      isPublic,
      notas,
      icone,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case InvalidVisibilityError:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return PowerPresenter.toHTTP(result.value.power);
  }
}
