# Character Domain Model (DDD)

Este documento detalha a arquitetura do Bounded Context `character-manager`, focado na entidade central (Aggregate Root) que representa o personagem (Aventureiro) no sistema Spirit and Caos / Aetherium. O modelo segue os princípios de Domain-Driven Design (DDD).

---

## 1. A Raiz de Agregação: `Character` (Aggregate Root)
A classe principal que representa o aventureiro. Nenhuma alteração de status (como sofrer dano, gastar Pontos de Aprendizado ou equipar itens) ocorre fora dos métodos desta classe, garantindo a consistência das regras de negócio (Invariants).

**Identidade e Estado Global (Value Objects e Primitivos):**
- **ID:** UUID único do personagem (`UniqueEntityID`).
- **Level:** Inteiro (1 a 250). O aumento de nível dispara `DomainEvents` que forçam o recálculo de recursos (PV, PE, PdA, Bônus de Eficiência).
- **Inspiracao:** Inteiro de 0 a 3 (limite máximo).
- **Calamidade:** String ou Enum (ex: "Raposa", "Lobo", "Dragão") derivada diretamente do Level atual.

---

## 2. Entidades de Narrativa (`NarrativeProfile`)
Value Object ou Entidade local que agrupa o escopo de Roleplay. Fornece gatilhos mecânicos, como o ganho de Inspiração.

- **Identidade:** String (Ex: "Cavaleiro Real").
- **Origem:** String (Ex: "Reino de Gardênia").
- **Motivacoes:** Lista de referências/strings.
- **Complicacoes:** Lista de referências/strings.
- *Regra de Criação:* O personagem deve ter pelo menos duas entradas no total, combinando motivações e complicações (ex: 2 motivações, ou 1 motivação e 1 complicação).

---

## 3. Modelo de Atributos (`AttributeSet`)
Value Object que encapsula os 6 atributos clássicos.

- **Atributos:** Força (FOR), Destreza (DES), Constituição (CON), Inteligência (INT), Sabedoria (SAB), Carisma (CAR).
- **Estrutura de cada Atributo:**
  - `BaseValue`: Valor base inicializado.
  - `ExtraBonus`: Bônus oriundos de efeitos/habilidades (bônus automatizados que se aplicam nas rolagens).
  - `Modifier()`: Método getter que calcula o bônus. A regra base matemática é `Math.floor((Valor - 10) / 2)`.
- **Atributos Chave (`KeyAttributes`):**
  - O jogador define **1 Atributo Físico** (For, Des, Con) e **1 Atributo Mental** (Int, Sab, Car) como "Chaves".
  - Estes atributos são fundamentais e injetados diretamente no cálculo de Pontos de Energia (PE) e em pré-requisitos de poderes específicos.

---

## 4. Status Derivados (Calculated Stats / Managers)
Valores atualizados reativamente por eventos de domínio (ex: subir de nível, alterar atributo).

- **BonusEficiencia:** Método/Getter que recebe o Level e retorna o bônus aplicável usando uma fórmula exponencial (Ex: `Math.round(3000 * Math.pow(Level / 250, 2)) + 1`).
- **HealthManager (PV - Pontos de Vida):**
  - `MaxPV`: Dinâmico. Nível 1 concede 6 PVs. Para cada nível subsequente, soma-se o Modificador de Constituição atual.
  - `CurrentPV`: Inteiro.
  - `TemporaryPV`: Pontos de vida temporários.
- **EnergyManager (PE - Pontos de Energia):**
  - `MaxPE`: Calculado somando o (Modificador do Atributo Chave Físico + Modificador do Atributo Chave Mental) e consultando a "Tabela de PE e Espaços" (ou algoritmo equivalente, ex: Soma 1 = 7 PE; Soma 5 = 16 PE).
  - `CurrentPE`: Inteiro.
  - `TemporaryPE`: Pontos de energia temporários.
- **SlotManager (Espaços para Poderes):**
  - `MaxSlots`: Usa o Modificador de Inteligência consultado na tabela/algoritmo (Ex: Mod Int 3 = 12 Espaços).
  - `UsedSlots`: Propriedade derivada da soma dos Espaços exigidos pelos Poderes (`Powers`) equipados atualmente.
- **PdA_Manager (Pontos de Aprendizado):**
  - Controla PdA Total, PdA Gasto e PdA Disponível.
  - *Progressão:* Nível 1 começa com 15 PdA; Nível 3 com 29 PdA; +7 PdA por nível subsequente.
  - *PdA Extra Livre:* Input manual para PdAs adquiridos de outras formas (narrativa, recompensas).

