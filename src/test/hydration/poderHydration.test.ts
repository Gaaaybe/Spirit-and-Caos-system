import { describe, it, expect } from 'vitest';
import { hydratePoder, formatarMensagensHydration, SCHEMA_VERSION } from '../../features/criador-de-poder/utils/poderHydration';
import type { PoderComVersion } from '../../features/criador-de-poder/utils/poderHydration';
import type { Poder, ModificacaoAplicada } from '../../features/criador-de-poder/regras/calculadoraCusto';

describe('Sistema de Hydration de Poderes', () => {
  describe('Versionamento', () => {
    it('deve adicionar versão do schema a poderes sem versão', () => {
      const poderAntigo: PoderComVersion = {
        id: 'test-1',
        nome: 'Poder Antigo',
        descricao: '',
        efeitos: [],
        modificacoesGlobais: [],
        acao: 1,
        alcance: 1,
        duracao: 0,
        // schemaVersion ausente
      };

      const result = hydratePoder(poderAntigo);
      
      expect((result.poder as PoderComVersion).schemaVersion).toBe(SCHEMA_VERSION);
      expect(result.changes).toContain('Poder atualizado para o schema atual');
    });

    it('deve atualizar versão antiga para atual', () => {
      const poderAntigo: PoderComVersion = {
        id: 'test-1',
        nome: 'Poder Antigo',
        descricao: '',
        efeitos: [],
        modificacoesGlobais: [],
        acao: 1,
        alcance: 1,
        duracao: 0,
        schemaVersion: '0.9.0',
      };

      const result = hydratePoder(poderAntigo);
      
      expect((result.poder as PoderComVersion).schemaVersion).toBe(SCHEMA_VERSION);
      expect(result.changes.some(c => c.includes('Schema atualizado'))).toBe(true);
    });
  });

  describe('Validação de Efeitos', () => {
    it('deve remover efeitos com IDs inexistentes', () => {
      const poder: PoderComVersion = {
        id: 'test-1',
        nome: 'Teste',
        descricao: '',
        efeitos: [
          {
            id: 'efeito-1',
            efeitoBaseId: 'id-que-nao-existe',
            grau: 10,
            modificacoesLocais: [],
          },
          {
            id: 'efeito-2',
            efeitoBaseId: 'dano',
            grau: 5,
            modificacoesLocais: [],
          },
        ],
        modificacoesGlobais: [],
        acao: 1,
        alcance: 1,
        duracao: 0,
      };

      const result = hydratePoder(poder);
      
      expect(result.poder.efeitos).toHaveLength(1);
      expect(result.poder.efeitos[0].efeitoBaseId).toBe('dano');
      expect(result.warnings).toContain('Efeito removido: "id-que-nao-existe" não existe mais no sistema');
    });

    it('deve corrigir graus inválidos', () => {
      const poder: PoderComVersion = {
        id: 'test-1',
        nome: 'Teste',
        descricao: '',
        efeitos: [
          {
            id: 'efeito-1',
            efeitoBaseId: 'dano',
            grau: -5, // grau negativo
            modificacoesLocais: [],
          },
        ],
        modificacoesGlobais: [],
        acao: 1,
        alcance: 1,
        duracao: 0,
      };

      const result = hydratePoder(poder);
      
      expect(result.poder.efeitos[0].grau).toBe(1);
      expect(result.changes.some(c => c.includes('Grau inválido corrigido'))).toBe(true);
    });
  });

  describe('Validação de Modificações', () => {
    it('deve remover modificações com IDs inexistentes', () => {
      const poder: PoderComVersion = {
        id: 'test-1',
        nome: 'Teste',
        descricao: '',
        efeitos: [],
        modificacoesGlobais: [
          {
            id: 'mod-1',
            modificacaoBaseId: 'mod-inexistente',
            escopo: 'global',
          },
          {
            id: 'mod-2',
            modificacaoBaseId: 'cansativo',
            escopo: 'global',
          },
        ],
        acao: 1,
        alcance: 1,
        duracao: 0,
      };

      const result = hydratePoder(poder);
      
      expect(result.poder.modificacoesGlobais).toHaveLength(1);
      expect(result.poder.modificacoesGlobais[0].modificacaoBaseId).toBe('cansativo');
      expect(result.warnings.some(w => w.includes('mod-inexistente'))).toBe(true);
    });

    it('deve ajustar grau de modificação fora dos limites', () => {
      const poder: PoderComVersion = {
        id: 'test-1',
        nome: 'Teste',
        descricao: '',
        efeitos: [],
        modificacoesGlobais: [
          {
            id: 'mod-1',
            modificacaoBaseId: 'area',
            escopo: 'global',
            grauModificacao: 100, // muito alto
            parametros: { grau: 100 },
          },
        ],
        acao: 1,
        alcance: 1,
        duracao: 0,
      };

      const result = hydratePoder(poder);
      
      // Area tem grauMaximo, deve ser ajustado
      expect(result.changes.some(c => c.includes('ajustado para o máximo'))).toBe(true);
    });
  });

  describe('Validação de Parâmetros', () => {
    it('deve corrigir parâmetros inválidos', () => {
      const poder: PoderComVersion = {
        id: 'test-1',
        nome: 'Teste',
        descricao: '',
        efeitos: [],
        modificacoesGlobais: [],
        acao: -1, // inválido
        alcance: NaN, // inválido
        duracao: 2.5, // deve arredondar
      };

      const result = hydratePoder(poder);
      
      expect(result.poder.acao).toBe(0);
      expect(result.poder.alcance).toBe(0);
      expect(result.poder.duracao).toBe(2);
    });
  });

  describe('Formatação de Mensagens', () => {
    it('deve formatar mensagens de warning corretamente', () => {
      const result = {
        poder: {} as Poder,
        warnings: ['Modificação removida'],
        changes: [],
      };

      const formatted = formatarMensagensHydration(result);
      
      expect(formatted.hasIssues).toBe(true);
      expect(formatted.severity).toBe('warning');
      expect(formatted.message).toContain('⚠️');
      expect(formatted.message).toContain('Modificação removida');
    });

    it('deve formatar mensagens de changes corretamente', () => {
      const result = {
        poder: {} as Poder,
        warnings: [],
        changes: ['Poder atualizado'],
      };

      const formatted = formatarMensagensHydration(result);
      
      expect(formatted.hasIssues).toBe(true);
      expect(formatted.severity).toBe('info');
      expect(formatted.message).toContain('✅');
    });

    it('não deve reportar issues se não houver mudanças', () => {
      const result = {
        poder: {} as Poder,
        warnings: [],
        changes: [],
      };

      const formatted = formatarMensagensHydration(result);
      
      expect(formatted.hasIssues).toBe(false);
      expect(formatted.message).toBe('');
    });
  });

  describe('Campos Obrigatórios', () => {
    it('deve adicionar campos faltantes com valores padrão', () => {
      const poder = {
        id: 'test-1',
        // nome ausente
        efeitos: [],
        modificacoesGlobais: [],
        acao: 1,
        alcance: 1,
        duracao: 0,
      } as unknown as PoderComVersion;

      const result = hydratePoder(poder);
      
      expect(result.poder.nome).toBe('Poder sem nome');
      expect(result.poder.descricao).toBe('');
    });

    it('deve lidar com modificações sem parâmetros', () => {
      const poder: PoderComVersion = {
        id: 'test-1',
        nome: 'Teste',
        descricao: '',
        efeitos: [],
        modificacoesGlobais: [
          {
            id: 'mod-1',
            modificacaoBaseId: 'cansativo',
            escopo: 'global',
            // parametros ausente (modificação antiga)
          } as ModificacaoAplicada,
        ],
        acao: 1,
        alcance: 1,
        duracao: 0,
      };

      const result = hydratePoder(poder);
      
      // Não deve quebrar, deve processar normalmente
      expect(result.poder.modificacoesGlobais).toHaveLength(1);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Custo Alternativo', () => {
    it('deve remover custo alternativo inválido', () => {
      const poder: PoderComVersion = {
        id: 'test-1',
        nome: 'Teste',
        descricao: '',
        efeitos: [],
        modificacoesGlobais: [],
        acao: 1,
        alcance: 1,
        duracao: 0,
        custoAlternativo: {
          tipo: 'tipo-invalido' as 'pe',
        },
      };

      const result = hydratePoder(poder);
      
      expect(result.poder.custoAlternativo).toBeUndefined();
      expect(result.changes).toContain('Custo alternativo inválido removido');
    });

    it('deve manter custo alternativo válido', () => {
      const poder: PoderComVersion = {
        id: 'test-1',
        nome: 'Teste',
        descricao: '',
        efeitos: [],
        modificacoesGlobais: [],
        acao: 1,
        alcance: 1,
        duracao: 0,
        custoAlternativo: {
          tipo: 'pe',
        },
      };

      const result = hydratePoder(poder);
      
      expect(result.poder.custoAlternativo).toBeDefined();
      expect(result.poder.custoAlternativo?.tipo).toBe('pe');
    });
  });

  describe('Migração de Modificações com Opções', () => {
    it('deve adicionar configuração padrão a Limitado antigo', () => {
      const poder: PoderComVersion = {
        id: 'test-1',
        nome: 'Teste',
        descricao: '',
        efeitos: [],
        modificacoesGlobais: [
          {
            id: 'mod-1',
            modificacaoBaseId: 'limitado',
            escopo: 'global',
            // SEM parametros.configuracaoSelecionada (poder antigo)
          },
        ],
        acao: 1,
        alcance: 1,
        duracao: 0,
      };

      const result = hydratePoder(poder);
      
      // Deve ter adicionado configuração padrão
      expect(result.poder.modificacoesGlobais[0].parametros).toBeDefined();
      expect(result.poder.modificacoesGlobais[0].parametros?.configuracaoSelecionada).toBeDefined();
      expect(result.changes.some(c => c.includes('Configuração padrão') && c.includes('Limitado'))).toBe(true);
    });

    it('deve adicionar configuração padrão a Seletivo antigo', () => {
      const poder: PoderComVersion = {
        id: 'test-1',
        nome: 'Teste',
        descricao: '',
        efeitos: [],
        modificacoesGlobais: [
          {
            id: 'mod-1',
            modificacaoBaseId: 'seletivo',
            escopo: 'global',
            grauModificacao: 1,
            // SEM parametros.configuracaoSelecionada
          },
        ],
        acao: 1,
        alcance: 1,
        duracao: 0,
      };

      const result = hydratePoder(poder);
      
      expect(result.poder.modificacoesGlobais[0].parametros).toBeDefined();
      expect(result.poder.modificacoesGlobais[0].parametros?.configuracaoSelecionada).toBe('restrito');
      expect(result.changes.some(c => c.includes('Seletivo'))).toBe(true);
    });

    it('deve adicionar configuração padrão a Sutil antigo', () => {
      const poder: PoderComVersion = {
        id: 'test-1',
        nome: 'Teste',
        descricao: '',
        efeitos: [],
        modificacoesGlobais: [
          {
            id: 'mod-1',
            modificacaoBaseId: 'sutil',
            escopo: 'global',
            grauModificacao: 1,
          },
        ],
        acao: 1,
        alcance: 1,
        duracao: 0,
      };

      const result = hydratePoder(poder);
      
      expect(result.poder.modificacoesGlobais[0].parametros).toBeDefined();
      expect(result.poder.modificacoesGlobais[0].parametros?.configuracaoSelecionada).toBe('dificil-notar');
      expect(result.changes.some(c => c.includes('Sutil'))).toBe(true);
    });

    it('deve manter configuração válida existente', () => {
      const poder: PoderComVersion = {
        id: 'test-1',
        nome: 'Teste',
        descricao: '',
        efeitos: [],
        modificacoesGlobais: [
          {
            id: 'mod-1',
            modificacaoBaseId: 'limitado',
            escopo: 'global',
            parametros: {
              configuracaoSelecionada: 'limitado-extremo', // já tem configuração válida
            },
          },
        ],
        acao: 1,
        alcance: 1,
        duracao: 0,
      };

      const result = hydratePoder(poder);
      
      // Deve manter a configuração existente
      expect(result.poder.modificacoesGlobais[0].parametros?.configuracaoSelecionada).toBe('limitado-extremo');
      // Não deve ter mensagem de mudança para essa modificação específica
      expect(result.changes.every(c => !c.includes('adicionada a Limitado'))).toBe(true);
    });
  });
});
