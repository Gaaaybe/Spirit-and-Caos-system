/**
 * MigracaoLocalStorage
 *
 * Detecta dados salvos em localStorage e oferece importar para a conta do usuário.
 * Faz backup automático antes de migrar e limpa o localStorage após sucesso.
 */
import { useCallback, useState } from 'react';
import { createPower } from '@/services/powers.service';
import { createPowerArray } from '@/services/powerArrays.service';
import { createPeculiarity } from '@/services/peculiarities.service';
import type {
  CreatePoderPayload,
  CreateAcervoPayload,
  DomainName,
} from '@/services/types';

// ─── Tipos locais (formato antigo do localStorage) ────────────────────────────

interface ModAplicadaLegacy {
  modificacaoBaseId: string;
  escopo: 'global' | 'local';
  parametros?: Record<string, unknown>;
  grauModificacao?: number;
  nota?: string;
}

interface EfeitoAplicadoLegacy {
  efeitoBaseId: string;
  grau: number;
  modificacoesLocais: ModAplicadaLegacy[];
  inputCustomizado?: string;
  configuracaoSelecionada?: string;
}

interface PoderLegacy {
  id: string;
  nome: string;
  descricao?: string;
  dominioId: string;
  dominioAreaConhecimento?: string;
  dominioIdPeculiar?: string;
  efeitos: EfeitoAplicadoLegacy[];
  modificacoesGlobais: ModAplicadaLegacy[];
  acao: number;
  alcance: number;
  duracao: number;
}

interface AcervoLegacy {
  id: string;
  nome: string;
  descritor: string;
  poderes: PoderLegacy[];
}

interface PeculiarityLegacy {
  id: string;
  nome: string;
  descricao?: string;
  espiritual: boolean;
}

interface CustomItemsLegacy {
  peculiaridades?: PeculiarityLegacy[];
}

// ─── Leitura do localStorage ──────────────────────────────────────────────────