---

## 5. Sistema de Perícias (`SkillManager`)
Gerencia o acervo de perícias do personagem através de uma `WatchedList` ou coleção encapsulada.

- **Entidade `Skill` (Local):**
  - `Name` & `BaseAttribute`: (Ex: "Acrobacia", Atributo vinculado: "Des").
  - `ProficiencyState`: Enum `[EFFICIENT, NEUTRAL, INEFFICIENT]`.
  - `TrainingBonus`: Inteiro. Pontos extras ganhos em sessões de treinamento (sem limite).
- **Regra de Criação:** A validação (feita pela Factory ou UseCase) exige exatas 4 perícias Eficientes e 4 Ineficientes na criação. O domínio aceita evolução natural depois disso.
- **Cálculo de Rolagem (`GetSkillBonus()`):**
  - `Bônus = BaseAttribute.Modifier() + TrainingBonus`
  - Se `EFFICIENT`: Soma o `BonusEficiencia`.
  - Se `INEFFICIENT`: Subtrai `Math.round(BonusEficiencia / 2)`.

---

## 6. Domínios e Princípio Espiritual
O cerne da mecânica de poderes da ficha e integração com o sistema de modificações.

- **Domínios (`Domains[]`):**
  - `DomainId`: Referência ao domínio.
  - `MasteryLevel`: Enum `[INICIANTE, PRATICANTE, MESTRE]`.
  - *Regra de Negócio:* Aumentar a maestria altera os custos de criação dos poderes vinculados àquele domínio. Isso pode ser implementado injetando uma "Modificação" de desconto dinamicamente no poder, disparando um evento que recalcula o `PdA_Gasto`.
- **Princípio Espiritual (`SpiritualPrinciple`):**
  - Objeto que representa o Despertar.
  - `IsUnlocked`: Boolean. (Se `false` na criação, o personagem recebe **+15 PdA livres**).
  - `Stage`: Enum `[NORMAL, DIVINE]`. Desbloqueia as flags de habilidades avançadas (Liberação, Transformação, Supressão e Pressentir).

---

## 7. Dependências Injetadas (Inventário, Poderes e Benefícios)
A ficha orquestra as referências (IDs) para outros Bounded Contexts (`power-manager`, `item-manager`) e consome seus custos.

- **Benefits (`Benefits[]`):** Lista de DTOs ou Value Objects contendo `{ BenefitId, Degree }`. Custam 3 PdA por Grau, debitados do `PdA_Manager`.
- **Powers (`CharacterPowers[]`):** Lista de referências contendo `{ PowerId, IsEquipped }`.
  - Poderes *equipados* somam ao `UsedSlots` do `SlotManager`.
  - O custo (PdA) de construção do poder é debitado permanentemente do `PdA_Manager` (levando em conta a Maestria de Domínios).
- **InventoryManager:**
  - `RunicsWallet`: Carteira de dinheiro (Inteiro).
  - `Bag`: Lista de `{ ItemId, Quantity }` (Itens não equipados).
  - `QuickAccess`: Vetor de tamanho `2 + quantidade de mãos`. Itens/proteções precisam estar aqui ou equipados para funcionar. (Ex: poções, granadas se acumulam em 2 por slot e podem ser aprimoradas).
  - `EquippedBody`: Slots específicos para `[Traje, Acessorio]`.
- **Composição de Combate (`CombatStats`):** Compila dados em tempo real para a UI e sistema de combate.
  - `Defesa_Esquiva` = Reflexos.
  - `Defesa_Bloqueio` = Redução de Dano (RD) Total (Soma da RD do Traje + Fortitude + Escudos/Poderes Passivos).

---

## 8. Gestão de Estado de Combate e Condições
Uma Máquina de Estados embutida na ficha para controlar a saúde imediata no grid/combate.

- **Conditions (`Conditions[]`):** Lista de *Status Effects* ativos (Ex: Abalado, Caído, Fraco).
  - *Evolução:* Condições de mesmo nome ou natureza sofrem progressão se aplicadas múltiplas vezes (Ex: Fatigado -> Exausto -> Inconsciente).
- **DeathState:** Enum `[ALIVE, DYING, DEAD]`.
  - Quando `HealthManager.CurrentPV <= 0`, o estado muda para `DYING`.
- **DeathCounter:**
  - Ativado quando em `DYING`. Inteiro iniciando em 0.
  - Se o contador chegar a 3 no início do turno, o personagem sofre *Lesão* ou *Morte*.
