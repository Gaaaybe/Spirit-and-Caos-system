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
import { CreateItemUseCase } from '@/domain/item-manager/application/use-cases/create-item';
import { InvalidItemDomainError } from '@/domain/item-manager/application/use-cases/errors/invalid-item-domain-error';
import { EquipmentType } from '@/domain/item-manager/enterprise/entities/defensive-equipment';
import { ItemType } from '@/domain/item-manager/enterprise/entities/item';
import { DamageDescriptor } from '@/domain/item-manager/enterprise/entities/value-objects/damage-descriptor';
import { WeaponRange } from '@/domain/item-manager/enterprise/entities/weapon';
import { Domain, DomainName } from '@/domain/shared/enterprise/value-objects/domain';
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

const commonFields = {
  nome: z.string().min(2).max(100),
  descricao: z.string().min(10).max(1000),
  dominio: dominioSchema,
  custoBase: z.number().int().min(0),
  nivelItem: z.number().int().min(1).optional(),
  isPublic: z.boolean().default(false),
  notas: z.string().max(2000).optional(),
  powerIds: z.array(z.string().min(1)).default([]),
  icone: z.url('Ícone deve ser um link válido').optional(),
  powerArrayIds: z.array(z.string().min(1)).default([]),
  canStack: z.boolean().optional(),
  maxStack: z.number().int().min(2).optional(),
};

const createItemBodySchema = z.discriminatedUnion('tipo', [
  z
    .object({
      ...commonFields,
      tipo: z.literal(ItemType.WEAPON),
      danos: z.array(damageDescriptorSchema).min(1),
      critMargin: z.number().int().min(2).max(20),
      critMultiplier: z.number().int().min(1).max(7),
      alcance: z.enum([
        WeaponRange.ADJACENTE,
        WeaponRange.NATURAL,
        WeaponRange.CURTO,
        WeaponRange.MEDIO,
        WeaponRange.LONGO,
      ]),
      alcanceExtraMetros: z.number().min(0).multipleOf(0.5).default(0),
      atributoEscalonamento: z.string().min(1).optional(),
      upgradeLevel: z.number().int().min(0).max(7).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.alcance !== WeaponRange.NATURAL && data.alcanceExtraMetros > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['alcanceExtraMetros'],
          message: 'Apenas armas de alcance natural podem ter alcance extra',
        });
      }
    }),
  z.object({
    ...commonFields,
    tipo: z.literal(ItemType.DEFENSIVE_EQUIPMENT),
    tipoEquipamento: z.enum([EquipmentType.TRAJE, EquipmentType.PROTECAO]),
    baseRD: z.number().int().min(0).optional(),
    atributoEscalonamento: z.string().min(1).optional(),
    upgradeLevel: z.number().int().min(0).max(9).optional(),
  }),
  z.object({
    ...commonFields,
    tipo: z.literal(ItemType.CONSUMABLE),
    descritorEfeito: z.string().min(1).max(500),
    qtdDoses: z.number().int().min(1),
    isRefeicao: z.boolean(),
  }),
  z.object({
    ...commonFields,
    tipo: z.literal(ItemType.ARTIFACT),
  }),
  z.object({
    ...commonFields,
    tipo: z.literal(ItemType.ACCESSORY),
  }),
  z.object({
    ...commonFields,
    tipo: z.literal(ItemType.GENERAL),
  }),
  z.object({
    ...commonFields,
    tipo: z.literal(ItemType.UPGRADE_MATERIAL),
    tier: z.number().int().min(1).max(4),
    maxUpgradeLimit: z.number().int().min(1),
  }),
]);

type CreateItemBodySchema = z.infer<typeof createItemBodySchema>;

@Controller('/items')
export class CreateItemController {
  constructor(private createItem: CreateItemUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createItemBodySchema)) body: CreateItemBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const dominioVO = Domain.create({
      name: body.dominio.name as DomainName,
      areaConhecimento: body.dominio.areaConhecimento,
      peculiarId: body.dominio.peculiarId,
    });

    const common = {
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
      canStack: body.canStack,
      maxStack: body.maxStack,
    };

    let result: Awaited<ReturnType<CreateItemUseCase['execute']>>;

    if (body.tipo === ItemType.WEAPON) {
      result = await this.createItem.execute({
        ...common,
        tipo: ItemType.WEAPON,
        danos: body.danos.map((d) => DamageDescriptor.create(d.dado, d.base, d.espiritual)),
        critMargin: body.critMargin,
        critMultiplier: body.critMultiplier,
        alcance: body.alcance as WeaponRange,
        alcanceExtraMetros: body.alcanceExtraMetros,
        atributoEscalonamento: body.atributoEscalonamento,
        upgradeLevel: body.upgradeLevel,
      });
    } else if (body.tipo === ItemType.DEFENSIVE_EQUIPMENT) {
      result = await this.createItem.execute({
        ...common,
        tipo: ItemType.DEFENSIVE_EQUIPMENT,
        tipoEquipamento: body.tipoEquipamento as EquipmentType,
        baseRD: body.baseRD,
        atributoEscalonamento: body.atributoEscalonamento,
        upgradeLevel: body.upgradeLevel,
      });
    } else if (body.tipo === ItemType.CONSUMABLE) {
      result = await this.createItem.execute({
        ...common,
        tipo: ItemType.CONSUMABLE,
        descritorEfeito: body.descritorEfeito,
        qtdDoses: body.qtdDoses,
        isRefeicao: body.isRefeicao,
      });
    } else if (body.tipo === ItemType.ARTIFACT) {
      result = await this.createItem.execute({ ...common, tipo: ItemType.ARTIFACT });
    } else if (body.tipo === ItemType.GENERAL) {
      result = await this.createItem.execute({ ...common, tipo: ItemType.GENERAL });
    } else if (body.tipo === ItemType.UPGRADE_MATERIAL) {
      result = await this.createItem.execute({
        ...common,
        tipo: ItemType.UPGRADE_MATERIAL,
        tier: body.tier,
        maxUpgradeLimit: body.maxUpgradeLimit,
      });
    } else {
      result = await this.createItem.execute({ ...common, tipo: ItemType.ACCESSORY });
    }

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case InvalidItemDomainError:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return ItemPresenter.toHTTP(result.value.item);
  }
}
