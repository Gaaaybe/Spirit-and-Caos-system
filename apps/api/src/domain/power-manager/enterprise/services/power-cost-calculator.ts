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
    const espacosPorEfeito: number[] = [];
    const pePorEfeito: number[] = [];

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
      const espacosEfeito = Math.max(0, gradeData.espacos);

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

      const custoEfeito = PowerCost.create({
        pda: pdaEfeito,
        pe: peEfeito,
        espacos: espacosEfeito,
      });

      custoPorEfeito.set(appliedEffect.id.toString(), custoEfeito);

      totalPdA += pdaEfeito;
      espacosPorEfeito.push(espacosEfeito);
      pePorEfeito.push(peEfeito);
    }

    // Espaços e PE: mesmo que o frontend — maior efeito + 1 por efeito adicional
    // Frontend: calcularEspacosTotal → max(espacos) + (numEfeitos - 1)
    // Frontend: calcularPETotal → max(pe) + (numEfeitos - 1)
    const maiorEspacos = espacosPorEfeito.length > 0 ? Math.max(...espacosPorEfeito) : 0;
    const maiorPE = pePorEfeito.length > 0 ? Math.max(...pePorEfeito) : 0;
    const qtdEfeitosAdicionais = Math.max(0, effects.length - 1);

    let totalEspacos = maiorEspacos + qtdEfeitosAdicionais;
    let totalPE = maiorPE + qtdEfeitosAdicionais;

    // ── Modificações globais especiais de PE e Espaços ──────────────────────
    // Espelha calcularPETotal() e calcularEspacosTotal() do frontend
    const getOpcao = (mod: (typeof globalModifications)[number]) =>
      typeof mod.parametros?.opcao === 'string' ? mod.parametros.opcao : undefined;

    const modPEDobrado = globalModifications.find(
      (m) => m.modificationBaseId === 'custo-pe-dobrado' && getOpcao(m) === 'PE Dobrado',
    );
    const modPETotal = globalModifications.find(
      (m) => m.modificationBaseId === 'custo-pe-total' && getOpcao(m) === 'Todos PE',
    );
    const modPEReduzido = globalModifications.find(
      (m) => m.modificationBaseId === 'custo-pe-reduzido' && getOpcao(m) === 'PE pela Metade',
    );
    const modPEMinimo = globalModifications.find(
      (m) =>
        m.modificationBaseId === 'custo-pe-minimo' &&
        getOpcao(m) === 'PE Mínimo (metade - 3/efeito)',
    );
    const modEspacosDobrado = globalModifications.find(
      (m) => m.modificationBaseId === 'custo-pe-dobrado' && getOpcao(m) === 'Espaços Dobrados',
    );
    const modEspacosTotal = globalModifications.find(
      (m) => m.modificationBaseId === 'custo-pe-total' && getOpcao(m) === 'Todos Espaços',
    );
    const modEspacosReduzido = globalModifications.find(
      (m) => m.modificationBaseId === 'custo-pe-reduzido' && getOpcao(m) === 'Espaços pela Metade',
    );
    const modEspacosMinimo = globalModifications.find(
      (m) => m.modificationBaseId === 'custo-pe-minimo' && getOpcao(m) === 'Espaços Fixos (3)',
    );

    // Aplica modificadores de PE
    if (modPEDobrado) {
      totalPE *= 2;
    } else if (modPETotal) {
      totalPE = pePorEfeito.reduce((acc, pe) => acc + pe, 0);
    } else if (modPEReduzido) {
      totalPE = Math.max(1, Math.ceil(totalPE / 2));
    } else if (modPEMinimo) {
      totalPE = Math.max(1, Math.floor(totalPE / 2) - 3 * effects.length);
    }

    // Aplica modificadores de Espaços
    if (modEspacosDobrado) {
      totalEspacos *= 2;
    } else if (modEspacosTotal) {
      totalEspacos = espacosPorEfeito.reduce((acc, e) => acc + e, 0);
    } else if (modEspacosReduzido) {
      totalEspacos = Math.max(1, Math.ceil(totalEspacos / 2));
    } else if (modEspacosMinimo) {
      totalEspacos = 3;
    }

    totalPdA = Math.max(0, totalPdA);
    totalEspacos = Math.max(0, totalEspacos);
    totalPE = Math.max(0, totalPE);

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
