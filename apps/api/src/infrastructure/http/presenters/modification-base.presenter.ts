import { ModificationBase } from '@/domain/power-manager/enterprise/entities/modification-base';

export class ModificationBasePresenter {
  static toHTTP(mod: ModificationBase) {
    return {
      id: mod.modificationId,
      nome: mod.nome,
      tipo: mod.tipo,
      custoFixo: mod.custoFixo,
      custoPorGrau: mod.custoPorGrau,
      descricao: mod.descricao,
      categoria: mod.categoria,
      observacoes: mod.observacoes ?? null,
      detalhesGrau: mod.detalhesGrau ?? null,
      requerParametros: mod.requerParametros,
      tipoParametro: mod.tipoParametro ?? null,
      opcoes: mod.opcoes ?? [],
      grauMinimo: mod.grauMinimo ?? null,
      grauMaximo: mod.grauMaximo ?? null,
      placeholder: mod.placeholder ?? null,
      configuracoes: mod.configuracoes ?? null,
    };
  }
}
