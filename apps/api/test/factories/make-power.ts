import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { Power } from '@/domain/power-manager/enterprise/entities/power';
import { Domain, DomainName } from '@/domain/power-manager/enterprise/entities/value-objects/domain';
import { PowerParameters } from '@/domain/power-manager/enterprise/entities/value-objects/power-parameters';
import { PowerCost } from '@/domain/power-manager/enterprise/entities/value-objects/power-cost';
import { PowerEffectList } from '@/domain/power-manager/enterprise/entities/watched-lists/power-effect-list';
import { PowerGlobalModificationList } from '@/domain/power-manager/enterprise/entities/watched-lists/power-global-modification-list';
import { makeAppliedEffect } from './make-applied-effect';

export function makePower(
  override: any = {},
  id?: UniqueEntityId,
) {
  const effects = new PowerEffectList();
  if (!override.effects) {
    effects.add(makeAppliedEffect());
  }

  const power = Power.create(
    {
      nome: 'Test Power',
      descricao: 'A test power description with more than ten characters.',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.create({ acao: 1, alcance: 1, duracao: 0 }),
      effects: override.effects ?? effects,
      globalModifications: new PowerGlobalModificationList(),
      custoTotal: PowerCost.create({ pda: 10, pe: 5, espacos: 1 }),
      isPublic: false,
      ...override,
    },
    id,
  );

  return power;
}
