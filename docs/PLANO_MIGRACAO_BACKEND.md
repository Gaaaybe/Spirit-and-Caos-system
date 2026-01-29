# 📋 Plano de Migração - Frontend para Arquitetura Full Stack

**Projeto:** Aetherium - Spirit & Caos RPG System  
**Data:** 28 de janeiro de 2026  
**Status:** Planejamento  

---

## 📊 Análise da Situação Atual

### Responsabilidades Atuais do Frontend

#### 🔴 **Alta Acoplamento - Crítico**
- **Regras de Negócio Complexas**
  - `src/features/criador-de-poder/regras/calculadoraCusto.ts` - 618 linhas de lógica de cálculo
  - `src/features/ficha-personagem/regras/calculadoraPersonagem.ts` - 364 linhas de cálculos
  - `src/features/criador-de-poder/regras/escalas.ts` - Sistema completo de escalas
  
- **Persistência de Dados Críticos**
  - Todo armazenamento em `localStorage`
  - Sem backup ou sincronização
  - Dados: poderes, personagens, bibliotecas, campanhas
  
- **Validação e Integridade**
  - Schema migration/hydration no cliente
  - Validações complexas client-side
  - Sem validação server-side (vulnerável a manipulação)

#### 🟡 **Médio Acoplamento - Preocupante**
- Biblioteca de poderes compartilháveis (mas sem compartilhamento real)
- Sistema de favoritos e customizações
- Gerenciamento de criaturas e tabelas mestras

#### 🟢 **Baixo Acoplamento - Aceitável**
- UI/UX e componentes visuais
- Formulários e inputs
- Navegação e routing
- Animações e transições

### Problemas Identificados

1. **Escalabilidade**: Impossível adicionar multi-usuário ou colaboração
2. **Segurança**: Regras podem ser adulteradas via DevTools
3. **Confiabilidade**: Dados vulneráveis a limpeza de cache/localStorage
4. **Manutenção**: Mudanças nas regras requerem deploy completo
5. **Sincronização**: Sem suporte multi-dispositivo
6. **Auditoria**: Impossível rastrear mudanças ou versões
7. **Colaboração**: Sem compartilhamento real de conteúdo entre usuários

---

## 🎯 Arquitetura Proposta

### Modelo Arquitetural: Híbrido (Client-Server)

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │   UI/UX Layer  │  │  State Manager │  │  Cache Layer   │ │
│  │   (React/TS)   │  │   (Zustand)    │  │  (IndexedDB)   │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│           │                   │                   │          │
│           └───────────────────┴───────────────────┘          │
│                              │                               │
│                    ┌─────────▼─────────┐                     │
│                    │   API Client      │                     │
│                    │   (Axios/Fetch)   │                     │
│                    └─────────┬─────────┘                     │
└──────────────────────────────┼───────────────────────────────┘
                               │
                               │ REST/GraphQL
                               │
┌──────────────────────────────▼───────────────────────────────┐
│                         BACKEND                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  API Gateway   │  │  Auth Service  │  │  File Storage  │ │
│  │  (Express/TS)  │  │  (JWT/OAuth)   │  │    (S3/GCS)    │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│           │                   │                   │          │
│  ┌────────▼───────────────────▼───────────────────▼────────┐ │
│  │              Business Logic Layer                       │ │
│  │  • Calculadora de Custos (regras imutáveis)            │ │
│  │  • Validador de Personagens                            │ │
│  │  • Gerenciador de Campanhas                            │ │
│  │  • Sistema de Compartilhamento                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│  ┌───────────────────────────▼──────────────────────────┐   │
│  │              Data Access Layer (ORM)                  │   │
│  │                   (Prisma/TypeORM)                    │   │
│  └───────────────────────────┬──────────────────────────┘   │
│                              │                               │
│  ┌───────────────────────────▼──────────────────────────┐   │
│  │              Database (PostgreSQL)                    │   │
│  │  • users          • characters    • campaigns        │   │
│  │  • powers         • creatures     • shared_content   │   │
│  │  • audit_logs     • versions      • sessions         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Princípios da Nova Arquitetura

1. **Single Source of Truth**: Backend é a fonte definitiva
2. **Offline-First**: Frontend funciona offline com sincronização
3. **Progressive Enhancement**: Migração gradual sem breaking changes
4. **API-First**: Backend expõe APIs consumíveis por qualquer cliente
5. **Type-Safe**: TypeScript em todo stack com tipos compartilhados

---

## 🔧 Stack Tecnológica Recomendada

