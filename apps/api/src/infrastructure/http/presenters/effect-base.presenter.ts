import { EffectBase } from '@/domain/power-manager/enterprise/entities/effect-base';

export class EffectBasePresenter {
  static toHTTP(effect: EffectBase) {
    return {
      id: effect.effectId,
      nome: effect.nome,
      custoBase: effect.custoBase,
      descricao: effect.descricao,
      categorias: effect.categorias,
      exemplos: effect.exemplos ?? null,
      parametrosPadrao: {
        acao: effect.parametrosPadrao.acao,
        alcance: effect.parametrosPadrao.alcance,
        duracao: effect.parametrosPadrao.duracao,
      },
      requerInput: effect.requerInput,
      tipoInput: effect.tipoInput ?? null,
      labelInput: effect.labelInput ?? null,
      opcoesInput: effect.opcoesInput ?? [],
      placeholderInput: effect.placeholderInput ?? null,
      configuracoes: effect.configuracoes ?? null,
    };
  }
}
