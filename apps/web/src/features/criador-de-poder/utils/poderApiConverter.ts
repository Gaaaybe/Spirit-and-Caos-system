/**
 * Conversor entre os tipos da API (PoderResponse/AcervoResponse) e os tipos
 * internos do editor (Poder/PoderSalvo/Acervo).
 *
 * Necessário porque a nomenclatura dos campos diverge entre as camadas:
 *  - API usa camelCase inspirado no domínio inglês (effects, effectBaseId, globalModifications…)
 *  - Editor usa nomenclatura PT-BR (efeitos, efeitoBaseId, modificacoesGlobais…)
 */

import type { Poder, EfeitoAplicado, ModificacaoAplicada } from '../regras/calculadoraCusto';
import type { PoderSalvo } from '../types';
import type { Acervo } from '../types/acervo.types';
import type {
  PoderResponse,
  EfeitoAplicadoResponse,
  ModificacaoAplicadaResponse,
  AcervoResponse,
  CreatePoderPayload,
  UpdatePoderPayload,
  EfeitoAplicadoPayload,
  ModificacaoAplicadaPayload,
  CustoAlternativoPayload,
  DomainName,
} from '@/services/types';

// ─── Modificação aplicada ──────────────────────────────────────────────────────

function modResponseToModAplicada(
  mod: ModificacaoAplicadaResponse,
  fallbackId: string,
): ModificacaoAplicada {
  return {
    id: fallbackId,
    modificacaoBaseId: mod.modificationBaseId,
    escopo: mod.scope,
    grauModificacao: mod.grau ?? undefined,
    parametros: mod.parametros ?? undefined,
    nota: mod.nota ?? undefined,
  };
}

// ─── Efeito aplicado ───────────────────────────────────────────────────────────

function efeitoResponseToEfeitoAplicado(efeito: EfeitoAplicadoResponse): EfeitoAplicado {
  return {
    id: efeito.id,
    efeitoBaseId: efeito.effectBaseId,
    grau: efeito.grau,
    configuracaoSelecionada: efeito.configuracaoId ?? undefined,
    inputCustomizado: efeito.inputValue != null ? String(efeito.inputValue) : undefined,
    modificacoesLocais: efeito.modifications.map((m, i) =>
      modResponseToModAplicada(m, `${efeito.id}-mod-${i}`),
    ),
  };
}

// ─── Poder ────────────────────────────────────────────────────────────────────

/**
 * Converte um `PoderResponse` (API) em `Poder` (editor interno).
 */
export function poderResponseToPoder(p: PoderResponse): Poder {
  return {
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    icone: p.icone ?? undefined,
    dominioId: p.dominio.name,
    dominioAreaConhecimento: p.dominio.areaConhecimento ?? undefined,
    dominioIdPeculiar: p.dominio.peculiarId ?? undefined,
    efeitos: p.effects.map(efeitoResponseToEfeitoAplicado),
    modificacoesGlobais: p.globalModifications.map((m, i) =>
      modResponseToModAplicada(m, `global-mod-${i}`),
    ),
    acao: p.parametros.acao,
    alcance: p.parametros.alcance,
    duracao: p.parametros.duracao,
    custoAlternativo: p.custoAlternativo
      ? {
          tipo: p.custoAlternativo.tipo,
          descricao: p.custoAlternativo.descricao,
        }
      : undefined,
  };
}

/**
 * Converte um `PoderResponse` (API) em `PoderSalvo` (editor + metadados de data).
 * Usado para exibição na BibliotecaPage (SwipeablePoderCard) e para carregar no editor.
 */
export function poderResponseToPoderSalvo(p: PoderResponse): PoderSalvo {
  return {
    ...poderResponseToPoder(p),
    dataCriacao: p.createdAt,
    dataModificacao: p.updatedAt ?? p.createdAt,
  };
}

// ─── Acervo ───────────────────────────────────────────────────────────────────

/**
 * Converte um `AcervoResponse` (API) no tipo `Acervo` legado.
 * Necessário para passar aos componentes `CriadorAcervo` e `ResumoAcervo`
 * que ainda tipam suas props com o tipo interno.
 *
 * Mapeamento de campos divergentes:
 *  - `descricao` (API)  →  `descritor` (legado)
 *  - `powers`    (API)  →  `poderes`   (legado)
 *  - `createdAt` (API)  →  `dataCriacao`
 */
export function acervoResponseToAcervo(a: AcervoResponse): Acervo {
  return {
    id: a.id,
    nome: a.nome,
    descritor: a.descricao,
    icone: a.icone ?? undefined,
    poderes: a.powers.map(poderResponseToPoder),
    dataCriacao: a.createdAt,
    dataModificacao: a.updatedAt ?? a.createdAt,
    dominioId: a.dominio.name,
    dominioAreaConhecimento: a.dominio.areaConhecimento ?? undefined,
    dominioIdPeculiar: a.dominio.peculiarId ?? undefined,
  };
}

// ─── Conversor Poder interno → payload da API ─────────────────────────────────

function modToPayload(m: ModificacaoAplicada): ModificacaoAplicadaPayload {
  return {
    modificationBaseId: m.modificacaoBaseId,
    scope: m.escopo,
    grau: m.grauModificacao,
    parametros: m.parametros,
    nota: m.nota ?? undefined,
  };
}

/**
 * Converte um `Poder` (editor interno) em `CreatePoderPayload` / `UpdatePoderPayload` (API).
 * Usado por CriadorDePoder ao salvar via API.
 */
