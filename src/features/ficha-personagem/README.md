# Ficha de Personagem - Sistema Aetherium

## 📋 Visão Geral

Sistema completo e automatizado de fichas de personagem para o RPG Spirit and Caos, com integração profunda ao sistema de poderes. Focado em automação máxima de cálculos e validações, preparado para integração com backend e visualização em tempo real.

## ✨ Features Implementadas

### ✅ Estrutura Base Completa
- [x] **Types e Interfaces** TypeScript com tipagem forte
- [x] **Schemas Zod** com validações complexas e refinamentos
- [x] **Hooks de Cálculo** com memoização e auto-update
- [x] **Persistência** com autosave, hydration e biblioteca
- [x] **Sistema de Domínios** com maestria e aplicação automática
- [x] **Tracking de Vitais** com histórico para sincronização futura

### ✅ Sistema de Cálculos Automáticos
- [x] **Pontos de Atributo**: `(nivel * (nivel+1) / 2) + (67 - somaAtributos)`
- [x] **PdA Total**: `15 + ((nivel-1)*7) + floor(nivel/5)*7 + extras`
- [x] **Modificadores de Atributo**: `ARREDONDAR.PARA.CIMA((atributo - 10) / 2)`
- [x] **Bônus de Eficiência**: `ARRED(3000 * (nivel/250)^2) + 1`
- [x] **Rank de Calamidade**: Lookup na Tabela Mestra (Raposa → Celestial)
- [x] **CD Mental/Físico**: `10 + modChave + nivel/2` (dois atributos chave)
- [x] **RD de Bloqueio**: Traje + Arma + Mod.Fortitude + Poderes Passivos
- [x] **Bônus de Perícia**: Mod.Atributo + Treino + Eficiência + Misc
- [x] **PV Máximo**: `(nivel * modCON) + 6`
- [x] **PE Máximo**: `floor(899 * sqrt((modMental + modFisico) / 15000))`
- [x] **Deslocamento**: `9 metros` (padrão)

### ✅ Validações em Tempo Real
- [x] Atributos entre 1-30
- [x] Nível entre 1-250
- [x] PdA gastos ≤ PdA totais
- [x] Espaços ocupados ≤ espaços disponíveis
- [x] PV/PE atual ≤ máximo + temporário
- [x] Domínios referenciados existem

### ✅ Integração com Sistema de Poderes
- [x] **Maestria de Domínio** aplicada automaticamente via modificações existentes
- [x] **Recálculo de Custos** quando poder ou maestria mudam
- [x] **Validação de Orçamento** em tempo real
- [x] **Tracking de Espaços** por poder equipado

### ✅ Sistema de Inventário
- [x] **Equipamento**: mainHand, offHand, extraHands[], traje, accessory
- [x] **Múltiplas Mãos**: Suporte para poderes que dão mãos extras
- [x] **Quick Slots**: Acesso rápido (6 slots)
- [x] **Backpack**: Armazenamento ilimitado (sem peso)
- [x] **RD de Bloqueio**: Soma todas as armas/escudos equipados

## 🧮 Fórmulas e Cálculos

### Pontos de Atributo (✅ Confirmado)
```typescript
PontosDisponiveis = (nivel * (nivel + 1) / 2) + (67 - somaAtributos)

Personagens começam com 60 pontos (6 × 10)
Ganham pontos a cada nível para distribuir

Exemplos:
- Nível 1, atributos 60 total: 1 + 7 = 8 pontos disponíveis
- Nível 2, atributos 60 total: 3 + 7 = 10 pontos disponíveis  
- Nível 5, atributos 60 total: 15 + 7 = 22 pontos disponíveis
- Nível 10, atributos 75 total: 55 + (67-75) = 47 pontos disponíveis
```

### PdA Total (✅ Confirmado)
```typescript
PdA Total = 15 + ((nivel-1) * 7) + floor(nivel/5) * 7 + pdaExtras

Regra Opcional: A cada nível múltiplo de 5, soma +7 extra

Exemplos:
- Nível 1:  15 PdA
- Nível 2:  22 PdA
- Nível 3:  29 PdA
- Nível 5:  50 PdA (bônus aos 5)
- Nível 10: 92 PdA (bônus aos 5 e 10)
- Nível 20: 183 PdA
```

