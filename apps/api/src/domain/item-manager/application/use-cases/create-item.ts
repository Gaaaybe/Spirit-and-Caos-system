import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import type { Domain } from '@/domain/shared/enterprise/value-objects/domain';
import { Accessory } from '../../enterprise/entities/accessory';
import { Artifact } from '../../enterprise/entities/artifact';
import { Consumable } from '../../enterprise/entities/consumable';
import { DefensiveEquipment, EquipmentType } from '../../enterprise/entities/defensive-equipment';
import type { Item, ItemBaseProps } from '../../enterprise/entities/item';
import { ItemType } from '../../enterprise/entities/item';
import { Weapon, WeaponRange } from '../../enterprise/entities/weapon';
import type { DamageDescriptor } from '../../enterprise/entities/value-objects/damage-descriptor';
import { ItemPowerArrayIdList } from '../../enterprise/entities/watched-lists/item-power-array-id-list';
import { ItemPowerIdList } from '../../enterprise/entities/watched-lists/item-power-id-list';
import { ItemsRepository } from '../repositories/items-repository';
import { PowerArraysLookupPort } from '../repositories/power-arrays-lookup-port';
import { PowersLookupPort } from '../repositories/powers-lookup-port';
import { InvalidItemDomainError } from './errors/invalid-item-domain-error';

interface CreateItemCommonProps {
  userId?: string;
  nome: string;
  descricao: string;
  dominio: Domain;
  custoBase: number;
  nivelItem?: number;
  isPublic?: boolean;
  icone?: string;
  notas?: string;
  powerIds?: string[];
  powerArrayIds?: string[];
}

type CreateItemRequest =
  | (CreateItemCommonProps & {
      tipo: ItemType.WEAPON;
      danos: DamageDescriptor[];
      critMargin: number;
      critMultiplier: number;
      alcance: WeaponRange;
      alcanceExtraMetros?: number;
      atributoEscalonamento?: string;
    })
  | (CreateItemCommonProps & {
      tipo: ItemType.DEFENSIVE_EQUIPMENT;
      tipoEquipamento: EquipmentType;
      baseRD?: number;
      atributoEscalonamento?: string;
    })
  | (CreateItemCommonProps & {
      tipo: ItemType.CONSUMABLE;
      descritorEfeito: string;
      qtdDoses: number;
      isRefeicao: boolean;
    })
  | (CreateItemCommonProps & { tipo: ItemType.ARTIFACT })
  | (CreateItemCommonProps & { tipo: ItemType.ACCESSORY });

interface CreateItemUseCaseResponseData {
  item: Item<ItemBaseProps>;
}

type CreateItemUseCaseResponse = Either<
  ResourceNotFoundError | InvalidItemDomainError,
  CreateItemUseCaseResponseData
>;

@Injectable()
export class CreateItemUseCase {
  constructor(
    private itemsRepository: ItemsRepository,
    private powersLookupPort: PowersLookupPort,
    private powerArraysLookupPort: PowerArraysLookupPort,
  ) {}

  async execute(request: CreateItemRequest): Promise<CreateItemUseCaseResponse> {
    const powerIdList = new ItemPowerIdList();
    let totalItemLevelContribution = 0;

    if (request.powerIds && request.powerIds.length > 0) {
      for (const powerId of request.powerIds) {
        const power = await this.powersLookupPort.findById(powerId);

        if (!power) {
          return left(new ResourceNotFoundError());
        }

        if (power.domainName !== request.dominio.name) {
          return left(
            new InvalidItemDomainError(
              `Poder "${power.nome}" é do domínio "${power.domainName}", mas o item é do domínio "${request.dominio.name}"`,
            ),
          );
        }

        powerIdList.add(new UniqueEntityId(powerId));
        totalItemLevelContribution += power.itemLevelContribution;
      }
    }

    const powerArrayIdList = new ItemPowerArrayIdList();

    if (request.powerArrayIds && request.powerArrayIds.length > 0) {
      for (const powerArrayId of request.powerArrayIds) {
        const powerArray = await this.powerArraysLookupPort.findById(powerArrayId);

        if (!powerArray) {
          return left(new ResourceNotFoundError());
        }

        if (powerArray.domainName !== request.dominio.name) {
          return left(
            new InvalidItemDomainError(
              `Acervo "${powerArray.nome}" é do domínio "${powerArray.domainName}", mas o item é do domínio "${request.dominio.name}"`,
            ),
          );
        }

        powerArrayIdList.add(new UniqueEntityId(powerArrayId));
        totalItemLevelContribution += powerArray.itemLevelContribution;
      }
    }

    const computedItemLevel = Math.max(1, totalItemLevelContribution);

    const common = {
      userId: request.userId,
      nome: request.nome,
      descricao: request.descricao,
      dominio: request.dominio,
      custoBase: request.custoBase,
      nivelItem: computedItemLevel,
      isPublic: request.isPublic,
      icone: request.icone,
      notas: request.notas,
      powerIds: powerIdList,
      powerArrayIds: powerArrayIdList,
    };

    let item: Item<ItemBaseProps>;

    switch (request.tipo) {
      case ItemType.WEAPON:
        item = Weapon.create({
          ...common,
          danos: request.danos,
          critMargin: request.critMargin,
          critMultiplier: request.critMultiplier,
          alcance: request.alcance,
          alcanceExtraMetros: request.alcanceExtraMetros,
          atributoEscalonamento: request.atributoEscalonamento,
        });
        break;

      case ItemType.DEFENSIVE_EQUIPMENT:
        item = DefensiveEquipment.create({
          ...common,
          tipoEquipamento: request.tipoEquipamento,
          baseRD: request.baseRD,
          atributoEscalonamento: request.atributoEscalonamento,
        });
        break;

      case ItemType.CONSUMABLE:
        item = Consumable.create({
          ...common,
          descritorEfeito: request.descritorEfeito,
          qtdDoses: request.qtdDoses,
          isRefeicao: request.isRefeicao,
        });
        break;

      case ItemType.ARTIFACT:
        item = Artifact.create({ ...common });
        break;

      case ItemType.ACCESSORY:
        item = Accessory.create({ ...common });
        break;
    }

    await this.itemsRepository.create(item);

    return right({ item });
  }
}
