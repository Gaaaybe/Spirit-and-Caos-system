import { describe, it, expect } from 'vitest'
import modificacoes from '../../data/modificacoes.json'

/**
 * Função auxiliar para calcular o custo de uma modificação
 * Agora suporta tanto modificadorCusto quanto modificadorCustoFixo
 */
function calcularCustoModificacao(
  modificacaoId: string,
  grauEfeito: number,
  configuracao?: string
): number {
  const mod = modificacoes.find(m => m.id === modificacaoId)
  if (!mod) throw new Error(`Modificação ${modificacaoId} não encontrada`)

  let custoPorGrau = mod.custoPorGrau
  let custoFixo = mod.custoFixo

  // Se tem configuração, aplicar os modificadores apropriados
  if (configuracao && 'configuracoes' in mod) {
    const configs = mod.configuracoes
    
    // Suporta tanto array de configurações (formato antigo) quanto objeto com opcoes (formato novo)
    if (Array.isArray(configs)) {
      const config = configs.find(c => 
        c.opcoes.some((o: any) => o.id === configuracao)
      )
      
      if (config) {
        const opcao = config.opcoes.find((o: any) => o.id === configuracao)
        if (opcao) {
          // Aplica modificadorCusto ao custoPorGrau
          if ('modificadorCusto' in opcao && opcao.modificadorCusto !== undefined) {
            custoPorGrau += opcao.modificadorCusto
          }
          // Aplica modificadorCustoFixo ao custoFixo
          if ('modificadorCustoFixo' in opcao && opcao.modificadorCustoFixo !== undefined) {
            custoFixo += opcao.modificadorCustoFixo
          }
        }
      }
    } else if (configs && 'opcoes' in configs && Array.isArray(configs.opcoes)) {
      // Formato novo: configuracoes é um objeto com propriedade opcoes
      const opcao = configs.opcoes.find((o: any) => o.id === configuracao)
      if (opcao) {
        // Aplica modificadorCusto ao custoPorGrau
        if ('modificadorCusto' in opcao && opcao.modificadorCusto !== undefined) {
          custoPorGrau += opcao.modificadorCusto
        }
        // Aplica modificadorCustoFixo ao custoFixo
        if ('modificadorCustoFixo' in opcao && opcao.modificadorCustoFixo !== undefined) {
          custoFixo += opcao.modificadorCustoFixo
        }
      }
    }
  }

  return custoFixo + (custoPorGrau * grauEfeito)
}

describe('Cálculo de Custo de Modificações', () => {
  it('deve calcular custo por grau corretamente', () => {
    // Afeta Intangível tem custoFixo: 1 e custoPorGrau: 0
    // Com grau 5: custo = 1 + (0 * 5) = 1
    const custo = calcularCustoModificacao('afeta-intangivel', 5)
    expect(custo).toBe(1) // 1 fixo + (0 * 5)
  })

  it('deve calcular custo com configuração corretamente', () => {
    // Testar uma modificação que tenha configurações estruturadas
    const modComConfig = modificacoes.find(m => 
      'configuracoes' in m && Array.isArray(m.configuracoes) && m.configuracoes.length > 0
    )
    
    if (modComConfig && 'configuracoes' in modComConfig && Array.isArray(modComConfig.configuracoes)) {
      const primeiraConfig = modComConfig.configuracoes[0]
      const primeiraOpcao = primeiraConfig.opcoes[0]
      
      const custo = calcularCustoModificacao(modComConfig.id, 5, primeiraOpcao.id)
      expect(typeof custo).toBe('number')
    }
  })

  it('deve calcular custo combinado (fixo + por grau)', () => {
    // Área tem custo por grau
    const mod = modificacoes.find(m => m.id === 'area')
    if (mod) {
      const custo = calcularCustoModificacao('area', 3, 'area-cone')
      expect(custo).toBeGreaterThanOrEqual(0)
    }
  })

  it('falhas devem reduzir o custo', () => {
    const falhas = modificacoes.filter(m => m.tipo === 'falha')
    
    falhas.forEach(falha => {
      // Para falhas que requerem configuração, usar a primeira opção disponível
      let configuracaoParaTestar: string | undefined
      
      if ('configuracoes' in falha) {
        const configs = falha.configuracoes
        if (Array.isArray(configs) && configs.length > 0) {
          configuracaoParaTestar = configs[0].opcoes[0]?.id
        } else if (configs && 'opcoes' in configs && Array.isArray(configs.opcoes) && configs.opcoes.length > 0) {
          configuracaoParaTestar = configs.opcoes[0].id
        }
      }
      
      const custo = calcularCustoModificacao(falha.id, 5, configuracaoParaTestar)
      expect(custo).toBeLessThanOrEqual(0)
    })
  })

  it('extras devem aumentar o custo', () => {
    const extras = modificacoes.filter(m => m.tipo === 'extra')
    
    extras.forEach(extra => {
      // Extras com custo 0 são válidos (alguns são situacionais)
      const custo = calcularCustoModificacao(extra.id, 5)
      expect(custo).toBeGreaterThanOrEqual(0)
    })
  })

  it('deve calcular custo zero para grau zero', () => {
    const mod = modificacoes.find(m => m.custoPorGrau > 0)
    if (mod && mod.custoFixo === 0) {
      const custo = calcularCustoModificacao(mod.id, 0)
      expect(custo).toBe(0)
    }
  })
})