### Modificadores (✅ Confirmado)
```typescript
Modificador = ARREDONDAR.PARA.CIMA((Atributo - 10) / 2)
// Math.ceil((atributo - 10) / 2)

Exemplos:
- Atributo 10 = +0
- Atributo 11 = +1  (antes era 0, agora arredonda para cima)
- Atributo 12 = +1
- Atributo 18 = +4
- Atributo 20 = +5
```

### Bônus de Eficiência (✅ Confirmado)
```typescript
BonusEficiencia = ARRED(3000 * (nivel / 250)^2) + 1
// Math.round(3000 * Math.pow(nivel / 250, 2)) + 1

Exemplos:
- Nível 1:   +1
- Nível 10:  +5
- Nível 50:  +121
- Nível 100: +481
- Nível 250: +3001
```

### Classe de Dificuldade (✅ Confirmado)
```typescript
CD = 10 + ModificadorAtributoChave + floor(Nivel / 2)

O personagem tem DOIS atributos chave:
- Mental: Inteligência, Sabedoria ou Carisma (escolha do jogador)
- Físico: Força, Destreza ou Constituição (escolha do jogador)

Usados para poderes específicos conforme descritor
```

### PV Máximo (✅ Confirmado)
```typescript
PV Max = (nivel * ModCON) + 6

Exemplos:
- Nível 1, CON 10 (mod +0):  6 PV
- Nível 5, CON 14 (mod +2):  16 PV  
- Nível 10, CON 18 (mod +4): 46 PV
- Nível 20, CON 20 (mod +5): 106 PV
```

### PE Máximo (✅ Confirmado)
```typescript
PE Max = ARREDONDAR.PARA.BAIXO(899 * RAIZ((modMental + modFisico) / 15000))
// Math.floor(899 * Math.sqrt((modMental + modFisico) / 15000))

modMental  = Modificador do atributo chave mental escolhido
modFisico  = Modificador do atributo chave físico escolhido

Exemplos:
- Mod Mental +0, Mod Físico +0: 0 PE
- Mod Mental +2, Mod Físico +2: 13 PE
- Mod Mental +5, Mod Físico +5: 21 PE
- Mod Mental +10, Mod Físico +10: 30 PE
```

### Deslocamento (✅ Confirmado)
```typescript
Deslocamento = 9 metros (padrão)

Pode ser modificado por poderes/itens
```

### Espaços Disponíveis (⚠️ PLACEHOLDER - Confirmar)
```typescript
// FÓRMULA TEMPORÁRIA
Espaços = 10 + (ModINT * 2) + floor(nivel / 10)

// TODO: Validar escalamento em níveis altos (nível 100 = +10?)
```

### RD (Redução de Dano)
```typescript
// RD Base (sem bloqueio)
RD = Traje.bonusRD + PoderesPassivos.RD

// RD de Bloqueio (ação defensiva)
RD_Bloqueio = Traje + Armas/Escudos (todas as mãos) + ModFortitude + Poderes

// Suporte para múltiplas mãos:
// - mainHand, offHand, extraHands[]
// - Todos os escudos equipados somam RD ao bloquear
// - extraHands[] permite equipar armas/escudos de poderes (ex: Membros Extras)

// ModFortitude = ModCON (perícia Fortitude usa Constituição)
```

### Perícias
```typescript
BonusPericia = ModAtributoBase + Treino + BonusEspecial

// Se Eficiente:    +BonusEficiencia (da Tabela Mestra)
// Se Ineficiente:  BonusTotal / 2 (arredondado para baixo)
// Misc:            Bônus de itens/situações

Mapeamento Perícia → Atributo (21 perícias):
- Físicas: Acrobacia(DES), Atletismo(FOR), Cavalgar(DES)...
- Mentais: Conhecimento(INT), Investigação(INT)...
- Sociais: Diplomacia(CAR), Intimidação(CAR)...
- Percepção: Intuição(SAB), Percepção(SAB)...
- Resistência: Fortitude(CON)
```

## 📦 Estrutura de Arquivos (Atualizada)

