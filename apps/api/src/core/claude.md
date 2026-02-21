# Arquitetura Core e Domain - Aetherium API

## Visão Geral

Este documento descreve a arquitetura da camada **Core** e **Domain** da API Aetherium, seguindo princípios de **Domain-Driven Design (DDD)** e **Clean Architecture**.

---

## 📁 Estrutura de Diretórios

```
apps/api/src/
├── core/                       # Camada de infraestrutura técnica reutilizável
│   ├── either.ts              # Implementação de Either para tratamento de erros
│   ├── entities/              # Classes base para entidades
│   │   ├── entity.ts
│   │   ├── aggregate-root.ts
│   │   ├── unique-entity-ts.ts
│   │   └── watched-list.ts
│   ├── errors/                # Erros genéricos da aplicação
│   │   ├── use-case-errors.ts
│   │   ├── alreadyExistsError.ts
│   │   ├── not-allowed-error.ts
│   │   └── resource-not-found-error.ts
│   ├── events/                # Sistema de eventos de domínio (em desenvolvimento)
│   ├── repositories/          # Interfaces base para repositórios
│   │   ├── paginationParams.ts
│   │   └── userRepository.ts
│   └── types/                 # Tipos utilitários TypeScript
│       └── optional.d.ts
│
└── domain/                    # Camada de domínio (regras de negócio)
    └── authentication/        # Bounded Context: Autenticação
        ├── application/       # Casos de uso e interfaces
        │   ├── repositories/
        │   │   └── usersRepository.ts
        │   └── useCases/
        │       ├── registerUser.ts
        │       └── test/
        │           └── inMemoryUsersRepository.ts
        └── enterprise/        # Entidades de negócio
            └── entities/
                ├── user.ts
                └── value-objects/
                    └── userRole.ts
```

---

## 🏗️ CORE - Infraestrutura Técnica

A camada **Core** contém abstrações e utilitários técnicos reutilizáveis em qualquer domínio.

### 1. Either Pattern (`either.ts`)

Implementação do padrão funcional **Either** para tratamento de erros tipado, eliminando a necessidade de `try/catch`.

```typescript
// Classes principais
class Left<L, R>   // Representa um erro/falha
class Right<L, R>  // Representa um sucesso

type Either<L, R> = Left<L, R> | Right<L, R>

// Helpers
const left = <L, R>(value: L): Either<L, R>
const right = <L, R>(value: R): Either<L, R>
```

**Características:**
- **Left**: Encapsula erros ou falhas
- **Right**: Encapsula valores de sucesso
- Type guards: `isLeft()` e `isRight()`
- Permite composição funcional sem exceções

**Exemplo de uso:**
```typescript
type Response = Either<AlreadyExistsError, { user: User }>

if (userExists) {
  return left(new AlreadyExistsError())
}
return right({ user })
```

---

### 2. Entities (Entidades Base)

#### 2.1 UniqueEntityId (`unique-entity-ts.ts`)

Classe que representa identificadores únicos de entidades.

```typescript
class UniqueEntityId {
  private value: string
  
  constructor(value?: string)  // Gera UUID se não fornecido
  toString(): string
  toValue(): string
  equals(id: UniqueEntityId): boolean
}
```

**Responsabilidades:**
- Gerar UUIDs automaticamente
- Encapsular lógica de comparação de IDs
- Garantir imutabilidade

---

#### 2.2 Entity (`entity.ts`)

Classe abstrata base para todas as entidades de domínio.

```typescript
abstract class Entity<Props> {
  private _id: UniqueEntityId
  protected props: Props
  
  get id(): UniqueEntityId
  equals(entity: Entity<unknown>): boolean
}
```

**Características:**
- Identidade única (`_id`)
- Props genéricos para flexibilidade
- Comparação por identidade (não por valor)
- Proteção do estado interno

**Conceito DDD:**
> Uma entidade é definida pela sua identidade, não pelos seus atributos.
> Duas entidades com os mesmos dados mas IDs diferentes são entidades distintas.

---

#### 2.3 AggregateRoot (`aggregate-root.ts`)

Classe abstrata que estende `Entity` e adiciona suporte a **Domain Events**.

