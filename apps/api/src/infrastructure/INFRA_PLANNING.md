# Planejamento de Infraestrutura: Character Manager

Este documento detalha o planejamento arquitetural para a camada de `infrastructure` do módulo `character-manager`, com foco no mapeamento de dados para o Prisma, na modelagem de repositórios e na estratégia de rotas HTTP (com suporte a auto-save do frontend).

## 1. Banco de Dados (Prisma Schema)

O `Character` é um Aggregate Root complexo (possui inventário, atributos, modificadores, lista de poderes, etc.). Em vez de normalizar tudo em dezenas de tabelas pequenas (o que geraria dezenas de JOINS lentos no carregamento da ficha), adotaremos a abordagem de **dados estruturados no Postgres (`JSONB`)** para Value Objects dinâmicos, e relações padrão para dados que precisam ser buscados separadamente.

### Tabela: `characters`
```prisma
model Character {
  id        String   @id @default(uuid())
  userId    String
  name      String
  level     Int      @default(1)
  
  // Value Objects complexos convertidos em JSONB para melhor performance de I/O
  attributes         Json  // Força, Destreza, Vigor, etc.
  narrativeProfile   Json  // Raça, Idade, Background, Religião, etc.
  skills             Json  // Lista de proficiências e bônus das perícias
  pdaState           Json  // Total PdA, PdA Gasto (pode derivar o disponível)
  healthState        Json  // PV Total, Atual, Modificador, Thresholds
  energyState        Json  // PE Total, Atual
  spiritualPrinciple Json  // Estágio (NORMAL, DIVINE) e se está desbloqueado
  equipmentSlots     Json  // Mãos, Cinto (Acesso Rápido), Traje e Acessório Equipados
  inventory          Json  // Runics e Bag (Lista de itens não equipados com {itemId, quantity})
  conditions         Json  // Array de status conditions atuais
  
  inspiration        Int     @default(0) // Limite 0 a 3
  deathCounter       Int     @default(0)
  
  // Metadados
  symbol    String?
  art       String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Relações com o Compêndio
  characterPowers       CharacterPower[]
  characterPowerArrays  CharacterPowerArray[]
  characterBenefits     CharacterBenefit[]
  characterDomains      CharacterDomain[]

  @@map("characters")
}

// Tabelas Pivot para relacionamento M:N (Ficha -> Poderes/Acervos)
// Obs: Apesar da ficha apontar para IDs locais/clonados, precisamos de pivots rápidos
model CharacterPower {
  characterId String
  powerId     String  // ID da instância privada do poder
  isEquipped  Boolean @default(false)
  posicao     Int

  character   Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  power       Power     @relation(fields: [powerId], references: [id], onDelete: Cascade)

  @@id([characterId, powerId])
  @@map("character_powers")
}
// (Seguir o mesmo padrão para CharacterPowerArray, CharacterBenefit e CharacterDomain)
```

## 2. Padrão de Auto-Save (Sync)

### A Dor do Auto-Save em RPGs
Fichas de RPG na web geram muitas requisições rápidas: o jogador marca 1 de dano, depois mais 1, depois gasta 1 PE. Se fizermos requisições inteiras HTTP de `PUT /characters/:id` para atualizar toda a ficha de 50kb a cada clique, o servidor deita e o cliente sofre com problemas de concorrência e *race conditions*.

### A Solução: Event-Driven e Sync Parcial via HTTP (Debounce)
No Frontend, usaremos uma estratégia de **Optimistic UI + Debounced Patch**:
1. O usuário clica e altera o PV. A tela muda instantaneamente (React Context/Zustand).
2. O Front "empacota" essas alterações em um payload parcial (ex: `{ health: { current: 14 } }`).
3. Uma rotina de *Debounce* espera o usuário parar de clicar por `X ms` (ex: 500ms) e envia a mutação.

### Rota Central de Sync: `PATCH /characters/:id/sync`
Em vez de expor 20 rotas (`PUT /health`, `PUT /pda`, `PUT /attributes`), teremos uma rota de Sync genérica de alta performance que consome uma *Partial Payload*.

**Controller (`SyncCharacterController`)**
```typescript
@Patch(':id/sync')
async handle(@Param('id') characterId: string, @Body() body: SyncCharacterDto) {
    // 1. Puxa a ficha
    // 2. Compara o payload e aplica os Use Cases dinamicamente
    //    Se veio body.pvChange => chama TakeDamageUseCase
    //    Se veio body.peChange => chama ConsumeEnergyUseCase
    //    Se veio body.attributes => chama UpdateCharacterAttributesUseCase
    // 3. Salva a ficha de uma vez só no Prisma
}
```

Isso alivia o tráfego de rede e centraliza o salvamento automático em uma única requisição forte.

Para ações de alta relevância (Adquirir Poder, Evoluir de Nível, Upgradear Item, Vender), teremos rotas isoladas pois elas possuem lógicas estritas de Domínio e retorno de erros que devem quebrar o auto-save e dar "Alert" na cara do jogador se ele burlar as regras.

## 3. Estrutura de Diretórios da Infraestrutura (`apps/api/src/infrastructure`)

```text
infrastructure/
├── database/prisma/
│   ├── repositories/
│   │   └── prisma-characters-repository.ts // Implementa CharactersRepository
│   └── mappers/
│       └── prisma-character-mapper.ts      // toDomain() e toPrisma() lindando com JSONB
├── http/
│   ├── controllers/
│   │   └── characters/
│   │       ├── create-character.controller.ts
│   │       ├── get-character-by-id.controller.ts
│   │       ├── fetch-user-characters.controller.ts
│   │       ├── delete-character.controller.ts
│   │       ├── sync-character.controller.ts      // A rota do auto-save
│   │       ├── acquire-power.controller.ts
│   │       ├── upgrade-item.controller.ts
│   │       └── ... (outras ações de compra/mecânica dura)
│   └── presenters/
│       └── character.presenter.ts // Monta o JSON gigante pra Web ler rápido
└── services/
    ├── prisma-items-lookup-port.ts     // Implementa a porta de Item para a Ficha
    └── prisma-powers-lookup-port.ts    // Implementa a porta de Poder para a Ficha
```

## 4. Mapper: Cuidado com o JSONB

O `PrismaCharacterMapper.toDomain()` vai receber o objeto do banco. Nós mapearemos os blocos JSON diretos para as classes de Value Object:
```typescript
const attributes = AttributeSet.create(raw.attributes as unknown as AttributeSetProps);
const inventory = Inventory.create(raw.inventory as unknown as InventoryProps);
```
O `toPrisma()` fará o inverso, puxando `character.inventory.bag` e injetando no prisma.

## 5. Próximos Passos
1. Atualizar o `schema.prisma` com o modelo do Character e aplicar a Migration.
2. Criar o `PrismaCharacterMapper`.
3. Criar o `PrismaCharactersRepository`.
4. Implementar as Portas (Lookup) conectadas ao Prisma.
5. Desenvolver os Controllers da API e atrelá-los ao Módulo do NestJS.