### Backend

```typescript
┌─────────────────────────────────────────────────┐
│ Runtime:        Node.js 20+ (LTS)              │
│ Framework:      Express.js ou NestJS           │
│ Linguagem:      TypeScript 5+                  │
│ ORM:            Prisma                         │
│ Database:       PostgreSQL 16+                 │
│ Cache:          Redis (opcional fase 2)       │
│ Auth:           JWT + bcrypt                   │
│ Validação:      Zod (compartilhado com front) │
│ Testing:        Jest + Supertest              │
│ Docs:           OpenAPI/Swagger                │
└─────────────────────────────────────────────────┘
```

### Justificativas

- **NestJS**: Se precisar de arquitetura escalável e modular desde o início
- **Express**: Se preferir simplicidade e controle total
- **Prisma**: Type-safety, migrations automáticas, excelente DX
- **PostgreSQL**: ACID, JSON support, confiável para dados críticos
- **Zod**: Já usado no frontend, facilita compartilhamento de schemas

### Frontend (Mudanças)

```typescript
┌─────────────────────────────────────────────────┐
│ State:          Zustand + React Query          │
│ Cache:          IndexedDB (via Dexie.js)      │
│ API Client:     Axios + interceptors           │
│ Offline:        Service Workers (PWA)          │
│ Sync:           Background sync quando online  │
└─────────────────────────────────────────────────┘
```

---

## 🗺️ Plano de Migração Gradual

### Fase 0: Preparação (1-2 semanas)

#### Objetivos
- Preparar frontend para consumir APIs
- Criar abstração de dados
- Configurar ambiente de desenvolvimento

#### Tarefas

**Frontend:**
```typescript
// 1. Criar camada de abstração de dados
src/services/
  ├── api/
  │   ├── client.ts           // Axios configurado
  │   ├── endpoints.ts        // URLs centralizadas
  │   └── interceptors.ts     // Auth, errors
  ├── repositories/
  │   ├── PoderesRepository.ts
  │   ├── PersonagensRepository.ts
  │   └── CampanhasRepository.ts
  └── sync/
      ├── SyncManager.ts      // Gerencia sincronização
      └── OfflineQueue.ts     // Fila de operações offline

// 2. Criar feature flags
src/config/
  └── features.ts
      export const FEATURES = {
        USE_BACKEND_API: false,  // Toggle gradual
        OFFLINE_MODE: true,
        SYNC_ENABLED: false,
      }

// 3. Criar tipos compartilhados (preparar para monorepo)
src/types/
  └── shared/
      ├── Poder.ts
      ├── Personagem.ts
      └── Usuario.ts
```

**Backend (Setup inicial):**
```bash
# Estrutura do projeto
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── powers/
│   │   ├── characters/
│   │   └── campaigns/
│   ├── shared/
│   │   ├── types/          # Compartilhado com frontend
│   │   ├── validation/
│   │   └── utils/
│   ├── config/
│   └── app.ts
├── prisma/
│   └── schema.prisma
├── tests/
└── package.json
```

**Entregáveis:**
- [ ] Repositório backend configurado
- [ ] Camada de abstração no frontend
- [ ] Feature flags implementadas
- [ ] Ambiente de desenvolvimento (Docker Compose)

---

### Fase 1: Autenticação e Usuários (2-3 semanas)

#### Objetivos
- Sistema de login/registro
- Gestão de sessões
- Migração de dados locais para contas

#### Schema do Banco

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  displayName   String?
  avatarUrl     String?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  // Relações
  powers        Power[]
  characters    Character[]
  campaigns     Campaign[]
  sharedContent SharedContent[]
  
  // Preferências
  preferences   Json?     // Dark mode, etc
  
  @@index([email])
  @@index([username])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  token        String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([token])
  @@index([userId])
}
```

#### APIs

```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

// POST /api/auth/logout
// GET  /api/auth/me
// PUT  /api/auth/profile
```

#### Frontend

```typescript
// src/features/auth/
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ProfileMenu.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useSession.ts
└── services/
    └── AuthService.ts

// Hook de autenticação
const { user, login, logout, isAuthenticated } = useAuth();

