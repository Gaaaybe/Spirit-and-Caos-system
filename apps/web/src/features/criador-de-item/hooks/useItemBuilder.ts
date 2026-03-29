import { useState } from 'react';
import type {
  CreateItemPayload,
  DomainName,
  ItemResponse,
  ItemType,
} from '@/services/types';

export const UPGRADE_PATAMARES = [
  { id: 1, nome: 'Fragmento', tier: 1, maxUpgradeLimit: 2, custoBase: 500 },
  { id: 2, nome: 'Estilhaço', tier: 2, maxUpgradeLimit: 4, custoBase: 5000 },
  { id: 3, nome: 'Pedaço', tier: 3, maxUpgradeLimit: 6, custoBase: 50000 },
  { id: 4, nome: 'Placa', tier: 4, maxUpgradeLimit: 9, custoBase: 100000 },
] as const;

export type UpgradePatamarId = (typeof UPGRADE_PATAMARES)[number]['id'];

interface ItemBuilderState {
  tipo: ItemType;
  nome: string;
  descricao: string;
  dominio: {
    name: DomainName;
    areaConhecimento?: string;
    peculiarId?: string;
  };
  custoBase: number;
  isPublic: boolean;
  icone: string;
  notas: string;
  powerIds: string[];
  powerArrayIds: string[];
  editingItemId: string | null;
  weapon: {
    danos: { dado: string; base: string; espiritual: boolean }[];
    critMargin: number;
    critMultiplier: number;
    alcance: 'adjacente' | 'natural' | 'curto' | 'medio' | 'longo';
    alcanceExtraMetros: number;
    atributoEscalonamento: string;
  };
  defensive: {
    tipoEquipamento: 'traje' | 'protecao';
    baseRD: number;
    atributoEscalonamento: string;
  };
  consumable: {
    descritorEfeito: string;
    qtdDoses: number;
    isRefeicao: boolean;
  };
  upgradeMaterial: {
    patamarId: UpgradePatamarId;
    tier: number;
    maxUpgradeLimit: number;
  };
}

const createInitialState = (): ItemBuilderState => ({
  tipo: 'weapon',
  nome: '',
  descricao: '',
  dominio: { name: 'natural' },
  custoBase: 1,
  isPublic: false,
  icone: '',
  notas: '',
  powerIds: [],
  powerArrayIds: [],
  editingItemId: null,
  weapon: {
    danos: [{ dado: '1d6', base: 'FOR', espiritual: false }],
    critMargin: 20,
    critMultiplier: 2,
    alcance: 'natural',
    alcanceExtraMetros: 0,
    atributoEscalonamento: '',
  },
  defensive: {
    tipoEquipamento: 'protecao',
    baseRD: 2,
    atributoEscalonamento: '',
  },
  consumable: {
    descritorEfeito: '',
    qtdDoses: 1,
    isRefeicao: false,
  },
  upgradeMaterial: {
    patamarId: 1 as UpgradePatamarId,
    tier: 1,
    maxUpgradeLimit: 2,
  },
});