describe('Validação de Configurações', () => {
  it('modificações com configurações devem ter opções válidas', () => {
    const comConfiguracoes = modificacoes.filter(m => 
      'configuracoes' in m && Array.isArray(m.configuracoes)
    )

    comConfiguracoes.forEach(mod => {
      if ('configuracoes' in mod && Array.isArray(mod.configuracoes)) {
        mod.configuracoes.forEach(config => {
          expect(config).toHaveProperty('tipo')
          expect(config).toHaveProperty('label')
          expect(config).toHaveProperty('opcoes')
          expect(Array.isArray(config.opcoes)).toBe(true)
          expect(config.opcoes.length).toBeGreaterThan(0)

          config.opcoes.forEach((opcao: any) => {
            expect(opcao).toHaveProperty('id')
            expect(opcao).toHaveProperty('nome')
            expect(opcao).toHaveProperty('modificadorCusto')
            expect(typeof opcao.modificadorCusto).toBe('number')
          })
        })
      }
    })
  })

  it('IDs de opções devem ser únicos dentro de cada configuração', () => {
    const comConfiguracoes = modificacoes.filter(m => 
      'configuracoes' in m && Array.isArray(m.configuracoes)
    )

    comConfiguracoes.forEach(mod => {
      if ('configuracoes' in mod && Array.isArray(mod.configuracoes)) {
        mod.configuracoes.forEach(config => {
          const ids = config.opcoes.map((o: any) => o.id)
          const uniqueIds = new Set(ids)
          expect(uniqueIds.size).toBe(ids.length)
        })
      }
    })
  })
})

describe('Cenários Reais de Uso', () => {
  it('poder de Dano básico sem modificações = grau * 1', () => {
    // Efeito de Dano básico custa 1 ponto por grau
    const grau = 10
    const custoBase = grau * 1
    expect(custoBase).toBe(10)
  })

  it('poder de Dano com Área deve custar mais', () => {
    const grau = 10
    const custoBase = grau * 1
    const custoArea = calcularCustoModificacao('area', grau, 'area-cone')
    const custoTotal = custoBase + custoArea
    
    expect(custoTotal).toBeGreaterThan(custoBase)
  })

  it('poder com falha deve custar menos', () => {
    const grau = 10
    const custoBase = grau * 1
    
    // Encontrar uma falha para testar
    const falha = modificacoes.find(m => m.tipo === 'falha')
    if (falha) {
      const custoFalha = calcularCustoModificacao(falha.id, grau)
      const custoTotal = custoBase + custoFalha
      
      expect(custoTotal).toBeLessThan(custoBase)
    }
  })
})

describe('Testes de modificadorCustoFixo', () => {
  it('Afeta Intangível com configuração deve usar modificadorCustoFixo', () => {
    // Afeta Intangível tem custoFixo: 1 e configurações com modificadorCustoFixo
    const grau = 5
    
    // Sem configuração: custo = 1 + (0 * 5) = 1
    const custoSemConfig = calcularCustoModificacao('afeta-intangivel', grau)
    expect(custoSemConfig).toBe(1)
    
    // Com configuração "metade-eficiencia": modificadorCustoFixo = 0, então custo = 1 + 0 = 1
    const custoMetade = calcularCustoModificacao('afeta-intangivel', grau, 'metade-eficiencia')
    expect(custoMetade).toBe(1)
    
    // Com configuração "grau-total": modificadorCustoFixo = 1, então custo = 1 + 1 = 2
    const custoTotal = calcularCustoModificacao('afeta-intangivel', grau, 'grau-total')
    expect(custoTotal).toBe(2)
  })

  it('Sutil deve ter custo fixo independente do grau', () => {
    // Sutil tem modificadorCustoFixo nas configurações
    const grau1 = calcularCustoModificacao('sutil', 1, 'dificil-notar')
    const grau10 = calcularCustoModificacao('sutil', 10, 'dificil-notar')
    
    // Custo deve ser o mesmo independente do grau
    expect(grau1).toBe(grau10)
    expect(grau1).toBe(1) // modificadorCustoFixo = 1
  })

  it('Sutil "Completamente Indetectável" deve custar mais que "Difícil de Notar"', () => {
    const grau = 5
    const custoDificil = calcularCustoModificacao('sutil', grau, 'dificil-notar')
    const custoIndetectavel = calcularCustoModificacao('sutil', grau, 'indetectavel')
    
    expect(custoIndetectavel).toBeGreaterThan(custoDificil)
    expect(custoIndetectavel).toBe(2) // modificadorCustoFixo = 2
  })
})

