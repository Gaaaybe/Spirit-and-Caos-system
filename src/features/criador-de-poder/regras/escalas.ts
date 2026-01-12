/**
 * Escalas de Parâmetros (RN-06)
 * Usadas para calcular o custo de mudança de parâmetros
 */

import { ESCALAS } from '../../../data';

export const ESCALA_ACAO = {
  COMPLETA: 0,
  PADRAO: 1,
  MOVIMENTO: 2,
  LIVRE: 3,
  REACAO: 4,
  NENHUMA: 5,
};

export const ESCALA_ALCANCE = {
  PESSOAL: 0,
  CORPO_A_CORPO: 1,
  DISTANCIA: 2,
  PERCEPCAO: 3,
};

export const ESCALA_DURACAO = {
  INSTANTANEO: 0,
  MANTIDA_CONCENTRACAO: 1,
  MANTIDA_SUSTENTADA: 2,
  ATIVADO: 3,
  PERMANENTE: 4,
};

/**
 * Obtém o valor de custo efetivo de um parâmetro, considerando custoEquivalente
 * Se o parâmetro tem custoEquivalente definido, usa esse valor para o cálculo
 */
function obterValorCusto(tipo: 'acao' | 'alcance' | 'duracao', valor: number): number {
  const escala = ESCALAS[tipo]?.escala.find(e => e.valor === valor);
  // Se tem custoEquivalente, usa ele; senão usa o valor normal
  return escala && 'custoEquivalente' in escala ? (escala.custoEquivalente as number) : valor;
}

/**
 * Calcula o custo especial de transição para duração
 * Implementa regras especiais:
 * - Instantâneo ↔ Concentração = ±1
 * - Concentração ↔ Sustentada = ±2
 * - Sustentada ↔ Ativado = ±3
 */
function calcularCustoDuracao(valorPadrao: number, valorUsado: number): number {
  // Custos especiais baseados nas transições
  const custos = [
    { de: 0, para: 1, custo: 1 },   // Instantâneo → Concentração
    { de: 1, para: 2, custo: 2 },   // Concentração → Sustentada
    { de: 2, para: 3, custo: 3 },   // Sustentada → Ativado
  ];

  let modificador = 0;
  
  // Determinar direção do movimento
  if (valorUsado > valorPadrao) {
    // Subindo na escala (melhorando)
    for (let i = valorPadrao; i < valorUsado; i++) {
      const transicao = custos.find(c => c.de === i && c.para === i + 1);
      modificador += transicao ? transicao.custo : 1;
    }
  } else if (valorUsado < valorPadrao) {
    // Descendo na escala (piorando)
    for (let i = valorPadrao; i > valorUsado; i--) {
      const transicao = custos.find(c => c.de === i - 1 && c.para === i);
      modificador -= transicao ? transicao.custo : 1;
    }
  }
  
  return modificador;
}

/**
 * Calcula o modificador de custo ao mudar um parâmetro
 * RN-06: (Valor_Usado - Valor_Padrão) = Modificador_PorGrau
 * 
 * LÓGICA: Nas escalas, valores MAIORES são MELHORES (mais flexíveis/poderosos)
 * O "PIOR" parâmetro é o MAIS PRÓXIMO DE 0 (mais restritivo)
 * 
 * - Ação: 0 (Completa) é PIOR que 5 (Nenhuma)
 * - Alcance: 0 (Pessoal) é PIOR que 3 (Percepção)
 * - Duração: 0 (Instantâneo) é PIOR que 4 (Permanente)
 * 
 * CUSTOS ESPECIAIS DE DURAÇÃO:
 * - Instantâneo ↔ Concentração = ±1 por grau
 * - Concentração ↔ Sustentada = ±2 por grau
 * - Sustentada ↔ Ativado = ±3 por grau
 * 
 * NOTA: Alguns parâmetros podem ter custoEquivalente definido (ex: Permanente = Ativado)
 * Neste caso, usa o custoEquivalente para o cálculo ao invés do valor real
 * 
 * Exemplo:
 * - Efeito padrão: ação=1 (Padrão)
 * - Poder força: ação=5 (Nenhuma) → MELHOR!
 * - Modificador: 5 - 1 = +4 (aumenta 4 PdA/grau) ✅
 * 
 * - Efeito padrão: duracao=1 (Concentração)
 * - Poder força: duracao=2 (Sustentada) → MELHOR!
 * - Modificador: +2 (aumenta 2 PdA/grau) ✅
 * 
 * @param {number} valorPadrao - Valor padrão do efeito
 * @param {number} valorUsado - Valor que o poder está forçando
 * @param {string} tipo - Tipo do parâmetro ('acao', 'alcance' ou 'duracao')
 * @returns {number} Modificador de custo por grau (positivo = mais caro, negativo = mais barato)
 */
export function calcularModificadorParametro(
  valorPadrao: number, 
  valorUsado: number, 
  tipo: 'acao' | 'alcance' | 'duracao' = 'duracao'
): number {
  // Para duração, usar cálculo especial
  if (tipo === 'duracao') {
    const custoPadrao = obterValorCusto(tipo, valorPadrao);
    const custoUsado = obterValorCusto(tipo, valorUsado);
    return calcularCustoDuracao(custoPadrao, custoUsado);
  }
  
  // Para ação e alcance, usar cálculo padrão
  const custoPadrao = obterValorCusto(tipo, valorPadrao);
  const custoUsado = obterValorCusto(tipo, valorUsado);
  return custoUsado - custoPadrao;
}

/**
 * Obtém o parâmetro mais restritivo entre vários valores (RN-07)
 * Usado para determinar os parâmetros finais de um Poder com múltiplos Efeitos
 */
export function obterParametroMaisRestritivo(valores: number[]): number | null {
  if (valores.length === 0) return null;
  
  // Para Ação, Alcance e Duração, o menor valor é o mais restritivo
  // (Ação Completa é mais lenta que Livre, Pessoal é mais curto que Distância, etc)
  return Math.min(...valores);
}