```
src/features/ficha-personagem/
├── types/
│   ├── index.ts                        # Interfaces completas
│   └── skillsMap.ts                    # Mapeamento perícia→atributo
├── schemas/
│   └── personagem.schema.ts            # Validações Zod com refinements
├── regras/
│   └── calculadoraPersonagem.ts        # Funções puras de cálculo
├── hooks/
│   ├── index.ts                        # Exports centralizados
│   ├── usePersonagemCalculator.ts      # Estado + cálculos memoizados
│   ├── usePersonagemPoderes.ts         # Integração poderes + maestria
│   ├── usePersonagemPersistence.ts     # Autosave + carregamento
│   ├── useBibliotecaPersonagens.ts     # CRUD biblioteca
│   └── useVitalsManager.ts             # Gerenciamento PV/PE + histórico
├── components/                         # (TODO - Fase 2)
├── utils/                              # (TODO - Hydration, sync)
└── index.ts                            # Re-exports
```

## 🔌 Integração com Sistema de Poderes

### Maestria de Domínio (Automática)

1. **Modificações de Domínio** (em `modificacoes.json`, categoria "Dominio")
   - `dominio-iniciante`: +1 PdA/grau
   - `dominio-mestre`: -1 PdA/grau
   - Praticante: sem modificação (custo normal)

2. **Aplicação Automática**
   ```typescript
   // Ao vincular poder ao personagem:
   usePersonagemPoderes.vincularPoder(poder, dominioId)
   
   // Hook automaticamente:
   // 1. Busca o domínio e sua maestria
   // 2. Adiciona modificação global ao poder
   // 3. Recalcula custo usando calcularDetalhesPoder
   // 4. Salva poder com custos atualizados
   ```

3. **Exemplo Prático**
   ```typescript
   Poder original: Dano 6 = 12 PdA
   
   Domínio: "Combate Arcano" (Maestria: Iniciante)
   → Adiciona modificação "dominio-iniciante"
   → Custo final: 12 + 6 = 18 PdA
   
   Domínio: "Combate Corpo-a-Corpo" (Maestria: Mestre)
   → Adiciona modificação "dominio-mestre"
   → Custo final: 12 - 6 = 6 PdA
   ```

### Estrutura de Dados

```typescript
interface PersonagemPoder {
  id: string;                    // ID único da instância
  poderId: string;               // ID do PoderSalvo na biblioteca
  poder: Poder;                  // Poder COM maestria já aplicada
  dominioId: string;             // Link com domínio
  ativo: boolean;                // Está ativo?
  pdaCost: number;               // Custo FINAL (com maestria)
  espacosOccupied: number;       // Espaços FINAIS
  usosRestantes?: number;        // Para poderes limitados
}
```

### Validação de Orçamento

```typescript
// Em tempo real (memoizado):
const pdaUsados = personagem.poderes.reduce((sum, p) => sum + p.pdaCost, 0);
const pdaDisponiveis = personagem.pdaTotal - pdaUsados;

// Validação Zod impede salvar se exceder
// UI mostra alerta visual quando próximo do limite
```

## 📊 Sistema de Perícias

### 21 Perícias Fixas (do Sistema)

Organizadas por categoria para UI:

**Físicas** (baseadas em atributos físicos)
- Acrobacia (DES)
- Atletismo (FOR)
- Cavalgar (DES)
- Furtividade (DES)
- Iniciativa (DES)
- Ladinagem (DES)

**Mentais** (baseadas em INT)
- Conhecimento (INT)
- Espiritismo (INT)
- Exploração (INT)
- Investigação (INT)
- Ofício (INT)
- Religião (INT)

**Sociais** (baseadas em CAR)
- Adestrar Animais (CAR)
- Atuação (CAR)
- Diplomacia (CAR)
- Enganação (CAR)
- Intimidação (CAR)

**Percepção** (baseadas em SAB)
- Cura (SAB)
- Intuição (SAB)
- Percepção (SAB)
- Sobrevivência (SAB)

**Resistência**
- Fortitude (CON) - também perícia de resistência física

### Configuração de Perícia

```typescript
interface SkillEntry {
  id: string;               // Nome da perícia
  isEfficient: boolean;     // Recebe +BonusEficiencia (Tabela Mestra)
  isInefficient: boolean;   // Sofre -50% do bônus total
  trainingLevel: number;    // Treinamento fixo ou de itens
  miscBonus: number;        // Bônus diversos
}

// Cálculo final:
Bonus = ModAtributo + Treino + (Eficiente ? BonusEficiencia : 0) + Misc
if (Ineficiente) Bonus = floor(Bonus / 2)
```

## 💊 Sistema de Vitais (PV/PE)

### Gerenciamento com Histórico