function lerPoderes(): PoderLegacy[] {
  try {
    const raw = localStorage.getItem('biblioteca-poderes');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function lerAcervos(): AcervoLegacy[] {
  try {
    const raw = localStorage.getItem('acervos');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function lerPeculiaridades(): PeculiarityLegacy[] {
  try {
    const raw = localStorage.getItem('customItems');
    if (!raw) return [];
    const parsed: CustomItemsLegacy = JSON.parse(raw);
    return Array.isArray(parsed?.peculiaridades) ? parsed.peculiaridades : [];
  } catch {
    return [];
  }
}

// ─── Conversores ──────────────────────────────────────────────────────────────

function converterPoder(poder: PoderLegacy): CreatePoderPayload | null {
  if (!poder.efeitos || poder.efeitos.length === 0) return null;

  const descricao =
    poder.descricao && poder.descricao.length >= 10
      ? poder.descricao
      : `Poder migrado: ${poder.nome}`;

  return {
    nome: poder.nome,
    descricao,
    dominio: {
      name: poder.dominioId as DomainName,
      areaConhecimento: poder.dominioAreaConhecimento,
      peculiarId: poder.dominioIdPeculiar,
    },
    parametros: {
      acao: poder.acao ?? 0,
      alcance: poder.alcance ?? 0,
      duracao: poder.duracao ?? 0,
    },
    effects: poder.efeitos.map((e) => ({
      effectBaseId: e.efeitoBaseId,
      // backend exige grau >= 1; valores 0 ou negativos do localStorage viram 1
      grau: Math.max(1, e.grau ?? 1),
      configuracaoId: e.configuracaoSelecionada,
      inputValue: e.inputCustomizado,
      modifications: e.modificacoesLocais.map((m) => ({
        modificationBaseId: m.modificacaoBaseId,
        scope: m.escopo,
        // grau de modificação também precisa ser >= 1 ou ausente
        grau: m.grauModificacao != null && m.grauModificacao >= 1 ? m.grauModificacao : undefined,
        parametros: m.parametros,
        nota: m.nota,
      })),
    })),
    globalModifications: poder.modificacoesGlobais.map((m) => ({
      modificationBaseId: m.modificacaoBaseId,
      scope: m.escopo,
      grau: m.grauModificacao != null && m.grauModificacao >= 1 ? m.grauModificacao : undefined,
      parametros: m.parametros,
      nota: m.nota,
    })),
    isPublic: false,
  };
}

function converterAcervo(
  acervo: AcervoLegacy,
  mapaIds: Map<string, string>, // localId → backendId
): CreateAcervoPayload | null {
  const powerIds = acervo.poderes
    .map((p) => mapaIds.get(p.id))
    .filter((id): id is string => !!id);

  if (powerIds.length === 0) return null;

  // Usa o domínio do primeiro poder do acervo como referência
  const primeiroPoder = acervo.poderes[0];
  const dominio: DomainName = (primeiroPoder?.dominioId as DomainName) ?? 'natural';

  const descricao =
    acervo.descritor && acervo.descritor.length >= 10
      ? acervo.descritor
      : `Acervo migrado: ${acervo.nome}`;

  return {
    nome: acervo.nome,
    descricao,
    dominio: { name: dominio },
    powerIds,
    isPublic: false,
  };
}

// ─── Utilitários ─────────────────────────────────────────────────────────────

function extrairMensagemErro(err: unknown): string {
  if (
    err != null &&
    typeof err === 'object' &&
    'response' in err
  ) {
    const resp = (err as { response?: { data?: { message?: unknown }; status?: number } }).response;
    const msg = resp?.data?.message;
    const status = resp?.status;
    if (Array.isArray(msg)) return `${status} - ${msg.join('; ')}`;
    if (typeof msg === 'string') return `${status} - ${msg}`;
    return `HTTP ${status}`;
  }
  if (err instanceof Error) return err.message;
  return 'falha desconhecida';
}

// ─── Backup ───────────────────────────────────────────────────────────────────

function baixarBackup(poderes: PoderLegacy[], acervos: AcervoLegacy[], peculiaridades: PeculiarityLegacy[]) {
  const backup = { poderes, acervos, peculiaridades, exportadoEm: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aetherium-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface MigracaoLocalStorageProps {
  onConcluido?: () => void;
}

interface ProgressoMigracao {
  total: number;
  concluido: number;
  etapa: string;
  erros: string[];
}

export function MigracaoLocalStorage({ onConcluido }: MigracaoLocalStorageProps) {
  const [poderes] = useState(() => lerPoderes());
  const [acervos] = useState(() => lerAcervos());
  const [peculiaridades] = useState(() => lerPeculiaridades());
  const temDados = poderes.length > 0 || acervos.length > 0 || peculiaridades.length > 0;

  const [visivel, setVisivel] = useState(temDados);
  const [migrando, setMigrando] = useState(false);
  const [progresso, setProgresso] = useState<ProgressoMigracao | null>(null);
  const [concluido, setConcluido] = useState(false);

  const migrar = useCallback(async () => {
    setMigrando(true);
    const erros: string[] = [];
    const mapaIds = new Map<string, string>();
    const total = poderes.length + acervos.length + peculiaridades.length;
    let concluido = 0;

    // Backup automático antes de começar
    baixarBackup(poderes, acervos, peculiaridades);

    setProgresso({ total, concluido: 0, etapa: 'Migrando peculiaridades…', erros: [] });

    // 1. Peculiaridades
    for (const p of peculiaridades) {
      try {
        const descricao =
          p.descricao && p.descricao.length >= 10
            ? p.descricao
            : `Peculiaridade migrada: ${p.nome}`;
        await createPeculiarity({ nome: p.nome, descricao, espiritual: p.espiritual, isPublic: false });
      } catch (err: unknown) {
        const detalhe = extrairMensagemErro(err);
        erros.push(`Peculiaridade "${p.nome}": ${detalhe}`);
      }
      concluido++;
      setProgresso({ total, concluido, etapa: 'Migrando peculiaridades…', erros: [...erros] });
    }

    setProgresso({ total, concluido, etapa: 'Migrando poderes…', erros: [...erros] });

    // 2. Poderes
    for (const poder of poderes) {
      const payload = converterPoder(poder);
      if (!payload) {
        erros.push(`Poder "${poder.nome}": sem efeitos, ignorado`);
        concluido++;
        setProgresso({ total, concluido, etapa: 'Migrando poderes…', erros: [...erros] });
        continue;
      }
      try {
        const criado = await createPower(payload);
        mapaIds.set(poder.id, criado.id);
      } catch (err: unknown) {
        const detalhe = extrairMensagemErro(err);
        erros.push(`Poder "${poder.nome}": ${detalhe}`);
      }
      concluido++;
      setProgresso({ total, concluido, etapa: 'Migrando poderes…', erros: [...erros] });
    }

    setProgresso({ total, concluido, etapa: 'Migrando acervos…', erros: [...erros] });

    // 3. Acervos
    for (const acervo of acervos) {
      const payload = converterAcervo(acervo, mapaIds);
      if (!payload) {
        erros.push(`Acervo "${acervo.nome}": nenhum poder migrado, ignorado`);
        concluido++;
        setProgresso({ total, concluido, etapa: 'Migrando acervos…', erros: [...erros] });
        continue;
      }
      try {
        await createPowerArray(payload);
      } catch (err: unknown) {
        const detalhe = extrairMensagemErro(err);
        erros.push(`Acervo "${acervo.nome}": ${detalhe}`);
      }
      concluido++;
      setProgresso({ total, concluido, etapa: 'Migrando acervos…', erros: [...erros] });
    }

    // 4. Limpar localStorage somente se não houve erros críticos
    if (mapaIds.size > 0 || peculiaridades.length > 0) {
      localStorage.removeItem('biblioteca-poderes');
      localStorage.removeItem('acervos');
      const customItems = JSON.parse(localStorage.getItem('customItems') ?? '{}');
      delete customItems.peculiaridades;
      localStorage.setItem('customItems', JSON.stringify(customItems));
    }

    setProgresso({ total, concluido: total, etapa: 'Concluído', erros });
    setMigrando(false);
    setConcluido(true);
  }, [poderes, acervos, peculiaridades]);

  const dispensar = useCallback(() => {
    setVisivel(false);
    onConcluido?.();
  }, [onConcluido]);

  if (!visivel || !temDados) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-4">
        {/* Cabeçalho */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            📦 Dados locais encontrados
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Encontramos dados salvos localmente. Deseja importar para sua conta?
          </p>
        </div>

        {/* Contagem */}
        {!concluido && !migrando && (
          <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
            {poderes.length > 0 && <li>⚡ {poderes.length} poder{poderes.length !== 1 ? 'es' : ''}</li>}
            {acervos.length > 0 && <li>📚 {acervos.length} acervo{acervos.length !== 1 ? 's' : ''}</li>}
            {peculiaridades.length > 0 && <li>✨ {peculiaridades.length} peculiaridade{peculiaridades.length !== 1 ? 's' : ''}</li>}
          </ul>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Um backup JSON será baixado automaticamente antes da importação.
        </p>

        {/* Progresso */}
        {migrando && progresso && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">{progresso.etapa}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-espirito-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((progresso.concluido / progresso.total) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {progresso.concluido} / {progresso.total}
            </p>
          </div>
        )}

        {/* Concluído */}
        {concluido && progresso && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              ✅ Migração concluída!
            </p>
            {progresso.erros.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                  Avisos ({progresso.erros.length}):
                </p>
                {progresso.erros.map((e, i) => (
                  <p key={i} className="text-xs text-yellow-600 dark:text-yellow-300">• {e}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          {!concluido ? (
            <>
              <button
                onClick={dispensar}
                disabled={migrando}
                className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Ignorar
              </button>
              <button
                onClick={migrar}
                disabled={migrando}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-espirito-600 hover:bg-espirito-700 text-white font-medium disabled:opacity-50"
              >
                {migrando ? 'Importando…' : 'Importar tudo'}
              </button>
            </>
          ) : (
            <button
              onClick={dispensar}
              className="w-full px-4 py-2 text-sm rounded-lg bg-espirito-600 hover:bg-espirito-700 text-white font-medium"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
