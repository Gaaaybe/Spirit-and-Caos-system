import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { Weapon, WeaponRange } from '@/domain/item-manager/enterprise/entities/weapon';
import { DamageDescriptor } from '@/domain/item-manager/enterprise/entities/value-objects/damage-descriptor';
import { Domain, DomainName } from '@/domain/shared/enterprise/value-objects/domain';
import { ItemPowerIdList } from '@/domain/item-manager/enterprise/entities/watched-lists/item-power-id-list';
import { ItemPowerArrayIdList } from '@/domain/item-manager/enterprise/entities/watched-lists/item-power-array-id-list';

export function makeWeapon(
  override: any = {},
  id?: UniqueEntityId,
) {
  const weapon = Weapon.create(
    {
      nome: 'Test Weapon',
      descricao: 'A test weapon description with more than ten characters.',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 10,
      nivelItem: 1,
      danos: [DamageDescriptor.create('1d8', 'corte', false)],
      critMargin: 2,
      critMultiplier: 2,
      alcance: WeaponRange.NATURAL,
      powerIds: new ItemPowerIdList(),
      powerArrayIds: new ItemPowerArrayIdList(),
      isPublic: false,
      canStack: false,
      maxStack: 2,
      ...override,
    },
    id,
  );

  return weapon;
}
