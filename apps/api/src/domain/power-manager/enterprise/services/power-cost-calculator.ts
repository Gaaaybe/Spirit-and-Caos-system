import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { EffectsRepository } from '../../application/repositories/effects-repository';
import { ModificationsRepository } from '../../application/repositories/modifications-repository';
import type { AppliedEffect } from '../entities/applied-effect';
import type { AppliedModification } from '../entities/value-objects/applied-modification';
import type { PowerParameters } from '../entities/value-objects/power-parameters';
import { PowerCost } from '../entities/value-objects/power-cost';

type UniversalTableRow = {
  grau: number;
  pe: number;
  espacos: number;
};

const UNIVERSAL_TABLE: UniversalTableRow[] = [
  ...((JSON.parse(
    readFileSync(join(process.cwd(), 'data', 'tabelaUniversal.json'), 'utf-8'),
  ) as Array<{ grau: number; pe: number; espacos: number }>).map((row) => ({
    grau: row.grau,
    pe: row.pe,
    espacos: row.espacos,
  }))),
];

export interface PowerCostCalculationResult {
  custoTotal: PowerCost;
  custoPorEfeito: Map<string, PowerCost>;
}

export interface PowerCostCalculationInput {
  effects: AppliedEffect[];
  parametros: PowerParameters;
  globalModifications?: AppliedModification[];
}

@Injectable()
export class PowerCostCalculator {
  constructor(
    private effectsRepository: EffectsRepository,
    private modificationsRepository: ModificationsRepository,
  ) {}

  async calculate({
    effects,
    parametros,
    globalModifications = [],
  }: PowerCostCalculationInput): Promise<
    Either<ResourceNotFoundError, PowerCostCalculationResult>
  > {
    const custoPorEfeito = new Map<string, PowerCost>();
    let totalPdA = 0;
    let totalPE = 0;
    let totalEspacos = 0;

    const defaultParamsPerEffect = [] as Array<{
      acao: number;
      alcance: number;
      duracao: number;
    }>;

    for (const appliedEffect of effects) {
      const effectBase = await this.effectsRepository.findById(appliedEffect.effectBaseId);

      if (!effectBase) {
        return left(new ResourceNotFoundError());
      }

      defaultParamsPerEffect.push(effectBase.parametrosPadrao.toValue());
    }

    const paramsModifierByGrade = this.calculateGlobalParamsModifier(
      defaultParamsPerEffect,
      parametros,
    );

    for (const appliedEffect of effects) {
      const effectBase = await this.effectsRepository.findById(appliedEffect.effectBaseId);

      if (!effectBase) {
        return left(new ResourceNotFoundError());
      }

      const gradeData = this.getUniversalGradeData(appliedEffect.grau);
      let custoPorGrauEfeito = effectBase.custoBase + paramsModifierByGrade;
      let custoFixoEfeito = 0;
      const peEfeito = gradeData.pe;
      let espacosEfeito = gradeData.espacos;

      if (appliedEffect.configuracaoId && effectBase.hasConfiguracoes()) {
        const config = effectBase.getConfiguracao(appliedEffect.configuracaoId);
        if (config?.modificadorCusto) {
          custoPorGrauEfeito += config.modificadorCusto;
        }
      }

      // Modificações GLOBAIS: custoPorGrau somado ao custoPorGrau do efeito
      //                        custoFixo somado ao custoFixo do efeito
      for (const globalMod of globalModifications) {
        const modBase = await this.modificationsRepository.findById(globalMod.modificationBaseId);
        if (!modBase) {
          return left(new ResourceNotFoundError());
        }

        const grauMod = globalMod.grau ?? 1;
        const selectedConfigurationId =
          typeof globalMod.parametros?.configuracaoSelecionada === 'string'
            ? globalMod.parametros.configuracaoSelecionada
            : undefined;
        const { custoFixo: cfGlobal, custoPorGrau: cpgGlobal } =
          modBase.calcularCustoComConfiguracao(selectedConfigurationId);

        custoPorGrauEfeito += cpgGlobal * grauMod;
        custoFixoEfeito += cfGlobal;
      }

      // Modificações LOCAIS
      for (const modification of appliedEffect.modifications) {
        const modBase = await this.modificationsRepository.findById(
          modification.modificationBaseId,
        );

        if (!modBase) {
          return left(new ResourceNotFoundError());
        }

        const grauMod = modification.grau ?? 1;
        const selectedConfigurationId =
          typeof modification.parametros?.configuracaoSelecionada === 'string'
            ? modification.parametros.configuracaoSelecionada
            : undefined;
        const { custoFixo: cfLocal, custoPorGrau: cpgLocal } =
          modBase.calcularCustoComConfiguracao(selectedConfigurationId);

        custoPorGrauEfeito += cpgLocal * grauMod;
        custoFixoEfeito += cfLocal;
      }

      // custoPorGrau final não pode ser menor que 1 (mesma regra do frontend: Math.max(1, ...))
      custoPorGrauEfeito = Math.max(1, custoPorGrauEfeito);

      const grauParaCalculo = appliedEffect.grau < 1 ? 1 : appliedEffect.grau;
      let pdaEfeito = custoPorGrauEfeito * grauParaCalculo + custoFixoEfeito;
      pdaEfeito = Math.max(1, pdaEfeito);

      espacosEfeito = Math.max(0, espacosEfeito);

      const custoEfeito = PowerCost.create({
        pda: pdaEfeito,
        pe: peEfeito,
        espacos: espacosEfeito,
      });

      custoPorEfeito.set(appliedEffect.id.toString(), custoEfeito);

      totalPdA += pdaEfeito;
      totalPE += peEfeito;
      totalEspacos += espacosEfeito;
    }

    totalPdA = Math.max(0, totalPdA);
    totalEspacos = Math.max(0, totalEspacos);

    const custoTotal = PowerCost.create({
      pda: totalPdA,
      pe: totalPE,
      espacos: totalEspacos,
    });

    return right({
      custoTotal,
      custoPorEfeito,
    });
  }

