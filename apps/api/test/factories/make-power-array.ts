import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { PowerArray } from '@/domain/power-manager/enterprise/entities/power-array';
import { Domain, DomainName } from '@/domain/power-manager/enterprise/entities/value-objects/domain';
import { PowerCost } from '@/domain/power-manager/enterprise/entities/value-objects/power-cost';
import { PowerArrayPowerList } from '@/domain/power-manager/enterprise/entities/watched-lists/power-array-power-list';
import { makePower } from './make-power';

export function makePowerArray(
  override: any = {},
  id?: UniqueEntityId,
) {
  const powers = new PowerArrayPowerList();
  if (!override.powers) {
    powers.add(makePower());
  }

  const powerArray = PowerArray.create(
    {
      nome: 'Test Power Array',
      descricao: 'A test power array description with more than ten characters.',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      powers: override.powers ?? powers,
      custoTotal: PowerCost.create({ pda: 15, pe: 10, espacos: 2 }),
      isPublic: false,
      ...override,
    },
    id,
  );

  return powerArray;
}