// Migração de dados locais
const migrarDadosLocais = async () => {
  const poderesLocais = localStorage.getItem('biblioteca-poderes');
  if (poderesLocais && user) {
    await api.post('/api/migration/powers', JSON.parse(poderesLocais));
  }
};
```

**Entregáveis:**
- [ ] Sistema de registro/login
- [ ] JWT authentication
- [ ] Protected routes no frontend
- [ ] Migração de dados locais para conta
- [ ] Persistência de sessão

---

### Fase 2: Poderes - Backend (3-4 semanas)

#### Objetivos
- Migrar lógica de cálculo de poderes para backend
- Persistência em banco de dados
- API completa de CRUD

#### Schema do Banco

```prisma
model Power {
  id                    String    @id @default(cuid())
  userId                String
  name                  String
  description           String?
  domainId              String
  
  // Parâmetros do poder
  action                Int
  range                 Int
  duration              Int
  
  // Custo alternativo (JSON para flexibilidade)
  alternativeCost       Json?
  
  // Metadados
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  schemaVersion         String    @default("1.0.0")
  
  // Relações
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  effects               PowerEffect[]
  globalModifications   PowerModification[]
  sharedWith            SharedContent[]
  
  // Soft delete
  deletedAt             DateTime?
  
  @@index([userId])
  @@index([domainId])
  @@index([createdAt])
}

model PowerEffect {
  id                    String    @id @default(cuid())
  powerId               String
  effectBaseId          String
  rank                  Int
  customInput           String?
  selectedConfig        String?
  order                 Int       // Para manter ordem
  
  power                 Power     @relation(fields: [powerId], references: [id], onDelete: Cascade)
  localModifications    PowerModification[]
  
  @@index([powerId])
}

model PowerModification {
  id                    String    @id @default(cuid())
  modificationBaseId    String
  scope                 String    // 'global' | 'local'
  parameters            Json?
  modificationRank      Int?
  note                  String?
  
  // Relações (uma das duas)
  powerId               String?
  effectId              String?
  
  power                 Power?       @relation(fields: [powerId], references: [id], onDelete: Cascade)
  effect                PowerEffect? @relation(fields: [effectId], references: [id], onDelete: Cascade)
  
  @@index([powerId])
  @@index([effectId])
}
```

#### APIs

```typescript
// CRUD básico
GET    /api/powers              // Listar poderes do usuário
GET    /api/powers/:id          // Buscar poder específico
POST   /api/powers              // Criar novo poder
PUT    /api/powers/:id          // Atualizar poder
DELETE /api/powers/:id          // Deletar poder

// Operações especiais
POST   /api/powers/:id/duplicate    // Duplicar poder
GET    /api/powers/:id/calculate    // Calcular custos (server-side)
POST   /api/powers/:id/validate     // Validar poder
GET    /api/powers/shared           // Poderes compartilhados

// Busca e filtros
GET    /api/powers?domain=:id       // Filtrar por domínio
GET    /api/powers?search=:query    // Buscar por nome/descrição
```

#### Migração da Lógica de Cálculo

```typescript
// backend/src/modules/powers/services/PowerCalculator.ts
// Migrar de: src/features/criador-de-poder/regras/calculadoraCusto.ts

export class PowerCalculatorService {
  calculatePowerCost(power: Power): PowerCostDetails {
    // Mesma lógica, mas server-side
    // Fonte única de verdade
  }
  
  validatePower(power: Power): ValidationResult {
    // Validações de integridade
  }
  
  calculateDefaultParameters(effects: Effect[]): Parameters {
    // Auto-cálculo de parâmetros
  }
}
```

#### Frontend (Adaptação)

```typescript
// src/features/criador-de-poder/hooks/usePoderCalculator.ts
export function usePoderCalculator() {
  const { data: poder, mutate } = usePower(powerId);
  const { mutate: savePower } = useSavePower();
  
  // Cálculos em tempo real (cache) OPCIONAL
  // Se FEATURES.USE_BACKEND_CALCULATION === true, usa API
  const detalhes = useQuery(
    ['power-calculation', poder?.id],
    () => api.get(`/api/powers/${poder.id}/calculate`),
    { enabled: !!poder?.id, staleTime: 30000 }
  );
  
  // Operações otimistas para UX
  const adicionarEfeito = async (efeitoId: string, grau: number) => {
    // Otimistic update
    mutate(draft => {
      draft.effects.push({ efeitoId, grau, ... });
    }, { revalidate: false });
    
    // Sincroniza com backend
    await savePower(poder);
  };
}
```

**Entregáveis:**
- [ ] CRUD completo de poderes
- [ ] Lógica de cálculo server-side
- [ ] Validação server-side
- [ ] Frontend adaptado para usar API
- [ ] Sincronização otimista
- [ ] Testes unitários de cálculo

---

### Fase 3: Personagens - Backend (3-4 semanas)

#### Schema do Banco

```prisma
model Character {
  id                String    @id @default(cuid())
  userId            String
  name              String
  level             Int       @default(1)
  experience        Int       @default(0)
  
  // Atributos
  attributes        Json      // { Força: 10, Destreza: 10, ... }
  tempBonuses       Json?     // Bônus temporários
  
  // Recursos vitais
  currentHP         Int
  maxHP             Int
  currentPE         Int
  maxPE             Int
  temporaryHP       Int       @default(0)
  
  // Habilidades e perícias
  skills            Json      // { Acrobacia: { ranks: 2, ... }, ... }
  
  // Poderes
  powers            Json[]    // Referências para poderes + configurações
  
  // Equipamento
  inventory         Json?
  
  // Campanha (opcional)
  campaignId        String?
  
  // Metadados
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime?
  
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaign          Campaign? @relation(fields: [campaignId], references: [id])
  
  @@index([userId])
  @@index([campaignId])
}
```

#### APIs

```typescript
GET    /api/characters
GET    /api/characters/:id
POST   /api/characters
PUT    /api/characters/:id
DELETE /api/characters/:id

