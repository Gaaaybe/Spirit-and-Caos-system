import { PowerArray } from '@/domain/power-manager/enterprise/entities/power-array';
import { PowerPresenter } from './power.presenter';

export class PowerArrayPresenter {
  static toHTTP(powerArray: PowerArray) {
    const pb = powerArray.parametrosBase;

    return {
      id: powerArray.id.toString(),
      userId: powerArray.userId ?? null,
      nome: powerArray.nome,
      descricao: powerArray.descricao,
      isPublic: powerArray.isPublic,
      notas: powerArray.notas ?? null,
      dominio: {
        name: powerArray.dominio.name,
        areaConhecimento: powerArray.dominio.areaConhecimento ?? null,
        peculiarId: powerArray.dominio.peculiarId ?? null,
      },
      parametrosBase: pb
        ? {
            acao: pb.acao,
            alcance: pb.alcance,
            duracao: pb.duracao,
          }
        : null,
      custoTotal: {
        pda: powerArray.custoTotal.pda,
        pe: powerArray.custoTotal.pe,
        espacos: powerArray.custoTotal.espacos,
      },
      powers: powerArray.powers.getItems().map(PowerPresenter.toHTTP),
      createdAt: powerArray.createdAt,
      updatedAt: powerArray.updatedAt ?? null,
    };
  }
}
