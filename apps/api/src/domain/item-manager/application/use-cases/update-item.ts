import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
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

interface UpdateItemCommonProps {
  itemId: string;
  userId: string;
  nome?: string;
  descricao?: string;
  dominio?: Domain;
  custoBase?: number;
  nivelItem?: number;
  isPublic?: boolean;
  notas?: string;
  powerIds?: string[];
}

type UpdateItemRequest =
  | (UpdateItemCommonProps & {
      tipo: ItemType.WEAPON;
      danos?: DamageDescriptor[];
      critMargin?: number;
      critMultiplier?: number;
      alcance?: WeaponRange;
      atributoEscalonamento?: string;
    })
  | (UpdateItemCommonProps & {
      tipo: ItemType.DEFENSIVE_EQUIPMENT;
      tipoEquipamento?: EquipmentType;
      baseRD?: number;
      atributoEscalonamento?: string;
    })
  | (UpdateItemCommonProps & {
      tipo: ItemType.CONSUMABLE;
      descritorEfeito?: string;
      qtdDoses?: number;
    })
  | (UpdateItemCommonProps & { tipo: ItemType.ARTIFACT })
  | (UpdateItemCommonProps & { tipo: ItemType.ACCESSORY; efeitoPassivo?: string });

interface UpdateItemUseCaseResponseData {
  item: Item<ItemBaseProps>;
}

type UpdateItemUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError | InvalidItemDomainError,
  UpdateItemUseCaseResponseData
>;

@Injectable()
export class UpdateItemUseCase {
  constructor(
    private itemsRepository: ItemsRepository,
    private powersLookupPort: PowersLookupPort,
  ) {}

  async execute(request: UpdateItemRequest): Promise<UpdateItemUseCaseResponse> {
    const existing = await this.itemsRepository.findById(request.itemId);

    if (!existing) {
      return left(new ResourceNotFoundError());
    }

    if (!existing.canBeEditedBy(request.userId)) {
      return left(new NotAllowedError());
    }

    const targetDomain = request.dominio ?? existing.dominio;

    let newPowerIds: ItemPowerIdList | undefined;
    if (request.powerIds !== undefined) {
      newPowerIds = new ItemPowerIdList();

      for (const powerId of request.powerIds) {
        const power = await this.powersLookupPort.findById(powerId);

        if (!power) {
          return left(new ResourceNotFoundError());
        }

        if (power.domainName !== targetDomain.name) {
          return left(
            new InvalidItemDomainError(
              `Poder "${power.nome}" é do domínio "${power.domainName}", mas o item é do domínio "${targetDomain.name}"`,
            ),
          );
        }

        newPowerIds.add(new UniqueEntityId(powerId));
      }
    }

    const commonPartial = {
      nome: request.nome,
      descricao: request.descricao,
      dominio: request.dominio,
      custoBase: request.custoBase,
      nivelItem: request.nivelItem,
      notas: request.notas,
      powerIds: newPowerIds,
    };

    let updatedItem: Item<ItemBaseProps>;

    if (existing instanceof Weapon && request.tipo === ItemType.WEAPON) {
      updatedItem = existing.update({
        ...commonPartial,
        danos: request.danos,
        critMargin: request.critMargin,
        critMultiplier: request.critMultiplier,
        alcance: request.alcance,
        atributoEscalonamento: request.atributoEscalonamento,
      });
    } else if (
      existing instanceof DefensiveEquipment &&
      request.tipo === ItemType.DEFENSIVE_EQUIPMENT
    ) {
      updatedItem = existing.update({
        ...commonPartial,
        tipoEquipamento: request.tipoEquipamento,
        baseRD: request.baseRD,
        atributoEscalonamento: request.atributoEscalonamento,
      });
    } else if (existing instanceof Consumable && request.tipo === ItemType.CONSUMABLE) {
      updatedItem = existing.update({
        ...commonPartial,
        descritorEfeito: request.descritorEfeito,
        qtdDoses: request.qtdDoses,
      });
    } else if (existing instanceof Artifact && request.tipo === ItemType.ARTIFACT) {
      updatedItem = existing.update(commonPartial);
    } else if (existing instanceof Accessory && request.tipo === ItemType.ACCESSORY) {
      updatedItem = existing.update({
        ...commonPartial,
        efeitoPassivo: request.efeitoPassivo,
      });
    } else {
      return left(new NotAllowedError());
    }

    if (request.isPublic !== undefined && request.isPublic !== existing.isPublic) {
      updatedItem = request.isPublic ? updatedItem.makePublic() : updatedItem.makePrivate();
    }

    await this.itemsRepository.update(updatedItem);

    return right({ item: updatedItem });
  }
}