// Operações especiais
POST   /api/characters/:id/level-up
PUT    /api/characters/:id/vitals        // Atualizar HP/PE
POST   /api/characters/:id/rest          // Descanso
GET    /api/characters/:id/calculate     // Recalcular valores derivados
POST   /api/characters/:id/add-power     // Adicionar poder
```

**Entregáveis:**
- [ ] CRUD de personagens
- [ ] Cálculos server-side
- [ ] Sistema de level-up
- [ ] Gestão de recursos vitais
- [ ] Integração com poderes

---

### Fase 4: Campanhas e Colaboração (4-5 semanas)

#### Objetivos
- Sistema de campanhas multi-jogador
- Compartilhamento de poderes/personagens
- Gestão de permissões

#### Schema do Banco

```prisma
model Campaign {
  id            String    @id @default(cuid())
  name          String
  description   String?
  gmUserId      String    // Game Master
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  gm            User        @relation("GMCampaigns", fields: [gmUserId], references: [id])
  players       CampaignPlayer[]
  characters    Character[]
  sessions      Session[]
  sharedContent SharedContent[]
  
  @@index([gmUserId])
}

model CampaignPlayer {
  id            String    @id @default(cuid())
  campaignId    String
  userId        String
  role          String    @default("player") // player, assistant_gm
  
  joinedAt      DateTime  @default(now())
  
  campaign      Campaign  @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([campaignId, userId])
}

model SharedContent {
  id            String    @id @default(cuid())
  type          String    // 'power', 'character', 'creature'
  contentId     String    // ID do conteúdo compartilhado
  ownerId       String
  
  // Compartilhamento
  isPublic      Boolean   @default(false)
  campaignId    String?   // Compartilhado com campanha específica
  
  // Metadados
  views         Int       @default(0)
  likes         Int       @default(0)
  
  createdAt     DateTime  @default(now())
  
  owner         User      @relation(fields: [ownerId], references: [id])
  campaign      Campaign? @relation(fields: [campaignId], references: [id])
  
  @@index([type, isPublic])
  @@index([campaignId])
}
```

#### APIs

```typescript
// Campanhas
GET    /api/campaigns
POST   /api/campaigns
GET    /api/campaigns/:id
PUT    /api/campaigns/:id
DELETE /api/campaigns/:id

// Jogadores
POST   /api/campaigns/:id/invite      // Convidar jogador
POST   /api/campaigns/:id/join        // Aceitar convite
DELETE /api/campaigns/:id/leave       // Sair da campanha
DELETE /api/campaigns/:id/kick/:userId

// Compartilhamento
GET    /api/shared/powers             // Poderes públicos
GET    /api/shared/powers/:id
POST   /api/powers/:id/share          // Compartilhar poder
POST   /api/powers/:id/clone          // Clonar poder compartilhado
```

**Entregáveis:**
- [ ] Sistema de campanhas
- [ ] Convites e permissões
- [ ] Compartilhamento de conteúdo
- [ ] Biblioteca pública

---

### Fase 5: Features Avançadas (Futuro)

#### Real-time Features
- WebSockets para atualizações em tempo real
- Chat de campanha
- Mapas compartilhados
- Iniciativa compartilhada

#### Analytics e Auditoria
```prisma
model AuditLog {
  id          String    @id @default(cuid())
  userId      String
  action      String    // 'create', 'update', 'delete'
  entityType  String    // 'power', 'character', etc
  entityId    String
  changes     Json?     // Diff das mudanças
  createdAt   DateTime  @default(now())
  
  @@index([userId, createdAt])
  @@index([entityType, entityId])
}
```

#### Import/Export
- Exportar personagens/poderes (JSON, PDF)
- Importar de outras plataformas
- Backup automático

---

## 🚀 Estratégia de Deploy

### Desenvolvimento

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: aetherium_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://dev:dev@postgres:5432/aetherium_dev
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret-change-in-production
    volumes:
      - ./backend:/app
    depends_on:
      - postgres
      - redis
  
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
    environment:
      VITE_API_URL: http://localhost:3001
```

