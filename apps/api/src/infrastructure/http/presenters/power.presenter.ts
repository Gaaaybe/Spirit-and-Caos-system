import type { AppliedEffect } from '@/domain/power-manager/enterprise/entities/applied-effect';
import { Power } from '@/domain/power-manager/enterprise/entities/power';
import type { AppliedModification } from '@/domain/power-manager/enterprise/entities/value-objects/applied-modification';

function serializeAppliedModification(mod: AppliedModification) {
  return {
    modificationBaseId: mod.modificationBaseId,
    scope: mod.scope,
    grau: mod.grau,
    parametros: mod.parametros ?? null,
    nota: mod.nota ?? null,
  };
}

function serializeAppliedEffect(effect: AppliedEffect) {
  return {
    id: effect.id.toString(),
    effectBaseId: effect.effectBaseId,
    grau: effect.grau,
    configuracaoId: effect.configuracaoId ?? null,
    inputValue: effect.inputValue ?? null,
    custo: {
      pda: effect.custo.pda,
      pe: effect.custo.pe,
      espacos: effect.custo.espacos,
    },
    modifications: effect.modifications.map(serializeAppliedModification),
    nota: effect.nota ?? null,
  };
}

export class PowerPresenter {
  static toHTTP(power: Power) {
    const alt = power.custoAlternativo;

    return {
      id: power.id.toString(),
      userId: power.userId ?? null,
      nome: power.nome,
      descricao: power.descricao,
      isPublic: power.isPublic,
      icone: power.icone ?? null,
      notas: power.notas ?? null,
      dominio: {
        name: power.dominio.name,
        areaConhecimento: power.dominio.areaConhecimento ?? null,
        peculiarId: power.dominio.peculiarId ?? null,
      },
      parametros: {
        acao: power.parametros.acao,
        alcance: power.parametros.alcance,
        duracao: power.parametros.duracao,
      },
      custoTotal: {
        pda: power.custoTotal.pda,
        pe: power.custoTotal.pe,
        espacos: power.custoTotal.espacos,
      },
      custoAlternativo: alt
        ? {
            tipo: alt.tipo,
            quantidade: alt.quantidade,
            descricao: alt.descricao ?? null,
            atributo: alt.atributo ?? null,
            itemId: alt.itemId ?? null,
          }
        : null,
      effects: power.effects.getItems().map(serializeAppliedEffect),
      globalModifications: power.globalModifications.getItems().map(serializeAppliedModification),
      createdAt: power.createdAt,
      updatedAt: power.updatedAt ?? null,
      userName: power.userName ?? null,
    };
  }
}