```typescript
useVitalsManager({
  vitals,
  onVitalsChange
})

// Retorna:
{
  // PV
  aplicarDano(valor, fonte?),
  curarDano(valor, fonte?),
  adicionarPVTemp(valor, fonte?),
  removerPVTemp(),
  
  // PE
  gastarPE(valor, fonte?),
  recuperarPE(valor, fonte?),
  adicionarPETemp(valor, fonte?),
  removerPETemp(),
  
  // Contadores de Morte (0-3)
  adicionarContadorMorte(),
  removerContadorMorte(),
  resetarContadoresMorte(),
  
  // Histórico (para sync futuro)
  historico: VitalChangeLog[],
  limparHistorico(),
  
  // Helpers
  estaMorto,          // deathCounters >= 3
  estaInconsciente,   // pv.current <= 0
  percentualPV,
  percentualPE,
}
```

### Histórico de Mudanças

```typescript
interface VitalChangeLog {
  timestamp: number;
  tipo: 'dano' | 'cura' | 'temp' | 'pe-gasto' | 'pe-recuperado';
  recurso: 'pv' | 'pe';
  valor: number;
  fonte?: string;  // "Ataque de Goblin", "Poção de Cura"
}

// Usado futuramente para:
// - Sincronização em tempo real com mestre
// - Replay de combate
// - Auditoria de mudanças
```

## 🎯 Roadmap de Implementação

### ✅ Fase 1: Estrutura Base (CONCLUÍDA)
- [x] Tipos e schemas Zod
- [x] Funções puras de cálculo
- [x] Hooks de estado e persistência
- [x] Sistema de domínios e maestria
- [x] Integração com poderes
- [x] Tracking de vitais com histórico
- [x] Biblioteca de personagens (CRUD)

### 🔄 Fase 2: Componentes UI (PRÓXIMA)
- [ ] `FichaPersonagem.tsx` - Container principal com tabs
- [ ] `AbaSobre.tsx` - Cabeçalho, identidade, motivações
- [ ] `AbaAtributos.tsx` - Sliders/inputs de atributos + mods
- [ ] `AbaPerícias.tsx` - Grid de 21 perícias com bônus calculados
- [ ] `AbaPoderes.tsx` - Lista de poderes + vinculação com domínios
- [ ] `AbaCombate.tsx` - PV/PE editáveis + contadores + defesas
- [ ] `AbaInventário.tsx` - Equipamento + acesso rápido

### 📋 Fase 3: Features Avançadas
- [ ] **Efeitos Passivos Automáticos**
  - Sistema para detectar poderes passivos que modificam ficha
  - Aplicação automática de bônus (RD, atributos, PV/PE, etc.)
  - Filtro por `duracao >= ATIVADO` e categorização por efeito

- [ ] **Sistema de Itens Completo**
  - Feature separada `features/itens/`
  - Integração com poderes (itens encantados)
  - Crafting e aprimoramento
  - Bônus complexos (condicionais, cargas, etc.)

- [ ] **Defesas Ativas (UI Placeholder)**
  - Botões "Esquiva", "Aparar", "Bloqueio"
  - Mostram fórmula: `1d20 + modReflexos` (visual apenas)
  - Não executam rolagem (aguarda sistema de rolagens futuro)

- [ ] **Domínios e Maestria (UI)**
  - Modal de criação/edição de domínios
  - Seletor visual de maestria
  - Preview de modificação de custo ao vincular poder

- [ ] **Confirmação de Fórmulas Placeholder**
  - Revisar PV/PE máximos com regras oficiais
  - Implementar lookup real na Tabela Mestra
  - Validar escalamento de Espaços em níveis altos

### 🔮 Fase 4: Integração Backend e Realtime
- [ ] **Camada de Sincronização** (`utils/sync.ts`)
  - Interface para WebSocket (visualização tempo real)
  - Adapter para API REST (CRUD personagens)
  - Sistema de conflitos (merge de mudanças)
  
- [ ] **Multiplayer**
  - Mestre visualiza ficha de jogadores
  - Aplicar dano/cura remotamente
  - Chat integrado
  
- [ ] **Hydration e Migrations**
  - Sistema de versionamento de schema
  - Auto-upgrade de personagens antigos
  - Backup e rollback

## 🧪 Como Usar (Desenvolvedor)

### Exemplo Básico