### Produção (Sugestões)

```
Frontend:   Vercel / Netlify (jamstack otimizado)
Backend:    Railway / Render / DigitalOcean App Platform
Database:   Supabase / Neon / Railway Postgres
Cache:      Upstash Redis
Storage:    Cloudinary / AWS S3
```

---

## ⚠️ Riscos e Mitigações

### Risco 1: Perda de Dados Durante Migração
**Mitigação:**
- Feature flag para rollback instantâneo
- Migração opcional por usuário
- Backup automático de localStorage antes da migração
- Período de convivência (dados locais + nuvem)

### Risco 2: Performance Degradada
**Mitigação:**
- Caching agressivo (React Query com 30s stale time)
- Optimistic updates
- Lazy loading de dados não críticos
- IndexedDB como cache local

### Risco 3: Complexidade da Sincronização Offline
**Mitigação:**
- Começar sem sync offline (Fase 1-3)
- Implementar sync apenas na Fase 4+
- Usar bibliotecas testadas (WatermelonDB, RxDB)

### Risco 4: Mudanças nas Regras de Negócio
**Mitigação:**
- Versionamento de schemas (já existe)
- Migrations automáticas (Prisma)
- Testes abrangentes de cálculos
- Documentação das regras

---

## 📊 Estimativas de Tempo

| Fase | Duração | Esforço (horas) |
|------|---------|-----------------|
| Fase 0: Preparação | 1-2 semanas | 40-60h |
| Fase 1: Auth | 2-3 semanas | 60-80h |
| Fase 2: Poderes | 3-4 semanas | 80-120h |
| Fase 3: Personagens | 3-4 semanas | 80-120h |
| Fase 4: Campanhas | 4-5 semanas | 120-160h |
| **TOTAL** | **13-18 semanas** | **380-540h** |

**Observações:**
- Estimativas para 1 desenvolvedor full-time
- Inclui testes e documentação
- Não inclui features avançadas (Fase 5)

---

## ✅ Checklist de Migração

### Preparação
- [ ] Decisão: NestJS vs Express
- [ ] Setup do repositório backend
- [ ] Docker Compose configurado
- [ ] CI/CD básico (GitHub Actions)
- [ ] Camada de abstração no frontend

### Fase 1 - Auth
- [ ] Registro de usuários
- [ ] Login/Logout
- [ ] JWT authentication
- [ ] Protected routes
- [ ] Migração de dados locais

### Fase 2 - Poderes
- [ ] Schema do banco (Prisma)
- [ ] CRUD de poderes
- [ ] Lógica de cálculo server-side
- [ ] Validação server-side
- [ ] Testes unitários
- [ ] Frontend adaptado

### Fase 3 - Personagens
- [ ] Schema do banco
- [ ] CRUD de personagens
- [ ] Cálculos server-side
- [ ] Level-up e recursos vitais
- [ ] Integração com poderes

### Fase 4 - Campanhas
- [ ] Schema do banco
- [ ] Sistema de campanhas
- [ ] Convites e permissões
- [ ] Compartilhamento
- [ ] Biblioteca pública

---

## 🎓 Recursos e Referências

### Documentação
- [Prisma Docs](https://www.prisma.io/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [React Query Docs](https://tanstack.com/query/latest)
- [Zod Validation](https://zod.dev)

### Arquitetura
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [API Design Best Practices](https://swagger.io/resources/articles/best-practices-in-api-design/)

### Segurança
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 📝 Próximos Passos

1. **Revisar e aprovar este plano**
2. **Decidir stack do backend** (Express vs NestJS)
3. **Criar repositório backend**
4. **Iniciar Fase 0** (preparação)
5. **Configurar ambiente de desenvolvimento**
6. **Primeira migration: autenticação**

---

**Documento vivo** - Atualizar conforme o projeto evolui.