  private getUniversalGradeData(grau: number): { pe: number; espacos: number } {
    return UNIVERSAL_TABLE.find((row) => row.grau === grau) ?? { pe: 0, espacos: 0 };
  }

  private calculateGlobalParamsModifier(
    defaultParamsPerEffect: Array<{ acao: number; alcance: number; duracao: number }>,
    selectedParams: PowerParameters,
  ): number {
    if (defaultParamsPerEffect.length === 0) {
      return 0;
    }

    const defaultAction = Math.min(...defaultParamsPerEffect.map((param) => param.acao));
    const defaultRange = Math.min(...defaultParamsPerEffect.map((param) => param.alcance));
    const defaultDuration = Math.min(...defaultParamsPerEffect.map((param) => param.duracao));

    return (
      this.calculateParameterModifier(defaultAction, selectedParams.acao, 'acao') +
      this.calculateParameterModifier(defaultRange, selectedParams.alcance, 'alcance') +
      this.calculateParameterModifier(defaultDuration, selectedParams.duracao, 'duracao')
    );
  }

  private calculateParameterModifier(
    defaultValue: number,
    selectedValue: number,
    type: 'acao' | 'alcance' | 'duracao',
  ): number {
    if (type !== 'duracao') {
      return selectedValue - defaultValue;
    }

    const normalizedDefaultDuration = defaultValue === 4 ? 3 : defaultValue;
    const normalizedSelectedDuration = selectedValue === 4 ? 3 : selectedValue;

    if (normalizedSelectedDuration === normalizedDefaultDuration) {
      return 0;
    }

    const transitionCost: Record<number, number> = {
      0: 1,
      1: 2,
      2: 3,
    };

    let modifier = 0;

    if (normalizedSelectedDuration > normalizedDefaultDuration) {
      for (let current = normalizedDefaultDuration; current < normalizedSelectedDuration; current++) {
        modifier += transitionCost[current] ?? 1;
      }
      return modifier;
    }

    for (let current = normalizedDefaultDuration; current > normalizedSelectedDuration; current--) {
      modifier -= transitionCost[current - 1] ?? 1;
    }

    return modifier;
  }
}