export function poderToCreatePayload(poder: Poder): CreatePoderPayload {
  let custoAlternativo: CustoAlternativoPayload | undefined;
  if (poder.custoAlternativo) {
    const ca = poder.custoAlternativo;
    custoAlternativo = {
      tipo: ca.tipo,
      // Campo `quantidade` não existe no tipo interno; usa valorMaterial ou 1 como fallback
      quantidade: ca.tipo === 'material' ? (ca.valorMaterial ?? 1000) : 1,
      descricao: ca.descricao,
    };
  }

  return {
    nome: poder.nome,
    // Garante mínimo de 10 chars exigido pelo backend
    descricao:
      poder.descricao && poder.descricao.length >= 10
        ? poder.descricao
        : `Poder: ${poder.nome}`.padEnd(10, '.'),
    icone: poder.icone?.trim() || undefined,
    dominio: {
      name: poder.dominioId as DomainName,
      areaConhecimento: poder.dominioAreaConhecimento,
      peculiarId: poder.dominioIdPeculiar,
    },
    parametros: {
      acao: poder.acao,
      alcance: poder.alcance,
      duracao: poder.duracao,
    },
    effects: poder.efeitos.map((e): EfeitoAplicadoPayload => ({
      effectBaseId: e.efeitoBaseId,
      grau: e.grau,
      configuracaoId: e.configuracaoSelecionada,
      inputValue: e.inputCustomizado,
      modifications: e.modificacoesLocais.map(modToPayload),
    })),
    globalModifications: poder.modificacoesGlobais.map(modToPayload),
    custoAlternativo,
  };
}

export type { UpdatePoderPayload };

// ─── Conversor formato legado (localStorage) → payload da API ────────────────

interface ModLegacy {
  modificacaoBaseId: string;
  escopo: 'global' | 'local';
  parametros?: Record<string, unknown>;
  grauModificacao?: number;
  nota?: string;
}

interface EfeitoLegacy {
  efeitoBaseId: string;
  grau: number;
  modificacoesLocais?: ModLegacy[];
  inputCustomizado?: string;
  configuracaoSelecionada?: string;
}

export interface PoderLegacy {
  nome: string;
  descricao?: string;
  dominioId?: string;
  dominioAreaConhecimento?: string;
  dominioIdPeculiar?: string;
  efeitos?: EfeitoLegacy[];
  modificacoesGlobais?: ModLegacy[];
  acao?: number;
  alcance?: number;
  duracao?: number;
}

/**
 * Converte o formato antigo do localStorage (pré-API) em CreatePoderPayload.
 * Também aceita PoderResponse exportado pelo app (que tem `effects` em inglês).
 */
export function legacyPoderToCreatePayload(raw: unknown): CreatePoderPayload {
  const p = raw as Record<string, unknown>;

  // Formato novo (PoderResponse exportado pelo app atual)
  if (Array.isArray(p['effects'])) {
    const resp = raw as import('@/services/types').PoderResponse;
    return poderToCreatePayload(poderResponseToPoder(resp));
  }

  // Formato legado (localStorage)
  const legacy = raw as PoderLegacy;
  const nome = String(legacy.nome ?? 'Poder Importado');
  const descricaoRaw = legacy.descricao ?? '';
  const descricao =
    descricaoRaw.length >= 10 ? descricaoRaw : `Poder: ${nome}`.padEnd(10, '.');

  // Domínio legado: se for 'peculiar' sem peculiarId válido no novo sistema,
  // rebaixa para 'natural' para não quebrar a validação.
  // O usuário pode corrigir manualmente depois.
  const dominioIdLegacy = legacy.dominioId ?? 'natural';
  const isPeculiarSemId =
    dominioIdLegacy === 'peculiar' && !legacy.dominioIdPeculiar;
  const dominioFinal = isPeculiarSemId ? 'natural' : dominioIdLegacy;

  const validDomains: string[] = [
    'natural', 'sagrado', 'sacrilegio', 'psiquico', 'cientifico', 'peculiar',
    'arma-branca', 'arma-fogo', 'arma-tensao', 'arma-explosiva', 'arma-tecnologica',
  ];
  const dominioName = validDomains.includes(dominioFinal) ? dominioFinal : 'natural';

  return {
    nome,
    descricao,
    dominio: {
      name: dominioName as DomainName,
      areaConhecimento: legacy.dominioAreaConhecimento,
      peculiarId: dominioName === 'peculiar' ? legacy.dominioIdPeculiar : undefined,
    },
    parametros: {
      acao: legacy.acao ?? 0,
      alcance: legacy.alcance ?? 0,
      duracao: legacy.duracao ?? 0,
    },
    effects: (legacy.efeitos ?? []).map((e): EfeitoAplicadoPayload => ({
      effectBaseId: e.efeitoBaseId,
      grau: e.grau,
      configuracaoId: e.configuracaoSelecionada,
      inputValue: e.inputCustomizado,
      modifications: (e.modificacoesLocais ?? []).map(
        (m): ModificacaoAplicadaPayload => ({
          modificationBaseId: m.modificacaoBaseId,
          scope: m.escopo,
          grau: m.grauModificacao,
          parametros: m.parametros,
          nota: m.nota,
        }),
      ),
    })),
    globalModifications: (legacy.modificacoesGlobais ?? []).map(
      (m): ModificacaoAplicadaPayload => ({
        modificationBaseId: m.modificacaoBaseId,
        scope: m.escopo,
        grau: m.grauModificacao,
        parametros: m.parametros,
        nota: m.nota,
      }),
    ),
  };
}