```typescript
abstract class AggregateRoot<Props> extends Entity<Props> {
  private _domainEvents: DomainEvent[]
  
  get domainEvents(): DomainEvent[]
  protected addDomainEvent(domainEvent: DomainEvent): void
  public clearEvents(): void
}
```

**Responsabilidades:**
- Gerenciar eventos de domínio
- Marcar agregados para despacho de eventos
- Limpar eventos após processamento

**Conceito DDD:**
> Aggregate Root é a entidade raiz de um agregado que garante consistência transacional.
> Apenas o Aggregate Root pode ser referenciado externamente.

**Estado atual:** Sistema de eventos parcialmente implementado (arquivos `domain-event.ts` e `domain-events.ts` ainda não criados)

---

#### 2.4 WatchedList (`watched-list.ts`)

Classe abstrata para rastrear mudanças em listas de entidades relacionadas.

```typescript
abstract class WatchedList<T> {
  public currentItems: T[]
  private initial: T[]
  private new: T[]
  private removed: T[]
  
  abstract compareItems(a: T, b: T): boolean
  
  // Métodos públicos
  getItems(): T[]
  getNewItems(): T[]      // Itens adicionados
  getRemovedItems(): T[]  // Itens removidos
  exists(item: T): boolean
  add(item: T): void
  remove(item: T): void
  update(items: T[]): void
}
```

**Responsabilidades:**
- Rastrear itens adicionados desde a carga inicial
- Rastrear itens removidos
- Manter estado atual vs. inicial
- Facilitar persistência incremental

**Caso de uso:**
Ideal para relações 1:N onde é necessário saber quais itens foram adicionados/removidos para atualizar apenas o delta no banco de dados.

**Exemplo:**
```typescript
class UserRoles extends WatchedList<UserRole> {
  compareItems(a: UserRole, b: UserRole) {
    return a.equals(b)
  }
}
```

---

### 3. Error Handling (Tratamento de Erros)

#### 3.1 Interface Base (`use-case-errors.ts`)

```typescript
interface UseCaseError {
  message: string
}
```

Contrato para todos os erros de caso de uso.

#### 3.2 Erros Predefinidos

| Classe | Mensagem | Uso |
|--------|----------|-----|
| `AlreadyExistsError` | "Resource already exists" | Quando tenta criar um recurso que já existe |
| `NotAllowedError` | "Not Allowed Error" | Autorização/permissão negada |
| `ResourceNotFoundError` | "Resource not found" | Recurso solicitado não encontrado |

**Características:**
- Estendem `Error` nativa do JavaScript
- Implementam `UseCaseError`
- Podem ser usados com `Either<Error, Success>`

---

### 4. Repositories (Padrão Repository)

#### 4.1 PaginationParams (`paginationParams.ts`)

```typescript
interface PaginationParams {
  page: number
}
```

Interface para padronizar paginação em repositórios.

#### 4.2 UserRepository (`userRepository.ts`)

**Nota:** Este arquivo está em `core/repositories/` mas deveria estar em `domain/`. Provavelmente será movido.

```typescript
interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  create(user: User): Promise<void>
}
```

---

### 5. Types (Tipos Utilitários)

#### Optional (`optional.d.ts`)

Type helper para tornar propriedades opcionais.

```typescript
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
```

**Exemplo:**
```typescript
interface UserProps {
  id: string
  name: string
  email: string
}

// Torna 'id' opcional
type CreateUserProps = Optional<UserProps, 'id'>

// Equivalente a:
// { name: string, email: string, id?: string }
```

**Uso comum:** Métodos `create()` de entidades onde algumas props têm valores padrão.

---

## 🎯 DOMAIN - Regras de Negócio

A camada **Domain** contém a lógica de negócio pura, independente de frameworks.

### Bounded Context: Authentication

#### 1. Enterprise Layer (Entidades de Negócio)

##### 1.1 User Entity (`user.ts`)

```typescript
interface UserProps {
  name: string
  email: string
  password: string
  roles: UserRole[]
  createdAt: Date
  updatedAt?: Date
}

class User extends Entity<UserProps> {
  // Getters
  get name(): string
  get email(): string
  get password(): string
  get roles(): UserRole[]
  get createdAt(): Date
  get updatedAt(): Date | undefined
  
  // Métodos de negócio
  hasRole(role: UserRole): boolean
  isMaster(): boolean
  isPlayer(): boolean
  addRole(role: UserRole): void
  removeRole(role: UserRole): void
  
  // Factory method
  static create(
    props: Optional<UserProps, 'roles' | 'createdAt'>,
    id?: UniqueEntityId
  ): User
}
```

