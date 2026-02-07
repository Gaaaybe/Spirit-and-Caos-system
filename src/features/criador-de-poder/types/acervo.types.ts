import { Poder } from '../regras/calculadoraCusto';

/**
 * Acervo de Poderes
 * 
 * Um conjunto de poderes com descritor comum onde o usuário
 * paga o custo do poder mais caro e adiciona outros por 1 PdA cada.
 * 
 * Limitações:
 * - Apenas 1 poder ativo por vez
 * - Troca = ação livre (1x por turno)
 * - Nenhum poder pode ter Duração Permanente
 * - Nenhum poder pode custar mais que o principal
 * - Vulnerabilidade compartilhada
 */
export interface Acervo {
  id: string;
  nome: string;
  descritor: string; // Descrição do tema/conceito comum
  poderes: Poder[]; // Array de poderes completos
  dataCriacao: string;
  dataModificacao: string;
}

/**
 * Detalhes calculados de um acervo
 */
export interface DetalhesAcervo {
  // Poder principal (mais caro)
  poderPrincipal: Poder | null;
  poderPrincipalIndex: number;
  
  // Custos
  custoPdAPrincipal: number;
  custoPdAOutros: number; // quantidade de outros × 1
  custoPdATotal: number;
  
  // Espaços
  espacosTotal: number;
  
  // Validações
  temPoderPermanente: boolean;
  temPoderMaisCaro: boolean; // algum poder custa mais que principal
  quantidadePoderes: number;
  valido: boolean;
  erros: string[];
}

/**
 * Resultado de validação de acervo
 */
export interface ValidacaoAcervo {
  valido: boolean;
  erros: string[];
  avisos?: string[];
}
