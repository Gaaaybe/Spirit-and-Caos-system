# Ficha de Personagem - Sistema Aetherium

## 📋 Visão Geral

Sistema completo de fichas de personagem para o RPG Spirit and Caos, integrado ao criador de poderes existente.

## ✨ Features Implementadas

### ✅ Estrutura Base
- [x] Types e interfaces TypeScript completas
- [x] Schemas de validação Zod
- [x] Hooks de cálculo automático
- [x] Hook de persistência (localStorage)
- [x] Componente UI principal com sistema de tabs
- [x] Integração com página de personagens

### ✅ Sistema de Cálculos Automáticos
- [x] **PdA Total**: Fórmula `15 + ((nivel-1)*7) + floor(nivel/5)*7 + extras`
- [x] **Modificadores de Atributo**: `(atributo - 10) / 2`
- [x] **Rank de Calamidade**: Calculado por nível (Raposa, Lobo, Tigre, etc)
- [x] **Espaços Disponíveis**: Baseado em INT (PLACEHOLDER)
- [x] **HP Máximo**: Baseado em nível + CON (PLACEHOLDER)
- [x] **PE Máximo**: Baseado em nível (PLACEHOLDER)

### ✅ Validações
- [x] Atributos entre 1-10
- [x] PdA gastos ≤ PdA totais
- [x] Espaços ocupados ≤ espaços disponíveis
- [x] Domínios válidos para poderes
- [x] HP/PE dentro dos limites

## 🧮 Fórmulas (Com PLACEHOLDERS)

### PdA Total (Implementado)
```typescript
PdA Total = 15 + ((nivel-1) * 7) + floor(nivel/5) * 7 + pdaExtras

Exemplos:
- Nível 1: 15 PdA
- Nível 2: 22 PdA
- Nível 5: 50 PdA (com bônus de patamar)
- Nível 10: 92 PdA
```

### HP Máximo (PLACEHOLDER - Confirmar)
```typescript
// FÓRMULA TEMPORÁRIA
HP Max = 20 + (nivel * (4 + modCON))
```

### PE Máximo (PLACEHOLDER - Confirmar)
```typescript
// FÓRMULA TEMPORÁRIA
PE Max = floor(sqrt(nivel * 10))
```

### Espaços Disponíveis (PLACEHOLDER - Confirmar)
```typescript
// FÓRMULA TEMPORÁRIA
Espaços = 10 + (modINT * 2) + floor(nivel / 10)
```

## 📦 Estrutura de Arquivos

```
src/features/ficha-personagem/
├── types/
│   └── index.ts                    # Interfaces TypeScript
├── schemas/
│   └── personagem.schema.ts        # Validações Zod
├── hooks/
│   ├── usePersonagem.ts            # CRUD + persistência
│   └── usePersonagemCalculator.ts  # Cálculos automáticos
├── components/
│   └── FichaPersonagem.tsx         # UI principal
├── utils/                          # (vazio por enquanto)
└── index.ts                        # Re-exports
```

## 🔌 Integração com Sistema de Poderes

### Como Funciona

1. **Domínios e Maestria**
   - Cada personagem tem uma lista de `Domain[]`
   - Cada domínio tem `maestria: 'Iniciante' | 'Praticante' | 'Mestre'`
   - Maestria afeta custo de criação:
     - Iniciante: +1 PdA/grau
     - Praticante: +0 PdA/grau (normal)
     - Mestre: -1 PdA/grau

2. **Poderes do Personagem**
   - Interface `PersonagemPoder` vincula `PoderSalvo` a um domínio
   - Campos: `ativo`, `equipado`, `usosRestantes`
   - Cálculo automático de PdA gastos e espaços ocupados

3. **Validação de Limites**
   - PdA: Soma de todos os poderes ativos
   - Espaços: Soma de todos os poderes equipados
   - Alertas visuais quando exceder

## 🎯 Próximos Passos (TODO)

### Fase 2: Componentes de Abas
- [ ] `AbaSobre.tsx` - Imagem, identidade, origem, notas
- [ ] `AbaAtributos.tsx` - Inputs de atributos com modificadores
- [ ] `AbaHabilidades.tsx` - Perícias, resistências
- [ ] `AbaPoderes.tsx` - Integração completa com biblioteca
- [ ] `AbaCombate.tsx` - HP/PE editáveis, defesas
- [ ] `AbaEquipamento.tsx` - Inventário, itens equipados

### Fase 3: Sistema de Domínios
- [ ] Criar domínios pré-definidos
- [ ] Modal para adicionar/editar domínios
- [ ] Integrar maestria na calculadora de poderes
- [ ] UI para vincular poderes a domínios

### Fase 4: Sistema de Inventário
- [ ] CRUD de itens
- [ ] Sistema de bônus de itens
- [ ] Cálculo de peso total
- [ ] RD de armadura + escudo

### Fase 5: Refinamentos
- [ ] Confirmar e implementar fórmulas corretas (HP, PE, Espaços)
- [ ] Sistema de arquetipos (presets de atributos)
- [ ] Exportar/Importar ficha
- [ ] Modo de visualização (para mestres)
- [ ] Histórico de mudanças

## 🧪 Como Testar

1. Navegue para `/personagens`
2. Clique em "Novo Personagem"
3. A ficha será criada com valores padrão
4. Explore as abas (por enquanto com conteúdo placeholder)
5. Observe os cálculos automáticos no header

## 📝 Notas de Implementação

### PLACEHOLDERS Identificados

Todos os placeholders estão marcados com comentários `// PLACEHOLDER` no código:

1. **HP Máximo** (`usePersonagemCalculator.ts:33-40`)
2. **PE Máximo** (`usePersonagemCalculator.ts:46-53`)
3. **Espaços Disponíveis** (`usePersonagemCalculator.ts:59-69`)
4. **Aparar (defesa)** (`usePersonagemCalculator.ts:197`)

### Auto-save

- Implementado com debounce de 300ms
- Salva automaticamente ao modificar qualquer campo
- Validação pré-save com Zod
- Indicador visual "Salvando..."

### Validação em Tempo Real

- Hook `usePersonagemValidacao` retorna erros e avisos
- Exibido no topo da ficha
- Não impede edição, apenas alerta

## 🔗 Dependências

- Reutiliza `useLocalStorage` do projeto
- Integra com `calcularDetalhesPoder` do criador de poderes
- Usa componentes UI do design system existente
- Zod 4.1 para validação

## 📚 Referências

- Inspiração: DnD Beyond, CRIS Ordem Paranormal
- Sistema base: Mutants & Masterminds 3e
- Progressão: Milestone (sem XP numérico)
