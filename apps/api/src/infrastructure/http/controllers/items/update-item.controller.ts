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
import { InvalidItemDomainError } from '@/domain/item-manager/application/use-cases/errors/invalid-item-domain-error';
import { UpdateItemUseCase } from '@/domain/item-manager/application/use-cases/update-item';
import { EquipmentType } from '@/domain/item-manager/enterprise/entities/defensive-equipment';
import { ItemType } from '@/domain/item-manager/enterprise/entities/item';
import { DamageDescriptor } from '@/domain/item-manager/enterprise/entities/value-objects/damage-descriptor';
import { WeaponRange } from '@/domain/item-manager/enterprise/entities/weapon';
import {
  Domain,
  DomainName,
} from '@/domain/shared/enterprise/value-objects/domain';
import { CurrentUser } from '@/infrastructure/auth/current-user-decorator';
import type { UserPayload } from '@/infrastructure/auth/jwt.strategy';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { ItemPresenter } from '../../presenters/item.presenter';

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

const damageDescriptorSchema = z.object({
  dado: z.string().regex(/^\d+d\d+$/, 'Formato inválido, use NdN (ex: 1d8)'),
  base: z.string().min(1),
  espiritual: z.boolean(),
});

const commonOptional = {
  nome: z.string().min(2).max(100).optional(),
  descricao: z.string().min(10).max(1000).optional(),
  dominio: dominioSchema.optional(),
  custoBase: z.number().int().min(0).optional(),
  nivelItem: z.number().int().min(1).optional(),
  isPublic: z.boolean().optional(),
  notas: z.string().max(2000).optional(),
  powerIds: z.array(z.string().min(1)).optional(),
  icone: z
    .union([z.url('Ícone deve ser um link válido'), z.null()])
    .optional(),
  powerArrayIds: z.array(z.string().min(1)).optional(),
};

const updateItemBodySchema = z.discriminatedUnion('tipo', [
  z.object({
    ...commonOptional,
    tipo: z.literal(ItemType.WEAPON),
    danos: z.array(damageDescriptorSchema).min(1).optional(),
    critMargin: z.number().int().min(2).max(20).optional(),
    critMultiplier: z.number().int().min(1).max(7).optional(),
    alcance: z
      .enum([
        WeaponRange.ADJACENTE,
        WeaponRange.NATURAL,
        WeaponRange.CURTO,
        WeaponRange.MEDIO,
        WeaponRange.LONGO,
      ])
      .optional(),
    alcanceExtraMetros: z.number().min(0).multipleOf(0.5).optional(),
    atributoEscalonamento: z.string().min(1).optional(),
  }).superRefine((data, ctx) => {
    const alcanceEfetivo = data.alcance;

    if (
      alcanceEfetivo !== undefined &&
      alcanceEfetivo !== WeaponRange.NATURAL &&
      (data.alcanceExtraMetros ?? 0) > 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alcanceExtraMetros'],
        message: 'Apenas armas de alcance natural podem ter alcance extra',
      });
    }
  }),
  z.object({
    ...commonOptional,
    tipo: z.literal(ItemType.DEFENSIVE_EQUIPMENT),
    tipoEquipamento: z.enum([EquipmentType.TRAJE, EquipmentType.PROTECAO]).optional(),
    baseRD: z.number().int().min(0).optional(),
    atributoEscalonamento: z.string().min(1).optional(),
  }),
  z.object({
    ...commonOptional,
    tipo: z.literal(ItemType.CONSUMABLE),
    descritorEfeito: z.string().min(1).max(500).optional(),
    qtdDoses: z.number().int().min(1).optional(),
  }),
  z.object({
    ...commonOptional,
    tipo: z.literal(ItemType.ARTIFACT),
  }),
  z.object({
    ...commonOptional,
    tipo: z.literal(ItemType.ACCESSORY),
  }),
]);

type UpdateItemBodySchema = z.infer<typeof updateItemBodySchema>;

@Controller('/items/:itemId')
export class UpdateItemController {
  constructor(private updateItem: UpdateItemUseCase) {}

  @Put()
  async handle(
    @Param('itemId') itemId: string,
    @Body(new ZodValidationPipe(updateItemBodySchema)) body: UpdateItemBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const dominioVO = body.dominio
      ? Domain.create({
          name: body.dominio.name as DomainName,
          areaConhecimento: body.dominio.areaConhecimento,
          peculiarId: body.dominio.peculiarId,
        })
      : undefined;

    const common = {
      itemId,
      userId: user.sub,
      nome: body.nome,
      descricao: body.descricao,
      dominio: dominioVO,
      custoBase: body.custoBase,
      nivelItem: body.nivelItem,
      isPublic: body.isPublic,
      notas: body.notas,
      powerIds: body.powerIds,
      icone: body.icone,
      powerArrayIds: body.powerArrayIds,
    };

    let result: Awaited<ReturnType<UpdateItemUseCase['execute']>>;

    if (body.tipo === ItemType.WEAPON) {
      result = await this.updateItem.execute({
        ...common,
        tipo: ItemType.WEAPON,
        danos: body.danos?.map((d) => DamageDescriptor.create(d.dado, d.base, d.espiritual)),
        critMargin: body.critMargin,
        critMultiplier: body.critMultiplier,
        alcance: body.alcance as WeaponRange | undefined,
        alcanceExtraMetros: body.alcanceExtraMetros,
        atributoEscalonamento: body.atributoEscalonamento,
      });
    } else if (body.tipo === ItemType.DEFENSIVE_EQUIPMENT) {
      result = await this.updateItem.execute({
        ...common,
        tipo: ItemType.DEFENSIVE_EQUIPMENT,
        tipoEquipamento: body.tipoEquipamento as EquipmentType | undefined,
        baseRD: body.baseRD,
        atributoEscalonamento: body.atributoEscalonamento,
      });
    } else if (body.tipo === ItemType.CONSUMABLE) {
      result = await this.updateItem.execute({
        ...common,
        tipo: ItemType.CONSUMABLE,
        descritorEfeito: body.descritorEfeito,
        qtdDoses: body.qtdDoses,
      });
    } else if (body.tipo === ItemType.ARTIFACT) {
      result = await this.updateItem.execute({ ...common, tipo: ItemType.ARTIFACT });
    } else {
      result = await this.updateItem.execute({ ...common, tipo: ItemType.ACCESSORY });
    }

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        case InvalidItemDomainError:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return ItemPresenter.toHTTP(result.value.item);
  }
}