**Regras de negócio encapsuladas:**
- Um usuário tem pelo menos um role (padrão: `PLAYER`)
- Não pode ter roles duplicados
- `updatedAt` é atualizado automaticamente ao modificar roles
- Validação de roles através de métodos `isMaster()` e `isPlayer()`

**Factory Method:**
```typescript
const user = User.create({
  name: 'João Silva',
  email: 'joao@example.com',
  password: 'hashedPassword',
  // roles e createdAt são opcionais
})
```

---

##### 1.2 UserRole Value Object (`userRole.ts`)

```typescript
enum UserRole {
  PLAYER = 'PLAYER',
  MASTER = 'MASTER'
}
```

**Conceito DDD:**
> Value Objects são objetos sem identidade conceitual, definidos apenas pelos seus atributos.
> São imutáveis e comparados por valor.

**Características:**
- Enum simples representando papéis do sistema
- `PLAYER`: Jogador comum
- `MASTER`: Mestre de jogo (narrador)

---

#### 2. Application Layer (Casos de Uso)

##### 2.1 UsersRepository Interface

```typescript
interface UsersRepository {
  findByEmail(email: string): Promise<User | null>
  create(user: User): Promise<User>
  findById(id: string): Promise<User | null>
}
```

Interface que define o contrato de persistência para Users, implementada na camada de infraestrutura.

---

##### 2.2 RegisterUser Use Case

```typescript
interface RegisterUserUseCaseRequest {
  name: string
  email: string
  password: string
  masterConfirm?: boolean
}

interface RegisterUserUseCaseResponseData {
  user: User
}

type RegisterUserUseCaseResponse = Either<
  AlreadyExistsError, 
  RegisterUserUseCaseResponseData
>

class RegisterUserUseCase {
  constructor(private usersRepository: UsersRepository)
  
  async execute(request: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse>
}
```

**Fluxo:**
1. Hasheia a senha com `bcryptjs` (salt rounds: 6)
2. Define role baseado em `masterConfirm`
3. Verifica se email já existe
4. Se existe → retorna `Left(AlreadyExistsError)`
5. Cria novo usuário com factory method
6. Persiste via repositório
7. Retorna `Right({ user })`

**Regras:**
- Senhas sempre hasheadas antes de persistir
- Email único (validado antes de criar)
- Role padrão: `PLAYER`
- Role `MASTER` apenas se `masterConfirm === true`

**Exemplo de uso:**
```typescript
const useCase = new RegisterUserUseCase(usersRepo)

const result = await useCase.execute({
  name: 'Maria',
  email: 'maria@example.com',
  password: '123456',
  masterConfirm: true
})

if (result.isLeft()) {
  console.error(result.value.message) // "Resource already exists"
} else {
  console.log(result.value.user) // User criado
}
```

---

#### 3. Testing (Testes)

##### InMemoryUsersRepository

Implementação em memória do `UsersRepository` para testes unitários.

```typescript
class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []
  
  async findByEmail(email: string): Promise<User | null>
  async create(user: User): Promise<User>
  async findById(id: string): Promise<User | null>
}
```

**Benefícios:**
- Testes rápidos sem banco de dados
- Isolamento total
- Controle total sobre dados de teste
- Verificação de estado interno (`items`)

---

## 🔄 Fluxo de Dados (Data Flow)

```
Controller/HTTP Handler
         ↓
    Use Case (Application Layer)
         ↓
    Repository Interface
         ↓
    Domain Entity
         ↓
    Repository Implementation
         ↓
    Database/ORM
```

**Princípios aplicados:**
- **Dependency Inversion**: Use cases dependem de interfaces, não de implementações
- **Single Responsibility**: Cada camada tem uma responsabilidade única
- **Separation of Concerns**: Domínio isolado de infraestrutura

---

## 🎨 Padrões de Design Aplicados

### 1. **Repository Pattern**
Abstrai lógica de persistência através de interfaces.