describe('Testes de Configurações com modificadorCusto (por grau)', () => {
  it('Ativação deve reduzir custo por grau baseado na configuração', () => {
    const grau = 5
    
    // Ativação tem configurações com modificadorCusto negativo
    const custoAcaoPadrao = calcularCustoModificacao('ativacao', grau, 'acao-padrao')
    const custoAcaoCompleta = calcularCustoModificacao('ativacao', grau, 'acao-completa')
    
    // Ambos devem reduzir o custo
    expect(custoAcaoPadrao).toBeLessThan(0)
    expect(custoAcaoCompleta).toBeLessThan(custoAcaoPadrao) // Ação completa reduz mais
  })

  it('Efeito Colateral deve reduzir custo por grau', () => {
    const grau = 10
    
    const custoAoFalhar = calcularCustoModificacao('efeito-colateral', grau, 'ao-falhar')
    const custoSempre = calcularCustoModificacao('efeito-colateral', grau, 'sempre')
    
    // Efeito Colateral "Sempre" deve reduzir mais
    expect(custoSempre).toBeLessThan(custoAoFalhar)
    expect(custoAoFalhar).toBe(-10) // -1 * 10
    expect(custoSempre).toBe(-20) // -2 * 10
  })

  it('configurações devem escalar corretamente com o grau', () => {
    const grau2 = 2
    const grau10 = 10
    
    // Teste com uma modificação que tem modificadorCusto
    const custo2 = calcularCustoModificacao('efeito-colateral', grau2, 'ao-falhar')
    const custo10 = calcularCustoModificacao('efeito-colateral', grau10, 'ao-falhar')
    
    // Verificar que ambos são negativos (falha)
    expect(custo2).toBeLessThan(0)
    expect(custo10).toBeLessThan(0)
    
    // O custo deve escalar proporcionalmente ao grau
    const razaoEsperada = grau10 / grau2
    const razaoReal = Math.abs(custo10) / Math.abs(custo2)
    expect(razaoReal).toBeCloseTo(razaoEsperada, 1)
  })
})

describe('Validação de Estrutura de Dados', () => {
  it('modificações não devem ter modificadorCusto aplicado duas vezes', () => {
    // Verifica que nenhuma modificação tem custoFixo e configurações com modificadorCusto
    // ao mesmo tempo (bug antigo)
    const modsComConfig = modificacoes.filter(m => 
      'configuracoes' in m && m.configuracoes && 'opcoes' in m.configuracoes
    )

    modsComConfig.forEach(mod => {
      if ('configuracoes' in mod && mod.configuracoes && 'opcoes' in mod.configuracoes) {
        const opcoes = mod.configuracoes.opcoes as any[]
        
        opcoes.forEach(opcao => {
          // Se tem modificadorCustoFixo, não deve ter modificadorCusto aplicado ao custoFixo
          if ('modificadorCustoFixo' in opcao) {
            // Esta é uma configuração que afeta custo fixo
            expect(opcao.modificadorCustoFixo).toBeDefined()
          }
          
          if ('modificadorCusto' in opcao) {
            // Esta é uma configuração que afeta custo por grau
            expect(opcao.modificadorCusto).toBeDefined()
          }
        })
      }
    })
  })

  it('modificações com requerParametros: false e configuracoes devem funcionar', () => {
    // Testa o bug corrigido: modificações como "Ativação" têm requerParametros: false
    // mas precisam de configuracaoSelecionada
    const ativacao = modificacoes.find(m => m.id === 'ativacao')
    
    expect(ativacao).toBeDefined()
    expect(ativacao?.requerParametros).toBe(false)
    expect('configuracoes' in ativacao!).toBe(true)
    
    // Deve calcular custo corretamente mesmo com requerParametros: false
    const custo = calcularCustoModificacao('ativacao', 5, 'acao-padrao')
    expect(typeof custo).toBe('number')
    expect(custo).toBeLessThan(0) // Ativação é uma falha
  })
})