export function useItemBuilder() {
  const [state, setState] = useState<ItemBuilderState>(createInitialState);

  const hydrateFromItem = (item: ItemResponse) => {
    setState((prev) => {
      const next = {
        ...createInitialState(),
        tipo: item.tipo,
        nome: item.nome,
        descricao: item.descricao,
        dominio: {
          name: item.dominio.name,
          areaConhecimento: item.dominio.areaConhecimento ?? undefined,
          peculiarId: item.dominio.peculiarId ?? undefined,
        },
        custoBase: item.custoBase,
        isPublic: item.isPublic,
        icone: item.icone ?? '',
        notas: item.notas ?? '',
        powerIds: item.powerIds,
        powerArrayIds: item.powerArrayIds,
        editingItemId: item.id,
        // Preserva seções não relacionadas quando o tipo atual for o mesmo.
        weapon: prev.tipo === item.tipo ? prev.weapon : createInitialState().weapon,
        defensive: prev.tipo === item.tipo ? prev.defensive : createInitialState().defensive,
        consumable: prev.tipo === item.tipo ? prev.consumable : createInitialState().consumable,
        upgradeMaterial: prev.tipo === item.tipo ? prev.upgradeMaterial : createInitialState().upgradeMaterial,
      } satisfies ItemBuilderState;

      if (item.tipo === 'weapon') {
        next.weapon = {
          danos: item.danos,
          critMargin: item.critMargin,
          critMultiplier: item.critMultiplier,
          alcance: item.alcance,
          alcanceExtraMetros: item.alcanceExtraMetros,
          atributoEscalonamento: item.atributoEscalonamento ?? '',
        };
      }

      if (item.tipo === 'defensive-equipment') {
        next.defensive = {
          tipoEquipamento: item.tipoEquipamento,
          baseRD: item.baseRD,
          atributoEscalonamento: item.atributoEscalonamento ?? '',
        };
      }

      if (item.tipo === 'consumable') {
        next.consumable = {
          descritorEfeito: item.descritorEfeito,
          qtdDoses: item.qtdDoses,
          isRefeicao: item.isRefeicao,
        };
      }

      if (item.tipo === 'upgrade-material') {
        const patamar = UPGRADE_PATAMARES.find((p) => p.tier === item.tier) ?? UPGRADE_PATAMARES[0];
        next.upgradeMaterial = {
          patamarId: patamar.id,
          tier: item.tier,
          maxUpgradeLimit: item.maxUpgradeLimit,
        };
      }

      return next;
    });
  };

  const updateField = <K extends keyof ItemBuilderState>(key: K, value: ItemBuilderState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const updateDomain = (partial: Partial<ItemBuilderState['dominio']>) => {
    setState((prev) => ({ ...prev, dominio: { ...prev.dominio, ...partial } }));
  };

  const setTipo = (tipo: ItemType) => {
    setState((prev) => ({ ...prev, tipo }));
  };

  const togglePower = (powerId: string) => {
    setState((prev) => ({
      ...prev,
      powerIds: prev.powerIds.includes(powerId)
        ? prev.powerIds.filter((id) => id !== powerId)
        : [...prev.powerIds, powerId],
    }));
  };

  const togglePowerArray = (powerArrayId: string) => {
    setState((prev) => ({
      ...prev,
      powerArrayIds: prev.powerArrayIds.includes(powerArrayId)
        ? prev.powerArrayIds.filter((id) => id !== powerArrayId)
        : [...prev.powerArrayIds, powerArrayId],
    }));
  };

  const updateWeaponDamage = (
    index: number,
    key: 'dado' | 'base' | 'espiritual',
    value: string | boolean,
  ) => {
    setState((prev) => ({
      ...prev,
      weapon: {
        ...prev.weapon,
        danos: prev.weapon.danos.map((dano, i) =>
          i === index ? { ...dano, [key]: value } : dano,
        ),
      },
    }));
  };

  const addWeaponDamage = () => {
    setState((prev) => ({
      ...prev,
      weapon: {
        ...prev.weapon,
        danos: [...prev.weapon.danos, { dado: '1d6', base: 'FOR', espiritual: false }],
      },
    }));
  };

  const removeWeaponDamage = (index: number) => {
    setState((prev) => ({
      ...prev,
      weapon: {
        ...prev.weapon,
        danos:
          prev.weapon.danos.length === 1
            ? prev.weapon.danos
            : prev.weapon.danos.filter((_, i) => i !== index),
      },
    }));
  };

  const updateWeaponField = (
    key: 'critMargin' | 'critMultiplier' | 'alcance' | 'alcanceExtraMetros' | 'atributoEscalonamento',
    value: number | string,
  ) => {
    setState((prev) => ({ ...prev, weapon: { ...prev.weapon, [key]: value } }));
  };

  const updateDefensiveField = (
    key: 'tipoEquipamento' | 'baseRD' | 'atributoEscalonamento',
    value: number | string,
  ) => {
    setState((prev) => ({ ...prev, defensive: { ...prev.defensive, [key]: value } }));
  };

  const updateConsumableField = (
    key: 'descritorEfeito' | 'qtdDoses' | 'isRefeicao',
    value: string | number | boolean,
  ) => {
    setState((prev) => ({ ...prev, consumable: { ...prev.consumable, [key]: value } }));
  };

  const setUpgradeMaterialPatamar = (patamarId: UpgradePatamarId) => {
    const patamar = UPGRADE_PATAMARES.find((p) => p.id === patamarId);
    if (!patamar) return;
    setState((prev) => ({
      ...prev,
      custoBase: patamar.custoBase,
      upgradeMaterial: {
        patamarId,
        tier: patamar.tier,
        maxUpgradeLimit: patamar.maxUpgradeLimit,
      },
    }));
  };

  const getValidationErrors = () => {
    const errors: string[] = [];

    if (state.nome.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres.');
    }

    if (state.descricao.trim().length < 10) {
      errors.push('Descrição deve ter pelo menos 10 caracteres.');
    }

    if (state.dominio.name === 'cientifico' && !state.dominio.areaConhecimento) {
      errors.push('Área de conhecimento é obrigatória para domínio Científico.');
    }

    if (state.dominio.name === 'peculiar' && !state.dominio.peculiarId) {
      errors.push('Peculiaridade é obrigatória para domínio Peculiar.');
    }

    if (state.tipo === 'consumable' && state.consumable.descritorEfeito.trim().length === 0) {
      errors.push('Consumível exige descritor de efeito.');
    }

    if (state.tipo === 'weapon') {
      const hasInvalidDamage = state.weapon.danos.some((d) => !d.dado.trim() || !d.base.trim());
      if (hasInvalidDamage) {
        errors.push('Preencha dado e base em todos os danos da arma.');
      }

      if (state.weapon.alcance !== 'natural' && state.weapon.alcanceExtraMetros > 0) {
        errors.push('Apenas armas de alcance natural podem ter alcance extra.');
      }

      if (!Number.isInteger(state.weapon.alcanceExtraMetros * 2)) {
        errors.push('Alcance extra da arma deve usar incrementos de 0,5m.');
      }
    }

    return errors;
  };

  const buildPayload = (): CreateItemPayload => {
    const common = {
      nome: state.nome.trim(),
      descricao: state.descricao.trim(),
      dominio: {
        name: state.dominio.name,
        ...(state.dominio.areaConhecimento && {
          areaConhecimento: state.dominio.areaConhecimento,
        }),
        ...(state.dominio.peculiarId && { peculiarId: state.dominio.peculiarId }),
      },
      custoBase: state.custoBase,
      isPublic: state.isPublic,
      ...(state.notas.trim() && { notas: state.notas.trim() }),
      ...(state.icone.trim() && { icone: state.icone.trim() }),
      ...(state.powerIds.length > 0 && { powerIds: state.powerIds }),
      ...(state.powerArrayIds.length > 0 && { powerArrayIds: state.powerArrayIds }),
    };

    if (state.tipo === 'weapon') {
      return {
        ...common,
        tipo: 'weapon',
        danos: state.weapon.danos,
        critMargin: state.weapon.critMargin,
        critMultiplier: state.weapon.critMultiplier,
        alcance: state.weapon.alcance,
        alcanceExtraMetros:
          state.weapon.alcance === 'natural' ? state.weapon.alcanceExtraMetros : 0,
        ...(state.weapon.atributoEscalonamento.trim() && {
          atributoEscalonamento: state.weapon.atributoEscalonamento.trim(),
        }),
      };
    }

    if (state.tipo === 'defensive-equipment') {
      return {
        ...common,
        tipo: 'defensive-equipment',
        tipoEquipamento: state.defensive.tipoEquipamento,
        baseRD: state.defensive.baseRD,
        ...(state.defensive.atributoEscalonamento.trim() && {
          atributoEscalonamento: state.defensive.atributoEscalonamento.trim(),
        }),
      };
    }

    if (state.tipo === 'consumable') {
      return {
        ...common,
        tipo: 'consumable',
        descritorEfeito: state.consumable.descritorEfeito.trim(),
        qtdDoses: state.consumable.qtdDoses,
        isRefeicao: state.consumable.isRefeicao,
      };
    }

    if (state.tipo === 'artifact') {
      return { ...common, tipo: 'artifact' };
    }

    if (state.tipo === 'accessory') {
      return { ...common, tipo: 'accessory' };
    }

    if (state.tipo === 'general') {
      return { ...common, tipo: 'general' };
    }

    return {
      ...common,
      tipo: 'upgrade-material',
      tier: state.upgradeMaterial.tier,
      maxUpgradeLimit: state.upgradeMaterial.maxUpgradeLimit,
    };
  };

  const reset = () => {
    setState(createInitialState());
  };

  return {
    state,
    updateField,
    updateDomain,
    setTipo,
    togglePower,
    togglePowerArray,
    updateWeaponDamage,
    addWeaponDamage,
    removeWeaponDamage,
    updateWeaponField,
    updateDefensiveField,
    updateConsumableField,
    setUpgradeMaterialPatamar,
    hydrateFromItem,
    getValidationErrors,
    buildPayload,
    reset,
  };
}