### 2. **Factory Method Pattern**
Métodos estáticos `create()` nas entidades para construção consistente.

### 3. **Value Object Pattern**
`UserRole`, `UniqueEntityId` - objetos definidos por valor, não identidade.

### 4. **Either Pattern (Railway Oriented Programming)**
Composição funcional de operações que podem falhar.

### 5. **Domain Events** (em desenvolvimento)
Sistema para comunicação entre agregados via eventos.

---

## 📋 Checklist de Implementação Futura

### Core
- [ ] Implementar `domain-event.ts` e `domain-events.ts`
- [ ] Adicionar suporte a despacho automático de eventos
- [ ] Criar mais erros específicos conforme necessário
- [ ] Adicionar `Result<T>` como alternativa ao `Either`

### Domain
- [ ] Mover `UserRepository` de `core/` para `domain/authentication/application/repositories/`
- [ ] Implementar repository no Prisma
- [ ] Adicionar validações de email e password na entidade User
- [ ] Criar mais casos de uso (Login, UpdateUser, DeleteUser, etc.)
- [ ] Adicionar testes unitários para User entity
- [ ] Implementar Domain Events (ex: `UserCreatedEvent`)

---

## 🧪 Guia de Testes

### Testando Use Cases

```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('RegisterUserUseCase', () => {
  let sut: RegisterUserUseCase
  let usersRepository: InMemoryUsersRepository

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterUserUseCase(usersRepository)
  })

  it('should register a new user', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123456'
    })

    expect(result.isRight()).toBe(true)
    expect(usersRepository.items).toHaveLength(1)
  })

  it('should not register with duplicate email', async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123456'
    })

    const result = await sut.execute({
      name: 'Jane Doe',
      email: 'john@example.com', // mesmo email
      password: '654321'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(AlreadyExistsError)
  })
})
```

---

## 📚 Referências e Conceitos DDD

### Entidade vs Value Object

| Aspecto | Entity | Value Object |
|---------|--------|--------------|
| Identidade | Tem identidade única | Sem identidade |
| Comparação | Por ID | Por valor |
| Mutabilidade | Pode mudar estado | Imutável |
| Exemplo | User, Order | Email, Money, UserRole |

### Aggregate Root

- Raiz de consistência transacional
- Único ponto de entrada para modificar agregado
- Gerencia invariantes do agregado
- Emite domain events

### Bounded Context

- Fronteira explícita de modelo
- Contexto linguístico específico
- Pode ter modelos diferentes da mesma entidade
- Exemplo: `User` em Authentication vs `User` em Authorization

---

## 🔐 Segurança

### Senhas
- **SEMPRE** hasheadas com `bcryptjs`
- Salt rounds: 6 (pode ser aumentado para ambientes de produção)
- Nunca expor senha em getters ou logs

### Validações futuras recomendadas
- [ ] Validar formato de email
- [ ] Validar força da senha (min 8 chars, letras, números, símbolos)
- [ ] Rate limiting em registro
- [ ] Captcha para prevenir bots

---

## 🚀 Próximos Passos

1. **Implementar camada de infraestrutura**
   - PrismaUsersRepository
   - Controllers NestJS
   - DTOs e validação (class-validator)

2. **Adicionar autenticação JWT**
   - Login use case
   - Refresh token
   - Guards e decorators

3. **Expandir domínio**
   - Novos bounded contexts (Characters, Campaigns, etc.)
   - Relacionamentos entre entidades
   - Domain events para integrações

4. **Melhorias de arquitetura**
   - Implementar CQRS se necessário
   - Event sourcing para auditoria
   - Cache strategies

---

## 📞 Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Entity | PascalCase | `User`, `Campaign` |
| Use Case | PascalCase + UseCase | `RegisterUserUseCase` |
| Repository Interface | PascalCase + Repository | `UsersRepository` |
| Repository Impl | PascalCase + Impl | `PrismaUsersRepository` |
| Value Object | PascalCase | `UserRole`, `Email` |
| Error | PascalCase + Error | `AlreadyExistsError` |
| Props Interface | EntityName + Props | `UserProps` |

---

**Última atualização:** 19 de fevereiro de 2026
**Versão:** 1.0.0
**Autor:** Documentação gerada para contexto do Claude AI
