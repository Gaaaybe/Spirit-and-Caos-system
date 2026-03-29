import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { AppliedEffect } from '@/domain/power-manager/enterprise/entities/applied-effect';
import { PowerCost } from '@/domain/power-manager/enterprise/entities/value-objects/power-cost';

export function makeAppliedEffect(
  override: any = {},
  id?: UniqueEntityId,
) {
  const appliedEffect = AppliedEffect.create(
    {
      effectBaseId: 'effect-1',
      grau: 1,
      modifications: [],
      custo: PowerCost.create({ pda: 2, pe: 1, espacos: 0 }),
      ...override,
    },
    id,
  );

  return appliedEffect;
}
