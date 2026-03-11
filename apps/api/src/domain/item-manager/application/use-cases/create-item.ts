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
import { ItemPowerIdList } from '../../enterprise/entities/watched-lists/item-power-id-list';
import { ItemsRepository } from '../repositories/items-repository';
import { PowersLookupPort } from '../repositories/powers-lookup-port';
import { InvalidItemDomainError } from './errors/invalid-item-domain-error';

interface CreateItemCommonProps {
  userId?: string;
  nome: string;
  descricao: string;
  dominio: Domain;
  custoBase: number;
  nivelItem: number;
  maxStack?: number;
  isPublic?: boolean;
  notas?: string;
  powerIds?: string[];
}

type CreateItemRequest =
  | (CreateItemCommonProps & {
      tipo: ItemType.WEAPON;
      danos: DamageDescriptor[];
      critMargin: number;
      critMultiplier: number;
      alcance: WeaponRange;
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
  | (CreateItemCommonProps & { tipo: ItemType.ACCESSORY; efeitoPassivo: string });

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
  ) {}

  async execute(request: CreateItemRequest): Promise<CreateItemUseCaseResponse> {
    const powerIdList = new ItemPowerIdList();

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
      }
    }

    const common = {
      userId: request.userId,
      nome: request.nome,
      descricao: request.descricao,
      dominio: request.dominio,
      custoBase: request.custoBase,
      nivelItem: request.nivelItem,
      maxStack: request.maxStack,
      isPublic: request.isPublic,
      notas: request.notas,
      powerIds: powerIdList,
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
        item = Accessory.create({
          ...common,
          efeitoPassivo: request.efeitoPassivo,
        });
        break;
    }

    await this.itemsRepository.create(item);

    return right({ item });
  }
}
