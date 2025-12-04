import { describe, it, expect } from 'vitest'
import modificacoes from '../../data/modificacoes.json'

describe('Validação dos Dados de Modificações', () => {
  it('deve ter pelo menos 100 modificações', () => {
    expect(modificacoes.length).toBeGreaterThanOrEqual(100)
  })

  it('todas as modificações devem ter ID único', () => {
    const ids = modificacoes.map(m => m.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(modificacoes.length)
  })

  it('todas as modificações devem ter campos obrigatórios', () => {
    modificacoes.forEach(mod => {
      expect(mod).toHaveProperty('id')
      expect(mod).toHaveProperty('nome')
      expect(mod).toHaveProperty('tipo')
      expect(mod).toHaveProperty('custoFixo')
      expect(mod).toHaveProperty('custoPorGrau')
      expect(mod).toHaveProperty('descricao')
      expect(mod).toHaveProperty('categoria')
      
      // Validar tipos
      expect(typeof mod.id).toBe('string')
      expect(typeof mod.nome).toBe('string')
      expect(['extra', 'falha']).toContain(mod.tipo)
      expect(typeof mod.custoFixo).toBe('number')
      expect(typeof mod.custoPorGrau).toBe('number')
      expect(typeof mod.descricao).toBe('string')
      expect(typeof mod.categoria).toBe('string')
    })
  })

  it('extras devem ter custo positivo ou zero', () => {
    const extras = modificacoes.filter(m => m.tipo === 'extra')
    extras.forEach(extra => {
      expect(extra.custoFixo).toBeGreaterThanOrEqual(0)
      expect(extra.custoPorGrau).toBeGreaterThanOrEqual(0)
    })
  })

  it('falhas devem ter custo negativo ou zero', () => {
    const falhas = modificacoes.filter(m => m.tipo === 'falha')
    falhas.forEach(falha => {
      expect(falha.custoFixo).toBeLessThanOrEqual(0)
      expect(falha.custoPorGrau).toBeLessThanOrEqual(0)
    })
  })

  it('modificações com parâmetros devem ter configurações ou opções', () => {
    const comParametros = modificacoes.filter(m => m.requerParametros)
    comParametros.forEach(mod => {
      // Se requer parâmetros, deve ter configurações (objeto com opcoes), opcoes (array), ou tipoParametro
      const temConfiguracoes = 'configuracoes' in mod && 
        typeof mod.configuracoes === 'object' && 
        mod.configuracoes !== null &&
        'opcoes' in mod.configuracoes &&
        Array.isArray(mod.configuracoes.opcoes) && 
        mod.configuracoes.opcoes.length > 0
      const temOpcoes = 'opcoes' in mod && Array.isArray(mod.opcoes) && mod.opcoes.length > 0
      const temTipoParametro = 'tipoParametro' in mod && typeof mod.tipoParametro === 'string'
      
      expect(temConfiguracoes || temOpcoes || temTipoParametro).toBe(true)
    })
  })

  it('deve ter pelo menos 20 categorias diferentes', () => {
    const categorias = new Set(modificacoes.map(m => m.categoria))
    expect(categorias.size).toBeGreaterThanOrEqual(20)
  })

  it('nomes devem começar com letra maiúscula', () => {
    modificacoes.forEach(mod => {
      const primeiraLetra = mod.nome.charAt(0)
      expect(primeiraLetra).toBe(primeiraLetra.toUpperCase())
    })
  })

  it('descrições não devem estar vazias', () => {
    modificacoes.forEach(mod => {
      expect(mod.descricao.trim().length).toBeGreaterThan(10)
    })
  })
})

describe('Categorias de Modificações', () => {
  it('deve listar todas as categorias existentes', () => {
    const categorias = [...new Set(modificacoes.map(m => m.categoria))].sort()
    expect(categorias.length).toBeGreaterThan(0)
    
    // Log para visualizar (útil durante desenvolvimento)
    console.log('Categorias encontradas:', categorias.length)
    categorias.forEach(cat => {
      const count = modificacoes.filter(m => m.categoria === cat).length
      console.log(`  - ${cat}: ${count} modificações`)
    })
  })

  it('categoria Combate deve ter modificações', () => {
    const combate = modificacoes.filter(m => m.categoria === 'Combate')
    expect(combate.length).toBeGreaterThan(0)
  })
})

describe('Validação de Configurações', () => {
  it('modificações com configuracoes devem ter estrutura válida', () => {
    const comConfigs = modificacoes.filter(m => 
      'configuracoes' in m && typeof m.configuracoes === 'object'
    )

    comConfigs.forEach(mod => {
      const configs = (mod as any).configuracoes
      
      expect(configs).toHaveProperty('tipo')
      expect(['select', 'radio']).toContain(configs.tipo)
      expect(configs).toHaveProperty('label')
      expect(typeof configs.label).toBe('string')
      expect(configs).toHaveProperty('opcoes')
      expect(Array.isArray(configs.opcoes)).toBe(true)
      expect(configs.opcoes.length).toBeGreaterThan(0)
    })
  })

  it('opções de configurações devem ter modificadorCusto ou modificadorCustoFixo', () => {
    const comConfigs = modificacoes.filter(m => 
      'configuracoes' in m && typeof m.configuracoes === 'object'
    )

    comConfigs.forEach(mod => {
      const configs = (mod as any).configuracoes
      
      configs.opcoes.forEach((opcao: any) => {
        expect(opcao).toHaveProperty('id')
        expect(opcao).toHaveProperty('nome')
        expect(opcao).toHaveProperty('descricao')
        
        // Deve ter pelo menos um dos modificadores
        const temModificadorCusto = 'modificadorCusto' in opcao
        const temModificadorCustoFixo = 'modificadorCustoFixo' in opcao
        
        expect(temModificadorCusto || temModificadorCustoFixo).toBe(true)
        
        // Se tem modificadorCusto, deve ser number
        if (temModificadorCusto) {
          expect(typeof opcao.modificadorCusto).toBe('number')
        }
        
        // Se tem modificadorCustoFixo, deve ser number
        if (temModificadorCustoFixo) {
          expect(typeof opcao.modificadorCustoFixo).toBe('number')
        }
      })
    })
  })

  it('IDs de opções devem ser únicos dentro de cada configuração', () => {
    const comConfigs = modificacoes.filter(m => 
      'configuracoes' in m && typeof m.configuracoes === 'object'
    )

    comConfigs.forEach(mod => {
      const configs = (mod as any).configuracoes
      const ids = configs.opcoes.map((o: any) => o.id)
      const uniqueIds = new Set(ids)
      
      expect(uniqueIds.size).toBe(ids.length)
    })
  })
})

describe('Testes de Casos Específicos', () => {
  it('Afeta Intangível deve usar modificadorCustoFixo', () => {
    const afetaIntangivel = modificacoes.find(m => m.id === 'afeta-intangivel')
    
    expect(afetaIntangivel).toBeDefined()
    expect('configuracoes' in afetaIntangivel!).toBe(true)
    
    const configs = (afetaIntangivel as any).configuracoes
    configs.opcoes.forEach((opcao: any) => {
      expect('modificadorCustoFixo' in opcao).toBe(true)
      expect(typeof opcao.modificadorCustoFixo).toBe('number')
      expect(opcao.modificadorCustoFixo).toBeGreaterThanOrEqual(0)
    })
  })

  it('Sutil deve usar modificadorCustoFixo', () => {
    const sutil = modificacoes.find(m => m.id === 'sutil')
    
    expect(sutil).toBeDefined()
    expect('configuracoes' in sutil!).toBe(true)
    
    const configs = (sutil as any).configuracoes
    // Verificar que todas as opções têm modificadorCustoFixo
    configs.opcoes.forEach((opcao: any) => {
      expect('modificadorCustoFixo' in opcao).toBe(true)
      expect(typeof opcao.modificadorCustoFixo).toBe('number')
      expect(opcao.modificadorCustoFixo).toBeGreaterThan(0)
    })
  })

  it('Ativação deve ter requerParametros: false mas ter configuracoes', () => {
    const ativacao = modificacoes.find(m => m.id === 'ativacao')
    
    expect(ativacao).toBeDefined()
    expect(ativacao?.requerParametros).toBe(false)
    expect('configuracoes' in ativacao!).toBe(true)
    
    const configs = (ativacao as any).configuracoes
    expect(configs.opcoes.length).toBeGreaterThan(0)
    
    configs.opcoes.forEach((opcao: any) => {
      expect('modificadorCusto' in opcao).toBe(true)
      expect(opcao.modificadorCusto).toBeLessThan(0) // Ativação é falha
    })
  })

  it('Efeito Colateral deve ter modificadorCusto negativo', () => {
    const efeitoColateral = modificacoes.find(m => m.id === 'efeito-colateral')
    
    expect(efeitoColateral).toBeDefined()
    expect('configuracoes' in efeitoColateral!).toBe(true)
    
    const configs = (efeitoColateral as any).configuracoes
    configs.opcoes.forEach((opcao: any) => {
      expect('modificadorCusto' in opcao).toBe(true)
      expect(opcao.modificadorCusto).toBeLessThan(0)
    })
  })

  it('modificações com requerParametros: false e configuracoes devem existir', () => {
    // Verifica que existem modificações com este padrão (bug corrigido)
    const comEstePatrao = modificacoes.filter(m => 
      m.requerParametros === false && 
      'configuracoes' in m && 
      typeof m.configuracoes === 'object'
    )
    
    expect(comEstePatrao.length).toBeGreaterThan(0)
    
    // Todas devem ter opcoes válidas
    comEstePatrao.forEach(mod => {
      const configs = (mod as any).configuracoes
      expect(configs.opcoes.length).toBeGreaterThan(0)
    })
  })
})

describe('Integridade de Dados', () => {
  it('não deve haver muitas modificações duplicadas', () => {
    const nomes = modificacoes.map(m => m.nome.toLowerCase())
    const nomesUnicos = new Set(nomes)
    
    // Permitir algumas variações (ex: "Área" vs "Área de Efeito")
    const percentualUnico = (nomesUnicos.size / nomes.length) * 100
    
    if (percentualUnico < 95) {
      const duplicados = nomes.filter((nome, index) => 
        nomes.indexOf(nome) !== index
      )
      console.log('Nomes duplicados encontrados:', [...new Set(duplicados)])
    }
    
    // Deve ter pelo menos 95% de nomes únicos
    expect(percentualUnico).toBeGreaterThanOrEqual(95)
  })

  it('custos devem ser números válidos', () => {
    modificacoes.forEach(mod => {
      expect(Number.isFinite(mod.custoFixo)).toBe(true)
      expect(Number.isFinite(mod.custoPorGrau)).toBe(true)
      expect(Number.isNaN(mod.custoFixo)).toBe(false)
      expect(Number.isNaN(mod.custoPorGrau)).toBe(false)
    })
  })

  it('IDs devem seguir padrão kebab-case', () => {
    modificacoes.forEach(mod => {
      // Formato válido: letras minúsculas, números e hífens
      const idValido = /^[a-z0-9-]+$/.test(mod.id)
      expect(idValido).toBe(true)
      
      // Não deve começar ou terminar com hífen
      expect(mod.id.startsWith('-')).toBe(false)
      expect(mod.id.endsWith('-')).toBe(false)
    })
  })
})