```typescript
import { 
  usePersonagemCalculator,
  usePersonagemPoderes,
  useVitalsManager,
  useBibliotecaPersonagens,
} from '@/features/ficha-personagem/hooks';

function FichaPersonagem() {
  // Estado e cálculos
  const {
    personagem,
    calculado,
    atualizarNivel,
    atualizarAtributo,
    obterBonusPericia,
  } = usePersonagemCalculator();
  
  // Poderes
  const {
    vincularPoder,
    desvincularPoder,
    calcularCustosTotal,
  } = usePersonagemPoderes({
    poderes: personagem.poderes,
    dominios: personagem.dominios,
    onPoderChange: (poderes) => {
      setPersonagem(prev => ({ ...prev, poderes }));
    },
  });
  
  // Vitais
  const {
    aplicarDano,
    curarDano,
    gastarPE,
    percentualPV,
  } = useVitalsManager({
    vitals: personagem.vitals,
    onVitalsChange: (vitals) => {
      setPersonagem(prev => ({ ...prev, vitals }));
    },
  });
  
  // Biblioteca
  const {
    personagens,
    salvarPersonagem,
  } = useBibliotecaPersonagens();
  
  return (
    <div>
      <h1>{personagem.header.name} - Nível {personagem.header.level}</h1>
      <p>PdA: {calculado.pdaUsados} / {personagem.pdaTotal}</p>
      <p>CD Mental: {calculado.cdMental}</p>
      
      <button onClick={() => aplicarDano(10, 'Ataque teste')}>
        Receber 10 de dano
      </button>
      
      <button onClick={() => salvarPersonagem(personagem)}>
        Salvar na Biblioteca
      </button>
    </div>
  );
}
```

## 📝 Notas Importantes

### PLACEHOLDERS Identificados

**Todos marcados com `// TODO:` no código:**

1. **PV Máximo** (`regras/calculadoraPersonagem.ts`)
   - Fórmula placeholder: `20 + (nivel * (4 + modCON))`
   - Confirmar se usa Tabela Mestra como criaturas

2. **PE Máximo** (`regras/calculadoraPersonagem.ts`)
   - Fórmula placeholder: `sqrt(nivel) * 10`
   - Confirmar se usa Tabela Mestra como criaturas

3. **Espaços Disponíveis** (`regras/calculadoraPersonagem.ts`)
   - Fórmula placeholder: `10 + (modINT * 2) + floor(nivel/10)`
   - Validar escalamento (nível 100 = apenas +10?)

4. **Bônus de Eficiência** (`regras/calculadoraPersonagem.ts`)
   - Lookup hardcoded até nível 20
   - TODO: Implementar leitura real da `tabelaMestra.csv`

5. **Efeitos Passivos de Poderes**
   - Sistema planejado mas não implementado
   - Aguarda design de mapeamento efeito → modificador de ficha

### Defesas Ativas vs Passivas

**NÃO existem defesas passivas no sistema:**
- Esquiva, Aparar, Bloqueio = rolagem de d20 + mod
- RD de Bloqueio = valor fixo aplicado QUANDO bloqueia
- UI deve mostrar fórmulas mas não executar (aguarda sistema de rolagens)

### Maestria e Modificações

**Modificações já existem em `modificacoes.json`:**
- Categoria "Dominio" contém `dominio-iniciante` e `dominio-mestre`
- Sistema apenas adiciona essas modificações globalmente ao poder
- Recálculo acontece automaticamente via `calcularDetalhesPoder`
- Não precisa modificar calculadora de custos existente

### Inventário sem Peso

- Sistema de inventário é **ilimitado** (sem limite de peso)
- Foco em tracking de bônus e equipamento
- Itens complexos serão feature separada no futuro

## 🔗 Dependências

- **Zod** ^4.1.0 - Validação de schemas
- **React** hooks (useState, useMemo, useCallback, useEffect)
- **Shared hooks**: `useLocalStorage` para persistência
- **Sistema de Poderes**: `calcularDetalhesPoder`, tipos `Poder`
- **Data**: `EFEITOS`, `MODIFICACOES` de `src/data/`

## 📚 Referências e Inspirações

- **Sistema Base**: Mutants & Masterminds 3e
- **UI/UX**: DnD Beyond, CRIS Ordem Paranormal
- **Progressão**: Milestone-based (sem XP numérico obrigatório)
- **Arquitetura**: Padrão de hooks do `criador-de-poder`

---

**Última Atualização**: Janeiro 2026
**Versão do Schema**: 1.0.0
**Status**: ✅ Estrutura base completa, aguardando UI
